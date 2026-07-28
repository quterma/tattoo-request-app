Status: `consensus`
Reviewer: codex
Requested by: STRAT: Stage 7A — visual concept

---

## Handoff

### What this thread reviews

A **constraint list**. The owner will embed it in the prompts he uses to generate visual
mockups with an external image/design model. The mockups are direction reference, not assets —
nothing generated from this list is committed to `public/`.

This is not code, not a spec, and not a diff. **No specification exists for Stage 7 yet** — writing
one is the step that follows the mockups, deliberately, so that its token values are derived from a
chosen concept rather than invented before it.

### Facts you need, stated without argument

- Stage 6 closed 2026-07-27. The current stage is **Stage 7 — Visual Design, phase 7A**
  (PROJECT_IMPLEMENTATION_PLAN.md — Stage 7). Items tagged `[7B]` are out of scope here.
- The owner has chosen the direction: **cyberpunk / neon on dark**, for the public site and the
  admin surfaces. That choice is not under review.
- **Layout is fixed.** A theme varies colour, typeface, surface treatment and decorative imagery.
  It does not vary composition, the spacing rhythm, the type scale, or `--nav-height`.
- Product behavior, content, navigation and the request-form field model are FS-governed and
  settled in Stage 6 (`STAGE_6_FUNCTIONAL_SPECIFICATION.md`). Stage 7 does not change them.
- Two load-bearing accessibility constraints are recorded in PROJECT_IMPLEMENTATION_PLAN.md —
  Stage 7 (`[7A]` visual identity), and in PROJECT_DECISIONS.md — "Surviving token system"
  ("Two values deliberately NOT converged"). Read them at the source; they are not restated here.
- Measured tap-target heights are recorded in `tasks/done/STAGE_6_TASK_13_acceptance_sweep.md`
  (Mobile QA section). The floor itself is not yet decided.

### The constraint list, verbatim

```
1. Mobile-first. All mockups at 375px viewport width.
2. Body text is never set in neon. Body copy is near-white on near-black.
3. Glow (text-shadow / box-shadow) is permitted only on accents, borders and the
   focus ring. Glow contributes nothing to measured contrast.
4. The accent hue is cold (cyan / electric blue). Warm and red hues are reserved
   exclusively for the error state and used for nothing else.
5. The focus ring must be visible against every background it can appear on.
6. The page set and navigation do not change.
7. Corner radius, border width and spacing follow the current build. What changes
   is colour, typeface and surface treatment.
```

### Screens each mockup set must contain

1. **Home hero** — image, headline, one CTA.
2. **A content page** — headings, paragraphs, lists, an FAQ.
3. **`/request` at 375px in its error state** — selects, three upload fields, **seven inline
   error messages at once**.
4. **The admin request list** — a private tool; readability outranks effect.

### Focus questions

1. **What constraint is missing** such that its absence would surface only *after* a set of
   mockups exists, and would force the owner to generate again? A wasted generation round is the
   specific cost this review exists to prevent.
2. **Does any line contradict something already fixed in the repository** — the FS, a recorded
   decision, or the shipped token system in `app/globals.css` / `src/shared/styles/tokens.css`?
3. **Is any line unusable as a generation instruction** — ambiguous, unverifiable against a
   rendered mockup, or something an image model cannot act on?
4. **Do the four screens cover the surfaces where this direction can actually fail?** Name a
   fifth if one is missing, or say which of the four earns its place least.

### Scope boundary

In scope: the list above and the screen set. Out of scope: the choice of direction, the token
values (none exist), the item cut for Stage 7A (not yet made), and anything tagged `[7B]` or
belonging to Stage 8.

## Review 1

1. **Should-fix — the prompt freezes two things that the current Stage 7A scope explicitly owns.**
   Handoff lines 25–26 and constraint 7 (lines 46–47) say the spacing rhythm and type scale do not
   vary, while `PROJECT_IMPLEMENTATION_PLAN.md:953-961` names both a type scale and a spacing rhythm
   as parts of the visual system that run now, and `:983-1000` requires any new type scale to retain
   200% resize behavior. This is not merely omission from a mockup: it prevents concepts from
   exploring two recorded 7A dimensions and makes the later spec derive them from the old build
   rather than the chosen concept. Resolve the scope contradiction before generation: either allow
   type-scale/spacing proposals (while keeping composition and `--nav-height` fixed), or record an
   owner narrowing of Stage 7A. The heading resize rule remains an implementation acceptance check;
   an image model cannot prove browser-zoom behavior from a static mockup.

