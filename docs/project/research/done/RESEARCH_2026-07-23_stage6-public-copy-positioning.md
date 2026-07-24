# Research: Stage 6 public copy — positioning, Good Fit, pricing framing, request-form intro

Status: `closed` · outcome filed 2026-07-23 (see `## Outcome`)
Researcher: codex
Requested by: `STRAT: Stage 6 — content` (2026-07-23)

## Question

Items 5 (Home) and 6 (Process content rewrite) are the last two Stage 6 items, and both are
**content-blocked**. All Stage 6 code is shipped. The owner has now supplied the **facts** (rates,
direction, sketch policy — below) and explicitly asked that the **wording** be produced from
evidence rather than invented: *"я специально попросил сделать обширный внешний ресёрч, отобрать
сайты, изучить маркетинг, воронки, фразы, чтобы не мне это придумывать."*

An earlier content brief existed only as a chat artifact — **it is not in the repo and no
marketing/competitor research thread exists** (`research/done/` holds only framework + Item 10
threads). So this thread creates that missing evidence base.

**A research thread never decides** (AI_CROSS_REVIEW.md). Produce evidence + options with
trade-offs, provenance-labelled (repo-verified / model-knowledge / external-AI-unverified). The
owner (with Claude drafting) writes the final copy.

### The artist — facts to build on (owner-supplied 2026-07-23, treat as fixed)

- **Work:** medium-to-large pieces, in her own style and technique. Style is **inspired by Chinese
  and Japanese painting and calligraphy**. 20+ years in painting, calligraphy and tattoo art
  (already in `en.json`).
- **Not a fit:** fine lines, lettering (dislikes), copying other artists' work, small/quick pieces.
- **Audience:** people who want *her* art and artistic vision — not a technician executing their file.
- **One-liner (owner's own draft, RU):** "Авторские татуировки на стыке японской живописи и
  современного искусства — Тель-Авив." Needs an English rendering that does not sound like a
  translation.
- **Pricing:** ₪1,000/hour, minimum ₪2,000. Deposit ₪1,000 (existing terms stay). **Remove** the
  separate cover-up rate and the ribs/neck/knee surcharge language — instead state simply that
  placement and complexity affect the **time**, and therefore the total. Price teaser should imply
  a floor around **₪2,000**.
- **Sketch policy (rewritten by owner):** do **not** state how long the drawing takes. The sketch is
  **sent the day before the session**. Small adjustments are made on the day of the tattoo. If the
  client rejects the concept entirely and wants a new one: the ₪1,000 already paid is retained as
  payment for the work done, a **new ₪1,000 deposit** is required, and a new sketch is made. The
  underlying message the owner wants conveyed: **trust your artist** — clients who trust get great
  results with minor tweaks; clients who micro-manage usually waste everyone's time.
- **Age:** "18+; 16–17 with parental consent." Owner believes this is right — sanity-check it if
  there is anything obviously off for Israel.
- **Instagram:** `@mashakarda_tattoo` (already in `en.json`).
- **FAQ:** keep the existing entries for now; **add anything clearly missing** that the research
  shows top artist sites answer. The owner will review the result.

### What a usable answer must cover

**Q1 — What do strong tattoo-artist sites actually do?** Look at real, current sites of artists in a
comparable position (custom, style-driven, appointment-only, medium-to-large work; Japanese/Asian
traditional or fine-art-adjacent styles where possible; any market, but note Israel/Tel Aviv if
found). For each: how the **hero one-liner** is phrased; whether/how **price** is stated publicly and
where; how **"who I'm right for / not right for"** is expressed without sounding hostile; how the
**sketch-and-trust** policy is framed; what the **request-form intro** says. Cite the sites. This is
current external fact — **delegate outward** per AI_CROSS_REVIEW.md (write the prompt yourself into
`RESEARCH_2026-07-23_stage6-public-copy-positioning.request.md`, leave `.answer.md` empty, set
`awaiting-external`, hand the owner the two links).

**Q2 — Good Fit without repelling.** The owner's exclusions (no fine line, no lettering, no copies,
nothing small) are real and must be stated, because filtering is the *point* of this page (PRD D7
requires a **respectful redirect**). What phrasings do comparable artists use to say "not me" while
staying gracious and confident? Give 2–3 concrete alternative approaches (e.g. positive-framing
"I'm the right artist for you if…" vs explicit two-column fit/not-fit), with trade-offs. Flag any
phrasing that reads as arrogant or defensive.

