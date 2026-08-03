// src/store/useTourStore.ts
import { create } from 'zustand';
import { TourConfig } from '@/types/tour.types';

interface TourStore {
  activeTourConfig: TourConfig | null;
  currentSceneId: string | null;
  isEditMode: boolean;
  activeFloorPlanUrl: string | null;
  setTourConfig: (config: TourConfig) => void;
  setCurrentSceneId: (sceneId: string) => void;
  setEditMode: (enabled: boolean) => void;
  setFloorPlanUrl: (url: string | null) => void;
}

export const useTourStore = create<TourStore>((set) => ({
  activeTourConfig: null,
  currentSceneId: null,
  isEditMode: false,
  activeFloorPlanUrl: null,
  setTourConfig: (config) =>
    set({
      activeTourConfig: config,
      currentSceneId: config.default?.firstScene || null,
    }),
  setCurrentSceneId: (sceneId) => set({ currentSceneId: sceneId }),
  setEditMode: (enabled) => set({ isEditMode: enabled }),
  setFloorPlanUrl: (url) => set({ activeFloorPlanUrl: url }),
}));
