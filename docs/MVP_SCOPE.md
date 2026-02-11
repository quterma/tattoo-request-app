# Tattoo Artist Request App — MVP Scope

## 1. Purpose

Web application for a tattoo artist to:

- reduce unstructured chat communication (Instagram / WhatsApp)
- collect structured first requests with references and photos
- centralize all requests in a single admin interface
- notify the artist about new requests and unread items

This is a **real production-oriented MVP** for a single real user.
Not a startup, not SaaS at this stage.

---

## 2. Target Users

### Public user

Potential tattoo client, mostly mobile, coming from Instagram link.

### Admin users

- Tattoo artist (primary)
- Assistant/partner (optional)
  Admin access only, limited audience.

---

## 3. Core Value

Replace “Hi, I want something but don’t know what” chats with:

- structured request form
- required visual references
- clear expectations before manual communication starts

Manual booking, deposits, and calendar control remain outside the app.

---

## 4. In-Scope Features (MVP)

### 4.1 Public Pages

- Home page
  - short intro
  - navigation to request form, rules, location
- Rules / Process / Pricing
  - static content
  - how to request
  - pricing explanation
  - basic FAQ (if needed)
- Request Form (main feature)
- Studio / Location
  - address
  - map
  - contact info

### 4.2 Request Form

Fields:

- description (text)
- reference images (up to 3)
- screenshots of artist’s works (up to 3)
- placement (dropdown)
- placement photos (up to 3)
- size (dropdown)
- color mode (mono / color)
- contact info:
  - name
  - WhatsApp / phone
  - Instagram username
  - preferred language
- consent checkbox (data & photo storage)

Upload rules:

- jpg / png / heic
- soft size limit per file
- preview + replace before submit
- immutable after submit

Submit result:

- request stored
- notification sent to admin
- success screen with next steps

---

## 5. Admin Interface

Mobile-first, private.

Features:

- list of requests
- sort / filter by status
- unread indicator
- request details view:
  - all fields
  - image gallery
  - internal notes
- status management:
  - New
  - In progress
  - Done
  - Rejected

---

## 6. Notifications

Telegram-based.

Types:

- New request notification
- Reminder notification (if request not opened within defined time)

Delivery:

- Telegram bot → personal Telegram chat of the artist

---

## 7. Localization & Direction

- i18n infrastructure enabled from start
- EN used as primary language in MVP
- RU / HE available in development/testing
- RTL/LTR supported at layout level
- language switcher present (feature-flagged if needed)

---

## 8. Non-Goals (Explicitly Out of Scope)

- automatic booking
- calendar synchronization
- payments or deposits
- chatbots / AI
- Instagram or WhatsApp API integration
- public portfolio gallery
- advanced analytics
- CMS for content editing
- multi-artist support

---

## 9. Tech Stack

Frontend:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- mobile-first responsive layout

Backend / Services:

- Supabase
  - Postgres (requests data)
  - Storage (images)
  - Auth (admin access)
  - Edge Functions (Telegram notifications, reminders)

Infrastructure:

- single repository
- Supabase as managed backend
- no separate backend service
- no AWS at MVP stage

---

## 10. High-Level Architecture (Surface Only)

- Next.js app (public + admin routes)
- Supabase client used from frontend
- Supabase Edge Functions:
  - send Telegram notifications
  - scheduled reminder checks
- Storage access controlled via Supabase policies

(Detailed architecture to be defined separately.)

---

## 11. Development Plan (High-Level)

1. Repo setup + environment configuration
2. Design kit (colors, typography, base UI atoms)
3. Public layout + static pages
4. Request form UI + validation
5. File upload integration
6. Supabase schema + storage setup
7. Submit flow + success UX
8. Telegram notifications
9. Admin list & details views
10. Status management + notes
11. Reminder logic
12. QA, demo scenarios, polish

---

## 12. Acceptance Criteria

- Client can submit a request with required data and images
- Artist receives Telegram notification
- Request visible in admin interface
- Images are viewable without external services
- Admin can change status and add notes
- App usable on mobile without friction
- No booking/payment functionality present

---

## 13. MVP Definition of Done

- Deployed web app
- Real requests can be submitted
- Artist can process requests without using Instagram DMs
- Scope strictly respected