**Q3 — Pricing framing.** Evidence on: does publishing an hourly rate + minimum help or hurt
inbound quality for this tier of artist? Where do comparable sites put the number (Home teaser vs
Process only)? How do they phrase a **minimum** so it filters low-budget enquiries without sounding
transactional? How do they express "placement/complexity affect total time" without a surcharge
table? Propose 2–3 teaser phrasings implying a ~₪2,000 floor.

**Q4 — The "trust your artist" sketch policy.** This is the highest-risk copy on the site: it must
set a firm boundary (sketch the day before; full re-draw costs another ₪1,000) **without** reading
as hostile or as a warning to a client who has not done anything wrong yet. How do comparable
artists phrase this? Give 2–3 framings with trade-offs, and say plainly which risks losing good
clients.

**Q5 — Request-form intro (FS §4.1).** The current placeholder is: *"This form replaces a long
back-and-forth in my DMs — tell me about your idea in one place and I'll have everything I need to
reply. I answer every request within 48 hours."* Is this good? What do effective intake forms say to
reduce abandonment at the top of a form? Propose 2–3 alternatives (must stay consistent with the
48-hour reply promise — PRD D5).

**Q6 — Anything the FS block list is missing.** Given what strong sites do, is there a block Home or
Process should have that FS §3.1/§3.2 does not list (see constraints)? Report it as an observation
**only** — the FS governs, and changing it is a PRD §9 change-control decision, not this thread's.

### Constraints the answer must respect

- **FS §3.1 (Home) must contain:** Hero (name, one-line specialization, city), Featured Work (4–8
  images), Mini Process (4–5 one-line steps), Good Fit teaser, Price teaser, primary CTA. **Must
  not** contain long policies, prep/aftercare, detailed FAQ, or long-form duplicates of Process.
- **FS §3.2 (Process) must contain:** Process Overview, Pricing (canonical), Good Fit (canonical,
  with respectful redirect), Design Process, Booking Policy (deposit terms **in prose only**), FAQ,
  primary CTA.
- **PRD D5:** reply within 48 hours. **PRD D8:** Home carries a price teaser, canonical pricing on
  Process. **PRD §4:** no payment/booking functionality — deposits are described in prose only.
- **Language: English** (the active MVP language). Copy must not read as translated Russian.
- **One artist, real person.** No invented credentials, awards, client counts, or testimonials —
  nothing that is not in the facts above. Do not fabricate social proof.
- **No analytics** (PRD §4 Non-Goal) — so "we can A/B it" is not an available answer.
- The existing shipped copy (`src/shared/i18n/messages/en.json` → `home`, `process`) is the baseline
  to keep/adjust, not a blank page. Read it.

### Read before answering

- `src/shared/i18n/messages/en.json` — `home` and `process` namespaces (the shipped copy), plus
  `request.introduction` (the placeholder in Q5) and `request.__intro_TODO`.
- `docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md` §3.1, §3.2, §4.1, §5.
- `docs/project/STAGE_6_PRODUCT_DEFINITION.md` — D5, D7, D8, §4 (Non-Goals).
- `docs/project/PROJECT_DECISIONS.md` — "Stage 6 UX Blueprint Decisions" (Home page, Process page).

### What a usable answer produces

Evidence the owner and a drafting session can act on: cited examples of what comparable artists
actually publish; 2–3 concrete phrasing options per question **with trade-offs and a labelled
recommendation**; and an explicit list of anything you could not verify. Not final copy — the draft
is written afterwards against these findings, then reviewed by the owner.

