// src/services/auth.service.ts
import { apiClient } from './api';
import { RegisterPayload, LoginPayload } from '@/types/auth.types';

export const authService = {
  async register(data: RegisterPayload) {
    return apiClient.post('/auth/register', data);
  },

  async login(data: LoginPayload) {
    return apiClient.post('/auth/login', data);
  },

  async sendOtp(email: string) {
    return apiClient.post('/auth/send-otp', { email });
  },

  async verifyOtp(session_token: string, verification_code: string) {
    return apiClient.post('/auth/verify-otp', {
      session_token,
      verification_code,
    });
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },

  async logout() {
    return apiClient.post('/auth/logout');
  },

  async changePassword(data: any) {
    return apiClient.put('/auth/change-password', data);
  },

  async deleteAccount() {
    return apiClient.delete('/users/me');
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', { token, new_password });
  },

  async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async updateProfile(data: { full_name?: string; preferred_language?: string }): Promise<any> {
    return apiClient.put('/users/me', data);
  },

  async uploadIdDocument(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('document', file);
    return apiClient.post('/users/me/id-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async updateNotificationPrefs(prefs: {
    notify_on_approval?: boolean;
    notify_on_inquiry?: boolean;
    notify_on_rejection?: boolean;
  }): Promise<any> {
    return apiClient.put('/users/me/notifications', prefs);
  },
};
