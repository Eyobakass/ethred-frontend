// src/services/payment.service.ts
import { apiClient } from './api';
import { BillingInvoice, PaymentProcessor } from '@/types/payment.types';

export const paymentService = {
  async createCheckout(data: {
    property_id: string;
    promotion_tier: string;
    processor: PaymentProcessor;
    amount: number;
  }): Promise<{ checkout_url?: string; tx_ref: string }> {
    return apiClient.post('/payments/checkout', data);
  },

  async getInvoiceStatus(tx_ref: string): Promise<BillingInvoice> {
    return apiClient.get(`/payments/status/${tx_ref}`);
  },
};
