// src/services/agency.service.ts
import { apiClient } from './api';
import { Agency, AgencyEmployee } from '@/types/index';

export const agencyService = {
  async listAgencies(params?: { page?: number; limit?: number; search?: string }) {
    const res = await apiClient.get('/agencies', { params });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async getAgency(id: string): Promise<Agency> {
    const res = await apiClient.get(`/agencies/${id}`);
    return (res as unknown as { data: Agency }).data ?? res;
  },

  async createAgency(formData: FormData): Promise<Agency> {
    // Requires multipart/form-data for business_license file
    const res = await apiClient.post('/agencies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return (res as unknown as { data: Agency }).data ?? res;
  },

  async updateAgency(id: string, data: Partial<Agency>): Promise<Agency> {
    const res = await apiClient.put(`/agencies/${id}`, data);
    return (res as unknown as { data: Agency }).data ?? res;
  },

  async inviteEmployee(agencyId: string, email: string) {
    const res = await apiClient.post(`/agencies/${agencyId}/invite`, { email });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async listEmployees(agencyId: string): Promise<AgencyEmployee[]> {
    const res = await apiClient.get(`/agencies/${agencyId}/employees`);
    return (res as unknown as { data: AgencyEmployee[] }).data ?? res;
  },

  async removeEmployee(agencyId: string, userId: string) {
    const res = await apiClient.delete(`/agencies/${agencyId}/employees/${userId}`);
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async getAnalytics(agencyId: string) {
    const res = await apiClient.get(`/agencies/${agencyId}/analytics`);
    return (res as unknown as { data: unknown }).data ?? res;
  },
};
