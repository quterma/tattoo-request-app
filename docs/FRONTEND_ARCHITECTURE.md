# Frontend Architecture

Feature-oriented architecture (FSD-inspired, simplified). Next.js App Router.

---

## 1. Top-Level Structure

/app
/(public)
/(admin)
layout.tsx
providers.tsx

/src
/bff
/features
/shared
/services
/config
/types

---

## 2. Layers and Responsibilities

### app/

- Next.js routing layer only
- Route composition, layouts, metadata
- No business logic
- Imports allowed ONLY from:
  - src/features
  - src/shared
  - src/config

---

### src/features/

Vertical slices of functionality.

Each feature may contain:

- ui (feature-level components)
- model (state, hooks, feature logic)
- api (feature-specific data access)
- types (feature-local types)

Examples:

- request-form
- admin-requests
- admin-auth

Rules:

- Features MUST NOT import from other features
- Features MAY import from shared, services, config, types

---

### src/shared/

Reusable, generic building blocks.

Contains:

- ui (buttons, inputs, layout primitives)
- hooks (generic hooks)
- utils (pure helpers)
- i18n (dictionaries, helpers)
- styles (tokens, globals)

Rules:

- shared MUST NOT import from features
- shared MUST NOT import from services

---

### src/bff/

Backend-for-Frontend orchestration layer using Next.js Route Handlers.

Used when:

- Client needs server-side validation before persistence
- Multiple backend calls need orchestration
- Data needs transformation between client and Supabase

Rules:

- bff MAY import from services, config, types
- bff MUST NOT import from features or shared
- bff exposes Route Handler functions, not React components

---

### src/services/

Integration layer with external systems.

Contains:

- supabase client
- auth helpers
- notification helpers (e.g. Telegram trigger calls)

Rules:

- services MUST NOT import from features
- services MAY import from config and types
- services expose functions, not React components

---

### src/config/

Application-wide configuration.

Contains:

- environment access
- feature flags
- constants

No imports from other layers.

---

### src/types/

Global, cross-feature TypeScript types.

Contains:

- Request
- Attachment
- Shared enums / DTOs

Rules:

- types MUST NOT import from any other layer
- All layers MAY import from types

---

## 3. Providers and Contexts

### app/providers.tsx

Single entry point for all React providers:

- theme
- i18n
- auth session (if needed later)

Rules:

- providers import ONLY from shared, services, config
- features MUST NOT define global providers

---

## 4. State Management

- Local component state by default
- Feature-level state via hooks in `features/*/model`
- No global state manager in MVP
- Server state handled via services (Supabase client)
- Complex feature flows (e.g., request form submission/upload) use useReducer as explicit finite-state flow inside features/\*/model.

---

## 5. Import Rules (Strict)

Allowed imports:

- app → features, shared, config, types
- features → shared, services, config, types
- bff → services, config, types
- services → config, types
- shared → config, types
- config → (none)
- types → (none)

Forbidden:

- feature → feature
- shared → services
- services → features
- any circular dependency
