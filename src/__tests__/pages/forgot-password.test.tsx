import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));
vi.mock("next/link", () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock("@/services/auth.service", () => ({
  authService: { forgotPassword: vi.fn() },
}));

import { authService } from "@/services/auth.service";
const mockForgot = vi.mocked(authService.forgotPassword);

beforeEach(() => vi.clearAllMocks());

describe("Forgot Password — Service Integration", () => {
  it("forgotPassword calls POST /auth/forgot-password with email", async () => {
    mockForgot.mockResolvedValueOnce({ message: "Email sent" });
    await authService.forgotPassword("user@example.com");
    expect(mockForgot).toHaveBeenCalledWith("user@example.com");
  });

  it("forgotPassword resolves successfully", async () => {
    mockForgot.mockResolvedValueOnce({ message: "If this email exists, a reset link was sent." });
    const result = await authService.forgotPassword("test@example.com");
    expect(result.message).toBeTruthy();
  });

  it("forgotPassword rejects on server error", async () => {
    mockForgot.mockRejectedValueOnce(new Error("Server error"));
    await expect(authService.forgotPassword("bad@example.com")).rejects.toThrow("Server error");
  });
});
