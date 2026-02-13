# Frontend Architecture

## 1. Architectural Model

Feature-oriented architecture inspired by FSD, simplified for MVP.
Strict import rules to prevent cyclic and unclear dependencies.

Framework: Next.js (App Router).

---

## 2. Top-Level Structure

/app
/(public)
/(admin)
layout.tsx
providers.tsx

/src
/features
/shared
/services
/config
/types

---

## 3. Layers and Responsibilities

### app/

- Next.js routing layer only
- Route composition, layouts, metadata
- No business logic
- Imports allowed ONLY from:
  - src/features
  - src/shared
  - src/config

`app` replaces the traditional `pages` layer.
There is NO separate `pages` folder.

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

## 4. Providers and Contexts

### app/providers.tsx

Single entry point for all React providers:

- theme
- i18n
- auth session (if needed later)

Rules:

- providers import ONLY from shared, services, config
- features MUST NOT define global providers

---

## 5. State Management

- Local component state by default
- Feature-level state via hooks in `features/*/model`
- No global state manager in MVP
- Server state handled via services (Supabase client)
- Complex feature flows (e.g., request form submission/upload) use useReducer as explicit finite-state flow inside features/\*/model.

---

## 6. Import Rules (Strict)

Allowed imports:

- app → features, shared, config, types
- features → shared, services, config, types
- services → config, types
- shared → config, types
- config → (none)
- types → (none)

Forbidden:

- feature → feature
- shared → services
- services → features
- any circular dependency

---

## 7. What Is Explicitly Out of Scope

- widgets layer
- entities layer
- global state manager
- architectural abstractions without usage

This architecture is fixed for MVP and may evolve later.
