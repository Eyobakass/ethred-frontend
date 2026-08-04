// src/app/[lang]/properties/[id]/tour/page.tsx
'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { PannellumViewer } from '@/components/3d-tour/PannellumViewer';
import { FloorPlanOverlay } from '@/components/3d-tour/FloorPlanOverlay';
import { SceneSelectorToolbar } from '@/components/3d-tour/SceneSelectorToolbar';
import { tourService } from '@/services/tour.service';
import { propertyService } from '@/services/property.service';
import { TourConfig } from '@/types/tour.types';
import { Property, PropertyMedia } from '@/types/property.types';

// ── Demo fallback data ────────────────────────────────────────────────────────
const DEMO_TOUR_CONFIG: TourConfig = {
  default: { firstScene: 'living-room', sceneFadeDuration: 1000 },
  scenes: {
    'living-room': {
      title: 'Living Room',
      type: 'equirectangular',
      panorama: 'https://pannellum.org/images/alma.jpg',
      hotSpots: [
        { pitch: 0, yaw: 45, type: 'scene', text: 'Walk to Kitchen', sceneId: 'kitchen' },
        { pitch: 10, yaw: -90, type: 'info', text: 'Italian Marble Floor' },
      ],
    },
    kitchen: {
      title: 'Kitchen',
      type: 'equirectangular',
      panorama: 'https://pannellum.org/images/cerro-toco.jpg',
      hotSpots: [
        { pitch: 0, yaw: -135, type: 'scene', text: 'Back to Living Room', sceneId: 'living-room' },
      ],
    },
    bedroom: {
      title: 'Master Bedroom',
      type: 'equirectangular',
      panorama: 'https://pannellum.org/images/jfk.jpg',
      hotSpots: [
        { pitch: -5, yaw: 100, type: 'scene', text: 'Back to Living Room', sceneId: 'living-room' },
      ],
    },
  },
};

const DEMO_SCENES: PropertyMedia[] = [
  { id: 'living-room', property_id: '', file_url: 'https://pannellum.org/images/alma.jpg', media_category: 'IMAGE', sort_order: 0, is_tour_scene: true, scene_name: 'Living Room', fp_x: 30, fp_y: 60 },
  { id: 'kitchen', property_id: '', file_url: 'https://pannellum.org/images/cerro-toco.jpg', media_category: 'IMAGE', sort_order: 1, is_tour_scene: true, scene_name: 'Kitchen', fp_x: 65, fp_y: 40 },
  { id: 'bedroom', property_id: '', file_url: 'https://pannellum.org/images/jfk.jpg', media_category: 'IMAGE', sort_order: 2, is_tour_scene: true, scene_name: 'Master Bedroom', fp_x: 50, fp_y: 20 },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function VirtualTourPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: rawLang, id: propertyId } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';

  const [tourConfig, setTourConfig] = useState<TourConfig | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string>('');
  const [scenesList, setScenesList] = useState<PropertyMedia[]>([]);
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  useEffect(() => {
    // Fetch property meta
    propertyService
      .getPropertyById(propertyId)
      .then((res) => { if (res) setProperty(res); })
      .catch(() => {});

    // Fetch tour config
    tourService
      .getTourConfig(propertyId)
      .then((config) => {
        if (config?.scenes && Object.keys(config.scenes).length > 0) {
          setTourConfig(config);
          setActiveSceneId(config.default?.firstScene ?? Object.keys(config.scenes)[0]);
          // Build scenes list from config
          const mediaList: PropertyMedia[] = Object.entries(config.scenes).map(
            ([id, scene], idx) => ({
              id,
              property_id: propertyId,
              file_url: scene.panorama,
              media_category: 'IMAGE' as const,
              sort_order: idx,
              is_tour_scene: true,
              scene_name: scene.title ?? id,
            })
          );
          setScenesList(mediaList);
        }
      })
      .catch(() => {
        // Demo fallback
        setTourConfig(DEMO_TOUR_CONFIG);
        setActiveSceneId('living-room');
        setScenesList(DEMO_SCENES.map((s) => ({ ...s, property_id: propertyId })));
      });
  }, [propertyId]);

  // When user selects a scene from toolbar/floor plan, update active state
  const handleExternalSceneSelect = useCallback(
    (sceneId: string) => {
      if (!tourConfig || sceneId === activeSceneId) return;
      setActiveSceneId(sceneId);
      setTourConfig((prev) =>
        prev ? { ...prev, default: { ...prev.default, firstScene: sceneId } } : prev
      );
    },
    [tourConfig, activeSceneId]
  );

  const propertyTitle = property
    ? lang === 'am' && property.title_am
      ? property.title_am
      : property.title_en
    : '3D Virtual Tour';

  const sceneCount = tourConfig ? Object.keys(tourConfig.scenes).length : 0;

  return (
    <div className="relative min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 inset-x-0 z-30 bg-neutral-50 dark:bg-neutral-950/90 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/${lang}/properties/${propertyId}`}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {lang === 'am' ? 'ወደ ዝርዝር' : 'Exit Tour'}
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-neutral-900 dark:text-white leading-none truncate">{propertyTitle}</h1>
            <p className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-0.5">
              {sceneCount} {lang === 'am' ? 'ክፍሎች' : 'Rooms'} · Navigable 3D Scene Graph
            </p>
          </div>
        </div>
      </div>

      {/* ── Viewer area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 relative flex flex-col justify-center">
        {tourConfig ? (
          <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            {/* Scene selector toolbar */}
            <SceneSelectorToolbar
              scenes={Object.entries(tourConfig.scenes).map(([id, scene]) => ({
                id,
                name: scene.title ?? id,
                thumbnailUrl: scene.panorama,
              }))}
              activeSceneId={activeSceneId}
              onSelectScene={handleExternalSceneSelect}
            />

            {/* Main 360° viewer */}
            <PannellumViewer
              tourConfig={tourConfig}
              onSceneChange={(sceneId) => setActiveSceneId(sceneId)}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[550px]">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-red-600 dark:border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold">Loading 3D Scene Graph...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
