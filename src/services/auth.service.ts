// src/services/auth.service.ts
import { apiClient } from './api';

export const authService = {
  async registerPhone(phone_number: string, preferred_language = 'en') {
    return apiClient.post('/auth/register-phone', {
      phone_number,
      preferred_language,
    });
  },

  async verifyOtp(session_token: string, verification_code: string) {
    return apiClient.post('/auth/verify-otp', {
      session_token,
      verification_code,
    });
  },

  async loginWithPassword(phone_number: string, password_hash: string) {
    return apiClient.post('/auth/login', {
      phone_number,
      password: password_hash,
    });
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },
};
