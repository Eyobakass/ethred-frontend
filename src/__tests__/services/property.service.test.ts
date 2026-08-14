import { describe, it, expect, vi, beforeEach } from 'vitest';
import { propertyService } from '@/services/property.service';

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

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

beforeEach(() => vi.clearAllMocks());

describe('propertyService — search & listings', () => {
  it('searchProperties — calls GET /properties/search with params', async () => {
    const mockResult = { count: 2, results: [{ id: 'p1' }, { id: 'p2' }] };
    mockGet.mockResolvedValueOnce(mockResult);
    const result = await propertyService.searchProperties({ category: 'APARTMENT' });
    expect(mockGet).toHaveBeenCalledWith('/properties/search', { params: { category: 'APARTMENT' } });
    expect(result).toEqual(mockResult);
  });

  it('getMyListings — returns results array from response', async () => {
    mockGet.mockResolvedValueOnce({ results: [{ id: 'p1', title_en: 'Test' }] });
    const result = await propertyService.getMyListings();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('p1');
  });

  it('getMyListings — returns empty array when results is missing', async () => {
    mockGet.mockResolvedValueOnce({});
    const result = await propertyService.getMyListings();
    expect(result).toEqual([]);
  });

  it('getPropertyById — calls GET /properties/:id and returns response directly', async () => {
    const property = { id: 'prop-1', title_en: 'Luxury Apartment' };
    mockGet.mockResolvedValueOnce(property);
    const result = await propertyService.getPropertyById('prop-1');
    expect(mockGet).toHaveBeenCalledWith('/properties/prop-1');
    expect(result).toEqual(property);
  });
});

describe('propertyService — CRUD (post-interceptor-unwrap)', () => {
  it('createProperty — calls POST /properties and returns response directly', async () => {
    const created = { id: 'new-1', title_en: 'New Property', status: 'DRAFT' };
    mockPost.mockResolvedValueOnce(created);
    const result = await propertyService.createProperty({ title_en: 'New Property' });
    expect(mockPost).toHaveBeenCalledWith('/properties', { title_en: 'New Property' });
    expect(result).toEqual(created);
  });

  it('updateProperty — calls PUT /properties/:id and returns response directly', async () => {
    const updated = { id: 'p1', title_en: 'Updated Title', status: 'DRAFT' };
    mockPut.mockResolvedValueOnce(updated);
    const result = await propertyService.updateProperty('p1', { title_en: 'Updated Title' });
    expect(mockPut).toHaveBeenCalledWith('/properties/p1', { title_en: 'Updated Title' });
    expect(result).toEqual(updated);
  });

  it('updateProperty — returned object has all fields intact', async () => {
    const updated = { id: 'p2', title_en: 'A', price_etb: 500000, bedrooms: 3, status: 'DRAFT' };
    mockPut.mockResolvedValueOnce(updated);
    const result = await propertyService.updateProperty('p2', { title_en: 'A' });
    expect(result.price_etb).toBe(500000);
    expect(result.bedrooms).toBe(3);
  });

  it('submitForReview — calls POST /properties/:id/submit', async () => {
    const submitted = { id: 'p1', status: 'PENDING' };
    mockPost.mockResolvedValueOnce(submitted);
    const result = await propertyService.submitForReview('p1');
    expect(mockPost).toHaveBeenCalledWith('/properties/p1/submit');
    expect(result).toEqual(submitted);
  });

  it('deleteProperty — calls DELETE /properties/:id', async () => {
    mockDelete.mockResolvedValueOnce({ success: true });
    await propertyService.deleteProperty('p1');
    expect(mockDelete).toHaveBeenCalledWith('/properties/p1');
  });
});

describe('propertyService — draft management', () => {
  it('createDraftClone — calls POST /properties/:id/draft and returns response directly', async () => {
    const draft = { id: 'draft-1', parent_id: 'p1', status: 'DRAFT' };
    mockPost.mockResolvedValueOnce(draft);
    const result = await propertyService.createDraftClone('p1');
    expect(mockPost).toHaveBeenCalledWith('/properties/p1/draft');
    expect(result).toEqual(draft);
    expect(result.id).toBe('draft-1');
  });

  it('createDraftClone — returned draft.id is usable (not undefined)', async () => {
    const draft = { id: 'draft-42', parent_id: 'original-1', status: 'DRAFT' };
    mockPost.mockResolvedValueOnce(draft);
    const result = await propertyService.createDraftClone('original-1');
    expect(result.id).toBeDefined();
    expect(result.id).toBe('draft-42');
  });

  it('getExistingDraft — returns draft object when one exists', async () => {
    const draft = { id: 'draft-1', status: 'DRAFT', parent_id: 'p1' };
    mockGet.mockResolvedValueOnce(draft);
    const result = await propertyService.getExistingDraft('p1');
    expect(mockGet).toHaveBeenCalledWith('/properties/p1/draft');
    expect(result).toEqual(draft);
    expect(result).not.toBeNull();
  });

  it('getExistingDraft — returns null when server returns empty/null', async () => {
    mockGet.mockResolvedValueOnce(null);
    const result = await propertyService.getExistingDraft('p1');
    expect(result).toBeNull();
  });

  it('getExistingDraft — returns PENDING_UPDATE draft correctly', async () => {
    const draft = { id: 'draft-2', status: 'PENDING_UPDATE', parent_id: 'p1' };
    mockGet.mockResolvedValueOnce(draft);
    const result = await propertyService.getExistingDraft('p1');
    expect(result?.status).toBe('PENDING_UPDATE');
  });

  it('deleteDraft — calls DELETE /properties/:draftId', async () => {
    mockDelete.mockResolvedValueOnce({});
    await propertyService.deleteDraft('draft-1');
    expect(mockDelete).toHaveBeenCalledWith('/properties/draft-1');
  });
});

describe('propertyService — favorites', () => {
  it('addFavorite — calls POST /favorites/:propertyId', async () => {
    mockPost.mockResolvedValueOnce({});
    await propertyService.addFavorite('prop-1');
    expect(mockPost).toHaveBeenCalledWith('/favorites/prop-1');
  });

  it('removeFavorite — calls DELETE /favorites/:propertyId', async () => {
    mockDelete.mockResolvedValueOnce({});
    await propertyService.removeFavorite('prop-2');
    expect(mockDelete).toHaveBeenCalledWith('/favorites/prop-2');
  });

  it('getFavorites — calls GET /favorites', async () => {
    mockGet.mockResolvedValueOnce([{ id: 'p1' }, { id: 'p2' }]);
    const result = await propertyService.getFavorites();
    expect(mockGet).toHaveBeenCalledWith('/favorites');
    expect(result).toHaveLength(2);
  });
});

describe('propertyService — stats', () => {
  it('getListingStats — returns stats object with correct fields', async () => {
    const stats = { property_id: 'p1', favorites_count: 7, inquiries_count: 3 };
    mockGet.mockResolvedValueOnce(stats);
    const result = await propertyService.getListingStats('p1');
    expect(mockGet).toHaveBeenCalledWith('/properties/p1/stats');
    expect(result.favorites_count).toBe(7);
    expect(result.inquiries_count).toBe(3);
  });
});

describe('propertyService — error handling', () => {
  it('getPropertyById — propagates error on API failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('Not found'));
    await expect(propertyService.getPropertyById('bad-id')).rejects.toThrow('Not found');
  });

  it('createDraftClone — propagates error on API failure', async () => {
    mockPost.mockRejectedValueOnce(new Error('Server error'));
    await expect(propertyService.createDraftClone('p1')).rejects.toThrow('Server error');
  });
});
