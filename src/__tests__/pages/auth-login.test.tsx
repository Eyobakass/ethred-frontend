import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPage from '@/app/[lang]/auth/login/page';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
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

describe('Login Page', () => {
  const mockPush = vi.fn();
  const mockSetAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: any) => selector({ setAuth: mockSetAuth })
    );
  });

  it('renders login form correctly', () => {
    render(<LoginPage params={Promise.resolve({ lang: 'en' })} />);

    expect(screen.getByRole('heading', { name: 'Welcome Back' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forgot password/i })).toBeInTheDocument();
  });

  it('redirects BUYER to home on successful login', async () => {
    (authService.login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      jwt: 'fake-token',
      user: { id: '1', role: 'BUYER' },
    });

    render(<LoginPage params={Promise.resolve({ lang: 'en' })} />);

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'buyer@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith({ id: '1', role: 'BUYER' }, 'fake-token');
      expect(mockPush).toHaveBeenCalledWith('/en');
    });
  });

  it('redirects SELLER to dashboard on successful login', async () => {
    (authService.login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      jwt: 'fake-token-2',
      user: { id: '2', role: 'SELLER' },
    });

    render(<LoginPage params={Promise.resolve({ lang: 'en' })} />);

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'seller@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en/seller/dashboard');
    });
  });

  it('displays error message on login failure', async () => {
    (authService.login as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(<LoginPage params={Promise.resolve({ lang: 'en' })} />);

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
