import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock("@/services/inquiry.service", () => ({
  inquiryService: { getSentInquiries: vi.fn() },
}));

import { inquiryService } from "@/services/inquiry.service";
const mockGet = vi.mocked(inquiryService.getSentInquiries);

beforeEach(() => vi.clearAllMocks());

describe("Buyer Inquiries — Service Integration", () => {
  it("getSentInquiries returns empty list", async () => {
    mockGet.mockResolvedValueOnce([]);
    const result = await inquiryService.getSentInquiries();
    expect(result).toEqual([]);
  });

  it("getSentInquiries returns list with correct shape", async () => {
    mockGet.mockResolvedValueOnce([
      {
        id: "inq-1", property_id: "p1", buyer_id: "b1",
        message: "Is this available?", status: "NEW" as const,
        created_at: new Date().toISOString(),
        property: { id: "p1", title_en: "Luxury Apartment" },
      },
    ]);
    const result = await inquiryService.getSentInquiries();
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("NEW");
    expect(result[0].property?.title_en).toBe("Luxury Apartment");
  });

  it("getSentInquiries handles SEEN status", async () => {
    mockGet.mockResolvedValueOnce([
      {
        id: "inq-2", property_id: "p2", buyer_id: "b1",
        message: "I want to visit", status: "SEEN" as const,
        created_at: new Date().toISOString(),
      },
    ]);
    const result = await inquiryService.getSentInquiries();
    expect(result[0].status).toBe("SEEN");
  });
});
