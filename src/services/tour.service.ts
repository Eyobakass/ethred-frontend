// src/services/tour.service.ts
import { apiClient } from './api';
import { TourConfig } from '@/types/tour.types';
import { Hotspot } from '@/types/property.types';

export const tourService = {
  async getTourConfig(propertyId: string, noCache?: boolean): Promise<TourConfig> {
    const query = noCache ? `?t=${Date.now()}` : '';
    return apiClient.get(`/properties/${propertyId}/tour${query}`);
  },

  async addHotspot(data: {
    scene_id: string;
    type: 'NAVIGATION' | 'INFO';
    yaw: number;
    pitch: number;
    target_scene_id?: string;
    label?: string;
  }): Promise<Hotspot> {
    const res: any = await apiClient.post('/hotspots', data);
    return res?.data ?? res;
  },

  async updateHotspot(id: string, data: Partial<Hotspot>): Promise<Hotspot> {
    const res: any = await apiClient.patch(`/hotspots/${id}`, data);
    return res?.data ?? res;
  },

  async deleteHotspot(id: string): Promise<{ success: boolean }> {
    const res: any = await apiClient.delete(`/hotspots/${id}`);
    return res?.data ?? res;
  },

  async deleteScene(propertyId: string, sceneId: string): Promise<{ success: boolean }> {
    const res: any = await apiClient.delete(`/properties/${propertyId}/media/${sceneId}`);
    return res?.data ?? res;
  },

  async uploadPanorama(propertyId: string, formData: FormData, sceneName?: string) {
    const url = `/properties/${propertyId}/media/tour-scene` + (sceneName ? `?scene_name=${encodeURIComponent(sceneName)}` : '');
    
    const res: any = await apiClient.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2-minute timeout for heavy image processing
    });
    return res?.data ?? res;
  },

  // ETH-INT-003: Must call PATCH /media/:id (media module) NOT /properties/:id/media/:id
  // The properties/service.js::updateMedia only saves scene_name, silently dropping
  // initial_yaw, fp_x, and fp_y. The media/service.js::updateMedia handles all fields.
  async updateScene(propertyId: string, sceneId: string, data: {
    scene_name?: string;
    initial_yaw?: number;
    fp_x?: number | null;
    fp_y?: number | null;
  }): Promise<{ success: boolean }> {
    const res: any = await apiClient.patch(`/media/${sceneId}`, data);
    return res?.data ?? res;
  },

  async pollRepairStatus(mediaId: string): Promise<{ needs_repair: boolean; file_url: string }> {
    return apiClient.get(`/media/${mediaId}/repair-status`);
  },

  // ETH-INT-004: Bulk reorder — backend PATCH /:id/tour/reorder accepts { scene_order: string[] }
  async reorderScenes(propertyId: string, sceneIds: string[]): Promise<{ success: boolean }> {
    const res: any = await apiClient.patch(`/properties/${propertyId}/tour/reorder`, { scene_order: sceneIds });
    return res?.data ?? res;
  },
};
