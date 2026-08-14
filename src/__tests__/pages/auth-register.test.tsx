import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RegisterPage from '@/app/[lang]/auth/register/page';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    register: vi.fn(),
    sendOtp: vi.fn(),
  },
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

describe('Register Page', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
  });

  it('renders registration form with all role buttons', () => {
    render(<RegisterPage params={Promise.resolve({ lang: 'en' })} />);

    expect(screen.getByRole('heading', { name: 'Create an Account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buyer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seller' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agency' })).toBeInTheDocument();
    // Labels have no htmlFor — use placeholder text to locate inputs
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
  });

  it('redirects to OTP page after successful registration', async () => {
    (authService.register as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ success: true });
    (authService.sendOtp as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ session_token: 'otp-token-123' });

    render(<RegisterPage params={Promise.resolve({ lang: 'en' })} />);

    fireEvent.click(screen.getByRole('button', { name: 'Seller' }));
    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'StrongPass1!' } });
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({
        email: 'john@example.com',
        role: 'SELLER',
      }));
      expect(mockPush).toHaveBeenCalledWith('/en/auth/verify-otp?token=otp-token-123&role=SELLER');
    });
  });

  it('displays error message on registration failure', async () => {
    (authService.register as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
      response: { data: { message: 'Email already exists' } },
    });

    render(<RegisterPage params={Promise.resolve({ lang: 'en' })} />);

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'StrongPass1!' } });
    fireEvent.submit(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
    expect(authService.sendOtp).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
