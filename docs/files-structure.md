# Project File Structure

```
tattoo-request-app/
├── .editorconfig
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── AGENTS.md
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
│   ├── CLAUDE.md
│   └── settings.json
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
│   │   │       ├── (protected)/
│   │   │       │   ├── actions.ts
│   │   │       │   ├── layout.tsx
│   │   │       │   ├── page.tsx
│   │   │       │   ├── SignOutButton.tsx
│   │   │       │   └── requests/
│   │   │       │       ├── error.tsx
│   │   │       │       ├── loading.tsx
│   │   │       │       ├── page.tsx
│   │   │       │       └── [id]/
│   │   │       │           ├── actions.ts
│   │   │       │           ├── error.tsx
│   │   │       │           ├── loading.tsx
│   │   │       │           ├── not-found.tsx
│   │   │       │           ├── page.tsx
│   │   │       │           └── __tests__/
│   │   │       │               └── actions.test.ts
│   │   │       ├── forgot-password/
│   │   │       │   ├── actions.ts
│   │   │       │   ├── ForgotPasswordForm.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── login/
│   │   │       │   ├── actions.ts
│   │   │       │   ├── LoginForm.tsx
│   │   │       │   └── page.tsx
│   │   │       └── reset-password/
│   │   │           ├── actions.ts
│   │   │           ├── page.tsx
│   │   │           └── ResetPasswordForm.tsx
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
│   ├── api/
│   │   └── request/
│   │       ├── route.ts
│   │       └── __tests__/
│   │           └── route.test.ts
│   └── auth/
│       ├── callback/
│       │   └── route.ts
│       └── reset-callback/
│           └── route.ts
├── docs/
│   ├── files-structure.md
│   ├── framework/
│   │   ├── AI_CROSS_REVIEW.md
│   │   ├── AI_DEVELOPMENT_RULES.md
│   │   ├── AI_DEVELOPMENT_WORKFLOW.md
│   │   ├── AI_FRAMEWORK_IDEAS.md
│   │   ├── AI_PROJECT_BOOTSTRAP.md
│   │   ├── AI_REVIEW_PIPELINE.md
│   │   ├── AI_TASK_PROTOCOL.md
│   │   ├── AI_WORKFLOW_MASTER.md
│   │   ├── DOCUMENTATION_SYSTEM_RULES.md
│   │   └── templates/
│   │       ├── CLAUDE_TEMPLATE.md
│   │       ├── PROJECT_ARCHITECTURE_TEMPLATE.md
│   │       ├── PROJECT_BACKLOG_TEMPLATE.md
│   │       ├── PROJECT_CONTEXT_TEMPLATE.md
│   │       ├── PROJECT_DECISIONS_TEMPLATE.md
│   │       ├── PROJECT_IMPLEMENTATION_PLAN_TEMPLATE.md
│   │       ├── PROJECT_STAGE_LOG_TEMPLATE.md
│   │       ├── PROJECT_STRUCTURE_TEMPLATE.md
│   │       └── STAGE_TASK_TEMPLATE.md
│   └── project/
│       ├── PROJECT_ARCHITECTURE.md
│       ├── PROJECT_BACKLOG.md
│       ├── PROJECT_CONTEXT.md
│       ├── PROJECT_DECISIONS.md
│       ├── PROJECT_IMPLEMENTATION_PLAN.md
│       ├── PROJECT_PRODUCTION_READINESS.md
│       ├── PROJECT_STAGE_LOG.md
│       ├── PROJECT_STRUCTURE.md
│       ├── PROJECT_TESTING_STRATEGY.md
│       ├── STAGE_6_FUNCTIONAL_SPECIFICATION.md
│       ├── STAGE_6_PRODUCT_DEFINITION.md
│       ├── reviews/
│       │   ├── .gitkeep
│       │   └── done/
│       │       ├── .gitkeep
│       │       ├── REVIEW_2026-07-13_codex-delegation-scope.md
│       │       ├── REVIEW_2026-07-13_codex-sync-setup.md
│       │       ├── REVIEW_2026-07-13_stage6-ux-blueprint-batch2.md
│       │       └── REVIEW_2026-07-13_stage6-ux-blueprint-full.md
│       └── tasks/
│           └── STAGE_6_STRAT_BRIEF.md
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
│   │   ├── admin/
│   │   │   ├── __tests__/
│   │   │   │   ├── RequestCard.test.tsx
│   │   │   │   ├── RequestDetail.test.tsx
│   │   │   │   ├── RequestImageViewer.test.tsx
│   │   │   │   ├── RequestList.test.tsx
│   │   │   │   ├── RequestListSkeleton.test.tsx
│   │   │   │   └── RequestStatusForm.test.tsx
│   │   │   ├── config/
│   │   │   │   └── index.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── ui/
│   │   │       ├── EmptyState.tsx
│   │   │       ├── index.ts
│   │   │       ├── RequestCard.tsx
│   │   │       ├── RequestDetail.tsx
│   │   │       ├── RequestDetailSkeleton.tsx
│   │   │       ├── RequestImageCard.tsx
│   │   │       ├── RequestImageGroup.tsx
│   │   │       ├── RequestImageViewer.tsx
│   │   │       ├── RequestList.tsx
│   │   │       ├── RequestListSkeleton.tsx
│   │   │       └── RequestStatusForm.tsx
│   │   └── request/
│   │       ├── __tests__/
│   │       │   ├── FileUploadInput.test.tsx
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
│   │   ├── authLog.ts
│   │   ├── db.ts
│   │   ├── index.ts
│   │   ├── requests.ts
│   │   ├── storage.ts
│   │   ├── supabase.ts
│   │   ├── supabaseAuth.ts
│   │   └── __tests__/
│   │       ├── auth.test.ts
│   │       ├── authLog.test.ts
│   │       ├── db.test.ts
│   │       ├── requests.test.ts
│   │       ├── storage.test.ts
│   │       └── supabaseAuth.test.ts
│   ├── shared/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── i18n/
│   │   │   ├── config.ts
│   │   │   ├── index.ts
│   │   │   ├── localePath.ts
│   │   │   ├── navigation.ts
│   │   │   ├── request.ts
│   │   │   ├── routing.ts
│   │   │   ├── __tests__/
│   │   │   │   └── localePath.test.ts
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
│   │       ├── uuid.ts
│   │       ├── validation.ts
│   │       └── __tests__/
│   │           └── uuid.test.ts
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
        ├── 20260629154719_domain_foundation.sql
        ├── 20260702114509_update_request_status_values.sql
        └── 20260705155244_harden_create_request_search_path.sql
```
