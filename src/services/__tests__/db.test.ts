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

import {
  createRequest,
  getRequestByClientSubmissionId,
  getRequestForStudio,
  listRequestsForStudio,
  updateRequestStatusForStudio,
} from "../db"
import type { UploadedFile } from "../storage"

const baseParams = {
  studioId: "a1b2c3d4-0000-4000-8000-000000000001",
  clientSubmissionId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  clientName: "Alex",
  description: "A wolf on my forearm",
  placement: "arm",
  size: "medium",
  color: "black-and-grey",
  budget: undefined,
  email: "client@example.com",
  phone: undefined,
  contactOther: undefined,
  consent: true as const,
  files: [] as UploadedFile[],
}

const sampleFiles: UploadedFile[] = [
  {
    type: "artist_work",
    storagePath: "a1b2c3d4-0000-4000-8000-000000000001/uuid/artist_work/abc.jpg",
    originalName: "ref.jpg",
    mimeType: "image/jpeg",
    size: 512000,
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe("createRequest", () => {
  // The reference code is generated inside the create_request RPC (plpgsql) and is
  // opaque to this TS wrapper — it passes through whatever the RPC returns. The FS §4.6
  // 6-char format (e.g. "K7M4XP") is asserted against the live DB (task CO-1), not here,
  // because the RPC is mocked. The fixture below uses a new-format sample to avoid
  // implying the old REQ-YYYY-NNNN format still lives at this layer.
  it("calls rpc with correct arguments and returns id + referenceCode", async () => {
    mockRpc.mockResolvedValue({
      data: { id: "db-uuid-1234", referenceCode: "K7M4XP" },
      error: null,
    })

    const result = await createRequest({ ...baseParams, files: sampleFiles })

    expect(result).toEqual({ id: "db-uuid-1234", referenceCode: "K7M4XP" })

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
          type: "artist_work",
          storagePath: "a1b2c3d4-0000-4000-8000-000000000001/uuid/artist_work/abc.jpg",
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

describe("listRequestsForStudio", () => {
  const STUDIO_ID = "a1b2c3d4-0000-4000-8000-000000000001"

  function makeListChain(result: { data: unknown; error: unknown }) {
    const order = vi.fn().mockResolvedValue(result)
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    mockFrom.mockReturnValue({ select })
    return { select, eq, order }
  }

  const sampleRow = {
    id: "req-uuid-1",
    reference_code: "REQ-2026-0001",
    client_name: "Alex",
    placement: "forearm",
    size: "medium",
    color: "black",
    status: "new",
    created_at: "2026-07-01T10:00:00.000Z",
  }

  it("queries requests scoped by studio_id", async () => {
    const { select, eq } = makeListChain({ data: [sampleRow], error: null })

    await listRequestsForStudio(STUDIO_ID)

    expect(mockFrom).toHaveBeenCalledWith("requests")
    expect(select).toHaveBeenCalledWith(
      "id, reference_code, client_name, placement, size, color, status, created_at",
    )
    expect(eq).toHaveBeenCalledWith("studio_id", STUDIO_ID)
  })

  it("orders by created_at descending", async () => {
    const { order } = makeListChain({ data: [sampleRow], error: null })

    await listRequestsForStudio(STUDIO_ID)

    expect(order).toHaveBeenCalledWith("created_at", { ascending: false })
  })

  it("maps snake_case rows to camelCase DTOs", async () => {
    makeListChain({ data: [sampleRow], error: null })

    const result = await listRequestsForStudio(STUDIO_ID)

    expect(result).toEqual([
      {
        id: "req-uuid-1",
        referenceCode: "REQ-2026-0001",
        clientName: "Alex",
        placement: "forearm",
        size: "medium",
        color: "black",
        status: "new",
        createdAt: "2026-07-01T10:00:00.000Z",
      },
    ])
  })

  it("returns an empty array when the studio has no requests", async () => {
    makeListChain({ data: [], error: null })

    const result = await listRequestsForStudio(STUDIO_ID)

    expect(result).toEqual([])
  })

  it("throws when supabase returns an error", async () => {
    makeListChain({ data: null, error: { message: "relation does not exist" } })

    await expect(listRequestsForStudio(STUDIO_ID)).rejects.toThrow("DB list query failed")
  })

  it("throws with the supabase error message", async () => {
    makeListChain({ data: null, error: { message: "connection timeout" } })

    await expect(listRequestsForStudio(STUDIO_ID)).rejects.toThrow("connection timeout")
  })

  it("throws when a row has an unrecognized status value", async () => {
    makeListChain({ data: [{ ...sampleRow, status: "archived" }], error: null })

    await expect(listRequestsForStudio(STUDIO_ID)).rejects.toThrow("Unknown request status")
  })

  it("throws for the retired 'contacted' status value", async () => {
    makeListChain({ data: [{ ...sampleRow, status: "contacted" }], error: null })

    await expect(listRequestsForStudio(STUDIO_ID)).rejects.toThrow("Unknown request status")
  })

  it.each(["new", "active", "booked", "completed", "rejected"] as const)(
    "accepts the '%s' status value",
    async (status) => {
      makeListChain({ data: [{ ...sampleRow, status }], error: null })

      const result = await listRequestsForStudio(STUDIO_ID)

      expect(result[0].status).toBe(status)
    },
  )
})

describe("getRequestForStudio", () => {
  const STUDIO_ID = "a1b2c3d4-0000-4000-8000-000000000001"
  const REQUEST_ID = "req-uuid-1"

  function makeDetailChain(result: { data: unknown; error: unknown }) {
    const maybeSingle = vi.fn().mockResolvedValue(result)
    const eqStudio = vi.fn().mockReturnValue({ maybeSingle })
    const eqId = vi.fn().mockReturnValue({ eq: eqStudio })
    const select = vi.fn().mockReturnValue({ eq: eqId })
    mockFrom.mockReturnValue({ select })
    return { select, eqId, eqStudio, maybeSingle }
  }

  const sampleDetailRow = {
    id: REQUEST_ID,
    reference_code: "REQ-2026-0001",
    client_name: "Alex",
    description: "A wolf on my forearm",
    placement: "forearm",
    size: "medium",
    color: "black",
    budget: "500-800",
    email: "alex@example.com",
    phone: null,
    contact_other: null,
    consent: true,
    status: "new",
    created_at: "2026-07-01T10:00:00.000Z",
    request_files: [
      {
        id: "file-uuid-1",
        storage_path: `${STUDIO_ID}/sub-id/artist_work/abc.jpg`,
        original_name: "ref.jpg",
        type: "artist_work",
        mime_type: "image/jpeg",
        size: 512000,
      },
    ],
  }

  it("queries by both id and studio_id", async () => {
    const { select, eqId, eqStudio } = makeDetailChain({ data: sampleDetailRow, error: null })

    await getRequestForStudio(STUDIO_ID, REQUEST_ID)

    expect(mockFrom).toHaveBeenCalledWith("requests")
    expect(select).toHaveBeenCalledWith(
      "id, reference_code, client_name, description, placement, size, color, budget, email, phone, contact_other, consent, status, created_at, request_files(id, storage_path, original_name, type, mime_type, size)",
    )
    expect(eqId).toHaveBeenCalledWith("id", REQUEST_ID)
    expect(eqStudio).toHaveBeenCalledWith("studio_id", STUDIO_ID)
  })

  it("returns null when the request does not exist", async () => {
    makeDetailChain({ data: null, error: null })

    const result = await getRequestForStudio(STUDIO_ID, REQUEST_ID)

    expect(result).toBeNull()
  })

  it("returns null (indistinguishable from missing) when the request belongs to a different studio", async () => {
    // The .eq("studio_id", ...) filter means a cross-studio request simply
    // never matches the query — Supabase returns the same null/data:null
    // shape as a genuinely missing request. No separate code path exists.
    makeDetailChain({ data: null, error: null })

    const result = await getRequestForStudio("other-studio-id", REQUEST_ID)

    expect(result).toBeNull()
  })

  it("maps snake_case detail row and nested request_files to camelCase", async () => {
    makeDetailChain({ data: sampleDetailRow, error: null })

    const result = await getRequestForStudio(STUDIO_ID, REQUEST_ID)

    expect(result).toEqual({
      id: REQUEST_ID,
      referenceCode: "REQ-2026-0001",
      clientName: "Alex",
      description: "A wolf on my forearm",
      placement: "forearm",
      size: "medium",
      color: "black",
      budget: "500-800",
      email: "alex@example.com",
      phone: null,
      contactOther: null,
      consent: true,
      status: "new",
      createdAt: "2026-07-01T10:00:00.000Z",
      files: [
        {
          id: "file-uuid-1",
          storagePath: `${STUDIO_ID}/sub-id/artist_work/abc.jpg`,
          originalName: "ref.jpg",
          type: "artist_work",
          mimeType: "image/jpeg",
          size: 512000,
        },
      ],
    })
  })

  it("maps a request with no files to an empty files array", async () => {
    makeDetailChain({ data: { ...sampleDetailRow, request_files: [] }, error: null })

    const result = await getRequestForStudio(STUDIO_ID, REQUEST_ID)

    expect(result?.files).toEqual([])
  })

  it("throws when a detail row has an unrecognized status value", async () => {
    makeDetailChain({ data: { ...sampleDetailRow, status: "archived" }, error: null })

    await expect(getRequestForStudio(STUDIO_ID, REQUEST_ID)).rejects.toThrow(
      "Unknown request status",
    )
  })

  it("throws when supabase returns an error", async () => {
    makeDetailChain({ data: null, error: { message: "relation does not exist" } })

    await expect(getRequestForStudio(STUDIO_ID, REQUEST_ID)).rejects.toThrow(
      "DB detail query failed",
    )
  })

  it("throws with the supabase error message", async () => {
    makeDetailChain({ data: null, error: { message: "connection timeout" } })

    await expect(getRequestForStudio(STUDIO_ID, REQUEST_ID)).rejects.toThrow("connection timeout")
  })
})

describe("updateRequestStatusForStudio", () => {
  const STUDIO_ID = "a1b2c3d4-0000-4000-8000-000000000001"
  const REQUEST_ID = "req-uuid-1"

  function makeUpdateChain(result: { data: unknown; error: unknown }) {
    const select = vi.fn().mockResolvedValue(result)
    const eqStudio = vi.fn().mockReturnValue({ select })
    const eqId = vi.fn().mockReturnValue({ eq: eqStudio })
    const update = vi.fn().mockReturnValue({ eq: eqId })
    mockFrom.mockReturnValue({ update })
    return { update, eqId, eqStudio, select }
  }

  it("scopes the update by both id and studio_id", async () => {
    const { update, eqId, eqStudio } = makeUpdateChain({
      data: [{ id: REQUEST_ID }],
      error: null,
    })

    await updateRequestStatusForStudio(STUDIO_ID, REQUEST_ID, "active")

    expect(mockFrom).toHaveBeenCalledWith("requests")
    expect(update).toHaveBeenCalledWith({ status: "active" })
    expect(eqId).toHaveBeenCalledWith("id", REQUEST_ID)
    expect(eqStudio).toHaveBeenCalledWith("studio_id", STUDIO_ID)
  })

  it("returns true when a row is matched and updated", async () => {
    makeUpdateChain({ data: [{ id: REQUEST_ID }], error: null })

    const result = await updateRequestStatusForStudio(STUDIO_ID, REQUEST_ID, "booked")

    expect(result).toBe(true)
  })

  it("returns false (safe not-found) when 0 rows are matched", async () => {
    makeUpdateChain({ data: [], error: null })

    const result = await updateRequestStatusForStudio(STUDIO_ID, REQUEST_ID, "booked")

    expect(result).toBe(false)
  })

  it("returns false (same result) for a cross-studio request as for a missing one", async () => {
    makeUpdateChain({ data: [], error: null })

    const result = await updateRequestStatusForStudio("other-studio-id", REQUEST_ID, "booked")

    expect(result).toBe(false)
  })

  it("throws when supabase returns an error", async () => {
    makeUpdateChain({ data: null, error: { message: "relation does not exist" } })

    await expect(updateRequestStatusForStudio(STUDIO_ID, REQUEST_ID, "new")).rejects.toThrow(
      "DB status update failed",
    )
  })

  it("throws with the supabase error message", async () => {
    makeUpdateChain({ data: null, error: { message: "connection timeout" } })

    await expect(updateRequestStatusForStudio(STUDIO_ID, REQUEST_ID, "new")).rejects.toThrow(
      "connection timeout",
    )
  })

  it.each(["new", "active", "booked", "completed", "rejected"] as const)(
    "accepts the '%s' status value",
    async (status) => {
      makeUpdateChain({ data: [{ id: REQUEST_ID }], error: null })

      const result = await updateRequestStatusForStudio(STUDIO_ID, REQUEST_ID, status)

      expect(result).toBe(true)
    },
  )
})
