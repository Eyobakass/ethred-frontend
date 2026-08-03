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
  }
};
