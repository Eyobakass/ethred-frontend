// src/services/admin.service.ts
import { apiClient } from './api';

export const adminService = {
  async getPendingProperties() {
    return apiClient.get('/admin/properties/pending');
  },

  async updatePropertyStatus(propertyId: string, status: 'APPROVED' | 'SUSPENDED') {
    return apiClient.patch(`/admin/properties/${propertyId}/status`, { status });
  },

  async getVerificationTickets() {
    return apiClient.get('/admin/verifications');
  },

  async getAuditLogs() {
    return apiClient.get('/admin/audit-logs');
  },
};