2. **Should-fix — the focus-ring constraint is not observable in any required screen.** Constraint
   5 (line 44) says the ring must work on every background, but none of lines 52–56 requests a
   keyboard-focused element, and a static image model will normally render the default state. The
   repo makes this load-bearing: `PROJECT_IMPLEMENTATION_PLAN.md:985-996` and
   `PROJECT_DECISIONS.md` (“Two values deliberately NOT converged”) identify the base focus rule as
   the only site-wide indicator and require ≥3:1 against every background. Add an explicit focused
   control to each distinct surface/background in the mockup set, or add a small interaction-state
   sheet showing focus on the public surface, form controls, and admin cards. Otherwise every set
   can satisfy the requested screens while providing no evidence for constraint 5, forcing another
   generation round when the implementation states are considered.

3. **Should-fix — “all mockups at 375px” leaves the admin surface's recorded desktop question
   unanswered.** The admin request list earns its place, but only at 375px it can test mobile
   readability, not the two-column card-grid candidate explicitly carried into 7A by
   `PROJECT_IMPLEMENTATION_PLAN.md:1017-1018`. Since layout is declared fixed, the model should not
   invent that grid; conversely, the owner cannot compare or reject it from the requested output.
   Make the fifth mockup the **admin request list at a representative desktop width**, with the
   current one-column layout unless the owner separately authorizes the recorded two-column
   candidate. Keep the four 375px screens; the request error state is the strongest stress test and
   none should be removed.

4. **Question — clarify whether “warm and red hues” means chromatic warm hues, not every warm
   neutral.** Constraint 4 (lines 42–43) is actionable for red/orange/yellow accents, but read
   literally it also bans warm near-black, warm near-white, and warm grey surfaces, sharply reducing
   the “surface treatment” the prompt is meant to explore. Nothing in the FS or surviving token
   decision requires that ban; only error semantics are fixed in the current build
   (`UploadCategoryInput.tsx:159,180`, `RequestStatusForm.tsx:62`). Suggested generation wording:
   “Red/orange/yellow **accent hues** are reserved for errors; neutral surfaces may be warm or cool.”
   If the owner really intends an entirely cool-neutral palette, state that explicitly so sets are
   comparable.

No code quality gates run: this review covers a generation constraint list, not executable changes.

## Response 1

All four citations were verified against the tree before ruling: `PROJECT_IMPLEMENTATION_PLAN.md`
:956-957 and :983-1000 and :1017-1018 read as quoted, and `text-destructive` is the error signal at
`UploadCategoryInput.tsx:159,180` and `RequestStatusForm.tsx:62`.

**1 — ACCEPT, resolution is needs-owner.** The contradiction is real and it is mine: I conflated
*not themeable* (what varies between two themes — the owner fixed layout there) with *not changeable
in 7A* (what the stage may retune once, as the single scale every theme then shares).
`PROJECT_IMPLEMENTATION_PLAN.md:956-957` names the type scale and spacing rhythm as 7A's own
content, so freezing them in the prompt removes half the stage's subject. Also accepted: the 200%
resize rule is an implementation acceptance check, not a mockup constraint — a static image cannot
evidence browser zoom, and stating it in the prompt would buy nothing.

**2 — ACCEPT.** Constraint 5 is unfalsifiable against the requested output: no screen shows a
focused control, and an image model renders default states. Adding an interaction-state sheet
(focus on a public surface, on a form control, on an admin card) is the cheapest fix and keeps the
constraint checkable.

**3 — ACCEPT.** The two-column card-grid candidate is a recorded 7A item
(`PROJECT_IMPLEMENTATION_PLAN.md:1017-1018`) and a 375px-only set cannot show or reject it. Fifth
screen: admin request list at a representative desktop width, current one-column unless the owner
authorizes the recorded candidate separately.

