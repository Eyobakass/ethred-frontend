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
    return res;
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

  async toggleFavorite(property_id: string): Promise<{ favorited: boolean }> {
    return apiClient.post(`/favorites/toggle`, { property_id });
  },

  async getFavorites(): Promise<Property[]> {
    return apiClient.get('/favorites');
  },

  async uploadImages(id: string, formData: FormData): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No auth token');

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api/v1';
    const res = await fetch(`${baseUrl}/properties/${id}/media/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload images');
    }
    return res.json();
  },

  async deleteMedia(propertyId: string, mediaId: string): Promise<any> {
    return apiClient.delete(`/properties/${propertyId}/media/${mediaId}`);
  },
};
