// src/components/3d-tour/PannellumViewer.tsx
'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { TourConfig } from '@/types/tour.types';
import { getImageUrl } from '@/utils/imageUrl';

interface PannellumViewerProps {
  tourConfig: TourConfig;
  activeSceneId?: string;
  onSceneChange?: (sceneId: string) => void;
  isEditMode?: boolean;
  onAddHotspot?: (yaw: number, pitch: number) => void;
  onDeleteHotspot?: (hotspotId: string) => void;
}

declare global {
  interface Window {
    pannellum: {
      viewer: (container: HTMLElement, config: object) => PannellumViewerInstance;
    };
  }
}

interface PannellumViewerInstance {
  on: (event: string, handler: (id: string) => void) => void;
  off: (event: string, handler: (id: string) => void) => void;
  destroy: () => void;
  mouseEventToCoords: (e: MouseEvent) => [number, number] | null;
  loadScene: (sceneId: string, pitch?: number | 'same', yaw?: number | 'same', hfov?: number | 'same') => void;
  getScene: () => string;
}

// Singleton script loader — ensures script is only injected once
let pannellumLoadPromise: Promise<void> | null = null;

function loadPannellum(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.pannellum) return Promise.resolve();
  if (pannellumLoadPromise) return pannellumLoadPromise;

  pannellumLoadPromise = new Promise((resolve, reject) => {
    const existingCss = document.querySelector(
      'link[href*="pannellum"]'
    );
    if (!existingCss) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href =
        'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(css);
    }

    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pannellum'));
    document.body.appendChild(script);
  });

  return pannellumLoadPromise;
}

