// src/services/tour.service.ts
import { apiClient } from './api';
import { TourConfig } from '@/types/tour.types';
import { Hotspot } from '@/types/property.types';

export const tourService = {
  async getTourConfig(propertyId: string): Promise<TourConfig> {
    return apiClient.get(`/properties/${propertyId}/tour?t=${Date.now()}`);
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

  async uploadPanorama(propertyId: string, formData: FormData, sceneName?: string) {
    const url = `/properties/${propertyId}/media/tour-scene` + (sceneName ? `?scene_name=${encodeURIComponent(sceneName)}` : '');
    
    // Get token dynamically just like the interceptor
    let token = '';
    if (typeof window !== 'undefined') {
      const { useAuthStore } = require('@/store/useAuthStore');
      token = useAuthStore.getState().token || '';
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    
    // Use native fetch to bypass any Axios boundary stripping bugs with FormData
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'POST',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      // No Content-Type header set at all, so the browser natively generates the correct multipart boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to upload panorama');
    }

    return response.json();
  },

  async updateScene(propertyId: string, sceneId: string, data: { scene_name?: string }): Promise<{ success: boolean }> {
    return apiClient.patch(`/properties/${propertyId}/media/${sceneId}`, data);
  },

  async pollRepairStatus(mediaId: string): Promise<{ needs_repair: boolean; file_url: string }> {
    return apiClient.get(`/media/${mediaId}/repair-status`);
  },
};
