// src/app/[lang]/seller/listings/[id]/tour-editor/page.tsx
'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { PannellumViewer } from '@/components/3d-tour/PannellumViewer';
import { HotspotOverlay } from '@/components/3d-tour/HotspotOverlay';
import { SceneSelectorToolbar } from '@/components/3d-tour/SceneSelectorToolbar';
import { tourService } from '@/services/tour.service';
import { TourConfig, PannellumHotSpot } from '@/types/tour.types';

const DEMO_CONFIG: TourConfig = {
  default: { firstScene: 'living-room', sceneFadeDuration: 1000 },
  scenes: {
    'living-room': {
      title: 'Living Room',
      type: 'equirectangular',
      panorama: 'https://pannellum.org/images/alma.jpg',
      hotSpots: [],
    },
    kitchen: {
      title: 'Kitchen',
      type: 'equirectangular',
      panorama: 'https://pannellum.org/images/cerro-toco.jpg',
      hotSpots: [],
    },
  },
};

export default function TourEditorPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: rawLang, id: propertyId } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [tourConfig, setTourConfig] = useState<TourConfig | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    yaw: number;
    pitch: number;
  }>({ isOpen: false, yaw: 0, pitch: 0 });

  useEffect(() => {
    tourService
      .getTourConfig(propertyId)
      .then((config) => {
        if (config?.scenes && Object.keys(config.scenes).length > 0) {
          setTourConfig(config);
          setActiveSceneId(config.default?.firstScene ?? Object.keys(config.scenes)[0]);
        }
      })
      .catch(() => {
        setTourConfig(DEMO_CONFIG);
        setActiveSceneId('living-room');
      });
  }, [propertyId]);

  const handleAddHotspotClick = useCallback((yaw: number, pitch: number) => {
    setModalState({ isOpen: true, yaw, pitch });
  }, []);

  const handleSceneSelect = useCallback(
    (sceneId: string) => {
      if (!tourConfig || sceneId === activeSceneId) return;
      setActiveSceneId(sceneId);
      setTourConfig((prev) =>
        prev ? { ...prev, default: { ...prev.default, firstScene: sceneId } } : prev
      );
    },
    [tourConfig, activeSceneId]
  );

  const handleSaveHotspot = useCallback(
    async (data: { type: 'NAVIGATION' | 'INFO'; targetSceneId?: string; label?: string }) => {
      if (!tourConfig) return;
      setIsSaving(true);
      setSaveMsg(null);

      const newClientHotspot: PannellumHotSpot = {
        pitch: modalState.pitch,
        yaw: modalState.yaw,
        type: data.type === 'NAVIGATION' ? 'scene' : 'info',
        text: data.label ?? (data.type === 'NAVIGATION' ? 'Go to ' + (data.targetSceneId ?? '') : 'Info'),
        sceneId: data.targetSceneId,
      };

      try {
        await tourService.addHotspot({
          scene_id: activeSceneId,
          type: data.type,
          yaw: modalState.yaw,
          pitch: modalState.pitch,
          target_scene_id: data.targetSceneId,
          label: data.label,
        });

        // Optimistically update local config
        setTourConfig((prev) => {
          if (!prev || !prev.scenes[activeSceneId]) return prev;
          const updated = { ...prev };
          updated.scenes = { ...prev.scenes };
          updated.scenes[activeSceneId] = {
            ...prev.scenes[activeSceneId],
            hotSpots: [...prev.scenes[activeSceneId].hotSpots, newClientHotspot],
          };
          return updated;
        });

        setSaveMsg({ type: 'success', text: 'Hotspot pin saved successfully.' });
      } catch {
        setSaveMsg({ type: 'error', text: 'Failed to save hotspot. Please try again.' });
      } finally {
        setIsSaving(false);
        setModalState({ isOpen: false, yaw: 0, pitch: 0 });
      }
    },
    [tourConfig, activeSceneId, modalState]
  );

  const currentScene = tourConfig?.scenes[activeSceneId];
  const hotspotCount = currentScene?.hotSpots?.length ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="text-xs font-bold text-gold-400 uppercase tracking-widest mb-1">
            🛠️ 3D Virtual Tour Authoring
          </div>
          <h1 className="text-2xl font-extrabold text-white">Place Room Navigation Hotspots</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Scene: <span className="text-gold-400 font-semibold">{currentScene?.title ?? activeSceneId}</span>
            {' '} · {hotspotCount} hotspot{hotspotCount !== 1 ? 's' : ''} placed
          </p>
        </div>
        <Link
          href={`/${lang}/seller/dashboard`}
          className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 transition self-start sm:self-auto"
        >
          ← Return to Dashboard
        </Link>
      </div>

      {/* Status message */}
      {saveMsg && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold ${
            saveMsg.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400'
              : 'bg-red-950/50 border-red-800 text-red-400'
          }`}
        >
          {saveMsg.type === 'success' ? '✅' : '❌'} {saveMsg.text}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-2xl text-xs text-neutral-400 leading-relaxed">
        💡 <span className="text-gold-400 font-semibold">How to add hotspots:</span>{' '}
        Click anywhere inside the 360° viewer to drop a pin at that exact spherical coordinate.
        Choose between a <em>Room Doorway</em> (navigates to another scene) or an <em>Info Tag</em> (shows a label).
        Hotspots are saved to the database in real-time.
      </div>

      {tourConfig ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          {/* Scene selector toolbar */}
          <div className="relative">
            <SceneSelectorToolbar
              scenes={Object.entries(tourConfig.scenes).map(([id, scene]) => ({
                id,
                name: scene.title ?? id,
                thumbnailUrl: scene.panorama,
              }))}
              activeSceneId={activeSceneId}
              onSelectScene={handleSceneSelect}
            />

            <PannellumViewer
              tourConfig={tourConfig}
              isEditMode={true}
              onAddHotspot={handleAddHotspotClick}
              onSceneChange={(sceneId) => setActiveSceneId(sceneId)}
            />
          </div>

          {/* Hotspot list */}
          {hotspotCount > 0 && (
            <div className="p-4 border-t border-neutral-800">
              <h3 className="text-xs font-bold text-neutral-300 mb-2">
                Hotspots in this scene:
              </h3>
              <div className="space-y-1.5">
                {currentScene?.hotSpots.map((hs, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800 text-xs text-neutral-300"
                  >
                    <span>{hs.type === 'scene' ? '🚪' : 'ℹ️'}</span>
                    <span className="font-medium">{hs.text ?? 'Pin'}</span>
                    <span className="text-neutral-500 font-mono ml-auto">
                      P:{hs.pitch.toFixed(1)}° Y:{hs.yaw.toFixed(1)}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-20 text-center text-neutral-400">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm">Loading Authoring Canvas...</p>
        </div>
      )}

      {/* Hotspot modal */}
      {tourConfig && (
        <HotspotOverlay
          isOpen={modalState.isOpen}
          yaw={modalState.yaw}
          pitch={modalState.pitch}
          availableScenes={Object.entries(tourConfig.scenes)
            .filter(([id]) => id !== activeSceneId)
            .map(([id, s]) => ({ id, name: s.title ?? id }))}
          onSave={handleSaveHotspot}
          onCancel={() => setModalState({ isOpen: false, yaw: 0, pitch: 0 })}
        />
      )}

      {isSaving && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-gold-500/40 px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xl text-xs font-semibold text-gold-400">
          <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          Saving hotspot...
        </div>
      )}
    </div>
  );
}
