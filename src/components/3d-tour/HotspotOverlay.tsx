// src/components/3d-tour/HotspotOverlay.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface HotspotOverlayProps {
  isOpen: boolean;
  yaw: number;
  pitch: number;
  availableScenes: { id: string; name: string }[];
  onSave: (data: { type: 'NAVIGATION' | 'INFO'; targetSceneId?: string; label?: string }) => void;
  onCancel: () => void;
}

export const HotspotOverlay: React.FC<HotspotOverlayProps> = ({
  isOpen,
  yaw,
  pitch,
  availableScenes,
  onSave,
  onCancel,
}) => {
  const [type, setType] = useState<'NAVIGATION' | 'INFO'>('NAVIGATION');
  const [targetSceneId, setTargetSceneId] = useState(availableScenes[0]?.id ?? '');
  const [label, setLabel] = useState('');

  // Reset form state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setType('NAVIGATION');
      setTargetSceneId(availableScenes[0]?.id ?? '');
      setLabel('');
    }
  }, [isOpen, availableScenes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'NAVIGATION' && !targetSceneId) return;
    if (type === 'INFO' && !label.trim()) return;
    onSave({
      type,
      targetSceneId: type === 'NAVIGATION' ? targetSceneId : undefined,
      label: type === 'INFO' ? label.trim() : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-red-600 dark:border-red-600/40 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400">📍 Author 3D Hotspot Pin</h3>
          <button
            onClick={onCancel}
            className="text-neutral-500 hover:text-neutral-900 dark:text-white transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
            Pitch: <span className="text-red-600 dark:text-red-400">{pitch.toFixed(2)}°</span>
          </span>
          <span className="text-neutral-600">|</span>
          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
            Yaw: <span className="text-red-600 dark:text-red-400">{yaw.toFixed(2)}°</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pin type selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Pin Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('NAVIGATION')}
                className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                  type === 'NAVIGATION'
                    ? 'bg-red-600 dark:bg-red-600 text-white border-red-600 dark:border-red-600 shadow-lg shadow-red-600 dark:shadow-red-600/20'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-neutral-600'
                }`}
              >
                🚪 Room Doorway
              </button>
              <button
                type="button"
                onClick={() => setType('INFO')}
                className={`py-2.5 text-xs font-bold rounded-xl border transition ${
                  type === 'INFO'
                    ? 'bg-red-600 dark:bg-red-600 text-white border-red-600 dark:border-red-600 shadow-lg shadow-red-600 dark:shadow-red-600/20'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-neutral-600'
                }`}
              >
                ℹ️ Info Tag
              </button>
            </div>
          </div>

          {/* NAVIGATION: target scene */}
          {type === 'NAVIGATION' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Target Room Scene
              </label>
              {availableScenes.length === 0 ? (
                <p className="text-xs text-red-400 bg-red-950/50 border border-red-800 p-3 rounded-xl">
                  No other scenes available. Add more panoramas first.
                </p>
              ) : (
                <select
                  value={targetSceneId}
                  onChange={(e) => setTargetSceneId(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-red-600 dark:border-red-600 transition"
                >
                  {availableScenes.map((scene) => (
                    <option key={scene.id} value={scene.id}>
                      {scene.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* INFO: label text */}
          {type === 'INFO' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Information Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Italian Marble Floor Finish"
                maxLength={120}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-red-600 dark:border-red-600 transition"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:bg-neutral-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 dark:bg-red-600 text-white text-xs font-bold hover:bg-red-500 dark:bg-red-500 transition shadow-lg shadow-red-600 dark:shadow-red-600/20"
            >
              Save Pin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
