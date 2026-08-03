// src/types/payment.types.ts

export type PaymentProcessor = 'CHAPA' | 'SANTIMPAY' | 'TELEBIRR' | 'CBE_BIRR';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface BillingInvoice {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  tx_ref: string;
  payment_processor: PaymentProcessor;
  status: PaymentStatus;
  metadata?: any;
  created_at: string;
  updated_at: string;
}
