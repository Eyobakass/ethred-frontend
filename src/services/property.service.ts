// src/services/property.service.ts
import { apiClient } from './api';
import { Property } from '@/types/property.types';

export const propertyService = {
  async searchProperties(params: Record<string, any>): Promise<{ count: number; results: Property[] }> {
    return apiClient.get('/properties/search', { params });
  },

  async getMyListings(): Promise<Property[]> {
    const res = await apiClient.get<any, any>('/properties');
    return res.results || [];
  },

  async getPropertyById(id: string): Promise<Property> {
    const res = await apiClient.get<any, any>(`/properties/${id}`);
    return res.data || res;
  },

  async createProperty(data: Partial<Property>): Promise<Property> {
    const res = await apiClient.post<any, any>('/properties', data);
    return res.data;
  },

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    const res = await apiClient.put<any, any>(`/properties/${id}`, data);
    return res.data;
  },

  async deleteProperty(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/properties/${id}`);
  },

  async submitForReview(id: string): Promise<Property> {
    const res = await apiClient.post<any, any>(`/properties/${id}/submit`);
    return res.data;
  },

  async createDraftClone(id: string): Promise<Property> {
    const res = await apiClient.post<any, any>(`/properties/${id}/draft`);
    return res.data;
  },

  async getExistingDraft(id: string): Promise<Property | null> {
    const res = await apiClient.get<any, any>(`/properties/${id}/draft`);
    return res.data || null;
  },

  async deleteDraft(draftId: string): Promise<void> {
    await apiClient.delete(`/properties/${draftId}`);
  },

  async toggleFavorite(property_id: string): Promise<{ favorited: boolean }> {
    return apiClient.post(`/favorites/toggle`, { property_id });
  },

  async getFavorites(): Promise<Property[]> {
    return apiClient.get('/favorites');
  },

  async uploadImages(id: string, formData: FormData): Promise<any> {
    return apiClient.post(`/properties/${id}/media/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2-minute timeout for heavy image processing
    });
  },

  async deleteMedia(propertyId: string, mediaId: string): Promise<any> {
    return apiClient.delete(`/properties/${propertyId}/media/${mediaId}`);
  },
};
