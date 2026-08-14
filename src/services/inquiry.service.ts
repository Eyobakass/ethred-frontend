// src/services/inquiry.service.ts
import { apiClient } from './api';
import { PropertyInquiry } from '@/types/index';

interface InquiryListResponse {
  results: PropertyInquiry[];
  count: number;
}

export const inquiryService = {
  /**
   * Seller: get all inquiries received on their listings
   * GET /inquiries/received
   */
  async getReceivedInquiries(params?: { page?: number; limit?: number }): Promise<PropertyInquiry[]> {
    const res = await apiClient.get<any, any>('/inquiries/received', { params });
    return res.results ?? res.data?.results ?? [];

  },

  /**
   * Buyer: get all inquiries they have sent
   * GET /inquiries
   */
  async getSentInquiries(params?: { page?: number; limit?: number }): Promise<PropertyInquiry[]> {
    const res = await apiClient.get<any, any>('/inquiries', { params });
    return res.results ?? res.data?.results ?? [];

  },

  /**
   * Get single inquiry detail
   * GET /inquiries/:id
   */
  async getInquiry(id: string): Promise<PropertyInquiry> {
    const res = await apiClient.get<any, any>(`/inquiries/${id}`);
    return res.data || res;
  },

  /**
   * Buyer: send a new inquiry on a property
   * POST /inquiries
   */
  async createInquiry(data: { property_id: string; message: string }): Promise<PropertyInquiry> {
    const res = await apiClient.post<any, any>('/inquiries', data);
    return res.data || res;
  },

  /**
   * Seller: update status of a received inquiry
   * PATCH /inquiries/:id/status
   */
  async updateInquiryStatus(id: string, status: 'SEEN' | 'RESOLVED'): Promise<PropertyInquiry> {
    const res = await apiClient.patch<any, any>(`/inquiries/${id}/status`, { status });
    return res.data || res;
  },

  /**
   * Buyer: report a listing
   * POST /inquiries/report/:propertyId
   */
  async reportListing(propertyId: string, reason: string): Promise<{ message: string }> {
    const res = await apiClient.post<any, any>(`/inquiries/report/${propertyId}`, { reason });
    return res.data || res;
  },
};
