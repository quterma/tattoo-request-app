Purpose  
Describe the project structure and code organization.

Scope  
Folders, layers, and import boundaries.  
No business logic or system behavior.

Audience  
AI agents and developers working with the codebase.

---

# Project Structure

The project follows a feature-oriented structure with shared modules and clear boundaries.

---

# Root Structure

/src  
 /app  
 /features  
 /shared  
 /services  
 /bff  
 /config  
 /types

---

# Folder Responsibilities

### app/

- Next.js App Router
- route groups (public, admin)
- layouts and pages
- route composition only

---

### features/

- feature-specific logic and components
- isolated by domain (e.g. request, admin)
- feature UI, logic, and local state

Current features:

#### features/request/

- config/ — form constants (field options, file limits)
- types/ — RequestFormData type inferred from zod schema
- validation/ — zod schema with all form fields and cross-field rules
- ui/ — RequestForm component (placeholder, no logic yet)

---

### shared/

- reusable UI components
- hooks
- utilities
- i18n
- styles
- test helpers

---

### services/

- API clients
- external integrations
- reusable business services

---

### bff/

- backend-for-frontend layer
- request handling
- server-side logic
- Route Handlers and orchestration

---

### config/

- environment configuration
- constants
- feature flags (if needed)

---

### types/

- shared TypeScript types
- enums and DTO-like structures shared across layers

---

# Import Rules

- use aliases (e.g. @/\* → src/\*)
- avoid deep imports
- import through public module interfaces (`index.ts`) when such public API exists

---

# Dependency Direction

Allowed:

- app → features, shared, config, types
- features → shared, services, config, types
- bff → services, config, types
- services → config, types
- shared → config, types
- config → none
- types → none

Restricted:

- shared must not depend on services or features
- features must not depend on other features directly
- services must not depend on features or shared UI
- bff must not import from UI layers
- UI must not depend on BFF
- no circular dependencies allowed

---

# Layer Mapping

The folder structure maps directly to architectural layers:

### Presentation Layer

- app/
- features/
- shared/ui

### Application Layer

- bff/
- services/

### Data Layer

- external systems (database, storage, Supabase)

This mapping must be respected when implementing features.

UI code must not access the data layer directly.

---

# Structure Principles

- keep modules isolated
- prefer composition over coupling
- avoid cross-layer dependencies
- maintain clear boundaries
- do not create new top-level folders without approval

---

# Update Rule

Update this document when files or folders are added, removed, moved, or when layer responsibilities change.