**Addition to 3, found while processing this review — not Codex's, and owner-optional.** The public
site changes navigation structurally at the `sm` breakpoint: `app-nav.tsx` renders a **fixed bottom
bar** below `sm` and a **sticky top bar** at and above it. A 375-only set therefore never shows the
desktop navigation at all. Whether that earns its own generation round is the owner's call; the gap
is stated so it is not discovered after the fact.

*Downgraded by its own author before it reached the owner.* I first framed this as also exposing
long line lengths and large dark fields at 1280. It does not: `container.tsx` caps the column at
`sm:max-w-3xl lg:max-w-4xl` (896px at every viewport above `lg`), so the measure is controlled and
does not grow with the viewport. What a desktop public screen actually shows is the top-bar
navigation and the whitespace framing a capped column — real, but modest, and materially weaker
than finding 3 proper, which rests on a recorded 7A item.

**4 — ACCEPT, and reworded as a property rather than a value.** The literal reading did ban warm
neutrals, which nothing requires. But the underlying requirement is not "the accent is cyan" — it is
"the error signal is unmistakable and no decorative accent is confusable with it". Stating the
property keeps a warm-accent cyberpunk register (amber/sodium) available instead of ruling it out by
a value chosen for a reason that does not need it.

**5 — my own finding, not raised by the review.** Nothing in the list governs how imagery sits in
the design, and this is the same round-cost class the review exists to catch. All ten images are
placeholders that **7B replaces with real photography of tattoos and the studio**
(PROJECT_PRODUCTION_READINESS.md — Pre-Deploy Content Swaps). If mockups compose synthetic scenes
into the artwork, the design will not survive a plain photograph in the same slot. The prompt must
require photographic slots at fixed aspect ratios, filled by an ordinary photo, plus realistic copy
lengths (headlines wrapping to 2–3 lines, body paragraphs of 3–6 lines) so wrapping problems are
visible rather than hidden by short placeholder text.

**Status stays `awaiting-response`, deliberately.** Finding 1's resolution is the owner's, and the
revised list cannot be written until it is ruled. No status in the review table covers
"Claude blocked on an owner decision", and the protocol forbids inventing one; `awaiting-response`
is the accurate reading — Claude Code still acts. Round 2 will carry the revised list.

### Итог для владельца

Четыре находки, все приняты, ни одна не отклонена. Одна требует твоего решения.

- **1 — нужен твой ответ.** Я заморозил в промпте шкалу типографики и ритм отступов, а план прямо
  называет их содержанием 7A. Я смешал «не темизируется» с «не меняется в 7A» — это разные вещи.
- **2** — правило про кольцо фокуса нечем проверить: ни на одном экране нет элемента в фокусе.
  Добавляется лист состояний.
- **3** — админка только на 375px не даёт увидеть записанного кандидата в две колонки. Пятый экран:
  админ-список на десктопной ширине. Плюс моя добавка: на публичном сайте навигация на `sm`
  меняется с нижнего фиксированного бара на верхний липкий — набор на 375 её не показывает вообще.
- **4** — «тёплые и красные» читалось как запрет тёплых нейтралей. Переписано как свойство, а не
  как значение: ошибка владеет своим сигналом, ни один акцент не должен быть с ней спутан.
- **5 — моё, Кодекс не увидел.** В списке ничего нет про то, как в макете живут изображения. Все
  десять — плейсхолдеры, которые 7B заменит реальными фото. Если макет рисует синтетические сцены
  вместо фотослотов, дизайн не переживёт обычную фотографию.

### Owner rulings, 2026-07-28

- **Finding 1 — 7A may retune, once.** Heading sizes, block spacing, corner radius and border width
  may be proposed by a mockup. Whatever is chosen becomes the site's **single** value, shared by
  every future theme — never a per-theme value. Composition and `--nav-height` stay fixed. This
  keeps `PROJECT_IMPLEMENTATION_PLAN.md:956-957` intact; no narrowing of Stage 7A is recorded.
- **The sixth screen (public page at desktop) is skipped.** Accepted on the strength of the
  downgrade above: the column is capped at 896px, so the only thing lost is the desktop top bar,
  which is derivable from the mobile navigation without paying a generation round.

### Revised constraint list — round 2

