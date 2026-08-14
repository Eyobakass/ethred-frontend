import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '@/services/payment.service';

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
const mockGet = vi.mocked(apiClient.get);

beforeEach(() => vi.clearAllMocks());

describe('paymentService — initiatePayment', () => {
  it('calls POST /payments/initiate with correct payload', async () => {
    mockPost.mockResolvedValueOnce({ checkout_url: 'https://chapa.co/pay/abc', tx_ref: 'ETH-001' });
    await paymentService.initiatePayment({ property_id: 'p1', promotion_tier: 'FEATURED_BASIC', amount: 500 });
    expect(mockPost).toHaveBeenCalledWith('/payments/initiate', {
      property_id: 'p1',
      promotion_tier: 'FEATURED_BASIC',
      amount: 500,
    });
  });

  it('returns checkout_url from response', async () => {
    mockPost.mockResolvedValueOnce({ checkout_url: 'https://chapa.co/pay/xyz', tx_ref: 'ETH-002' });
    const result = await paymentService.initiatePayment({ property_id: 'p2', promotion_tier: 'ELITE_SPOTLIGHT', amount: 2500 });
    expect(result).toMatchObject({ checkout_url: expect.stringContaining('https://') });
  });

  it('rejects when server returns error', async () => {
    mockPost.mockRejectedValueOnce(new Error('Payment gateway unavailable'));
    await expect(paymentService.initiatePayment({ property_id: 'p1', promotion_tier: 'FEATURED_BASIC', amount: 500 })).rejects.toThrow('Payment gateway unavailable');
  });
});

describe('paymentService — listInvoices', () => {
  it('calls GET /payments/invoices', async () => {
    mockGet.mockResolvedValueOnce([]);
    await paymentService.listInvoices();
    expect(mockGet).toHaveBeenCalledWith('/payments/invoices');
  });

  it('returns list of invoices', async () => {
    const invoices = [
      { id: 'inv-1', amount: 500, status: 'COMPLETED', tx_ref: 'ETH-001', currency: 'ETB', user_id: 'u1', payment_processor: 'CHAPA', created_at: '' },
      { id: 'inv-2', amount: 1200, status: 'PENDING', tx_ref: 'ETH-002', currency: 'ETB', user_id: 'u1', payment_processor: 'CHAPA', created_at: '' },
    ];
    mockGet.mockResolvedValueOnce(invoices);
    const result = await paymentService.listInvoices();
    expect(result).toHaveLength(2);
    expect(result[0].status).toBe('COMPLETED');
  });

  it('returns empty array when no invoices', async () => {
    mockGet.mockResolvedValueOnce([]);
    const result = await paymentService.listInvoices();
    expect(result).toEqual([]);
  });
});

describe('paymentService — getInvoice', () => {
  it('calls GET /payments/invoices/:id', async () => {
    mockGet.mockResolvedValueOnce({ id: 'inv-1', amount: 500, status: 'COMPLETED' });
    await paymentService.getInvoice('inv-1');
    expect(mockGet).toHaveBeenCalledWith('/payments/invoices/inv-1');
  });

  it('returns single invoice object', async () => {
    const invoice = { id: 'inv-3', amount: 2500, status: 'FAILED', tx_ref: 'ETH-003', currency: 'ETB', user_id: 'u1', payment_processor: 'CHAPA', created_at: '' };
    mockGet.mockResolvedValueOnce(invoice);
    const result = await paymentService.getInvoice('inv-3');
    expect(result.status).toBe('FAILED');
    expect(result.amount).toBe(2500);
  });
});
