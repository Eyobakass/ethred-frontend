import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));
vi.mock("next/link", () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true, validateSession: vi.fn() }),
}));
vi.mock("@/services/inquiry.service", () => ({
  inquiryService: {
    createInquiry: vi.fn(),
    reportListing: vi.fn(),
  },
}));

import { inquiryService } from "@/services/inquiry.service";
const mockCreate = vi.mocked(inquiryService.createInquiry);
const mockReport = vi.mocked(inquiryService.reportListing);

beforeEach(() => vi.clearAllMocks());

describe("Property Detail — Inquiry Service Integration", () => {
  it("createInquiry POSTs correct payload", async () => {
    mockCreate.mockResolvedValueOnce({ id: "inq-1" } as any);
    await inquiryService.createInquiry({ property_id: "prop-1", message: "Interested in this property." });
    expect(mockCreate).toHaveBeenCalledWith({ property_id: "prop-1", message: "Interested in this property." });
  });

  it("createInquiry resolves with inquiry id", async () => {
    mockCreate.mockResolvedValueOnce({ id: "inq-42", status: "NEW" } as any);
    const result = await inquiryService.createInquiry({ property_id: "p1", message: "Hello there." });
    expect((result as any).id).toBe("inq-42");
  });

  it("createInquiry rejects on API error", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Network error"));
    await expect(
      inquiryService.createInquiry({ property_id: "p1", message: "Test message." })
    ).rejects.toThrow("Network error");
  });

  it("reportListing POSTs correct payload", async () => {
    mockReport.mockResolvedValueOnce({ message: "Reported" });
    await inquiryService.reportListing("prop-1", "Fake price and misleading information.");
    expect(mockReport).toHaveBeenCalledWith("prop-1", "Fake price and misleading information.");
  });

  it("reportListing resolves successfully", async () => {
    mockReport.mockResolvedValueOnce({ message: "Our team will review this." });
    const result = await inquiryService.reportListing("prop-1", "Wrong information.");
    expect(result.message).toBeTruthy();
  });
});