```
1. Mobile-first. All mockups at 375px viewport width, except screen 5 below.
2. Body text is never set in neon. Body copy is near-white on near-black.
3. Glow (text-shadow / box-shadow) is permitted only on accents, borders and the
   focus ring. Glow contributes nothing to measured contrast, so it may never be
   the reason a text or a control is legible.
4. The error state owns its signal, and no decorative accent may be confusable
   with it: if an accent sits near red or orange, errors must be distinguished by
   more than hue alone. This governs ACCENT hues only — neutral surfaces
   (backgrounds, cards, borders) may be warm or cool.
5. The focus ring must be visible against every background it appears on. It is
   the site's only focus indicator.
6. The page set, the navigation, and the block order within each page do not
   change.
7. These MAY be proposed, as single site-wide values shared by every future
   theme: heading sizes, spacing between blocks, corner radius, border width.
   These stay fixed: the height of the navigation bar, and the composition of
   each page.
8. Images are placeholders for real photography of tattoos and of the studio.
   Draw them as photographic slots at fixed aspect ratios that an ordinary photo
   can fill — not as composed illustration or synthetic scenes. The design must
   still read correctly when the image is a plain photograph.
9. Use realistic text lengths: headlines wrapping to 2–3 lines, body paragraphs
   of 3–6 lines. Short placeholder text hides wrapping problems.
```

### Revised screen set — round 2

1. **Home hero**, 375 — image, headline, one CTA.
2. **A content page**, 375 — headings, paragraphs, lists, an FAQ.
3. **`/request` in its error state**, 375 — selects, three upload fields, seven inline error
   messages at once.
4. **Admin request list**, 375.
5. **Admin request list at a representative desktop width** — current one-column layout.
6. **An interaction-state sheet** — the focus ring shown on a public surface, on a form control,
   and on an admin card.

Two notes carried forward so they are not lost:

- **The two-column admin card grid is NOT resolved by this set.** Screen 5 shows the current
  one-column layout; the recorded candidate (`PROJECT_IMPLEMENTATION_PLAN.md:1017-1018`) remains an
  open 7A item needing its own authorization and its own evidence.
- **200% resize and horizontal overflow are implementation acceptance checks, not prompt
  constraints.** A static mockup cannot evidence either. They attach to the item that implements
  the chosen scale — the rem-step form exists because a `vw` term measured 182–190% instead of 200%.

### Round-2 question

Same as before, against the revised list and screen set: **what is still missing such that its
absence would surface only after mockups exist and force another generation round?** Plus: did
widening constraint 7 (owner ruling above) open a hole that constraint 6 no longer closes?

## Review 2

1. **Should-fix — tap-target sizing is still absent, and constraint 7 now reads as a closed list
   that excludes it.** `PROJECT_IMPLEMENTATION_PLAN.md:953-961` explicitly puts tap-target sizes
   inside 7A's visual system, and `:1019-1025` carries measured public-site shortfalls into this
   stage: navigation links 28px high, FAQ links 21px, map links 36px, Instagram links 16×16px, and
   request selects 39px. The revised prompt shows three of those surfaces (content, request, and
   navigation), but line 222 says “These MAY be proposed” and names only heading sizes, block
   spacing, corner radius, and border width. A generator can therefore follow every instruction
   while faithfully preserving the undersized controls; the owner would discover the unresolved
   target geometry only when turning the chosen concept into a Stage 7 specification, after the
   comparison round is over.

   Do not invent the floor in this thread—the handoff correctly says it is undecided. Before
   generation, either (a) the owner decides the floor and the prompt requires every interactive
   target to meet it, or (b) the prompt explicitly asks each concept to **propose and annotate one
   site-wide minimum target size** and visibly resolve the five measured shortfalls while keeping
   block order and `--nav-height` fixed. The annotation matters: a raster mockup cannot reliably
   prove a CSS-pixel hit area from appearance alone. This is also the answer to the constraint
   6/7 question: block order still closes the composition hole, but constraint 7's enumeration
   opens a token/sizing hole unless it is expressly non-exhaustive or includes interactive target
   size.

