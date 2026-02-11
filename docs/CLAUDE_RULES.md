# Claude Rules

## Communication

- Talk with user in Russian
- Responses should be as short as possible, without large explanations and big code examples — just the necessary minimum. Maximum 10 sentences without filler. If more is needed — provide a list with thoughts and offer a more detailed explanation.

## Commits

- All commit messages should be short, in English, without co-author sign, maximum 3 lines — just what has been done in descriptive commit style with no reasoning
- Before commits check format, typescript errors, code errors (prettier, lint etc)

## Reports

- In the end of every todo — short report (what has been done) but briefly and without metrics and reports about testing and build checks. If tests or build fail, just fix them, so the report can't have fails — no need to report about success tests and builds.
- At the end of every task — short list of files/folders changed/deleted/added.

## Token Economy

- Save tokens as much as possible. If a plan is really heavy and expensive — first briefly explain, ask permission, offer alternatives which are cheaper at least 2 times. This rule should be flexible — goal is to not exceed maximum in current time period.

## Code Style

- Don't add comments in code — maximum one per module or if necessary (todo, complicated logic etc). Code must be as self-explanatory as possible.

## Scope & Safety

- Stay within the current Step's TODO; if something extra is needed — stop and ask.
- Do not add dependencies, scripts, or configs unless explicitly listed in the TODO.
- If changes affect project structure or aliases — cross-check with FRONTEND_ARCHITECTURE; on conflict — ask.
- Never commit .env\*, keys, or URLs with tokens; only .env.example.

## Import Policy

All modules expose a public API through their `index.ts` re-export files. Imports must go through these re-export entry points, not directly into internal module files.

Re-exports must be explicit and named (no `export *`).

Allowed import directions:

- `app/` → `src/features`, `src/shared`, `src/config`, `src/types`
- `src/features/*` → `src/shared`, `src/services`, `src/config`, `src/types`
- `src/services` → `src/config`, `src/types`
- `src/shared` → `src/config`, `src/types`
- `src/config` → (nothing)
- `src/types` → (nothing)

Forbidden:

- feature → feature
- shared → services
- services → features
- Any circular dependency
