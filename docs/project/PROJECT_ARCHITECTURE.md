Purpose  
Describe the system architecture, components, and interactions.

Scope  
High-level system design, data flow, and integrations.  
No UI or implementation-level details.

Audience  
AI agents and developers implementing the system.

---

# System Overview

The application is a web-based system consisting of:

- client application (public + admin interfaces)
- backend layer (API / BFF)
- database and file storage
- external notification service (Telegram — planned post-launch)

The system is designed as a simple, production-ready MVP with minimal moving parts.

---

# System Boundary

Defines what is part of the system and what is external.

Internal:

- Next.js application
- UI, forms, client validation
- BFF layer via Next.js Route Handlers

External:

- database
- file storage
- Telegram notifications
- future third-party integrations

All external systems are accessed only through the application layer.

---

# Architecture Style

The system follows a simplified layered architecture:

- Presentation layer (client UI)
- Application layer (BFF / API logic)
- Data layer (database + storage)

The goal is clarity, maintainability, and fast iteration.

---

# Core Components

### Client (Frontend)

- public pages (home, policies, location, request)
- admin interface (protected routes)

Responsibilities:

- rendering UI
- handling user input
- client-side validation
- sending requests to backend
- displaying submission and admin states

---

### Backend (BFF / API)

BFF is implemented via Next.js Route Handlers.

Used only when required for:

- server-side validation
- request orchestration
- secure logic
- integration with external services

Responsibilities:

- receive and validate request data
- handle file upload flow
- persist data to database
- trigger notifications
- return success or error response

---

### Database

Stores structured request data:

- request details
- status
- timestamps
- admin notes

Supabase (PostgreSQL) is used as the database. See PROJECT_DECISIONS.md.

The database is treated as an external managed system, not application code.

---

### File Storage

Supabase Storage is used for uploaded images.

Stores:

- reference images (uploaded via the reference images input on the request form)
- placement photos (uploaded via the placement images input on the request form)

Storage bucket is private. Files are not publicly accessible.
Files are immutable after submission.

Each uploaded file is recorded as a typed file record linked to its request:
type ("reference" | "placement"), storagePath, originalName, mimeType, size.
See PROJECT_DECISIONS.md — File Data Model Decisions.

Admin file access uses signed URLs generated server-side in the BFF.
Signed URLs are short-lived (~1 hour) and scoped to the private bucket.
Image Proxy through BFF was evaluated and rejected in Stage 3C.2 planning — see PROJECT_DECISIONS.md.

---

### Notification Service

Telegram notifications are planned post-launch (see PROJECT_IMPLEMENTATION_PLAN.md — Stage 2).

They are not part of the initial production release. When implemented:

- new request alerts triggered by backend events after successful request creation
- optional reminders for unread requests

---

# Data Flow

### Request Submission

1. user fills request form in client
2. client validates input
3. client sends data and files to backend
4. backend performs server validation
5. backend uploads files to storage
6. backend stores request data in database
7. backend returns success response to client

Note: Telegram notification (step 7 in the original design) is post-launch. See Stage 2 in PROJECT_IMPLEMENTATION_PLAN.md.

---

### Admin Authentication Flow (Stage 4A)

1. admin navigates to any protected route under `/[locale]/admin/`
2. Next.js middleware (`proxy.ts`) refreshes the Supabase SSR session cookie if present
3. Admin layout server component checks for a valid Supabase session via SSR auth client
4. If no session → redirect to `/[locale]/admin/login`
5. If session present → call `getAuthenticatedStudioMember()` (checks `studio_members` row)
6. If no `studio_members` row → render unauthorized page
7. If both checks pass → render admin content

Login flow:
1. Admin submits email/password (or Google OAuth) on the login page
2. Supabase Auth issues a session (cookie-based via SSR client)
3. Redirect to `/[locale]/admin`

OAuth callback (Google):
1. Supabase redirects to `app/auth/callback/route.ts` with auth code
2. Route exchanges code for session; redirects to `/[locale]/admin`
3. No authorization logic in the callback

Password reset flow:
1. Admin requests reset link via email
2. Supabase sends a recovery link
3. Admin opens link → recovery session issued
4. Admin sets new password; recovery session is exchanged for a full session
5. Recovery session must not grant admin access before reset is completed

---

### Admin Flow

1. admin opens request list
2. client fetches request data from backend
3. admin views request details
4. admin updates status or notes
5. backend persists changes

---

# Integration Points

### Database

Used for storing all structured data.

### Storage

Used for image uploads and retrieval. Accessed only through the service layer.

### Telegram Bot

Planned post-launch for notifications. Not part of the initial production release.

---

# Service Layer

All external systems (database, storage, Telegram) are accessed only through the service layer.

The service layer is implemented as plain service modules — no provider abstractions,
DI containers, factory patterns, or interface hierarchies unless a second real provider is added.

See PROJECT_DECISIONS.md — Service Layer Decisions.

## Supabase Clients

Two separate Supabase clients exist from Stage 4A onward:

- **`services/supabase.ts`** — service role client; used for all DB and Storage operations; server-only; must never reach the client
- **`services/supabaseAuth.ts`** — SSR/cookie-session auth client (`@supabase/ssr`); used only to verify session identity; must not be used for data queries on `requests`, `request_files`, or admin data in Stage 4

The SSR auth client is also used by `proxy.ts` (Next.js middleware) to refresh session cookies.

---

# Constraints

- mobile-first usage
- low request volume (≈5–20 per week)
- single primary admin user
- simple deployment and maintenance

---

# Design Principles

- keep system simple (no over-engineering)
- avoid unnecessary services
- prefer clarity over flexibility
- optimize for real usage, not scalability
