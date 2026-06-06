Purpose
Track current progress and maintain session continuity.

Scope
Current stage status and historical log entries.
This is the FIRST document AI must read at the start of every session.

Audience
AI agents and developers working on the project.

---

## Current Stage

Stage: Stage 3 — Request Flow
Status: In Progress

Current focus:

- Stage 3B.2 — Success / Error UX

Completed in Stage 3:

- form config (SIZE_OPTIONS, COLOR_OPTIONS, PLACEMENT_OPTIONS, MAX_FILES_PER_FIELD)
- zod validation schema with all fields and cross-field contact rule (migrated to zod/v3 for @hookform/resolvers compat)
- RequestFormData and RequestFormInput types inferred from schema
- i18n namespace `request` added to en.json (labels, placeholders, hints, errors, options)
- request page route wired (`app/[locale]/(public)/request/page.tsx`)
- local form primitives: TextInput, TextareaInput, SelectInput, CheckboxInput, Button, FileUploadInput
- RequestForm fully implemented with RHF + zodResolver, all fields, mock submit
- error handling redesigned: schema uses stable custom message keys; lib/errors.ts has flat MESSAGE_TO_I18N_KEY map + getFieldError/getContactGroupError helpers; RequestForm uses local err() shorthand — no type aliases or nested maps in form file
- final cleanup: lib/ layer added to feature, all component ids explicit, buttonText i18n-controlled, eslint allow-list updated for features/*/lib/**
- select UX fixed: defaultValues for placement/size/color set to "" + z.preprocess in schema so placeholder is shown initially and "" is treated as missing value
- upload trigger text updated to i18n key with maxFiles interpolation ("Choose up to {maxFiles} images.")
- deferred file-upload UX documented in PROJECT_BACKLOG.md

Next expected step:

- Stage 3B.2: success / error UX

---

## Log Entries (reverse chronological)

### 2026-06-06 — Stage 3B.1 — Payload contract + API route + first end-to-end submit

Status: Completed

Completed:

- FormData contract defined: text fields + repeated file keys (referenceImages, placementImages), optional fields omitted when empty, consent as string "true"
- src/bff/request.ts: ParsedRequestPayload interface + parseRequestFormData()
- src/bff/index.ts: exports parseRequestFormData and ParsedRequestPayload as public API
- app/api/request/route.ts: POST handler, parses FormData via BFF, returns { ok: true, requestId: uuid }
- RequestForm.tsx: onSubmit replaced with real fetch to /api/request, console.log on response

---

### 2026-06-06 — Stage 3 — Planning sync (round 2)

Status: Planning completed

Notes:

- File data model direction confirmed: typed file collection (type, storagePath, originalName, mimeType, size)
- Two upload inputs on current form confirmed: reference images and placement images — map to type values
- Mobile upload requirement clarified: native file input for MVP (gallery/camera/files); no advanced upload UI needed now
- Image Proxy technical review scheduled for start of Stage 3C.2
- .env.example / env var documentation scheduled for Stage 3C.1
- Stale backlog item removed: "real upload flow to storage" (now Stage 3C task, not backlog)
- PROJECT_DECISIONS.md, PROJECT_ARCHITECTURE.md, PROJECT_IMPLEMENTATION_PLAN.md, PROJECT_BACKLOG.md updated

---

### 2026-06-06 — Stage 3 — Planning sync

Status: Planning completed

Notes:

- Stage 3A (form UI) confirmed complete via codebase audit
- Backend slice (API, storage, database) not yet started — confirmed
- Stage 3 execution plan approved: sub-stages 3B → 3C → 3D defined in PROJECT_IMPLEMENTATION_PLAN.md
- Storage direction approved: Supabase Storage, private bucket
- Service layer rule documented: no provider abstractions, YAGNI-compliant
- File access decision documented: Image Proxy through BFF (pending short technical review before implementation)
- PROJECT_DECISIONS.md, PROJECT_ARCHITECTURE.md, PROJECT_IMPLEMENTATION_PLAN.md updated to reflect all decisions

---

### 2026-04-08 — Stage 2 — Public Pages

Status: Completed

Completed:

- Home sections (hero, gallery placeholder, how it works, about)
- Policies page with full content
- Aftercare page with full content
- Location page
- CTA links verified — all lead to /request
- Navigation links verified across all public pages

### 2026-03-24 — Stage 2 — Public Pages (partial)

Status: Superseded

Completed at that point:

- Home sections (Gallery, How It Works, About)
- Policies page
- Location page

---

### Stage 1 — App Shell & Navigation

Status: Completed

Completed:

- Layout and navigation implemented
- Route groups created (public, admin)
- Base pages added (home, policies, location)
- Responsive navigation (mobile + desktop)
