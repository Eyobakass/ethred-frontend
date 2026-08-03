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
  isEditMode?: boolean;
  onDeleteScene?: (sceneId: string) => void;
  onReplaceScene?: (sceneId: string) => void;
}

export const SceneSelectorToolbar: React.FC<SceneSelectorToolbarProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  isEditMode = false,
  onDeleteScene,
  onReplaceScene,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!isEditMode && scenes.length <= 1) return null; // No point showing toolbar for single scene in view mode
  if (scenes.length === 0) return null;

  return (
    // Position relative to the nearest positioned ancestor (the viewer wrapper)
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-[90%]">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-950/90 backdrop-blur-md px-3 py-2 rounded-full border border-red-600 dark:border-red-600/30 shadow-2xl overflow-x-auto scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId;
          return (
            <div key={scene.id} className="flex items-center gap-1">
              <button
                onClick={() => onSelectScene(scene.id)}
                title={scene.name}
                aria-pressed={isActive}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-xs whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-red-600 dark:bg-red-600 text-white font-extrabold shadow-lg shadow-red-600 dark:shadow-red-600/25'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:text-white hover:bg-neutral-50 dark:bg-neutral-800'
                }`}
              >
                {/* Mini thumbnail */}
                {scene.thumbnailUrl && (
                  <div
                    className={`w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border ${
                      isActive ? 'border-black/30' : 'border-neutral-300 dark:border-neutral-700'
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
              
              {isActive && isEditMode && (
                <div className="flex items-center gap-1 ml-1 bg-black/80 dark:bg-black/60 rounded-full px-1.5 py-1">
                  {onReplaceScene && (
                    <button
                      onClick={() => onReplaceScene(scene.id)}
                      title="Replace Scene Photo"
                      className="text-amber-400 hover:text-amber-300 transition text-xs p-1"
                    >
                      🔄
                    </button>
                  )}
                  {onDeleteScene && (
                    <button
                      onClick={() => onDeleteScene(scene.id)}
                      title="Delete Scene"
                      className="text-red-400 hover:text-red-300 transition text-xs p-1"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
