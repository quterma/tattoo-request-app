# Project Architecture

## 1. System Overview

High-level structure of the system.

- Main application(s)
- External services (if any)
- Key responsibilities

Keep it simple.

---

## 2. Components

Describe major parts of the system.

Example:

### Web Application

- Responsibilities
- What it handles

### Backend / External Services

- What is used (DB, storage, auth, etc.)
- Treated as internal or external

---

## 3. Data Flow

Describe key flows.

Example:

- User action → processing → storage → result
- Admin flow (if exists)

Focus on main flows only.

---

## 4. Data Model (Conceptual)

Describe main entities:

- Entity name
- Key fields

No schema details.

---

## 5. Storage

- Where data is stored
- File handling (if any)
- Mutability rules (immutable / editable)

---

## 6. Auth (if applicable)

- Who is authenticated
- Access rules

---

## 7. Constraints

Critical architectural rules:

- What is NOT allowed
- Key limitations

---

## 8. Frontend Architecture (if applicable)

High-level rules:

- Layering (features/shared/services/etc.)
- Import rules
- State management approach

---

## 9. Deployment

- How system is deployed
- Environments (if relevant)

---

## Notes

- This document defines SYSTEM STRUCTURE
- Must be strict and enforceable
- No vague statements