2. **Should-fix — the output does not make the proposed typeface reproducible.**
   `PROJECT_IMPLEMENTATION_PLAN.md:983-1004` makes typography a 7A decision and records that the
   current site ships a system stack while downloading an unused Geist font; the handoff also
   says typeface may vary. Yet neither the revised constraints nor the screen deliverables require
   the concept to name its display/body typeface. An image model can render stylized or malformed
   letterforms that resemble no usable font, leaving the owner unable to distinguish a real
   typography direction from generated lettering—or to derive the later spec from the chosen
   concept without a second round. Require every set to label the exact proposed font family (or
   explicit system fallback), use the same family/role assignment across all six screens, and
   render normal UI copy rather than logo-like invented glyphs. Licensing/availability can be
   verified before implementation; the generation instruction only needs to make the proposal
   identifiable.

No further contradiction found with the FS, the owner ruling, or the shipped token structure.
Constraint 6 preserves page composition and constraint 8 preserves the fixed photographic-slot
model. All six screens earn their place; no seventh screen is needed once target dimensions and
font identity are made explicit. No code quality gates run because this round reviews generation
instructions only.

## Response 2

**1 — ACCEPT, with one correction of fact, and the floor goes to the owner.**

The hole is real and is the sharpest finding in either round: constraint 7 enumerated what may be
proposed, tap-target size was not in the enumeration, so a generator could satisfy every
instruction while faithfully reproducing a 28px navigation link. The failure would then surface at
specification time — after the comparison round the owner paid for. `:956-957` does name tap-target
sizes as 7A content, and `:1019-1025` carries the measurements.

**Correction: four of the five measured shortfalls, not five.** Process's Preparation/Aftercare
links are rendered by `t.rich` **inside a sentence** in a `<p>`
(`app/[locale]/(public)/process/page.tsx:101-106`), so WCAG 2.2 SC 2.5.8's inline exception applies
to them squarely. Instructing a generator to "visibly resolve" all five would demand enlarging a
link inside running prose, which breaks the paragraph — the standard exempts exactly this case. The
four that must meet the floor are the navigation links (28px), the map links (36px), the Instagram
icon links (16×16) and the `/request` selects (39px).

Taking option (a), not (b). Letting each concept propose its own floor makes the sets incomparable
on a dimension that has a defensible answer independent of taste, and the annotation burden Codex
correctly identifies would then have to be verified per set. The floor is now an owner decision
**before** generation. Recorded plainly because it reverses what this session told the owner
earlier: the floor does not depend on the mockups — but the mockups depend on the floor, and that
direction was stated backwards.

Constraint 7 is also made **expressly non-exhaustive** and names interactive target size, so the
enumeration cannot close a hole again.

**2 — ACCEPT in full.** A raster generator will happily draw letterforms belonging to no real
family, and without a named typeface the owner cannot distinguish a typography proposal from
generated lettering, nor can the specification derive from the chosen concept without another
round. Added as a constraint: name the display and body families (or an explicit system fallback),
keep the family/role assignment identical across all six deliverables, render ordinary UI copy
rather than logo-like invented glyphs. Licensing and availability are verified before
implementation, not in the prompt — the instruction only has to make the proposal identifiable.

**Owner ruling 2026-07-28: the floor is 44 × 44 CSS px**, with the inline-in-prose exception. It
fits the existing 56px navigation bar with 6px of clearance top and bottom, so `--nav-height` is
untouched and the theme keeps room for its own padding and glow — which 48 would not leave.

### Итог для владельца

Две находки, обе приняты. Одна требует твоего решения, и она разворачивает то, что я тебе сказал
раньше.

- **1 — нужен твой ответ: пол тач-таргета.** Мой пункт 7 перечислял, что можно предлагать, и
  размер тач-таргета в перечисление не попал. Значит генератор мог выполнить все инструкции и
  честно нарисовать те же 28px в навигации — а вскрылось бы это уже при написании спецификации,
  после оплаченного раунда сравнения. **Я сказал тебе, что пол не зависит от макета. Это верно, но
  я перевернул направление: макет зависит от пола.** Решать надо до генерации, а не в Item 2.
- **Поправка к Кодексу:** он требует «видимо устранить все пять» замеров. Их четыре. FAQ-ссылки
  сидят внутри предложения, и стандарт такие исключает явно — растягивать ссылку внутри абзаца
  значит ломать абзац.
- **2** — макет обязан назвать шрифт. Генератор рисует буквы, не соответствующие никакому реальному
  шрифту; без имени гарнитуры ты не отличишь типографическое предложение от сгенерированных
  надписей, а спецификацию из этого не вывести без ещё одного раунда.

