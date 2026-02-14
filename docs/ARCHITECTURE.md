# Architecture

## 1. System Overview

- Single Next.js web app (public + admin)
- Managed backend (Supabase)
- Notification delivery (Telegram)
- No standalone backend service

---

## 2. Components

### Web Application (Next.js)

- Public routes: home, policies, request form, location
- Admin routes: request list, request details
- BFF layer via Route Handlers — optional, used only for server-side validation, orchestration, or secure logic (webhooks, auth). Initial Supabase calls may be client-side in MVP. See FRONTEND_ARCHITECTURE.md

### Backend (Supabase)

- Postgres (request data)
- Storage (images)
- Auth (admin)
- Edge Functions (notifications, reminders)

Treated as external system, not application code.

### Notifications (Telegram)

- Telegram Bot API, messages triggered by backend events
- New request + reminder for unread requests

---

## 3. Data Flows

**Request submission:** form → validate → store data + files in Supabase → trigger Telegram notification

**Admin review:** fetch requests → view details/images → update status/notes → persist

**Reminders:** scheduled check → find requests without `readAt` beyond threshold → send Telegram

---

## 4. Data Model (Conceptual)

**Request:** id, createdAt, status, readAt, description, placement, size, colorMode, preferredLanguage, contactInfo, internalNotes

**Attachments:** requestId, type (reference / artist / placement), storagePath, metadata

Exact schema defined in Stage 4.

---

## 5. File Storage

- Supabase Storage, access controlled by policies
- Files immutable after submission
- No public file URLs

## 6. Auth

- Admin routes only (Supabase Auth)
- Public users are anonymous
- Role-based access via backend policies

## 7. i18n

- Frontend-only, dictionaries in repo
- RTL/LTR at layout level
- Backend data is language-agnostic

## 8. Deployment

- Single web app + managed Supabase backend
- Environment-based configuration
- No custom servers
