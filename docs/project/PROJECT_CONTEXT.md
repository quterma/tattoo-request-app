Purpose  
Describe the product, its goals, and scope without implementation details.

Scope  
Product definition, users, features, and success criteria.  
Does not include architecture or technical decisions.

Audience  
AI agents and developers working on the project.

This document defines product boundaries that must not be expanded during implementation.

---

# Product Overview

Tattoo Artist Request App is a web application designed to replace unstructured communication (Instagram/WhatsApp) with a structured request flow.

It allows potential clients to submit detailed tattoo requests with references and photos, while providing the artist with a centralized interface to review and manage those requests.

The system is built as a production MVP for a single tattoo artist, not as a SaaS platform.

---

# Target Users

### Public Users

Potential tattoo clients, primarily mobile users arriving via Instagram links.

### Admin Users

- Tattoo artist (primary user)
- Assistant or partner (optional)

Admin access is private and limited.

---

# Core Product Idea

The product solves the problem of fragmented and low-quality client requests by enforcing a structured submission process.

Instead of chat-based communication, users provide all necessary information upfront, allowing the artist to:

- quickly evaluate requests
- reduce back-and-forth communication
- focus on relevant, high-quality work

---

# MVP Features

### Public Surface

- Home page (intro + navigation)
- Rules / Process / Pricing page
- Studio / Location page
- Request form (core feature)

### Request Form

- client name (required)
- structured input (description, placement, size, color)
- image uploads (references, placement, artist work)
  - up to 3 files per upload field
  - total expected 2–8 images per request
- contact information
- consent confirmation
- success state after submission (shows reference code)

### Admin Interface

- request list
- request details view (data + images)
- status management (new / contacted / booked / completed / rejected)
- internal notes
- unread tracking

---

# Constraints

- mobile-first usage
- low request volume (≈5–20 per week)
- single primary admin user
- minimal content updates (infrequent manual changes)
- simple deployment and maintenance

---

# Non-Goals

The following are explicitly out of scope for the initial production release:

- Telegram notifications (planned post-launch — see Post-Launch Roadmap in PROJECT_IMPLEMENTATION_PLAN.md)
- booking or calendar integration
- payments or deposits
- chat functionality
- Instagram or WhatsApp API integration
- CMS or content editing system
- multi-artist support
- analytics or marketing tools

---

# Success Criteria

The production release is considered complete when:

- users can submit requests with required data and images
- requests are stored and accessible to the artist
- requests can be reviewed and managed in the admin interface
- the application works smoothly on mobile devices
- UI/UX quality is production-ready across all surfaces (see Stage 6 in PROJECT_IMPLEMENTATION_PLAN.md)
- the system is deployed and usable in real conditions

---

# Product Boundaries

The system is NOT:

- a marketplace
- a booking system
- a communication platform

The system IS:

- a structured intake tool
- a request management interface for the artist
