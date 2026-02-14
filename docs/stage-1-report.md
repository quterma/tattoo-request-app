Вот краткий и структурированный отчёт для report-1.md.

Stage 1 — UI Shell & Layout Foundation
Цель Stage 1

Построить мобильный UI-каркас приложения без бизнес-логики:

Layout структура

Навигационный shell

Типографический baseline

Shared layout primitives

Mobile-first и RTL-ready фундамент

1. Visual Baseline (Light-only)

Добавлено:

tokens.css — базовые CSS-переменные:

--color-bg

--color-text-primary

--color-text-secondary

--color-border

--color-link

--color-focus

--nav-height

Глобальная типографическая шкала (h1–h4, body, small, muted)

Глобальный :focus-visible

Удалён dark-mode scaffolding

Решения:

Stage 1 — только light theme

Один источник истины для цветов (tokens.css)

Без theme provider

2. Mobile-first + RTL-ready фундамент

Зафиксировано в документации:

Mobile-first, desktop secondary

RTL-ready с Stage 1

dir управляется на уровне locale layout

избегаем left/right CSS

используем логические свойства

Результат:

Layout примитивы не привязаны к LTR

Desktop — enhancement, не основная цель

3. Shared Layout Primitives

Добавлены в src/shared/ui:

Container

Page

Section

Stack

Характеристики:

Mobile-first

Без бизнес-логики

Без межслойных импортов

Консистентный cn() паттерн

4. Route Groups и Shell

Введены route groups:

(public)

(admin)

Public Shell:

Отдельный layout.tsx

Использует layout primitives

Содержит AppNav

Admin:

Stub-страница

Без публичной навигации

Отдельный UX-контур (layout можно добавить позже)

5. AppNav (Single Responsive Component)

Один компонент:

Mobile: fixed bottom

Desktop: sticky top

Safe-area поддержка

Высота синхронизирована через --nav-height

Навигация:

Home

Request

Rules

Location

Active state:

exact match для /

startsWith для остальных

aria-current="page"

i18n:

EN labels добавлены

Locale-aware routing через shared i18n layer

Без language switcher

6. Архитектурная консистентность

Импорт-политика не нарушена

Нет deep imports между слоями

Нет преждевременных абстракций

Нет feature-логики

Нет Supabase

Нет admin UI

Итог Stage 1

Stage 1 завершён.

Сформирован стабильный:

UI shell

Layout фундамент

Mobile-first структура

RTL-ready архитектура

Готово к переходу к Stage 2 (Public content / Request flow).
