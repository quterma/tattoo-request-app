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
- external notification service (Telegram)

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

Stores uploaded images:

- reference images
- placement photos
- additional files

Files are linked to requests via IDs or URLs.  
Files are immutable after submission.

---

### Notification Service

Telegram is used for:

- new request alerts
- reminders (optional)

Notifications are triggered by backend events after successful request creation.

---

# Data Flow

### Request Submission

1. user fills request form in client
2. client validates input
3. client sends data and files to backend
4. backend performs server validation
5. backend uploads files to storage
6. backend stores request data in database
7. backend triggers Telegram notification
8. backend returns success response to client

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

Used for image uploads and retrieval.

### Telegram Bot

Used for notifications.

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
