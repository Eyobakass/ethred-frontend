// src/services/agency.service.ts
import { apiClient } from './api';
import { Agency, AgencyEmployee } from '@/types/agency.types';

export const agencyService = {
  async listAgencies(): Promise<Agency[]> {
    return apiClient.get('/agencies');
  },

  async getAgencyById(id: string): Promise<Agency> {
    return apiClient.get(`/agencies/${id}`);
  },

  async registerAgency(data: {
    name: string;
    description_en?: string;
    business_license_url?: string;
    logo_url?: string;
  }): Promise<Agency> {
    return apiClient.post('/agencies', data);
  },

  async addEmployee(agencyId: string, phone_number: string): Promise<AgencyEmployee> {
    return apiClient.post(`/agencies/${agencyId}/employees`, { phone_number });
  },

  async getAgencyEmployees(agencyId: string): Promise<AgencyEmployee[]> {
    return apiClient.get(`/agencies/${agencyId}/employees`);
  },

  async removeEmployee(agencyId: string, employeeId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/agencies/${agencyId}/employees/${employeeId}`);
  },
};
