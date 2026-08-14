// src/services/admin.service.ts
import { apiClient } from './api';
import { Property } from '@/types/property.types';
import { AdminDashboardStats, AuditLog } from '@/types/index';

export const adminService = {
  // ─── Dashboard ─────────────────────────────────────────────────────────────
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const res = await apiClient.get('/admin/dashboard');
    return (res as unknown as { data: AdminDashboardStats }).data ?? res;
  },

  // ─── Properties ────────────────────────────────────────────────────────────
  async getPendingProperties(params?: { page?: number; limit?: number }) {
    const res = await apiClient.get('/admin/properties/pending', { params });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async approveProperty(id: string) {
    const res = await apiClient.patch(`/admin/properties/${id}/approve`);
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async rejectProperty(id: string, reason: string) {
    const res = await apiClient.patch(`/admin/properties/${id}/reject`, { reason });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async suspendProperty(id: string, reason: string) {
    const res = await apiClient.patch(`/admin/properties/${id}/suspend`, { reason });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  // Legacy wrapper used by existing review page
  async updatePropertyStatus(
    propertyId: string,
    status: 'APPROVED' | 'SUSPENDED' | 'REJECTED',
    reason?: string
  ) {
    if (status === 'APPROVED') return adminService.approveProperty(propertyId);
    if (status === 'SUSPENDED') return adminService.suspendProperty(propertyId, reason || '');
    return adminService.rejectProperty(propertyId, reason || '');
  },

  // ─── Users ─────────────────────────────────────────────────────────────────
  async listUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
    const res = await apiClient.get('/admin/users', { params });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async getUser(id: string) {
    const res = await apiClient.get(`/admin/users/${id}`);
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async banUser(id: string, reason: string) {
    const res = await apiClient.patch(`/admin/users/${id}/ban`, { reason });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async unbanUser(id: string) {
    const res = await apiClient.patch(`/admin/users/${id}/unban`);
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async verifyUserIdentity(id: string) {
    const res = await apiClient.patch(`/admin/users/${id}/verify-identity`);
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async changeUserRole(id: string, role: string) {
    const res = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  // ─── Agencies ──────────────────────────────────────────────────────────────
  async getPendingAgencies(params?: { page?: number; limit?: number }) {
    const res = await apiClient.get('/admin/agencies/pending', { params });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async approveAgency(id: string) {
    const res = await apiClient.patch(`/admin/agencies/${id}/approve`);
    return (res as unknown as { data: unknown }).data ?? res;
  },

  async rejectAgency(id: string, reason: string) {
    const res = await apiClient.patch(`/admin/agencies/${id}/reject`, { reason });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  // ─── Audit Logs ────────────────────────────────────────────────────────────
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    target_table?: string;
    actor_id?: string;
  }) {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return (res as unknown as { data: unknown }).data ?? res;
  },

  // ─── Legacy (kept for backward compat) ─────────────────────────────────────
  async getVerificationTickets() {
    const res = await apiClient.get('/admin/verifications');
    return (res as unknown as { data: unknown }).data ?? res;
  },
};
