import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '@/services/admin.service';

vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/services/api';

const mockGet = vi.mocked(apiClient.get);
const mockPatch = vi.mocked(apiClient.patch);

beforeEach(() => vi.clearAllMocks());

describe('adminService — dashboard', () => {
  it('getDashboardStats — calls GET /admin/dashboard', async () => {
    const stats = { users: { total: 100 }, properties: { total: 50, pending: 5 }, agencies: { total: 10, pending: 2 }, revenue: { total_etb: 50000, total_invoices: 20, completed_count: 15 } };
    mockGet.mockResolvedValueOnce(stats);
    const result = await adminService.getDashboardStats();
    expect(mockGet).toHaveBeenCalledWith('/admin/dashboard');
    expect(result).toEqual(stats);
  });
});

describe('adminService — property moderation', () => {
  it('getPendingProperties — calls GET /admin/properties/pending', async () => {
    mockGet.mockResolvedValueOnce([{ id: 'p1', status: 'PENDING' }]);
    await adminService.getPendingProperties({ page: 1, limit: 10 });
    expect(mockGet).toHaveBeenCalledWith('/admin/properties/pending', { params: { page: 1, limit: 10 } });
  });

  it('approveProperty — calls PATCH /admin/properties/:id/approve', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'p1', status: 'APPROVED' });
    await adminService.approveProperty('p1');
    expect(mockPatch).toHaveBeenCalledWith('/admin/properties/p1/approve');
  });

  it('rejectProperty — calls PATCH /admin/properties/:id/reject with reason', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'p1', status: 'REJECTED' });
    await adminService.rejectProperty('p1', 'Incomplete information.');
    expect(mockPatch).toHaveBeenCalledWith('/admin/properties/p1/reject', { reason: 'Incomplete information.' });
  });

  it('suspendProperty — calls PATCH /admin/properties/:id/suspend with reason', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'p1', status: 'SUSPENDED' });
    await adminService.suspendProperty('p1', 'Policy violation.');
    expect(mockPatch).toHaveBeenCalledWith('/admin/properties/p1/suspend', { reason: 'Policy violation.' });
  });
});

describe('adminService — updatePropertyStatus (legacy wrapper)', () => {
  it('routes APPROVED to approveProperty', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'p1', status: 'APPROVED' });
    await adminService.updatePropertyStatus('p1', 'APPROVED');
    expect(mockPatch).toHaveBeenCalledWith('/admin/properties/p1/approve');
  });

  it('routes REJECTED to rejectProperty with reason', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'p1', status: 'REJECTED' });
    await adminService.updatePropertyStatus('p1', 'REJECTED', 'Bad photos');
    expect(mockPatch).toHaveBeenCalledWith('/admin/properties/p1/reject', { reason: 'Bad photos' });
  });

  it('routes SUSPENDED to suspendProperty with reason', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'p1', status: 'SUSPENDED' });
    await adminService.updatePropertyStatus('p1', 'SUSPENDED', 'Fraud suspected');
    expect(mockPatch).toHaveBeenCalledWith('/admin/properties/p1/suspend', { reason: 'Fraud suspected' });
  });

  it('passes empty string as reason when none provided for REJECTED', async () => {
    mockPatch.mockResolvedValueOnce({});
    await adminService.updatePropertyStatus('p1', 'REJECTED');
    expect(mockPatch).toHaveBeenCalledWith('/admin/properties/p1/reject', { reason: '' });
  });
});

describe('adminService — user management', () => {
  it('listUsers — calls GET /admin/users with params', async () => {
    mockGet.mockResolvedValueOnce({ results: [] });
    await adminService.listUsers({ page: 1, limit: 20, role: 'SELLER', search: 'john' });
    expect(mockGet).toHaveBeenCalledWith('/admin/users', { params: { page: 1, limit: 20, role: 'SELLER', search: 'john' } });
  });

  it('getUser — calls GET /admin/users/:id', async () => {
    mockGet.mockResolvedValueOnce({ id: 'u1', email: 'a@b.com' });
    await adminService.getUser('u1');
    expect(mockGet).toHaveBeenCalledWith('/admin/users/u1');
  });

  it('banUser — calls PATCH /admin/users/:id/ban with reason', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'u1', is_banned: true });
    await adminService.banUser('u1', 'Spam activity');
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/u1/ban', { reason: 'Spam activity' });
  });

  it('unbanUser — calls PATCH /admin/users/:id/unban', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'u1', is_banned: false });
    await adminService.unbanUser('u1');
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/u1/unban');
  });

  it('verifyUserIdentity — calls PATCH /admin/users/:id/verify-identity', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'u1', is_identity_verified: true });
    await adminService.verifyUserIdentity('u1');
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/u1/verify-identity');
  });

  it('changeUserRole — calls PATCH /admin/users/:id/role with role', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'u1', role: 'SELLER' });
    await adminService.changeUserRole('u1', 'SELLER');
    expect(mockPatch).toHaveBeenCalledWith('/admin/users/u1/role', { role: 'SELLER' });
  });
});

describe('adminService — agency moderation', () => {
  it('getPendingAgencies — calls GET /admin/agencies/pending', async () => {
    mockGet.mockResolvedValueOnce([]);
    await adminService.getPendingAgencies();
    expect(mockGet).toHaveBeenCalledWith('/admin/agencies/pending', { params: undefined });
  });

  it('approveAgency — calls PATCH /admin/agencies/:id/approve', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'ag1', is_approved: true });
    await adminService.approveAgency('ag1');
    expect(mockPatch).toHaveBeenCalledWith('/admin/agencies/ag1/approve');
  });

  it('rejectAgency — calls PATCH /admin/agencies/:id/reject with reason', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'ag1' });
    await adminService.rejectAgency('ag1', 'Invalid license');
    expect(mockPatch).toHaveBeenCalledWith('/admin/agencies/ag1/reject', { reason: 'Invalid license' });
  });
});

describe('adminService — audit logs', () => {
  it('getAuditLogs — calls GET /admin/audit-logs with filters', async () => {
    mockGet.mockResolvedValueOnce({ results: [] });
    await adminService.getAuditLogs({ page: 1, limit: 50, action: 'APPROVE', target_table: 'properties' });
    expect(mockGet).toHaveBeenCalledWith('/admin/audit-logs', {
      params: { page: 1, limit: 50, action: 'APPROVE', target_table: 'properties' },
    });
  });

  it('getAuditLogs — calls without params', async () => {
    mockGet.mockResolvedValueOnce({ results: [] });
    await adminService.getAuditLogs();
    expect(mockGet).toHaveBeenCalledWith('/admin/audit-logs', { params: undefined });
  });
});
