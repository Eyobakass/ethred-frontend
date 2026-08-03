// src/components/3d-tour/SceneSelectorToolbar.tsx
'use client';

import React, { useRef } from 'react';

interface SceneOption {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

interface SceneSelectorToolbarProps {
  scenes: SceneOption[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
}

export const SceneSelectorToolbar: React.FC<SceneSelectorToolbarProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (scenes.length <= 1) return null; // No point showing toolbar for single scene

  return (
    // Position relative to the nearest positioned ancestor (the viewer wrapper)
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-[90%]">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md px-3 py-2 rounded-full border border-gold-500/30 shadow-2xl overflow-x-auto scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId;
          return (
            <button
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              title={scene.name}
              aria-pressed={isActive}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-xs whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-gold-500 text-black font-extrabold shadow-lg shadow-gold-500/25'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {/* Mini thumbnail */}
              {scene.thumbnailUrl && (
                <div
                  className={`w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border ${
                    isActive ? 'border-black/30' : 'border-neutral-700'
                  }`}
                >
                  <img
                    src={scene.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              {/* Live indicator for active scene */}
              {!scene.thumbnailUrl && (
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isActive ? 'bg-black' : 'bg-emerald-400'
                  }`}
                />
              )}
              <span>{scene.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
