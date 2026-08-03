// src/services/property.service.ts
import { apiClient } from './api';
import { Property } from '@/types/property.types';

export const propertyService = {
  async searchProperties(params: Record<string, any>): Promise<{ count: number; results: Property[] }> {
    return apiClient.get('/properties/search', { params });
  },

  async getPropertyById(id: string): Promise<Property> {
    const res = await apiClient.get<any, any>(`/properties/${id}`);
    return res.data;
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

  async toggleFavorite(property_id: string): Promise<{ favorited: boolean }> {
    return apiClient.post(`/favorites/toggle`, { property_id });
  },

  async getFavorites(): Promise<Property[]> {
    return apiClient.get('/favorites');
  },
};
