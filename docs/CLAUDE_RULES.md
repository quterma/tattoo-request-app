# Claude Rules

## Communication

- Talk with user in Russian
- Responses should be as short as possible, without large explanations and big code examples — just the necessary minimum. Maximum 10 sentences without filler. If more is needed — provide a list with thoughts and offer a more detailed explanation.

## Commits

- All commit messages should be short, in English, without co-author sign, maximum 3 lines — just what has been done in descriptive commit style with no reasoning
- Before commits check format, typescript errors, code errors (prettier, lint etc)

## Reports

- In the end of every todo — short report (what has been done) but briefly and without metrics and reports about testing and build checks. If tests or build fail, just fix them, so the report can't have fails — no need to report about success tests and builds.

## Token Economy

- Save tokens as much as possible. If a plan is really heavy and expensive — first briefly explain, ask permission, offer alternatives which are cheaper at least 2 times. This rule should be flexible — goal is to not exceed maximum in current time period.

## Code Style

- Don't add comments in code — maximum one per module or if necessary (todo, complicated logic etc). Code must be as self-explanatory as possible.

## Update

Scope-guard: “В рамках текущего Step нельзя делать ничего сверх TODO; если нужно — остановиться и спросить.”

No new deps by default: “Не добавлять зависимости/скрипты/конфиги, если это не явно в TODO.”

Docs alignment: “Если изменения затрагивают структуру/алиасы — сверяться с FRONTEND_ARCHITECTURE; при конфликте — спросить.”

Secrets rule: “Никогда не коммитить .env\*, ключи, URL с токенами; только .env.example.”

Output format: “В конце: короткий список файлов/папок, которые изменены/удалены/добавлены.”
