// src/types/tour.types.ts

export interface PannellumHotSpot {
  pitch: number;
  yaw: number;
  type: 'scene' | 'info';
  text?: string;
  sceneId?: string;
  id?: string;
}

export interface PannellumScene {
  title?: string;
  type: 'equirectangular';
  panorama: string;
  yaw?: number;
  pitch?: number;
  hfov?: number;
  hotSpots: PannellumHotSpot[];
}

export interface TourConfig {
  default: {
    firstScene: string;
    sceneFadeDuration?: number;
    autoLoad?: boolean;
    compass?: boolean;
  };
  scenes: Record<string, PannellumScene>;
}
