import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockRpc } = vi.hoisted(() => ({ mockRpc: vi.fn() }))

vi.mock("../supabase", () => ({
  supabase: {
    rpc: mockRpc,
  },
}))

import { createRequest } from "../db"
import type { UploadedFile } from "../storage"

const baseParams = {
  clientSubmissionId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  clientName: undefined,
  description: "A wolf on my forearm",
  placement: "forearm",
  size: "medium",
  color: "blackAndGrey",
  budget: undefined,
  email: "client@example.com",
  phone: undefined,
  contactOther: undefined,
  consent: true as const,
  files: [] as UploadedFile[],
}

const sampleFiles: UploadedFile[] = [
  {
    type: "reference",
    storagePath: "uuid/reference/reference-01.jpg",
    originalName: "ref.jpg",
    mimeType: "image/jpeg",
    size: 512000,
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe("createRequest", () => {
  it("calls rpc with correct arguments and returns id + referenceCode", async () => {
    mockRpc.mockResolvedValue({
      data: { id: "db-uuid-1234", referenceCode: "REQ-2026-0001" },
      error: null,
    })

    const result = await createRequest({ ...baseParams, files: sampleFiles })

    expect(result).toEqual({ id: "db-uuid-1234", referenceCode: "REQ-2026-0001" })

    expect(mockRpc).toHaveBeenCalledWith("create_request", {
      p_client_submission_id: baseParams.clientSubmissionId,
      p_client_name: null,
      p_description: baseParams.description,
      p_placement: baseParams.placement,
      p_size: baseParams.size,
      p_color: baseParams.color,
      p_budget: null,
      p_email: baseParams.email,
      p_phone: null,
      p_contact_other: null,
      p_consent: true,
      p_files: [
        {
          type: "reference",
          storagePath: "uuid/reference/reference-01.jpg",
          originalName: "ref.jpg",
          mimeType: "image/jpeg",
          size: 512000,
        },
      ],
    })
  })

  it("passes null for optional fields when undefined", async () => {
    mockRpc.mockResolvedValue({
      data: { id: "db-uuid-2", referenceCode: "REQ-2026-0002" },
      error: null,
    })

    await createRequest({
      ...baseParams,
      clientName: undefined,
      budget: undefined,
      email: undefined,
      phone: undefined,
      contactOther: undefined,
    })

    const call = mockRpc.mock.calls[0][1]
    expect(call.p_client_name).toBeNull()
    expect(call.p_budget).toBeNull()
    expect(call.p_email).toBeNull()
    expect(call.p_phone).toBeNull()
    expect(call.p_contact_other).toBeNull()
  })

  it("passes budget when provided", async () => {
    mockRpc.mockResolvedValue({
      data: { id: "db-uuid-b", referenceCode: "REQ-2026-0006" },
      error: null,
    })

    await createRequest({ ...baseParams, budget: "500-800" })

    const call = mockRpc.mock.calls[0][1]
    expect(call.p_budget).toBe("500-800")
  })

  it("passes empty files array when no files provided", async () => {
    mockRpc.mockResolvedValue({
      data: { id: "db-uuid-3", referenceCode: "REQ-2026-0003" },
      error: null,
    })

    await createRequest(baseParams)

    const call = mockRpc.mock.calls[0][1]
    expect(call.p_files).toEqual([])
  })

  it("throws when rpc returns an error", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "duplicate key value violates unique constraint" },
    })

    await expect(createRequest(baseParams)).rejects.toThrow("DB insert failed")
  })

  it("throws with the supabase error message", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "connection timeout" },
    })

    await expect(createRequest(baseParams)).rejects.toThrow("connection timeout")
  })
})
