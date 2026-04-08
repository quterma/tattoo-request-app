# Project File Structure

```
tattoo-request-app/
├── .editorconfig
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
│   ├── CLAUDE.md
│   └── settings.local.json
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── [locale]/
│       ├── layout.tsx
│       ├── (admin)/
│       │   └── admin/
│       │       └── page.tsx
│       └── (public)/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── aftercare/
│           │   └── page.tsx
│           ├── location/
│           │   └── page.tsx
│           ├── policies/
│           │   └── page.tsx
│           └── request/
│               └── page.tsx
├── docs/
│   ├── framework/
│   │   ├── AI_DEVELOPMENT_RULES.md
│   │   ├── AI_DEVELOPMENT_WORKFLOW.md
│   │   ├── AI_FRAMEWORK_IDEAS.md
│   │   ├── AI_PROJECT_BOOTSTRAP.md
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
│       ├── PROJECT_STAGE_LOG.md
│       ├── PROJECT_STRUCTURE.md
│       └── PROJECT_TESTING_STRATEGY.md
├── scripts/
│   └── update-structure.mjs
└── src/
    ├── bff/
    │   └── index.ts
    ├── config/
    │   └── index.ts
    ├── features/
    │   └── index.ts
    ├── services/
    │   └── index.ts
    ├── shared/
    │   ├── index.ts
    │   ├── hooks/
    │   │   └── index.ts
    │   ├── i18n/
    │   │   ├── config.ts
    │   │   ├── index.ts
    │   │   ├── navigation.ts
    │   │   ├── request.ts
    │   │   ├── routing.ts
    │   │   └── messages/
    │   │       └── en.json
    │   ├── styles/
    │   │   ├── index.ts
    │   │   └── tokens.css
    │   ├── test/
    │   │   ├── index.ts
    │   │   └── setup.ts
    │   ├── ui/
    │   │   ├── app-nav.tsx
    │   │   ├── container.tsx
    │   │   ├── icons.tsx
    │   │   ├── index.ts
    │   │   ├── page.tsx
    │   │   ├── public-footer.tsx
    │   │   ├── section.tsx
    │   │   └── stack.tsx
    │   └── utils/
    │       ├── cn.ts
    │       ├── index.ts
    │       └── validation.ts
    └── types/
        ├── css.d.ts
        └── index.ts
```
