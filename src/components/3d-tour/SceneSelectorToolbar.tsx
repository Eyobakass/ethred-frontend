// src/components/3d-tour/SceneSelectorToolbar.tsx
'use client';

import React, { useRef, useState } from 'react';
import { Trash2, RefreshCw, Edit2, Check, X } from 'lucide-react';

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
  onRenameScene?: (sceneId: string, newName: string) => void;
}

export const SceneSelectorToolbar: React.FC<SceneSelectorToolbarProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  isEditMode = false,
  onDeleteScene,
  onReplaceScene,
  onRenameScene,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isEditMode && scenes.length <= 1) return null;
  if (scenes.length === 0) return null;

  const handleStartEdit = (sceneId: string, currentName: string) => {
    setEditingSceneId(sceneId);
    setEditName(currentName);
  };

  const handleSaveEdit = (sceneId: string) => {
    if (editName.trim() && onRenameScene) {
      onRenameScene(sceneId, editName.trim());
    }
    setEditingSceneId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, sceneId: string) => {
    if (e.key === 'Enter') handleSaveEdit(sceneId);
    if (e.key === 'Escape') setEditingSceneId(null);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-[90%]">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-950/90 backdrop-blur-md px-3 py-2 rounded-full border border-red-600 dark:border-red-600/30 shadow-2xl overflow-x-auto scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId;
          const isEditing = editingSceneId === scene.id;

          return (
            <div key={scene.id} className="flex items-center gap-1">
              <button
                onClick={() => !isEditing && onSelectScene(scene.id)}
                title={scene.name}
                aria-pressed={isActive}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-xs whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-red-600 dark:bg-red-600 text-white font-extrabold shadow-lg shadow-red-600 dark:shadow-red-600/25'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:text-white hover:bg-neutral-50 dark:bg-neutral-800'
                }`}
              >
                {scene.thumbnailUrl && !isEditing && (
                  <div className={`w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border ${isActive ? 'border-black/30' : 'border-neutral-300 dark:border-neutral-700'}`}>
                    <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                {!scene.thumbnailUrl && !isEditing && (
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-black' : 'bg-emerald-400'}`} />
                )}
                
                {isEditing ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => handleKeyDown(e, scene.id)}
                      className="bg-transparent text-white placeholder-white/70 outline-none border-b border-white/40 w-24 px-1"
                    />
                    <Check onClick={() => handleSaveEdit(scene.id)} className="w-3.5 h-3.5 hover:text-green-300 cursor-pointer" />
                    <X onClick={() => setEditingSceneId(null)} className="w-3.5 h-3.5 hover:text-red-300 cursor-pointer" />
                  </div>
                ) : (
                  <span>{scene.name}</span>
                )}
              </button>
              
              {isActive && isEditMode && !isEditing && (
                <div className="flex items-center gap-1.5 ml-1 bg-black/80 dark:bg-black/60 rounded-full px-2 py-1">
                  {onRenameScene && (
                    <button onClick={() => handleStartEdit(scene.id, scene.name)} title="Rename Scene" className="text-neutral-300 hover:text-white transition p-0.5">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onReplaceScene && (
                    <button onClick={() => onReplaceScene(scene.id)} title="Replace Scene Photo" className="text-amber-400 hover:text-amber-300 transition p-0.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteScene && (
                    <button onClick={() => onDeleteScene(scene.id)} title="Delete Scene" className="text-red-400 hover:text-red-300 transition p-0.5">
                      <Trash2 className="w-3.5 h-3.5" />
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
