# Project File Structure

```
tattoo-request-app/
├── .editorconfig
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── proxy.ts
├── README.md
├── tsconfig.json
├── vitest.config.ts
├── .claude/
│   └── CLAUDE.md
├── .husky/
│   └── pre-commit
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       └── login/
│   │   │           └── page.tsx
│   │   └── (public)/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── aftercare/
│   │       │   └── page.tsx
│   │       ├── location/
│   │       │   └── page.tsx
│   │       ├── policies/
│   │       │   └── page.tsx
│   │       └── request/
│   │           └── page.tsx
│   └── api/
│       └── request/
│           ├── route.ts
│           └── __tests__/
│               └── route.test.ts
├── docs/
│   ├── files-structure.md
│   ├── framework/
│   │   ├── AI_DEVELOPMENT_RULES.md
│   │   ├── AI_DEVELOPMENT_WORKFLOW.md
│   │   ├── AI_FRAMEWORK_IDEAS.md
│   │   ├── AI_PROJECT_BOOTSTRAP.md
│   │   ├── AI_REVIEW_PIPELINE.md
│   │   ├── DOCUMENTATION_SYSTEM_RULES.md
│   │   └── templates/
│   │       ├── CLAUDE_TEMPLATE.md
│   │       ├── PROJECT_ARCHITECTURE_TEMPLATE.md
│   │       ├── PROJECT_BACKLOG_TEMPLATE.md
│   │       ├── PROJECT_CONTEXT_TEMPLATE.md
│   │       ├── PROJECT_DECISIONS_TEMPLATE.md
│   │       ├── PROJECT_IMPLEMENTATION_PLAN_TEMPLATE.md
│   │       ├── PROJECT_STAGE_LOG_TEMPLATE.md
│   │       └── PROJECT_STRUCTURE_TEMPLATE.md
│   └── project/
│       ├── PROJECT_ARCHITECTURE.md
│       ├── PROJECT_BACKLOG.md
│       ├── PROJECT_CONTEXT.md
│       ├── PROJECT_DECISIONS.md
│       ├── PROJECT_IMPLEMENTATION_PLAN.md
│       ├── PROJECT_PRODUCTION_READINESS.md
│       ├── PROJECT_STAGE_LOG.md
│       ├── PROJECT_STRUCTURE.md
│       └── PROJECT_TESTING_STRATEGY.md
├── scripts/
│   └── update-structure.mjs
├── src/
│   ├── bff/
│   │   ├── index.ts
│   │   ├── request.ts
│   │   ├── validateFiles.ts
│   │   └── __tests__/
│   │       ├── request.test.ts
│   │       ├── validateFiles.test.ts
│   │       └── validateRequestPayload.test.ts
│   ├── config/
│   │   └── index.ts
│   ├── features/
│   │   ├── index.ts
│   │   └── request/
│   │       ├── __tests__/
│   │       │   ├── RequestForm.submission.test.tsx
│   │       │   └── schema.test.ts
│   │       ├── config/
│   │       │   ├── form.ts
│   │       │   └── index.ts
│   │       ├── lib/
│   │       │   └── errors.ts
│   │       ├── types/
│   │       │   └── index.ts
│   │       ├── ui/
│   │       │   ├── Button.tsx
│   │       │   ├── CheckboxInput.tsx
│   │       │   ├── FileUploadInput.tsx
│   │       │   ├── index.ts
│   │       │   ├── RequestForm.tsx
│   │       │   ├── SelectInput.tsx
│   │       │   ├── TextareaInput.tsx
│   │       │   ├── TextInput.tsx
│   │       │   └── field/
│   │       │       ├── FieldError.tsx
│   │       │       ├── FieldHint.tsx
│   │       │       ├── FieldLabel.tsx
│   │       │       └── FormFieldLayout.tsx
│   │       └── validation/
│   │           ├── index.ts
│   │           ├── schema.ts
│   │           └── validationKeys.ts
│   ├── services/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── index.ts
│   │   ├── storage.ts
│   │   ├── supabase.ts
│   │   ├── supabaseAuth.ts
│   │   └── __tests__/
│   │       ├── auth.test.ts
│   │       ├── db.test.ts
│   │       └── storage.test.ts
│   ├── shared/
│   │   ├── index.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── i18n/
│   │   │   ├── config.ts
│   │   │   ├── index.ts
│   │   │   ├── navigation.ts
│   │   │   ├── request.ts
│   │   │   ├── routing.ts
│   │   │   └── messages/
│   │   │       └── en.json
│   │   ├── styles/
│   │   │   ├── index.ts
│   │   │   └── tokens.css
│   │   ├── test/
│   │   │   ├── index.ts
│   │   │   └── setup.ts
│   │   ├── ui/
│   │   │   ├── app-nav.tsx
│   │   │   ├── container.tsx
│   │   │   ├── icons.tsx
│   │   │   ├── index.ts
│   │   │   ├── page.tsx
│   │   │   ├── public-footer.tsx
│   │   │   ├── section.tsx
│   │   │   └── stack.tsx
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── index.ts
│   │       └── validation.ts
│   └── types/
│       ├── css.d.ts
│       └── index.ts
└── supabase/
    ├── .gitignore
    ├── config.toml
    └── migrations/
        ├── 20260622000000_create_requests.sql
        ├── 20260622000001_add_client_submission_id_unique.sql
        ├── 20260623000000_make_client_name_not_null.sql
        └── 20260629154719_domain_foundation.sql
```
