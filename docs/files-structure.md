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
├── pnpm-workspace.yaml
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
│       └── page.tsx
├── docs/
│   ├── ARCHITECTURE.md
│   ├── files-structure.md
│   ├── FRONTEND_ARCHITECTURE.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── MVP_SCOPE.md
│   └── TESTING_STRATEGY.md
├── scripts/
│   └── update-structure.mjs
└── src/
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
    │   │   ├── request.ts
    │   │   ├── routing.ts
    │   │   └── messages/
    │   │       └── en.json
    │   ├── styles/
    │   │   └── index.ts
    │   ├── test/
    │   │   ├── index.ts
    │   │   └── setup.ts
    │   ├── ui/
    │   │   └── index.ts
    │   └── utils/
    │       ├── cn.ts
    │       ├── index.ts
    │       └── validation.ts
    └── types/
        └── index.ts
```
