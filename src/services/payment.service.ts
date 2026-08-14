// src/services/payment.service.ts
import { apiClient } from './api';
import { BillingInvoice } from '@/types/index';

export const paymentService = {
  async initiatePayment(data: { property_id: string; promotion_tier: string; amount: number }) {
    const res = await apiClient.post('/payments/initiate', data);
    return (res as unknown as { data: { checkout_url: string; tx_ref: string } }).data ?? res;
  },

  async listInvoices(): Promise<BillingInvoice[]> {
    const res = await apiClient.get('/payments/invoices');
    return (res as unknown as { data: BillingInvoice[] }).data ?? res;
  },

  async getInvoice(id: string): Promise<BillingInvoice> {
    const res = await apiClient.get(`/payments/invoices/${id}`);
    return (res as unknown as { data: BillingInvoice }).data ?? res;
  },
};
