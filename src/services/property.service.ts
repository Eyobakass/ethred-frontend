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
    return apiClient.post('/properties', data);
  },

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    return apiClient.put(`/properties/${id}`, data);
  },

  async deleteProperty(id: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/properties/${id}`);
  },

  async submitForReview(id: string): Promise<Property> {
    return apiClient.post(`/properties/${id}/submit`);
  },

  async createDraftClone(id: string): Promise<Property> {
    return apiClient.post(`/properties/${id}/draft`);
  },

  async getExistingDraft(id: string): Promise<Property | null> {
    const res = await apiClient.get<any, any>(`/properties/${id}/draft`);
    return res || null;
  },

  async deleteDraft(draftId: string): Promise<void> {
    await apiClient.delete(`/properties/${draftId}`);
  },

  async addFavorite(propertyId: string): Promise<any> {
    return apiClient.post(`/favorites/${propertyId}`);
  },

  async removeFavorite(propertyId: string): Promise<any> {
    return apiClient.delete(`/favorites/${propertyId}`);
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

  async getListingStats(id: string): Promise<{ property_id: string; favorites_count: number; inquiries_count: number }> {
    const res = await apiClient.get<any, any>(`/properties/${id}/stats`);
    return res.data || res;
  },

  async uploadDocument(propertyId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('document', file);
    return apiClient.post(`/properties/${propertyId}/media/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  async uploadFloorPlan(propertyId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<any, any>(`/properties/${propertyId}/floor-plan`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res.data || res;
  },
};
