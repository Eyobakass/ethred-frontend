// src/components/3d-tour/FloorPlanOverlay.tsx
'use client';

import React from 'react';
import { PropertyMedia } from '@/types/property.types';

interface FloorPlanOverlayProps {
  floorPlanUrl: string;
  scenes: PropertyMedia[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
}

export const FloorPlanOverlay: React.FC<FloorPlanOverlayProps> = ({
  floorPlanUrl,
  scenes,
  activeSceneId,
  onSelectScene,
}) => {
  // Only show scenes that have floor plan coordinates
  const sceneWithCoords = scenes.filter(
    (s) => s.fp_x != null && s.fp_y != null
  );

  return (
    // This component must be rendered inside a `relative`-positioned parent
    <div className="absolute bottom-5 left-5 z-20 bg-neutral-950/90 backdrop-blur-md p-3 rounded-xl border border-gold-500/30 w-[240px] shadow-2xl">
      <div className="text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-2 flex items-center justify-between">
        <span>🗺️ Floor Plan</span>
        {sceneWithCoords.length > 0 && (
          <span className="text-neutral-500 normal-case font-normal">
            {sceneWithCoords.length} rooms mapped
          </span>
        )}
      </div>

      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800">
        <img
          src={floorPlanUrl}
          alt="2D Floor Plan Layout"
          className="w-full h-full object-contain opacity-90"
          loading="lazy"
        />

        {sceneWithCoords.map((scene) => {
          const isActive = scene.id === activeSceneId;
          return (
            <button
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              style={{
                left: `${scene.fp_x}%`,
                top: `${scene.fp_y}%`,
              }}
              title={scene.scene_name ?? 'Room'}
              aria-label={`Navigate to ${scene.scene_name ?? 'room'}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isActive
                  ? 'z-10 scale-125'
                  : 'hover:scale-110'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-lg ${
                  isActive
                    ? 'bg-gold-500 border-gold-300 shadow-gold-500/50'
                    : 'bg-emerald-600 border-emerald-400 shadow-emerald-500/30 hover:bg-emerald-500'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-black' : 'bg-white'}`} />
              </div>
              {/* Active scene label */}
              {isActive && scene.scene_name && (
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900 text-gold-400 text-[9px] font-bold px-1.5 py-0.5 rounded shadow border border-gold-500/30">
                  {scene.scene_name}
                </div>
              )}
            </button>
          );
        })}

        {sceneWithCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[10px] text-neutral-500 text-center px-4">
              No room positions mapped yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
