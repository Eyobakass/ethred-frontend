import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/services/auth.service';

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

const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockGet = vi.mocked(apiClient.get);
const mockDelete = vi.mocked(apiClient.delete);

beforeEach(() => vi.clearAllMocks());

describe('authService — registration & login', () => {
  it('register — calls POST /auth/register with payload', async () => {
    mockPost.mockResolvedValueOnce({ session_token: 'tok123' });
    await authService.register({ email: 'a@b.com', password: 'pass123', full_name: 'Test', preferred_language: 'en', role: 'BUYER' } as any);
    expect(mockPost).toHaveBeenCalledWith('/auth/register', expect.objectContaining({ email: 'a@b.com' }));
  });

  it('login — calls POST /auth/login', async () => {
    mockPost.mockResolvedValueOnce({ jwt: 'token', user: { id: 'u1' } });
    await authService.login({ email: 'a@b.com', password: 'pass' } as any);
    expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });
  });

  it('sendOtp — calls POST /auth/send-otp with email', async () => {
    mockPost.mockResolvedValueOnce({ session_token: 'sess1' });
    await authService.sendOtp('user@example.com');
    expect(mockPost).toHaveBeenCalledWith('/auth/send-otp', { email: 'user@example.com' });
  });

  it('verifyOtp — calls POST /auth/verify-otp with session_token and verification_code', async () => {
    mockPost.mockResolvedValueOnce({ jwt: 'token', user: {} });
    await authService.verifyOtp('sess1', '123456');
    expect(mockPost).toHaveBeenCalledWith('/auth/verify-otp', {
      session_token: 'sess1',
      verification_code: '123456',
    });
  });
});

describe('authService — session management', () => {
  it('getMe — calls GET /auth/me', async () => {
    mockGet.mockResolvedValueOnce({ user: { id: 'u1', email: 'a@b.com' } });
    await authService.getMe();
    expect(mockGet).toHaveBeenCalledWith('/auth/me');
  });

  it('logout — calls POST /auth/logout', async () => {
    mockPost.mockResolvedValueOnce({});
    await authService.logout();
    expect(mockPost).toHaveBeenCalledWith('/auth/logout');
  });

  it('deleteAccount — calls DELETE /users/me', async () => {
    mockDelete.mockResolvedValueOnce({});
    await authService.deleteAccount();
    expect(mockDelete).toHaveBeenCalledWith('/users/me');
  });
});

describe('authService — password reset', () => {
  it('forgotPassword — calls POST /auth/forgot-password with email', async () => {
    mockPost.mockResolvedValueOnce({ message: 'Email sent' });
    const result = await authService.forgotPassword('user@example.com');
    expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'user@example.com' });
    expect(result).toEqual({ message: 'Email sent' });
  });

  it('forgotPassword — resolves successfully with truthy message', async () => {
    mockPost.mockResolvedValueOnce({ message: 'If this email exists, a reset link was sent.' });
    const result = await authService.forgotPassword('test@example.com');
    expect(result.message).toBeTruthy();
  });

  it('forgotPassword — rejects on server error', async () => {
    mockPost.mockRejectedValueOnce(new Error('Server error'));
    await expect(authService.forgotPassword('bad@example.com')).rejects.toThrow('Server error');
  });

  it('resetPassword — calls POST /auth/reset-password with token and new_password', async () => {
    mockPost.mockResolvedValueOnce({ message: 'Password reset successful' });
    const result = await authService.resetPassword('tok123', 'newPass!1');
    expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'tok123',
      new_password: 'newPass!1',
    });
    expect(result).toEqual({ message: 'Password reset successful' });
  });

  it('resetPassword — rejects when token is invalid', async () => {
    mockPost.mockRejectedValueOnce(new Error('Token expired'));
    await expect(authService.resetPassword('bad-token', 'pass')).rejects.toThrow('Token expired');
  });
});

describe('authService — profile management', () => {
  it('updateProfile — calls PUT /users/me with data', async () => {
    mockPut.mockResolvedValueOnce({ id: 'u1', full_name: 'New Name' });
    await authService.updateProfile({ full_name: 'New Name', preferred_language: 'am' });
    expect(mockPut).toHaveBeenCalledWith('/users/me', { full_name: 'New Name', preferred_language: 'am' });
  });

  it('updateProfile — partial update (only language)', async () => {
    mockPut.mockResolvedValueOnce({ id: 'u1' });
    await authService.updateProfile({ preferred_language: 'en' });
    expect(mockPut).toHaveBeenCalledWith('/users/me', { preferred_language: 'en' });
  });

  it('changePassword — calls PUT /auth/change-password', async () => {
    mockPut.mockResolvedValueOnce({ message: 'Changed' });
    await authService.changePassword({ old_password: 'old', new_password: 'new' });
    expect(mockPut).toHaveBeenCalledWith('/auth/change-password', { old_password: 'old', new_password: 'new' });
  });
});

describe('authService — notification preferences', () => {
  it('updateNotificationPrefs — calls PUT /users/me/notifications with prefs', async () => {
    mockPut.mockResolvedValueOnce({ message: 'Updated' });
    await authService.updateNotificationPrefs({
      notify_on_approval: true,
      notify_on_inquiry: false,
      notify_on_rejection: true,
    });
    expect(mockPut).toHaveBeenCalledWith('/users/me/notifications', {
      notify_on_approval: true,
      notify_on_inquiry: false,
      notify_on_rejection: true,
    });
  });

  it('updateNotificationPrefs — partial prefs update works', async () => {
    mockPut.mockResolvedValueOnce({ message: 'Updated' });
    await authService.updateNotificationPrefs({ notify_on_approval: true });
    expect(mockPut).toHaveBeenCalledWith('/users/me/notifications', { notify_on_approval: true });
  });
});
