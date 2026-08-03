// src/services/tour.service.ts
import { apiClient } from './api';
import { TourConfig } from '@/types/tour.types';
import { Hotspot } from '@/types/property.types';

export const tourService = {
  async getTourConfig(propertyId: string): Promise<TourConfig> {
    return apiClient.get(`/properties/${propertyId}/tour`);
  },

  async addHotspot(data: {
    scene_id: string;
    type: 'NAVIGATION' | 'INFO';
    yaw: number;
    pitch: number;
    target_scene_id?: string;
    label?: string;
  }): Promise<Hotspot> {
    return apiClient.post('/hotspots', data);
  },

  async updateHotspot(id: string, data: Partial<Hotspot>): Promise<Hotspot> {
    return apiClient.put(`/hotspots/${id}`, data);
  },

  async deleteHotspot(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/hotspots/${id}`);
  },

  async deleteScene(propertyId: string, sceneId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/properties/${propertyId}/media/${sceneId}`);
  },

  async uploadPanorama(propertyId: string, formData: FormData) {
    return apiClient.post(`/properties/${propertyId}/media/tour-scene`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async pollRepairStatus(mediaId: string): Promise<{ needs_repair: boolean; file_url: string }> {
    return apiClient.get(`/media/${mediaId}/repair-status`);
  },
};