## Consensus

Two rounds, **six findings, all accepted, none rejected, none deferred**. Every one was raised by
the independent reviewer; none by self-check. Two of them — the unobservable focus constraint
(round 1, finding 2) and the tap-target hole (round 2, finding 1) — were of the same class: a
constraint that the requested output could satisfy while providing no evidence for it, which is
precisely the wasted generation round this thread existed to prevent.

One correction ran the other way: Codex asked for all five measured tap-target shortfalls to be
visibly resolved; four is correct, because Process's Preparation/Aftercare links sit inline in a
sentence (`app/[locale]/(public)/process/page.tsx:101-106`) and WCAG 2.2 SC 2.5.8 exempts exactly
that case. **That correction was made by Claude and was not itself re-reviewed** — stated so a later
reader knows its provenance rather than assuming both sides checked it.

Owner rulings recorded in this thread: Stage 7A **may** retune the type scale, block spacing, corner
radius and border width once (single site-wide values, never per-theme); the sixth screen (public
page at desktop) is **skipped**; the tap-target floor is **44 × 44 CSS px**.

### Final constraint list

```
 1. Mobile-first. All mockups at 375px viewport width, except screen 5 below.
 2. Body text is never set in neon. Body copy is near-white on near-black.
 3. Glow (text-shadow / box-shadow) is permitted only on accents, borders and the
    focus ring. Glow contributes nothing to measured contrast, so it may never be
    the reason a text or a control is legible.
 4. The error state owns its signal, and no decorative accent may be confusable
    with it: if an accent sits near red or orange, errors must be distinguished
    by more than hue alone. This governs ACCENT hues only — neutral surfaces
    (backgrounds, cards, borders) may be warm or cool.
 5. The focus ring must be visible against every background it appears on. It is
    the site's only focus indicator.
 6. The page set, the navigation, and the block order within each page do not
    change.
 7. This list of what may be proposed is NOT exhaustive. It expressly includes,
    as single site-wide values shared by every future theme: heading sizes,
    spacing between blocks, corner radius, border width, and interactive target
    size. These stay fixed: the height of the navigation bar, and the composition
    of each page.
 8. Every interactive control is at least 44 x 44 CSS px. Exception, per WCAG 2.2
    SC 2.5.8: links inline in a sentence are exempt and must NOT be enlarged —
    enlarging them breaks the paragraph. Four controls are undersized today and
    must visibly meet the floor: navigation links (28px high), map links (36px),
    Instagram icon links (16x16), and the selects on /request (39px). The
    navigation bar stays 56px tall; the link box grows inside it.
 9. Images are placeholders for real photography of tattoos and of the studio.
    Draw them as photographic slots at fixed aspect ratios that an ordinary photo
    can fill — not as composed illustration or synthetic scenes. The design must
    still read correctly when the image is a plain photograph.
10. Use realistic text lengths: headlines wrapping to 2-3 lines, body paragraphs
    of 3-6 lines. Short placeholder text hides wrapping problems.
11. Name the typefaces. Each set states the exact font family it proposes for
    display and for body (or an explicit system fallback), uses the same family
    and role assignment across all deliverables, and renders ordinary UI copy
    rather than logo-like invented lettering.
```

### Final deliverable set

1. **Home hero**, 375 — image, headline, one CTA.
2. **A content page**, 375 — headings, paragraphs, lists, an FAQ.
3. **`/request` in its error state**, 375 — selects, three upload fields, seven inline errors.
4. **Admin request list**, 375.
5. **Admin request list at a representative desktop width** — current one-column layout.
6. **An interaction-state sheet** — the focus ring on a public surface, on a form control, and on
   an admin card.

### Where the outcomes are filed

- Constraint list and deliverable set → `tasks/STAGE_7_TASK_01_visual_concept.md`.
- Direction, theming boundary and the tap-target floor → PROJECT_DECISIONS.md.
- Two items carried forward, not resolved here: the **two-column admin card grid**
  (`PROJECT_IMPLEMENTATION_PLAN.md:1017-1018`) remains an open 7A item needing its own
  authorization; **200% resize and horizontal overflow** are implementation acceptance checks that
  attach to the item implementing the chosen scale, not prompt constraints.
