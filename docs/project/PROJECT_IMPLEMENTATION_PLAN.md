Purpose  
Define a clear, executable implementation plan for the project.

Scope  
Development stages and execution order.  
No architecture explanations.

Audience  
AI agents and developers implementing the system.

---

# Execution Rule

AI must implement only what is defined in PROJECT_CONTEXT and PROJECT_DECISIONS.

No extra features, optimizations, or enhancements unless explicitly requested.

---

# Implementation Strategy

The project is implemented in incremental stages.

Each stage must:

- result in a working, testable state
- have clear exit criteria
- not break previous functionality

---

# Stage 0 — Foundation

Goal: prepare the technical base.

Tasks:

- project setup (Next.js, TypeScript)
- basic configuration (eslint, tsconfig, aliases)
- UI foundation (Tailwind, base components)
- i18n setup
- routing structure (public/admin)
- initial project structure
- documentation setup

Exit Criteria:

- project builds without errors
- routing works (basic pages accessible)
- base UI components render correctly
- i18n works for at least one page
- project structure matches PROJECT_STRUCTURE.md

---

# Stage 1 — App Shell

Goal: build basic navigation and layout.

Tasks:

- layout components
- navigation (mobile + desktop)
- route groups (public, admin)
- basic pages:
  - home
  - policies
  - location

Exit Criteria:

- navigation works across all pages
- layout is consistent
- mobile and desktop navigation function correctly
- pages are accessible and render without errors

Result:

- navigable application with static content

---

# Stage 2 — Public Content

Goal: complete public-facing pages.

Tasks:

- home sections (hero, gallery, how it works, about)
- policies content
- location page
- links and CTA flow

Exit Criteria:

- all public pages contain real content (no placeholders)
- CTA leads to request flow
- links between pages are correct
- layout remains consistent

Result:

- ready public surface

---

# Stage 3 — Request Flow (Core)

Goal: implement request submission.

Tasks:

- request form UI
- form validation (client)
- file upload handling
- API endpoint (BFF via Route Handlers)
- server validation
- data storage
- success state

Exit Criteria:

- user can submit request successfully
- invalid data is rejected (client + server)
- files are uploaded and linked correctly
- request is stored in database
- success response is shown to user
- no console or server errors

Result:

- users can submit requests end-to-end

---

# Stage 4 — Admin Panel

Goal: implement request management.

Tasks:

- request list
- request details page
- status updates
- admin notes
- unread indicator

Exit Criteria:

- admin can view all requests
- admin can open request details
- admin can update status
- admin notes are saved
- UI reflects updated state

Result:

- admin can manage requests

---

# Stage 5 — Notifications

Goal: notify about new requests.

Tasks:

- Telegram integration
- trigger on new request
- optional reminder logic

Exit Criteria:

- notification is sent on new request
- notification contains correct data
- system does not break if notification fails

Result:

- admin receives notifications

---

# Stage 6 — Stabilization

Goal: prepare for real usage.

Tasks:

- bug fixes
- UX improvements
- mobile optimization
- basic testing
- deployment

Exit Criteria:

- no critical bugs
- mobile UX is acceptable
- main flows tested manually
- application deployed
- system usable in real conditions

Result:

- production-ready MVP

---

# Execution Rules

- implement stages sequentially
- do not skip stages
- do not start next stage before completing current
- each stage must satisfy its Exit Criteria
- avoid premature optimization
- keep scope within MVP

---

# Done Criteria

The implementation is complete when:

- all stages are completed
- request flow works end-to-end
- admin panel is functional
- notifications are working
- application is deployed and usable
