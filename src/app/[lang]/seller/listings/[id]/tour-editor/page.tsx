// src/app/[lang]/seller/listings/[id]/tour-editor/page.tsx
'use client';

import React, { useEffect, useState, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DoorOpen, Info } from 'lucide-react';
import { propertyService } from '@/services/property.service';
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

  const router = useRouter();

  const fetchTourConfig = useCallback(() => {
    propertyService.getPropertyById(propertyId).then(property => {
      if (property && property.status === 'APPROVED') {
        propertyService.createDraftClone(propertyId).then(draft => {
          router.replace(`/${lang}/seller/listings/${draft.id}/tour-editor`);
        }).catch(console.error);
        return;
      }

      tourService
      .getTourConfig(propertyId)
      .then((config) => {
        if (config?.scenes && Object.keys(config.scenes).length > 0) {
          setTourConfig(config);
          // If active scene is missing (deleted), set to first
          if (!activeSceneId || !config.scenes[activeSceneId]) {
             setActiveSceneId(config.default?.firstScene ?? Object.keys(config.scenes)[0]);
          }
        } else {
          setTourConfig({ default: { firstScene: '', sceneFadeDuration: 1000 }, scenes: {} });
          setActiveSceneId('');
        }
      })
      .catch(() => {
        // Backend returns 404 if no scenes exist. Set empty state.
        setTourConfig({ default: { firstScene: '', sceneFadeDuration: 1000 }, scenes: {} });
        setActiveSceneId('');
      });
  }, [propertyId, activeSceneId]);

  useEffect(() => {
    fetchTourConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDeleteHotspot = useCallback(
    async (hotspotId: string) => {
      if (!window.confirm('Are you sure you want to delete this hotspot?')) return;
      setIsSaving(true);
      try {
        await tourService.deleteHotspot(hotspotId);
        // Optimistically update
        setTourConfig((prev) => {
          if (!prev || !prev.scenes[activeSceneId]) return prev;
          const updated = { ...prev };
          updated.scenes = { ...prev.scenes };
          updated.scenes[activeSceneId] = {
            ...prev.scenes[activeSceneId],
            hotSpots: prev.scenes[activeSceneId].hotSpots.filter((h: any) => h.id !== hotspotId),
          };
          return updated;
        });
        setSaveMsg({ type: 'success', text: 'Hotspot deleted.' });
      } catch {
        setSaveMsg({ type: 'error', text: 'Failed to delete hotspot.' });
      } finally {
        setIsSaving(false);
      }
    },
    [activeSceneId]
  );

  const handleDeleteScene = useCallback(
    async (sceneId: string) => {
      if (!window.confirm('Are you sure you want to delete this scene? All hotspots placed here will also be lost.')) return;
      setIsSaving(true);
      try {
        // 1. Manually delete all hotspots in this scene to avoid backend FK constraint errors
        const scene = tourConfig?.scenes[sceneId];
        if (scene && scene.hotSpots && scene.hotSpots.length > 0) {
          const deletePromises = scene.hotSpots.map((hs: any) => {
            if (hs.id) return tourService.deleteHotspot(hs.id).catch(() => {});
            return Promise.resolve();
          });
          await Promise.all(deletePromises);
        }

        // 2. Delete the scene itself
        await tourService.deleteScene(propertyId, sceneId);
        setSaveMsg({ type: 'success', text: 'Scene deleted successfully.' });
        fetchTourConfig();
      } catch (err) {
        console.error('Delete scene error:', err);
        setSaveMsg({ type: 'error', text: 'Failed to delete scene.' });
      } finally {
        setIsSaving(false);
      }
    },
    [propertyId, fetchTourConfig, tourConfig]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replacingSceneId, setReplacingSceneId] = useState<string | null>(null);

  const handleReplaceSceneClick = useCallback((sceneId: string) => {
    if (!window.confirm('Replacing this scene will delete its current 360 photo and any hotspots placed inside it. Proceed?')) return;
    setReplacingSceneId(sceneId);
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const newSceneName = prompt(
        replacingSceneId ? 'Enter the new room name:' : 'Enter a name for this room (e.g., Living Room):',
        tourConfig?.scenes[replacingSceneId ?? '']?.title ?? 'Room'
      );
      
      if (newSceneName === null) {
        if (fileInputRef.current) fileInputRef.current.value = '';
        setReplacingSceneId(null);
        return; // User cancelled
      }

      setIsSaving(true);
      setSaveMsg(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // 1. Upload new scene
        await tourService.uploadPanorama(propertyId, formData, newSceneName.trim() || 'Room');
        
        if (replacingSceneId) {
          // 2. Delete all hotspots inside the old scene to prevent FK constraint issues
          const scene = tourConfig?.scenes[replacingSceneId];
          if (scene && scene.hotSpots && scene.hotSpots.length > 0) {
            const deletePromises = scene.hotSpots.map((hs: any) => {
              if (hs.id) return tourService.deleteHotspot(hs.id).catch(() => {});
              return Promise.resolve();
            });
            await Promise.all(deletePromises);
          }

          // 3. Delete old scene
          await tourService.deleteScene(propertyId, replacingSceneId);
          setSaveMsg({ type: 'success', text: 'Scene replaced successfully.' });
        } else {
          setSaveMsg({ type: 'success', text: 'New scene uploaded successfully.' });
        }

        fetchTourConfig();
      } catch (err) {
        console.error('Upload scene error:', err);
        setSaveMsg({ type: 'error', text: 'Failed to upload scene.' });
      } finally {
        setIsSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setReplacingSceneId(null);
      }
    },
    [propertyId, replacingSceneId, fetchTourConfig, tourConfig]
  );

  const handleRenameScene = useCallback(
    async (sceneId: string, newName: string) => {
      setIsSaving(true);
      setSaveMsg(null);
      try {
        await tourService.updateScene(propertyId, sceneId, { scene_name: newName });
        setSaveMsg({ type: 'success', text: 'Scene renamed successfully.' });
        fetchTourConfig();
      } catch (err) {
        console.error('Rename scene error:', err);
        setSaveMsg({ type: 'error', text: 'Failed to rename scene.' });
      } finally {
        setIsSaving(false);
      }
    },
    [propertyId, fetchTourConfig]
  );

  const handleSaveHotspot = useCallback(
    async (data: { type: 'NAVIGATION' | 'INFO'; targetSceneId?: string; label?: string }) => {
      if (!tourConfig) return;
      setIsSaving(true);
      setSaveMsg(null);

      try {
        // Normalize yaw to [0, 360)
        let normalizedYaw = modalState.yaw % 360;
        if (normalizedYaw < 0) normalizedYaw += 360;

        const response: any = await tourService.addHotspot({
          scene_id: activeSceneId,
          type: data.type,
          yaw: normalizedYaw,
          pitch: modalState.pitch,
          target_scene_id: data.targetSceneId,
          label: data.label,
        });

        const newClientHotspot: PannellumHotSpot = {
          id: response.data?.id,
          pitch: modalState.pitch,
          yaw: normalizedYaw,
          type: data.type === 'NAVIGATION' ? 'scene' : 'info',
          text: data.label ?? (data.type === 'NAVIGATION' ? 'Go to ' + (data.targetSceneId ?? '') : 'Info'),
          sceneId: data.targetSceneId,
          cssClass: data.type === 'NAVIGATION' ? 'tour-nav-hotspot' : 'tour-info-hotspot',
        };

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
      {/* Hidden file input for scene replacement */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
            🛠️ 3D Virtual Tour Authoring
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Place Room Navigation Hotspots</h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Scene: <span className="text-red-600 dark:text-red-400 font-semibold">{currentScene?.title ?? activeSceneId}</span>
            {' '} · {hotspotCount} hotspot{hotspotCount !== 1 ? 's' : ''} placed
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => {
              setReplacingSceneId(null);
              fileInputRef.current?.click();
            }}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition flex items-center gap-2"
          >
            <span>➕</span> Upload New Scene
          </button>
          <Link
            href={`/${lang}/seller/dashboard`}
            className="px-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:bg-neutral-700 transition"
          >
            ← Return to Dashboard
          </Link>
        </div>
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
      <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
        <p>
          <span className="text-red-600 dark:text-red-400 font-semibold">Adding Hotspots:</span>{' '}
          Double-click anywhere inside the 360° viewer to drop a pin.
          Choose between a <em>Room Doorway</em> (navigates to another scene) or an <em>Info Tag</em> (shows a label).
        </p>
        <p>
          <span className="text-red-600 dark:text-red-400 font-semibold">Removing Elements:</span>{' '}
          Click on any existing pin to delete it. Use the delete and replace buttons in the scene toolbar (at the top) to delete or replace the active scene entirely.
        </p>
      </div>

      {tourConfig ? (
        Object.keys(tourConfig.scenes).length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl border-dashed">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4 text-3xl">
              📸
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No Scenes Uploaded Yet</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
              Start building your 3D virtual tour by uploading your first 360° panorama image.
            </p>
            <button
              onClick={() => {
                setReplacingSceneId(null);
                fileInputRef.current?.click();
              }}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition"
            >
              Upload First Scene
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
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
                isEditMode={true}
                onDeleteScene={handleDeleteScene}
                onReplaceScene={handleReplaceSceneClick}
                onRenameScene={handleRenameScene}
              />

              <PannellumViewer
                tourConfig={tourConfig}
                isEditMode={true}
                onAddHotspot={handleAddHotspotClick}
                onSceneChange={(sceneId) => setActiveSceneId(sceneId)}
                onDeleteHotspot={handleDeleteHotspot}
              />
            </div>

            {/* Hotspot list */}
            {hotspotCount > 0 && (
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Hotspots in this scene:
                </h3>
                <div className="space-y-1.5">
                  {currentScene?.hotSpots.map((hs, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300"
                    >
                      {hs.type === 'scene' ? (
                        <DoorOpen className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500" />
                      )}
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
        )
      ) : (
        <div className="py-20 text-center text-neutral-600 dark:text-neutral-400">
          <div className="w-10 h-10 border-4 border-red-600 dark:border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-neutral-900 border border-red-600 dark:border-red-600/40 px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xl text-xs font-semibold text-red-600 dark:text-red-400">
          <div className="w-4 h-4 border-2 border-red-600 dark:border-red-600 border-t-transparent rounded-full animate-spin" />
          Saving changes...
        </div>
      )}
    </div>
  );
}
