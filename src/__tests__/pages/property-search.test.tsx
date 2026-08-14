import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PropertiesPage from '@/app/[lang]/properties/page';
import { propertyService } from '@/services/property.service';
import { useFilterStore } from '@/store/useFilterStore';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock('@/services/property.service', () => ({
  propertyService: {
    searchProperties: vi.fn(),
  },
}));

vi.mock('@/store/useFilterStore', () => ({
  useFilterStore: vi.fn(),
}));

vi.mock('@/components/properties/PropertyGrid', () => ({
  PropertyGrid: ({ properties }: { properties: any[] }) => (
    <div data-testid="property-grid">
      {properties.map((p) => <div key={p.id}>{p.title_en}</div>)}
    </div>
  ),
}));

vi.mock('@/components/properties/FilterSidebar', () => ({
  FilterSidebar: () => <div data-testid="filter-sidebar" />,
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...(actual as object),
    use: (promise: Promise<any>) => {
      let result: any;
      promise.then((val) => { result = val; }).catch(() => {});
      return result || { lang: 'en' };
    },
  };
});

describe('Property Search Page', () => {
  const mockReplace = vi.fn();
  const mockSetFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ replace: mockReplace });
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/en/properties');
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(new URLSearchParams(''));
    (useFilterStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      search_query: '',
      transaction_mode: '',
      region: '',
      sub_city: '',
      category: '',
      price_min: 0,
      price_max: 0,
      bedrooms: 0,
      has_virtual_tour: false,
      setFilter: mockSetFilter,
    });
  });

  it('calls searchProperties on mount after hydration and renders results', async () => {
    (propertyService.searchProperties as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      results: [{ id: 'p1', title_en: 'Test Apartment Bole', media: [] }],
    });

    render(<PropertiesPage params={Promise.resolve({ lang: 'en' })} />);

    // Wait for the 400ms debounce + effect chain to complete
    await waitFor(() => {
      expect(propertyService.searchProperties).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText('Test Apartment Bole')).toBeInTheDocument();
    });
  }, 10000);

  it('syncs active filters to URL via router.replace after hydration', async () => {
    (useFilterStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      search_query: 'Bole',
      transaction_mode: 'SALE',
      region: 'Addis Ababa',
      sub_city: 'Bole',
      category: 'APARTMENT',
      price_min: 0,
      price_max: 0,
      bedrooms: 0,
      has_virtual_tour: false,
      setFilter: mockSetFilter,
    });
    (propertyService.searchProperties as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ results: [] });

    render(<PropertiesPage params={Promise.resolve({ lang: 'en' })} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('search_query=Bole'),
        { scroll: false }
      );
    }, { timeout: 3000 });
  }, 10000);
});