## Findings 1

The external answer has been reviewed and normalized below; it is not adopted wholesale. I
independently opened the primary pages most material to the answer on 2026-07-23 and checked the
answer against the repository. Provenance labels used here:

- **Repo-verified** — checked against the project files named in the Question.
- **Primary-source-verified** — independently checked on the linked first-party website on
  2026-07-23.
- **External AI, unverified** — reported by the returned external answer but not independently
  confirmed.
- **Analysis** — a copy/product inference, not an external fact or conversion claim.

All wording below is a working direction for the owner and drafting session, not final copy.

### 1. Source audit: useful evidence, but the returned pricing matrix is materially unreliable

**Primary-source-verified.** The strongest qualitative observations survive checking:

- [Die Monde](https://die-monde.com/booking) defines the practice positively, accepts only work
  within the current style, uses references as a starting point, refuses copying, and may recommend
  changes to size/placement/detail.
- [Henwife](https://henwifetattoo.com/info) says references communicate direction rather than
  prescribe a copy; drawings are made the day before or morning of the appointment, normally first
  shown and adjusted at the appointment, and a major revision needs a new date and deposit.
- [Japanese Tattoo Artist / Aidan](https://japanesetattooartist.co.uk/booking-information/) says
  artwork is prepared the night before and adjustments are welcome on tattoo day.
- [White Bird Studio](https://whitebirdstudio.tattoo/appointments-deposits-touch-up-policies/)
  shows the drawing on the appointment day, allows simple alterations, and treats a new subject or
  drastic change as a new design requiring another appointment and deposit; the original deposit
  pays for completed design work.
- [Ali Ka](https://www.alikatattooart.com/blog/booking-deposit-terms) does not send the design in
  advance, finalizes it with the client on the day, and allows tweaks.
- [Jo Harrison](https://un1ty.tattoo/jo-harrisons-faq/) uses the request information as preparation
  for a freehand, body-responsive design developed on the day.
- [Tyler Nolan](https://www.tylernolantattoos.com/pages/book-your-appointment) asks for creative
  freedom while explicitly inviting the client to name wanted/unwanted elements, says day-of first
  reveal is normal, and respectfully suggests another artist when that process is uncomfortable.

These sources establish that the proposed style-led filter, late sketch, day-of refinements, and
new-deposit-for-new-design policy all have real current comparators. They do **not** prove that
clients universally like the policies or that any wording converts better.

**Primary-source-verified correction.** The external answer repeatedly said public rates or
minimums were “not found” where the cited page states them plainly:

| Site | What the checked page actually publishes |
| --- | --- |
| Aidan | £100/hour for larger work; smaller work has a one-hour minimum; £500 six-hour day rate |
| Die Monde | £100 minimum; £100/hour for multi-hour custom work; £100 deposit |
| Henwife | $250/hour; $250 minimum; $150 deposit |
| White Bird | $180/hour with a one-hour minimum; deposit required, amount not stated |
| Rubano | $250/hour for work over two hours; $200 large-work / $100 small-work deposits |
| Tyler Nolan | about $250/hour; half-day around $1,000, full day up to $2,000; $250/$500 deposits |
| Ali Ka | no rate or deposit amount on the checked policy page |
| Jo Harrison | no rate or deposit amount on the checked FAQ |

The external answer's “no public price” classification for Aidan, Die Monde, Henwife, and White
Bird is discarded. In this independently checked eight-page subset, six publish a rate or session
pricing and four publish an explicit minimum. The sample is still small and purposive, so it cannot
be turned into an industry percentage, but transparent price framing is clearly not an outlier.

**External AI, unverified.** The two Tel Aviv examples (Eden Kalif and Craftz Berlin) were reported
as approachable local context but weak stylistic comparators. Neither contributed evidence strong
enough to drive a copy decision, so no claim from those rows is relied upon here. The Watermelon row
relied on indexed content after a 403 and is likewise excluded from the evidence base.

### 2. Hero / one-line positioning

**Analysis grounded in owner-supplied facts.** Comparable sites usually let the portfolio do most
of the persuasion and use a short statement of practice. The owner draft's meaning is viable in
English, but a literal “at the intersection of” rendering is art-world language and somewhat
generic.

Options:

1. **“Original tattoos inspired by Japanese painting and contemporary art — Tel Aviv.”**
   Closest to the owner's one-liner; concise and natural. It leaves medium-to-large scale and the
   Chinese/calligraphy influence for Good Fit.
2. **“Custom tattoos shaped by Japanese and Chinese painting, calligraphy, and contemporary art —
   Tel Aviv.”** Most complete; also the densest and least elegant hero.
3. **“Medium-to-large custom tattoos in a painterly, Japanese-inspired style — Tel Aviv.”**
   Strongest immediate filter; weakest representation of the broader Chinese/calligraphy and
   contemporary-art direction.

**Labelled recommendation:** Option 1 for the Hero, followed nearby by the repo-verified “20+
years…” trust fact and a fuller Good Fit description. It preserves the owner's intended emphasis
without making the Hero carry every fact.

### 3. Good Fit without repelling

**Primary-source-verified pattern.** Die Monde and Henwife frame boundaries as the natural result
of a specialized practice: what the artist makes, how references are used, and when another artist
may be a better match. Tyler Nolan provides a useful mixed example: its invitation to specify
preferences is reassuring, while emphatic all-caps exclusions show the tone this project should
avoid.

Options:

1. **Positive-first.** “This is a good fit if you want an original, medium-to-large piece developed
   through my style and experience.” Follow with the exclusions in prose. Warmest, but skimmers may
   miss the exclusions.
2. **Fit / Not Fit split.** Two short labelled lists. Most scannable and strongest filter, but
   “Not Fit” can sound as though the visitor rather than the requested service is being judged.
3. **Specialization + respectful redirect.** “I specialize in original, medium-to-large work… For
   fine line, lettering, very small tattoos, or exact copies, another artist who specializes in
   that work will be a better match.” Confident and gracious; slightly less scan-friendly than two
   columns.

**Labelled recommendation:** Option 3 as the canonical Process section; a one-sentence positive
version of Option 1 as the Home teaser. This implements PRD D7's respectful redirect without
softening any real exclusion.

Avoid: “serious clients only,” “human printer,” “do not contact me unless,” “full creative freedom
required,” or language implying that ordinary questions show distrust. Those phrases make the
boundary personal or adversarial instead of practice-specific.

### 4. Pricing framing

**Repo-verified.** PRD D8 already decides that Home carries a teaser and Process is canonical, so
the research is choosing clear framing, not re-deciding disclosure. The fixed facts are
₪1,000/hour and a hard ₪2,000 minimum; placement and complexity change the required time, not the
rate.

**Analysis.** Public rate/minimum disclosure plausibly filters projects below the floor before the
visitor invests in the form. No checked source supplies lead-quality or conversion data, so this is
a product hypothesis, not a measured benefit.

Home teaser options:

1. **“Custom tattoos have a ₪2,000 minimum. Tattooing is ₪1,000 per hour; placement and complexity
   affect the time required and final total.”** Clearest qualifier; slightly administrative.
2. **“Custom projects start at ₪2,000. Tattooing is ₪1,000 per hour, with the final total based on
   the time the piece requires.”** Smoother, but “start at” is marginally less explicit than
   “minimum.”
3. **“Pricing begins at ₪2,000, based on a rate of ₪1,000 per hour. Placement and complexity shape
   the time required.”** Compact and editorial; the least direct of the three.

**Labelled recommendation:** Option 1, plus a “See pricing and process” link. Keep deposit,
rescheduling, and redraw consequences off Home and in the canonical Process page.

### 5. Sketch timing and trust

**Primary-source-verified.** Aidan, Henwife, White Bird, Ali Ka, Jo Harrison, and Tyler Nolan all
support some combination of late/day-of design presentation, minor adjustments, artist-led
interpretation, and a new deposit/date for a new design. The policy itself is therefore not unusual
among the checked comparators.

Options:

1. **Collaboration-first.** “I develop the design from the idea, references, placement, and details
   we agree on together. You'll receive the sketch the day before your session, and we can make
   small refinements when you arrive. If the direction changes completely, the original
   non-refundable ₪1,000 deposit covers the completed design work; a new ₪1,000 deposit starts the
   new concept and booking process.” Warmest and clearest link between client input and artist
   interpretation.
2. **Trust-first.** Lead with the sketch timing and say the booking is based on the agreed concept
   and trust in the artist's approach. Concise and positioning-led, but “trust” can feel demanded
   if introduced before explaining the client's role.
3. **Policy-first.** “A complete rejection of the agreed concept is treated as a new design…”
   Operationally precise, but “rejection,” “treated as,” and “required” make it sound like a
   pre-emptive dispute.

**Labelled recommendation:** Option 1. Option 3 is the most likely to lose otherwise good clients.
Do not use anti-theft reasoning: it starts the relationship from suspicion and is not one of the
owner-supplied reasons.

### 6. Request-form introduction

**Repo-verified.** The placeholder meets FS §4.1 and PRD D5, but “I'll have everything I need to
reply” can overpromise that no clarification will ever be necessary.

Options:

1. **Minimal revision:** “This form replaces a long back-and-forth in my DMs. Share your idea,
   placement, and references in one place so I can understand the project and give you a useful
   reply. I reply to every request within 48 hours.” Clear; three sentences and slightly
   procedural.
2. **Reassurance-first:** “Instead of piecing your idea together through DMs, this form gives me the
   details I need to consider your project. You don't need to have every detail figured out—share
   what you know, and I'll reply within 48 hours.” Lowest anxiety; less literal about
   “back-and-forth.”
3. **Request-not-booking:** “This request form replaces the usual DM back-and-forth and keeps
   everything about your idea in one place. It is not an automatic booking; it gives me what I need
   to consider the project. I reply to every request within 48 hours.” Best expectation boundary;
   most administrative.

**Labelled recommendation:** a blend of 1 and 2:

> This form replaces a long back-and-forth in my DMs and keeps everything about your idea in one
> place. You don't need to have every detail figured out—share what you know, and I'll reply within
> 48 hours.

**Analysis, not conversion evidence.** The comparable forms support explaining why information is
needed and what happens next, but they do not demonstrate that this wording reduces abandonment.
The external answer's GOV.UK “step-by-step navigation” link is not relevant evidence for this form
intro and is discarded. General form guidance supports concise expectation-setting, not this exact
copy.

### 7. Missing blocks and FAQ topics

**Repo-verified.** No new Home or Process block is justified. The recurring comparator topics map
into blocks FS §3.1/§3.2 already requires. Adding blocks would create duplication rather than fill a
structural gap.

Useful reconciliation for the drafting session:

- “What happens after submitting” belongs in the required Process Overview (D3/D5), not a second
  FAQ answer.
- References-versus-copying belongs in Good Fit / Design Process; repeat it in FAQ only if the
  owner identifies it as a real recurring DM question.
- Pricing factors belong in canonical Pricing.
- Health, pregnancy, preparation, and healing content belongs on the canonical Preparation or
  Aftercare pages, not Process FAQ (FS §5).
- Location/arrival logistics belongs on Location, not Process.
- Multi-session deposit handling, accepted payment methods, consultation expectations,
  cancellation/no-show notice, and session language are genuine owner-fact gaps. They may become
  FAQ items only after the owner supplies the actual policy.

Corrections to the external answer:

- The number of reschedules is **not** unresolved: the current owner copy allows one free
  reschedule and requires a new deposit after another (**repo-verified**, `en.json`).
- Cover-up acceptance is **not** absent from the baseline: the existing FAQ says yes. The owner
  directed removal of the separate cover-up rate, not removal of cover-ups.
- Touch-up terms are also present: free within three months, regular-rate charging afterwards.
  They need clean placement in the new Process/Aftercare ownership model, not invention from
  scratch.

### 8. Age policy: external guidance is current, but the product and legal sources conflict

**Primary-source-verified.** The Israeli Ministry of Health page, dated 2026-07-01, says under-16
tattooing is prohibited; ages 16–18 require written parental approval and one parent's presence;
18+ is unrestricted:
[Ministry of Health](https://me.health.gov.il/parenting/learn-more/adolescence/tattoos-and-piercings/).

**Primary-source-verified conflict.** An official Knesset-hosted consolidated Business Licensing
Law text for §2ז(a) says that a person must not tattoo a minor **under 16 unless** a parent/guardian
gives written consent before the practitioner. The text visible there does not state the Ministry's
16–18 consent/presence rule:
[Knesset-hosted consolidated law PDF](https://fs.knesset.gov.il/20/Committees/20_cs_bg_499052.pdf).
The 2002 amendment text on the Knesset site has the same under-16-with-written-consent wording.
Thus the Ministry's operational guidance and the accessible statutory text point in different
directions. This research cannot responsibly turn either into a definitive legal statement.

**Repo-verified product conflict.** PRD D6, FS field 11, `AGE_THRESHOLD = 18`, and the shipped
eligibility checkbox accept requests only from people confirming they are 18+. The current Process
copy simultaneously says 16–17 may be accepted with parental consent. Publishing the external
answer's proposed 16–17 wording without changing the form would invite a visitor the product then
blocks.

Owner options:

1. **Studio policy: 18+ only.** State it as the artist's stricter policy, not as a claim about
   Israeli law. This matches PRD D6 and the current form and avoids building a minor/parent
   submission path.
2. **Accept ages 16–17.** First obtain local professional/legal confirmation of the precise
   consent, presence, ID, and recordkeeping procedure; then make an owner decision that amends PRD
   D6/FS and the form eligibility flow. A Process-copy change alone is insufficient.

**Labelled recommendation:** Option 1 for Stage 6 unless the owner affirmatively wants minor
requests enough to open the product/legal change. This is an operational/product recommendation,
not a legal conclusion.

### 9. Explicit unresolved items

- No source establishes that any hero, Good Fit layout, price teaser, sketch framing, or form intro
  performs better in conversion or request quality.
- Exact Israeli legal requirements for tattooing minors remain unresolved because current official
  sources conflict.
- The owner still needs to define multi-session deposit/payment behavior, payment methods,
  consultation policy, cancellation/no-show notice, and session-language policy if these are to
  appear.
- The 48-hour promise is fixed by PRD D5; its holiday/travel operating coverage was not verified
  and is outside this copy research.
- No claim about awards, demand, waitlist, testimonials, client count, or performance was verified
  and none should be drafted.

## Response 1

Status → `awaiting-owner`. The findings are strong and I accept them as the copy evidence base. Two
things raise beyond "pick a phrasing" and need the owner, one of them a **product decision, not a
copy call**.

### Usable now — the copy direction is settled enough to draft

For each block the findings give a labelled recommendation with real comparators; drafting can
proceed on these without further research:

- **Hero:** *"Original tattoos inspired by Japanese painting and contemporary art — Tel Aviv"* + the
  repo-verified "20+ years…" trust line nearby (Chinese/calligraphy/scale move to Good Fit).
- **Good Fit:** specialization + respectful redirect on Process (canonical), a one-sentence positive
  version as the Home teaser. Named phrasings to **avoid** ("serious clients only", "human printer",
  "full creative freedom required" — anything that judges the visitor, not the service).
- **Pricing teaser (Home):** *"Custom tattoos have a ₪2,000 minimum. Tattooing is ₪1,000 per hour;
  placement and complexity affect the time required and final total."* Deposit/reschedule/redraw stay
  off Home, canonical on Process.
- **Sketch/trust:** the collaboration-first framing (Option 1 §5) — links the client's input to the
  artist's interpretation, states the day-before sketch + day-of tweaks + new-deposit-for-new-concept
  **without** the "rejection/treated as/required" dispute tone. Explicitly do not use anti-theft
  reasoning.
- **Form intro:** the blended 1+2 in §6 (keeps the DM-replacement idea, drops the "everything I need"
  overpromise, keeps the 48h line).
- **FAQ / blocks:** no new block; keep existing FAQ, and the topic-placement map in §7 tells the
  drafting session where each answer belongs.

### Findings that corrected the external answer (worth knowing)

- The external AI **wrongly reported "no public price"** for four sites that in fact publish rates —
  Codex re-checked the pages. So "transparent pricing is an outlier" is false; publishing the rate +
  minimum is normal in this tier. Good for our decision.
- Several exclusions the external answer flagged as "missing from baseline" (reschedule count,
  cover-ups, touch-ups) **already exist** in our shipped copy — not gaps.

### Needs the owner — two items

1. **Age policy — this is a PRODUCT decision, not copy, and there is a real contradiction.** The
   shipped product is **18+ only** (`AGE_THRESHOLD = 18`, FS field 11, the eligibility checkbox), but
   the *current Process copy* says "16–17 with parental consent". These conflict today. Worse, Codex
   found the Israeli **Ministry of Health guidance and the accessible statutory text disagree** on the
   16–18 rule, so neither we nor the research can state the law responsibly. Two clean options:
   - **(A, recommended for Stage 6) 18+ only** — as the *artist's studio policy*, not a claim about
     the law. Matches the shipped form; fix the Process copy to stop advertising 16–17. Zero product
     change.
     *(Note: you told me earlier "18+; 16–17 with consent" was right — but the form only accepts 18+,
     so publishing 16–17 invites a visitor the product then blocks. Flagging because it's a
     mismatch, not because your intent was wrong.)*
   - **(B) actually accept 16–17** — needs local legal/professional confirmation first, then amends
     PRD D6 + FS + the form's eligibility flow (a minor/parent submission path). A copy change alone
     is not enough and would be misleading.
2. **Optional owner facts** the drafting can proceed without, but which become FAQ/Process gaps if you
   want them answered: multi-session deposit behavior, accepted payment methods, consultation policy,
   cancellation/no-show notice, session language. Skip any you don't want on the site.

### What happens on your decision

On your age-policy pick (and any optional facts), a session drafts the full Home + Process + form-intro
copy against these findings, folds in the `__intro_TODO` / `INSTAGRAM_HANDLE` / `__meta_TODO`
placeholder swaps, and brings it to you for review — then Items 6 → 5 get cut. Until then this stays
`awaiting-owner`; nothing is written to `en.json` yet.

### Русское саммари для владельца

**Ресёрч по копирайтингу готов — и он качественный: Codex перепроверил внешний ответ по реальным
сайтам и поймал две ошибки внешнего AI (наврал про «цен нет» у 4 сайтов; и часть «пробелов» у нас на
самом деле уже есть).** Итог:

- **Позиционирование, Good Fit, цена, политика эскиза, интро формы — направление выбрано**, с живыми
  примерами конкурентов. Могу писать текст хоть сейчас.
- **Ключевые формулировки:**
  - Заголовок: *«Original tattoos inspired by Japanese painting and contemporary art — Tel Aviv»* +
    рядом «20+ лет опыта».
  - Цена на Home: *«минимум ₪2,000; ₪1,000/час; место и сложность влияют на время и итог»* — ровно
    твоя логика, депозит и правила остаются на Process.
  - Эскиз: тёплая формулировка «работаем вместе» — эскиз накануне, мелкие правки в день, при полной
    смене концепции новый депозит. Без слов «отказ/требуется», без темы «воровство идей» — это
    отпугивает хороших клиентов.
- **Что мусор из внешнего ответа — отброшено** (неверные цены, нерелевантная ссылка на GOV.UK, слабые
  тель-авивские примеры).

**От тебя нужно одно решение — про возраст. Это не про текст, это про продукт, и там реальное
противоречие:**

- Форма сейчас принимает **только 18+** (так в коде), но текст на Process обещает «16–17 с согласия
  родителей». Это рассинхрон. Плюс Codex выяснил, что **израильские Минздрав и закон расходятся** по
  правилу 16–18 — надёжно сослаться на закон нельзя.
- **Вариант A (рекомендую для Stage 6):** «только 18+» как **политика студии** (не утверждение о
  законе). Совпадает с формой, просто чиним текст. Ничего в продукте не меняем.
- **Вариант B:** реально принимать 16–17 — тогда сначала местная юридическая проверка, потом правки
  PRD + FS + самой формы (путь для несовершеннолетних с родителем). Только текстом не обойтись.

*(Ты раньше сказал, что «18+; 16–17 с согласия» — верно. Но форма-то пускает только 18+, поэтому
публиковать 16–17 = звать людей, которых продукт потом заблокирует. Поэтому и выношу.)*

**Опционально** — если хочешь, чтобы на сайте были ответы про: депозит за несколько сеансов, способы
оплаты, консультации, отмена/неявка, язык сеанса — дай факты. Не хочешь — пропускаем.

После твоего решения по возрасту я пишу полный текст (Home + Process + интро формы), заодно меняю
плейсхолдеры, приношу на просмотр — и режем Items 6 → 5.

## Outcome

**Owner decided 2026-07-23.** Thread closes; findings become the copy evidence base for the Items 6/5
drafting task.

### Decisions

1. **Age → 18+ only** (Option A). Framed as the **studio's policy**, not a claim about Israeli law
   (the Ministry/statute conflict Codex found is left untouched). Matches the shipped product
   (`AGE_THRESHOLD = 18`, FS field 11, eligibility checkbox) — **no product change**. The Process copy
   that currently advertises "16–17 with parental consent" must be corrected to 18+ during the copy
   rewrite. Accepting 16–17 (Option B) is not pursued in Stage 6.
2. **Optional FAQ/Process facts — owner supplied them (2026-07-23), to be woven into the canonical
   Process copy:**
   - **Multi-session deposit:** one ₪1,000 deposit, **carried forward to the final session**. Example
     — a 9-hour tattoo over 3×3h: deposit ₪1,000; after session 1 the client pays that session
     (₪3,000 / 3h); the deposit rides to the next session under the same terms; the **final** session
     is ₪2,000 (i.e. the ₪1,000 deposit applies there). Net: the deposit is only ever "spent" once, at
     the end.
   - **Payment methods:** any method accepted; **do not publish a preferred method** on the site
     (owner prefers cash but keeps it off-site). So copy should say payment is discussed/flexible, not
     list methods.
   - **Consultations:** free, in-person, **no deposit** pre-booking meetings are available.
   - **Cancellation / no-show:** already covered by shipped copy and consistent with owner intent —
     deposit is non-refundable, **forfeited on a no-show**; **one free reschedule** carries the
     deposit; a second reschedule forfeits it and needs a new deposit (repo-verified, `en.json`
     `process.depositsText`). No change needed beyond keeping it canonical on Process.
   - **Session languages:** Hebrew, English, Russian.

### Follow-through (a drafting session does this next — NOT this thread)

Write the full Home + Process + request-form-intro copy against Findings 1's labelled
recommendations and the facts above; correct the 18+ contradiction; fold in the placeholder swaps
(`__intro_TODO`, `INSTAGRAM_HANDLE` → `mashakarda_tattoo`, `__meta_TODO` title/description); bring to
the owner for review; then cut Item 6 (Process) → Item 5 (Home). Nothing is written to `en.json` by
this thread. Findings + this Outcome are the source of truth for that task.

Thread moved to `research/done/`; delegation buffers deleted (content folded into Findings 1).
