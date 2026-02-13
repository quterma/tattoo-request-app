# Tattoo Artist Request App — MVP Scope

## 1. Purpose

Web app for a tattoo artist to:

- collect structured first requests with references and photos (instead of Instagram/WhatsApp chats)
- centralize all requests in a single admin interface
- notify the artist about new requests

Production MVP for a single real user. Not SaaS.

---

## 2. Target Users

### Public user

Potential tattoo client, mostly mobile, coming from Instagram link.

### Admin users

- Tattoo artist (primary)
- Assistant/partner (optional)
  Admin access only, limited audience.

---

## 3. In-Scope Features (MVP)

### 3.1 Public Pages

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

### 3.2 Request Form

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

## 4. Admin Interface

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

## 5. Notifications

- Telegram bot → personal chat of the artist
- New request notification
- Reminder if request not opened within threshold

---

## 6. Localization & Direction

- i18n infrastructure enabled from start
- EN used as primary language in MVP
- RU / HE available in development/testing
- RTL/LTR supported at layout level
- language switcher present (feature-flagged if needed)

---

## 7. Non-Goals (Out of Scope)

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

## 8. Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, mobile-first
- **Backend:** Supabase (Postgres, Storage, Auth, Edge Functions)
- **Notifications:** Telegram Bot API
- **Infra:** single repo, no separate backend, no AWS

---

## 9. Acceptance Criteria / Definition of Done

- Client can submit a request with required data and images
- Artist receives Telegram notification
- Request visible in admin interface
- Images viewable without external services
- Admin can change status and add notes
- App usable on mobile without friction
- Deployed web app, real requests can be submitted
- No booking/payment functionality present

See: ARCHITECTURE.md (system design), IMPLEMENTATION_PLAN.md (staged plan).
