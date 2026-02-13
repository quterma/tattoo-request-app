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
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── (admin)/
│       │   └── admin/
│       │       └── page.tsx
│       └── (public)/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── location/
│           │   └── page.tsx
│           ├── request/
│           │   └── page.tsx
│           └── rules/
│               └── page.tsx
├── docs/
│   ├── ARCHITECTURE.md
│   ├── files-structure.md
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── MVP_SCOPE.md
│   ├── stage-0-report.md
│   └── TESTING_STRATEGY.md
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
    │   │   ├── index.ts
    │   │   ├── page.tsx
    │   │   ├── section.tsx
    │   │   └── stack.tsx
    │   └── utils/
    │       ├── cn.ts
    │       ├── index.ts
    │       └── validation.ts
    └── types/
        └── index.ts
```
