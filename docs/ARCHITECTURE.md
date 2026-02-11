# Tattoo Artist Request App — Architecture

## 1. Architecture Goals

- Simple, explainable structure
- Mobile-first, production-like web app
- Clear separation between public, admin, and backend responsibilities
- Easy to evolve during development without heavy refactors

This document describes the system at a high level.
Implementation details are intentionally omitted.

---

## 2. System Overview

The system consists of:

- a single Next.js web application (public + admin)
- a managed backend (Supabase)
- external notification delivery (Telegram)

There is no standalone backend service.

---

## 3. High-Level Components

### 3.1 Web Application (Next.js)

Responsibilities:

- render public pages
- collect and validate request data
- upload files
- provide admin UI
- interact with backend services

Routes:

- Public routes (home, rules, request form, location)
- Admin routes (request list, request details)

---

### 3.2 Backend Platform (Supabase)

Used as a managed backend.

Responsibilities:

- persist request data (Postgres)
- store uploaded images (Storage)
- handle admin authentication
- run server-side logic (Edge Functions)

Supabase is treated as an external system, not as application code.

---

### 3.3 Notification Layer (Telegram)

Responsibilities:

- notify artist about new requests
- send reminder notifications for unread requests

Implementation:

- Telegram Bot API
- messages triggered by backend events

No interactive chat features.

---

## 4. Data Flow

### 4.1 Request Submission Flow

1. Client fills request form
2. Client uploads images
3. Web app validates data
4. Data is stored in Supabase
5. Files are stored in Supabase Storage
6. Notification event is triggered
7. Telegram message is sent to artist

---

### 4.2 Admin Review Flow

1. Admin opens admin UI
2. Requests are fetched from Supabase
3. Admin views request details and images
4. Admin updates request status or notes
5. Changes are persisted in Supabase

---

### 4.3 Reminder Flow

1. Scheduled backend check runs
2. Requests without `readAt` beyond threshold are selected
3. Reminder notification is sent via Telegram

---

## 5. Data Model (Conceptual)

### Request

- id
- createdAt
- status
- readAt
- description
- placement
- size
- colorMode
- preferredLanguage
- contactInfo
- internalNotes

### Attachments

- requestId
- type (reference / artist / placement)
- storagePath
- metadata

Exact schema defined later.

---

## 6. File Storage Strategy

- Images stored in Supabase Storage
- Access controlled by policies
- Files immutable after submission
- Admin has read-only access
- No public file URLs

---

## 7. Authentication & Authorization

- Authentication required only for admin routes
- Public users are anonymous
- Admin users authenticated via Supabase Auth
- Role-based access enforced by backend policies

---

## 8. Localization & Direction

- i18n handled in frontend
- Language dictionaries stored in repo
- RTL/LTR handled at layout level
- Backend data language-agnostic

---

## 9. Error Handling Strategy

- Client-side validation for form input
- Graceful handling of upload failures
- User-friendly error messages
- Logging via platform defaults

No centralized logging system at MVP stage.

---

## 10. Deployment Model

- Single web app deployment
- Managed backend (Supabase)
- No custom servers
- Environment-based configuration

---

## 11. Evolution Strategy

Planned future extensions:

- CMS for content editing
- Calendar integration
- Payment processing
- Analytics
- Multi-artist support

Architecture is intentionally simple to allow incremental evolution.

---

## 12. Out of Scope

- Detailed component hierarchy
- State management implementation
- Styling decisions
- Database schema migrations
- CI/CD pipelines

These are addressed during implementation.
