import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockRpc, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock("../supabase", () => ({
  supabase: {
    rpc: mockRpc,
    from: mockFrom,
  },
}))

import { createRequest, getRequestByClientSubmissionId } from "../db"
import type { UploadedFile } from "../storage"

const baseParams = {
  studioId: "a1b2c3d4-0000-4000-8000-000000000001",
  clientSubmissionId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  clientName: "Alex",
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
    storagePath: "a1b2c3d4-0000-4000-8000-000000000001/uuid/reference/reference-01.jpg",
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
      p_studio_id: baseParams.studioId,
      p_client_submission_id: baseParams.clientSubmissionId,
      p_client_name: "Alex",
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
          storagePath: "a1b2c3d4-0000-4000-8000-000000000001/uuid/reference/reference-01.jpg",
          originalName: "ref.jpg",
          mimeType: "image/jpeg",
          size: 512000,
        },
      ],
    })
  })

  it("passes clientName to rpc and nulls for absent optional fields", async () => {
    mockRpc.mockResolvedValue({
      data: { id: "db-uuid-2", referenceCode: "REQ-2026-0002" },
      error: null,
    })

    await createRequest({
      ...baseParams,
      clientName: "Jordan",
      budget: undefined,
      email: undefined,
      phone: undefined,
      contactOther: undefined,
    })

    const call = mockRpc.mock.calls[0][1]
    expect(call.p_client_name).toBe("Jordan")
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

describe("getRequestByClientSubmissionId", () => {
  const CLIENT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"

  function makeChain(result: { data: unknown; error: unknown }) {
    const maybeSingle = vi.fn().mockResolvedValue(result)
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ select })
    return { select, eq, maybeSingle }
  }

  it("returns referenceCode when request exists", async () => {
    makeChain({ data: { reference_code: "REQ-2026-0001" }, error: null })

    const result = await getRequestByClientSubmissionId(CLIENT_ID)

    expect(result).toBe("REQ-2026-0001")
    expect(mockFrom).toHaveBeenCalledWith("requests")
  })

  it("returns null when no matching request exists", async () => {
    makeChain({ data: null, error: null })

    const result = await getRequestByClientSubmissionId(CLIENT_ID)

    expect(result).toBeNull()
  })

  it("throws when supabase returns an error", async () => {
    makeChain({ data: null, error: { message: "relation does not exist" } })

    await expect(getRequestByClientSubmissionId(CLIENT_ID)).rejects.toThrow("DB lookup failed")
  })

  it("throws with the supabase error message", async () => {
    makeChain({ data: null, error: { message: "connection timeout" } })

    await expect(getRequestByClientSubmissionId(CLIENT_ID)).rejects.toThrow("connection timeout")
  })
})
