import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock("@/services/inquiry.service", () => ({
  inquiryService: {
    getReceivedInquiries: vi.fn(),
    updateInquiryStatus: vi.fn(),
  },
}));

import { inquiryService } from "@/services/inquiry.service";

const mockGet = vi.mocked(inquiryService.getReceivedInquiries);
const mockUpdate = vi.mocked(inquiryService.updateInquiryStatus);

beforeEach(() => vi.clearAllMocks());

describe("Seller Inquiries — Service Integration", () => {
  it("getReceivedInquiries returns a list", async () => {
    mockGet.mockResolvedValueOnce([
      {
        id: "inq-1", property_id: "p1", buyer_id: "b1",
        message: "I want to rent", status: "NEW" as const,
        created_at: new Date().toISOString(),
        property: { id: "p1", title_en: "Studio" },
        buyer: { id: "b1", profile: { full_name: "John" } },
      },
    ]);
    const result = await inquiryService.getReceivedInquiries();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("inq-1");
  });

  it("updateInquiryStatus called with SEEN", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "inq-1", status: "SEEN" } as any);
    await inquiryService.updateInquiryStatus("inq-1", "SEEN");
    expect(mockUpdate).toHaveBeenCalledWith("inq-1", "SEEN");
  });

  it("updateInquiryStatus called with RESOLVED", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "inq-1", status: "RESOLVED" } as any);
    await inquiryService.updateInquiryStatus("inq-1", "RESOLVED");
    expect(mockUpdate).toHaveBeenCalledWith("inq-1", "RESOLVED");
  });
});
