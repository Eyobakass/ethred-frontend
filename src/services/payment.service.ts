// src/services/payment.service.ts
import { apiClient } from './api';
import { BillingInvoice } from '@/types/index';

export const paymentService = {
  async initiatePayment(data: { property_id: string; promotion_tier: string; currency?: string }) {
    const res: any = await apiClient.post('/payments/initiate', data);
    // Axios interceptor already unwraps response.data, so res = { success, checkout_url, tx_ref, invoice_id }
    return res?.data ?? res;
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
