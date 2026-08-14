import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inquiryService } from '@/services/inquiry.service';

vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

import { apiClient } from '@/services/api';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);

beforeEach(() => vi.clearAllMocks());

describe('inquiryService — getReceivedInquiries', () => {
  it('calls GET /inquiries/received', async () => {
    mockGet.mockResolvedValueOnce({ results: [] });
    await inquiryService.getReceivedInquiries();
    expect(mockGet).toHaveBeenCalledWith('/inquiries/received', { params: undefined });
  });

  it('extracts results array when backend returns { results: [...] }', async () => {
    const data = [{ id: '1', message: 'Hello', status: 'NEW' }];
    mockGet.mockResolvedValueOnce({ results: data });
    const result = await inquiryService.getReceivedInquiries();
    expect(result).toEqual(data);
    expect(result).toHaveLength(1);
  });

  it('returns empty array when results is missing', async () => {
    mockGet.mockResolvedValueOnce({});
    const result = await inquiryService.getReceivedInquiries();
    expect(result).toEqual([]);
  });

  it('passes pagination params correctly', async () => {
    mockGet.mockResolvedValueOnce({ results: [] });
    await inquiryService.getReceivedInquiries({ page: 2, limit: 10 });
    expect(mockGet).toHaveBeenCalledWith('/inquiries/received', { params: { page: 2, limit: 10 } });
  });

  it('returns inquiries with correct shape', async () => {
    const inquiry = {
      id: 'inq-1', property_id: 'p1', buyer_id: 'b1',
      message: 'I want to rent this', status: 'NEW' as const,
      created_at: '2024-01-01T00:00:00Z',
      property: { id: 'p1', title_en: 'Studio' },
      buyer: { id: 'b1', profile: { full_name: 'John Doe' } },
    };
    mockGet.mockResolvedValueOnce({ results: [inquiry] });
    const result = await inquiryService.getReceivedInquiries();
    expect(result[0].id).toBe('inq-1');
    expect(result[0].buyer?.profile?.full_name).toBe('John Doe');
    expect(result[0].property?.title_en).toBe('Studio');
  });
});

describe('inquiryService — getSentInquiries', () => {
  it('calls GET /inquiries', async () => {
    mockGet.mockResolvedValueOnce({ results: [] });
    await inquiryService.getSentInquiries();
    expect(mockGet).toHaveBeenCalledWith('/inquiries', { params: undefined });
  });

  it('extracts results array', async () => {
    const data = [{ id: 'inq-2', status: 'SEEN' as const, message: 'Hi', property_id: 'p1', buyer_id: 'b1', created_at: '' }];
    mockGet.mockResolvedValueOnce({ results: data });
    const result = await inquiryService.getSentInquiries();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('SEEN');
  });

  it('returns empty array on empty results', async () => {
    mockGet.mockResolvedValueOnce({ results: [] });
    const result = await inquiryService.getSentInquiries();
    expect(result).toEqual([]);
  });

  it('handles RESOLVED status correctly', async () => {
    mockGet.mockResolvedValueOnce({
      results: [{ id: 'inq-3', status: 'RESOLVED', message: 'Done', property_id: 'p1', buyer_id: 'b1', created_at: '' }],
    });
    const result = await inquiryService.getSentInquiries();
    expect(result[0].status).toBe('RESOLVED');
  });
});

describe('inquiryService — createInquiry', () => {
  it('calls POST /inquiries with correct payload', async () => {
    const payload = { property_id: 'prop-1', message: 'Interested!' };
    mockPost.mockResolvedValueOnce({ id: 'inq-1', ...payload, status: 'NEW' });
    const result = await inquiryService.createInquiry(payload);
    expect(mockPost).toHaveBeenCalledWith('/inquiries', payload);
    expect(result).toMatchObject({ id: 'inq-1' });
  });

  it('returned inquiry has status NEW', async () => {
    mockPost.mockResolvedValueOnce({ id: 'inq-42', status: 'NEW', property_id: 'p1', message: 'Hello.' });
    const result = await inquiryService.createInquiry({ property_id: 'p1', message: 'Hello.' });
    expect(result.status).toBe('NEW');
  });

  it('rejects on network error', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network error'));
    await expect(inquiryService.createInquiry({ property_id: 'p1', message: 'Test.' })).rejects.toThrow('Network error');
  });

  it('rejects on 401 unauthorized', async () => {
    mockPost.mockRejectedValueOnce(new Error('Unauthorized'));
    await expect(inquiryService.createInquiry({ property_id: 'p1', message: 'Test.' })).rejects.toThrow('Unauthorized');
  });
});

describe('inquiryService — updateInquiryStatus', () => {
  it('calls PATCH /inquiries/:id/status with SEEN', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'inq-1', status: 'SEEN' });
    await inquiryService.updateInquiryStatus('inq-1', 'SEEN');
    expect(mockPatch).toHaveBeenCalledWith('/inquiries/inq-1/status', { status: 'SEEN' });
  });

  it('calls PATCH /inquiries/:id/status with RESOLVED', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'inq-1', status: 'RESOLVED' });
    await inquiryService.updateInquiryStatus('inq-1', 'RESOLVED');
    expect(mockPatch).toHaveBeenCalledWith('/inquiries/inq-1/status', { status: 'RESOLVED' });
  });

  it('returns updated inquiry object', async () => {
    mockPatch.mockResolvedValueOnce({ id: 'inq-2', status: 'RESOLVED', property_id: 'p1' });
    const result = await inquiryService.updateInquiryStatus('inq-2', 'RESOLVED');
    expect(result.status).toBe('RESOLVED');
  });
});

describe('inquiryService — reportListing', () => {
  it('calls POST /inquiries/report/:propertyId with reason', async () => {
    mockPost.mockResolvedValueOnce({ message: 'Reported' });
    await inquiryService.reportListing('prop-1', 'Fake price and misleading info.');
    expect(mockPost).toHaveBeenCalledWith('/inquiries/report/prop-1', { reason: 'Fake price and misleading info.' });
  });

  it('resolves with message string on success', async () => {
    mockPost.mockResolvedValueOnce({ message: 'Our team will review this.' });
    const result = await inquiryService.reportListing('prop-1', 'Wrong address listed.');
    expect(result.message).toBeTruthy();
  });

  it('rejects on server error', async () => {
    mockPost.mockRejectedValueOnce(new Error('Failed'));
    await expect(inquiryService.reportListing('prop-1', 'Reason here.')).rejects.toThrow('Failed');
  });
});
