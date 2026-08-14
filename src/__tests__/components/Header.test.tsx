import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Header } from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock the dynamically imported authService inside the logout button
vi.mock('@/services/auth.service', () => ({
  authService: {
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/components/common/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

vi.mock('@/components/common/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

vi.mock('@/components/common/ChangePasswordModal', () => ({
  ChangePasswordModal: () => <div data-testid="change-password-modal" />,
}));

vi.mock('@/components/common/DeleteAccountModal', () => ({
  DeleteAccountModal: () => <div data-testid="delete-account-modal" />,
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/en');
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: vi.fn() });
  });

  it('renders unauthenticated state correctly', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isAuthenticated: false,
      validateSession: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByText('ETHRED')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Properties' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Agencies' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
  });

  it('renders authenticated BUYER state and shows correct menu items', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '1', email: 'test@example.com', role: 'BUYER' },
      isAuthenticated: true,
      validateSession: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);
    fireEvent.click(screen.getByText('T'));

    // Actual items from the BUYER dropdown (verified from component source)
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('My Inquiries')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    // BUYER should NOT see Seller Dashboard or Admin Portal
    expect(screen.queryByText('Seller Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Portal')).not.toBeInTheDocument();
  });

  it('renders authenticated SELLER state with seller dashboard link', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '2', email: 'seller@example.com', role: 'SELLER' },
      isAuthenticated: true,
      validateSession: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);
    fireEvent.click(screen.getByText('S'));
    expect(screen.getByText('Seller Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Inquiries Received')).toBeInTheDocument();
  });

  it('renders authenticated ADMIN state with admin links', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '3', email: 'admin@example.com', role: 'ADMIN' },
      isAuthenticated: true,
      validateSession: vi.fn(),
      logout: vi.fn(),
    });

    render(<Header />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('calls logout when sign out is confirmed', async () => {
    const mockLogout = vi.fn();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '1', email: 'test@example.com', role: 'BUYER' },
      isAuthenticated: true,
      validateSession: vi.fn(),
      logout: mockLogout,
    });

    render(<Header />);

    // Open dropdown
    fireEvent.click(screen.getByText('T'));
    // Click the "Sign out" menu item (opens the confirmation modal)
    fireEvent.click(screen.getByText('Sign out'));

    // Confirmation modal renders — click the "Sign Out" confirm button
    const confirmButton = await screen.findByRole('button', { name: 'Sign Out' });

    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(mockLogout).toHaveBeenCalled();
  });
});