export const PannellumViewer: React.FC<PannellumViewerProps> = ({
  tourConfig,
  activeSceneId,
  onSceneChange,
  isEditMode = false,
  onAddHotspot,
  onDeleteHotspot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewerInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable callback refs so they never cause viewer re-init
  const onSceneChangeRef = useRef(onSceneChange);
  const onAddHotspotRef = useRef(onAddHotspot);
  const onDeleteHotspotRef = useRef(onDeleteHotspot);
  useEffect(() => { onSceneChangeRef.current = onSceneChange; }, [onSceneChange]);
  useEffect(() => { onAddHotspotRef.current = onAddHotspot; }, [onAddHotspot]);
  useEffect(() => { onDeleteHotspotRef.current = onDeleteHotspot; }, [onDeleteHotspot]);

  // Load Pannellum script once
  useEffect(() => {
    loadPannellum()
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err.message));
  }, []);

  // Hold references to preloaded images so they aren't garbage collected
  const preloadedImagesRef = useRef<{ [key: string]: HTMLImageElement }>({});

  // Preload and decode all panoramas to avoid loading glitches
  useEffect(() => {
    if (!tourConfig || !tourConfig.scenes) return;
    
    Object.values(tourConfig.scenes).forEach((scene: any) => {
      if (scene.panorama) {
        const fullUrl = getImageUrl(scene.panorama);
        if (!preloadedImagesRef.current[fullUrl]) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = fullUrl;
          // Force off-thread decoding so the browser has the bitmap ready in RAM
          img.decode().catch(() => {});
          preloadedImagesRef.current[fullUrl] = img;
          
          // Also fetch with CORS to strictly enforce network cache
          fetch(fullUrl, { mode: 'cors', cache: 'force-cache' }).catch(() => {});
        }
      }
    });
  }, [tourConfig]);

  // Stable click handler for edit mode
  const handleClick = useCallback((event: MouseEvent) => {
    // If they clicked on a hotspot (a div with class pnlm-hotspot-base), don't trigger add hotspot
    if ((event.target as HTMLElement).closest('.pnlm-hotspot-base')) {
      return;
    }
    if (!viewerRef.current || !onAddHotspotRef.current) return;
    const coords = viewerRef.current.mouseEventToCoords(event);
    if (coords && Array.isArray(coords)) {
      const [pitch, yaw] = coords;
      onAddHotspotRef.current(yaw, pitch);
    }
  }, []); // no deps — everything accessed via refs

  // Stable scene-change handler
  const handleSceneChange = useCallback((sceneId: string) => {
    if (onSceneChangeRef.current) onSceneChangeRef.current(sceneId);
  }, []);

  // Init / re-init Pannellum viewer whenever tourConfig changes
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !tourConfig) return;

    // Destroy any existing instance
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy();
      } catch {
        // ignore
      }
      viewerRef.current = null;
    }

    try {
      // Pre-process scenes to attach delete handlers to hotspots if in edit mode
      const processedScenes = Object.fromEntries(
        Object.entries(tourConfig.scenes).map(([sceneId, scene]) => [
          sceneId,
          {
            ...scene,
            panorama: scene.panorama ? getImageUrl(scene.panorama) : scene.panorama,
            hotSpots: scene.hotSpots?.map((hs: any) => ({
              ...hs,
              cssClass: 'redfin-hotspot', // Force override database value
              targetYaw: 'same',          // Force Pannellum native 'same' handling
              targetPitch: 'same',        // Force Pannellum native 'same' handling
              clickHandlerFunc: (event: any, args: any) => {
                if (isEditMode && onDeleteHotspotRef.current) {
                  onDeleteHotspotRef.current(args.id);
                } else if (hs.type === 'scene' && hs.sceneId && !isEditMode) {
                  viewerRef.current?.loadScene(hs.sceneId, 'same', 'same');
                }
              },
              clickHandlerArgs: { id: hs.id },
            })),
          },
        ])
      );

      const viewer = window.pannellum.viewer(containerRef.current, {
        default: {
          firstScene: tourConfig.default.firstScene,
          sceneFadeDuration: 400, // Force override database value (which returns 1000)
          autoLoad: true,
          compass: true,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
          keyboardZoom: true,
        },
        scenes: processedScenes,
      });

      viewer.on('scenechange', handleSceneChange);
      viewerRef.current = viewer;
    } catch (err) {
      console.error('[PannellumViewer] Initialization error:', err);
      setError('Failed to initialize 3D viewer');
    }

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch {
          // ignore
        }
        viewerRef.current = null;
      }
    };
  // tourConfig is the only dep that should re-init the viewer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, tourConfig]);

  // Change scene externally without destroying viewer
  useEffect(() => {
    if (viewerRef.current && activeSceneId) {
      if (viewerRef.current.getScene() !== activeSceneId) {
        viewerRef.current.loadScene(activeSceneId);
      }
    }
  }, [activeSceneId]);

  // Attach / detach click handler when edit mode changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isLoaded) return;

    if (isEditMode) {
      container.addEventListener('dblclick', handleClick);
      return () => container.removeEventListener('dblclick', handleClick);
    }
  }, [isLoaded, isEditMode, handleClick]);

  if (error) {
    return (
      <div className="w-full h-[400px] md:h-[500px] rounded-lg border border-red-800 bg-red-950/30 flex items-center justify-center">
        <div className="text-center text-red-400 space-y-2 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          <p className="text-sm font-semibold">3D Tour Unavailable</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-black shadow-sm border border-red-600 dark:border-red-600/20">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 z-10">
          <div className="flex flex-col items-center gap-3 text-neutral-600 dark:text-neutral-400">
            <div className="w-10 h-10 border-4 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" />
            <span className="text-sm font-semibold">Loading 3D Virtual Tour...</span>
            <span className="text-xs text-neutral-500">Initializing WebGL renderer</span>
          </div>
        </div>
      )}

      {isEditMode && isLoaded && (
        <div className="absolute top-3 right-3 z-20 bg-amber-500/20 border border-amber-500/40 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-3 py-1.5 rounded-lg pointer-events-none">
          🛠️ EDIT MODE — Double-click to drop pin • Click pin to delete
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" />
      <style>{`
        .pnlm-load-box, .pnlm-lbox {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }

        /* Redfin-style Hotspot Custom CSS */
        .redfin-hotspot {
          width: 34px;
          height: 34px;
          margin-left: -17px;
          margin-top: -17px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.95);
          background-color: rgba(0, 0, 0, 0.3);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform-origin: center center;
          position: absolute;
          z-index: 2;
          pointer-events: auto;
        }
        
        .redfin-hotspot:hover {
          background-color: rgba(255, 255, 255, 0.45);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0, 0, 0, 0.5);
          transform: scale(1.15);
        }

        /* Hide the default hover tooltip if we want a clean look */
        .redfin-hotspot .pnlm-tooltip {
          display: none !important;
        }
      `}</style>
    </div>
  );
};
