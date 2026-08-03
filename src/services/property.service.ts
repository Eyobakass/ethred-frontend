// src/services/property.service.ts
import { apiClient } from './api';
import { Property } from '@/types/property.types';

export const propertyService = {
  async searchProperties(params: Record<string, any>): Promise<{ count: number; results: Property[] }> {
    return apiClient.get('/properties/search', { params });
  },

  async getPropertyById(id: string): Promise<Property> {
    return apiClient.get(`/properties/${id}`);
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

  async toggleFavorite(property_id: string): Promise<{ favorited: boolean }> {
    return apiClient.post(`/favorites/toggle`, { property_id });
  },

  async getFavorites(): Promise<Property[]> {
    return apiClient.get('/favorites');
  },
};
