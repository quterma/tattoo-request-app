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

- Request form UI implementation

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

- Success state / error state after submission
- Backend integration (API route handler)

---

## Log Entries (reverse chronological)

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
