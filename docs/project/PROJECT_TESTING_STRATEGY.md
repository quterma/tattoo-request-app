Purpose  
Define a minimal and practical testing strategy for the project.

Scope  
What should and should not be tested in the MVP.  
Does not define coverage targets or enterprise QA processes.

Audience  
AI agents and developers working on the project.

---

# Testing Principle

Testing should remain minimal and intentional.

The goal is to protect critical logic and reduce regression risk without slowing down development.

---

# What Should Be Tested

### Request Form Logic

- validation rules
- required fields
- submission state flow
- file upload constraints
- success and error states

### Critical Utilities

- pure helper functions
- validation mappers
- i18n helpers if they contain logic

### Integration-Like Flows

- request form submission flow
- interaction between form logic and service layer
- error handling for failed submissions

---

# What Should Not Be Tested

- static content pages
- visual layout
- simple presentational components
- styling details
- framework behavior
- third-party SDK internals

These should be verified manually when needed.

---

# Manual Verification

Manual checks are required for:

- mobile layout
- page navigation
- RTL/LTR rendering
- upload UX
- admin usability
- public page readability

---

# Test Levels

### Unit Tests

Used for isolated logic and pure functions.

### Integration-Like Tests

Used for critical request flow behavior.

### End-to-End Tests

Not required for MVP.

---

# Test Rules

- test only logic with meaningful regression risk
- avoid writing tests for trivial UI
- backend and external integrations should be mocked
- tests should support safe refactoring, not increase process overhead
- add tests only when they protect important behavior or reduce real regression risk

---

# Success Condition

Testing is sufficient when:

- the critical request flow is safe to change
- major validation regressions are unlikely
- important form logic is protected by tests
- UI and layout are verified manually where appropriate

---

AI must not introduce testing frameworks or patterns beyond this strategy.
