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
    const res: any = await apiClient.post('/properties', data);
    return res?.data ?? res;
  },

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    const res: any = await apiClient.put(`/properties/${id}`, data);
    return res?.data ?? res;
  },

  async deleteProperty(id: string): Promise<{ success: boolean }> {
    const res: any = await apiClient.delete(`/properties/${id}`);
    return res?.data ?? res;
  },

  async submitForReview(id: string): Promise<Property> {
    const res: any = await apiClient.post(`/properties/${id}/submit`);
    return res?.data ?? res;
  },

  async createDraftClone(id: string): Promise<Property> {
    const res: any = await apiClient.post(`/properties/${id}/draft`);
    return res?.data ?? res;
  },

  async getExistingDraft(id: string): Promise<Property | null> {
    const res = await apiClient.get<any, any>(`/properties/${id}/draft`);
    // Axios interceptor unwraps response.data, so res is { success, data }
    return res?.data || null;
  },

  async deleteDraft(draftId: string): Promise<void> {
    await apiClient.delete(`/properties/${draftId}`);
  },

  async addFavorite(propertyId: string): Promise<any> {
    const res: any = await apiClient.post(`/favorites/${propertyId}`);
    return res?.data ?? res;
  },

  async removeFavorite(propertyId: string): Promise<any> {
    const res: any = await apiClient.delete(`/favorites/${propertyId}`);
    return res?.data ?? res;
  },

  async getFavorites(): Promise<Property[]> {
    const res = await apiClient.get<any, any>('/favorites');
    // res is { success, count, results: [{id, property_id, property: {...}}] }
    return (res?.results || []).map((f: any) => f.property).filter(Boolean);
  },

  async uploadImages(id: string, formData: FormData): Promise<any> {
    const res: any = await apiClient.post(`/properties/${id}/media/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2-minute timeout for heavy image processing
    });
    return res?.data ?? res;
  },

  async deleteMedia(propertyId: string, mediaId: string): Promise<any> {
    const res: any = await apiClient.delete(`/properties/${propertyId}/media/${mediaId}`);
    return res?.data ?? res;
  },

  async getListingStats(id: string): Promise<{ property_id: string; favorites_count: number; inquiries_count: number }> {
    const res = await apiClient.get<any, any>(`/properties/${id}/stats`);
    return res.data || res;
  },

  async uploadDocument(propertyId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('document', file);
    const res: any = await apiClient.post(`/properties/${propertyId}/media/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return res?.data ?? res;
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
