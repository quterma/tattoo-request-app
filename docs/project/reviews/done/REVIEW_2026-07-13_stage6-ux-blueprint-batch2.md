Status: `consensus`
Reviewer: external

# Stage 6 UX Blueprint — Batch 2 (Success, Location, Preparation, Aftercare)

## Handoff

Continuation of the Stage 6 UX blueprint (page structure, block order, flows, states,
navigation/CTA placement — no visual design). Batch 1 (navigation/CTA, Home, Process, Request)
already went through one external review round (ad-hoc file exchange, predates this protocol);
4 corrections were applied and are recorded in PROJECT_DECISIONS.md. This thread covers the
remaining four sub-topics, all decided in the same STRAT session, same method (FS §3 as the fixed
constraint, blueprint only decides what FS leaves open).

Decision text (verbatim from PROJECT_DECISIONS.md — Stage 6 UX Blueprint Decisions):

---

### Success page (FS §3.4)

Content and its order are fully fixed by FS §3.4 ("Must contain, **in order**": confirmation →
reference code → 48-hour expectation → contact echo → channel notes → Back to Home CTA) — not
reopened here. The page does not exist in the shipped Stages 0–5 site (an in-place success state
was shipped instead — a recorded divergence); Stage 6 introduces it as a real route. The open
blueprint questions were the access/data mechanics behind FS's gating rule ("Reachable only
immediately after a successful submission. If opened directly, refreshed, or reached without a
successful submission in the current session, redirect to Home"):

- **Data transport: the module-level client store, clean URL.** On successful submit, the same
  module-level store that D-Blueprint 5(a) (batch 1, Request) already requires for form
  persistence receives the success payload (reference code + the contact method/value as
  entered), and the client navigates to `/success` via client-side routing. The URL carries no
  data (no query params, no path segment): a reload drops module state by nature, which yields
  FS's "refreshed → redirect to Home" behavior for free instead of requiring an invalidation
  mechanism. The rejected alternative (data in URL, e.g. `/success?ref=…`) would keep a
  shareable/refreshable success URL alive — directly contradicting the FS gating sentence.
- **Gate check:** on mount, Success reads the store; an empty store means no successful
  submission in this session → immediate client-side redirect to Home. This single check covers
  all three FS cases (direct open, refresh, no-submission navigation).
- **One-time read:** the store's success payload is cleared immediately after Success renders it.
  Any revisit (browser back from Home, history navigation, manual URL entry) finds the store
  empty and redirects — matching FS's "only immediately after a successful submission" literally,
  not just approximately. Trade-off accepted knowingly: a visitor who navigates away and comes
  back cannot re-view the reference code on-site; the code is delivered once. This matches FS's
  intent (no public lookup functionality, §4.6) and the reply itself arrives via the contact
  channel regardless.

### Location page (FS §3.5)

FS §3.5 fixes the content set (address, map, studio photos, transport/parking, entrance
instructions if non-obvious; no marketing content) but not the order.

- **Block order: keep the shipped page's order**, which already satisfies the content set:
  Address (with map-provider links: Google Maps / Apple Maps / Waze) → map embed → How to find us
  → Studio Photos, **plus the primary CTA appended at the end** per the site-wide CTA decision
  (Location is in FS §2's CTA table — "Start Your Request" — but the shipped page has no CTA;
  that is the only structural gap). Prior art respected: the page exists and works
  (`app/[locale]/(public)/location/page.tsx`); no reordering without cause.
- **Transport/parking and entrance instructions live inside "How to find us"** as optional
  owner-added items, not separate blocks. FS's own qualifier ("entrance instructions **if
  non-obvious**") makes presence content-conditional; the owner extends the same logic to
  transport/parking: for the current location none of these are needed, and adding them would be
  friction, not help (PRD §6 — a content block must answer a real user problem). The structure is
  ready to accept these items for a future location; their absence today is an owner content
  decision, not a blueprint gap.

### Preparation page (FS §3.6)

The shipped site has no Preparation page — its content lives inside the combined `aftercare`
route (sections: before-appointment, tattoo-day, aftercare-instructions, healing-touch-ups), a
recorded Stages 0–5 divergence. **Stage 6 splits it into two routes per FS §3.6/§3.7**; this is
FS compliance, not a new blueprint invention.

- **Blocks, chronological:** short intro (1–2 lines: who this page is for — booked clients — and
  what it covers) → Before appointment → Tattoo day.
- **Navigation presence:** the nav bar is rendered on this page (FS §2 — primary navigation is
  "identical and persistent on all public pages") while the page itself is absent from the nav's
  item set (PRD D9). Reaching the page is by direct URL only, sent by the artist at the right
  journey moment (PRD §5 operational assumption; no in-product discovery is an explicitly
  accepted, recorded risk — changing that requires a PRD escalation, and the owner reconfirmed
  the model in-session after the trade-off was restated).
- **No primary CTA** (FS §2 table: none for content pages Preparation/Aftercare).
- **The shipped page's "back to policies" links (top and bottom) are removed:** the policies page
  is superseded in Stage 6 (nav item becomes Process), and FS §2 allows secondary links only when
  they help complete the current task — a preparing client's task is not served by Process.
- **No cross-link to Aftercare:** the PRD §5 distribution model (artist sends each URL at its
  journey moment) is deliberate; a Preparation→Aftercare link would quietly reintroduce in-product
  discovery, and Aftercare does not serve the Preparation reader's current task (their session
  hasn't happened yet).

### Aftercare page (FS §3.7)

Mirror of Preparation (same split, same rules).

- **Blocks, chronological:** short intro → Aftercare instructions (immediate care) → Healing &
  touch-ups (longer-term expectations).
- Nav bar present / absent from nav item set; no primary CTA; "back to policies" links removed;
  no cross-link to Preparation — same rationale as the Preparation section above, applied
  symmetrically.
- **Content boundary for "Healing & touch-ups" recorded explicitly:** this section covers healing
  expectations and when a touch-up is appropriate — nothing else. Any touch-up booking terms or
  pricing belong exclusively to Process (Booking Policy): FS §3.7 forbids pricing/booking content
  here, and FS §5's canonical-ownership table places booking rules on Process alone. This line is
  drawn now because touch-ups are the one aftercare topic that naturally drifts toward booking
  language.
- **Tone requirement carried from FS §3.7:** the copy is "written as the artist's own
  instructions" — owner-authored content; per FS §3, missing content blocks implementation, it is
  not improvised by engineering.

---

## Relevant FS/PRD excerpts (for a reviewer without repo access)

**FS §3.4 Success (verbatim):** "Must contain, in order: 1. Confirmation the request was
received; no further action required. 2. Reference code (§4.6). 3. Response expectation: reply
within 48 hours (PRD D5). 4. Reply channel echo: all contact methods the visitor provided,
displayed as entered... 5. Channel-specific expectation note for each displayed method
(Appendix A §A.2). 6. Primary CTA: Back to Home. Reachable only immediately after a successful
submission. If opened directly, refreshed, or reached without a successful submission in the
current session, redirect to Home."

**FS §3.5 Location (verbatim):** "Purpose: minimize arrival friction. Must contain: address, map,
studio photos, transport/parking, entrance instructions if non-obvious. No marketing content."

**FS §3.6 Preparation (verbatim):** "Purpose: reduce repetitive pre-session questions; audience is
booked clients (PRD §5). Scope: appointment preparation only. No pricing or booking content."

**FS §3.7 Aftercare (verbatim):** "Purpose: reduce repetitive post-session questions. Scope:
healing and care only, written as the artist's own instructions. No pricing or booking content."

**FS §2 (verbatim, CTA table row for these pages):** Preparation/Aftercare → "none"; Location →
"Start Your Request". Primary navigation is "Home, Process, Request, Location... Preparation and
Aftercare are reachable only by direct URL."

**PRD §5 Customer Journey (verbatim, operational assumption):** "These pages are reached via
stable, shareable URLs manually sent by the artist at the right journey moment. The product
provides stable URLs and content; distribution is the artist's responsibility. No in-product
fallback discovery (no footer links) in Stage 6 — accepted, recorded risk."

**PRD §6 (verbatim, cited for Location's transport/parking omission):** "one primary CTA per
page; one user problem per content block; explain before asking."

**FS §4.6 (verbatim, cited for Success's one-time-read trade-off):** "No public lookup
functionality."

## Scope boundary

Page structure, block order, navigation/CTA presence, and state/access logic only. Not in scope:
visual design, exact copy (Appendix A already supplies normative copy where FS requires it),
implementation code.

## Focus questions

1. Does the Success page's client-store + one-time-read design actually satisfy FS §3.4's gating
   sentence in every case FS describes (direct open, refresh, no-submission reach), or is there a
   case this misses (e.g. multiple tabs, back-forward cache/bfcache restoring a stale DOM without
   a fresh mount)?
2. Is dropping transport/parking/entrance-instructions from Location correct given the current
   location, or does FS's phrasing ("Must contain: ... transport/parking...") without a
   conditional qualifier (unlike entrance instructions, which explicitly says "if non-obvious")
   make transport/parking non-optional regardless of whether the owner judges it necessary?
3. Is the "no cross-link between Preparation and Aftercare" call correct, or does it read PRD §5's
   "no in-product fallback discovery (no footer links)" more broadly than intended — i.e. does
   that sentence forbid discovery from public pages/footer specifically, while an in-context link
   from one already-reached contextual page to a *related* contextual page (both requiring the
   artist's distribution to reach in the first place) might not be the same risk?
4. Anything from prior research on this project (before this Stage 6 STRAT session) that
   contradicts, refines, or was dropped from any decision above?

## Review 1 (external)

Normalized from the external reviewer's answer (original text preserved in meaning; findings
numbered for the response). The reviewer had the full FS/PRD texts and prior Stage 6 research
context.

**Approved as-is:** Success data-transport and gate-check design (with two additions below),
Location block order, the Preparation/Aftercare split, both pages' block order, no-CTA, removal
of the policies links, the Healing & touch-ups content boundary (called out as the batch's best
formulation — the line is drawn exactly where content naturally drifts into booking language).

**Finding 1 — Success (should-fix, guarantee gap).** The claim "any revisit finds the store empty
and redirects" relies on a fresh mount. Client-side SPA navigation and multi-tab cases are
covered (module state is per-tab; route transitions remount and re-run the gate check), and
refresh is covered by module-state reset. But if the user left Success via a **full document
navigation** and returns via browser back, the page can be restored from the back-forward cache
(bfcache) — whole DOM, no mount, no gate check — showing the reference code again. Not exotic on
mobile Safari/Chrome. Cheap blueprint-level fix: Success listens to `pageshow`; on
`event.persisted === true` the gate check re-runs → empty store → redirect. Two adjacent notes:
(1a) "cleared immediately after render" should be worded idempotently (React dev strict-mode
double-invokes effects; a naive read-then-clear effect would redirect itself) — read-once
semantics robust to repeated invocation, mechanics left to implementation; (1b) a gap neither
batch caught: D-Blueprint 5(a) persists the Request form state, and the Success decision clears
the success payload but never says the *form* state is cleared on successful submit — without
that line, a visitor returning to Request in the same session finds the form pre-filled with an
already-submitted request. Add: successful persist clears both the success payload (after
display) and the persisted form state.

**Finding 2 — Location transport/parking (blocker: real FS conflict).** FS §3.5 reads "Must
contain: address, map, studio photos, transport/parking, entrance instructions **if
non-obvious**" — the conditional qualifier binds syntactically to entrance instructions only;
transport/parking sits in the unconditional must-contain list. Omitting it is therefore not an
"owner content decision" but a violation of FS text, and rationalizing via PRD §6 does not work:
the framework itself says FS/PRD text beats interpretation and conflicts are escalated, not
silently resolved at a lower level. Two legal exits: **(a)** minimal content — one sentence on
parking/transit closes the item literally (and "parking is unnecessary" is a doubtful premise
for an Israeli city; one line of arrival-friction info is exactly the page's FS purpose);
**(b)** if the owner genuinely deems it irrelevant for the current location — a deliberate FS
v1.1 amendment ("transport/parking **if relevant**") through the owner process, recorded in the
decision log. Reviewer recommends (a). What is not acceptable is the current state.

**Finding 3 — Preparation↔Aftercare cross-link rationale (should-fix: rationale overclaim,
decision itself fine).** PRD §5's "no in-product fallback discovery (no footer links)" is about
public-page discoverability — a Preparation→Aftercare link does not create public
discoverability, since seeing it already requires having received the Preparation URL from the
artist. So PRD §5 does not forbid such a link, and citing it is the same class of overclaim as
batch 1's "long-form duplicate". The decision (no cross-link) stands on the honest second
argument already present: FS §2 allows secondary links only when they serve the page's current
task, and the Preparation reader's task (session ahead) is not aftercare. Fix the recorded
rationale: keep task-relevance, drop the PRD §5 citation. This matters because a future
"read what comes after" link at the bottom of Preparation has a plausible case (pre-session
anxiety reduction); with the wrong rationale it would look like a PRD escalation when it is
actually a cheap blueprint change — mislabeled grounds inflate the cost of future change.

**Q4 notes (no action in blueprint).** Nothing critical dropped versus prior research. The
chronological block orders match strong references from the Stage 6 research. The observed
"aftercare as pre-booking trust content" pattern is consciously traded away by PRD §5's
distribution model — already an accepted, recorded risk; noted, not lost. The policies-route
removal is right and complete; verifying no inbound links to the superseded route remain
site-wide belongs to the implementation batch's acceptance checks, not the blueprint.

**Reviewer's protocol summary:** only Finding 2 is a genuine FS conflict; Finding 1 is a
guarantee gap; Finding 3 is grounds hygiene. No PRD escalation needed anywhere; Finding 2
requires either content or an owner-level FS amendment.

## Response 1

- **Finding 1 (Success: bfcache / idempotent read-once / form-state clearing) — accept.** All
  three sub-points are technically correct; the bfcache restore path genuinely bypasses a
  mount-based gate check, and the form-clearing gap was real (neither batch had stated it).
  Applied to PROJECT_DECISIONS.md — Stage 6 UX Blueprint Decisions, Success section: new
  "bfcache guard" and "Form-state clearing on successful submit" bullets; "One-time read"
  reworded to idempotent semantics with mechanics left to implementation.
- **Finding 2 (Location transport/parking) — accept; resolution decided by owner.** The FS
  conflict is real: the "if non-obvious" qualifier binds to entrance instructions only, and the
  first version of the decision waived unconditional must-contain content at the wrong level.
  The owner chose option (a) — minimal content — over an FS amendment (2026-07-13, in-session):
  "How to find us" carries at least one sentence of transport/parking content. Applied to the
  Location section, with the correction history recorded in place.
- **Finding 3 (cross-link rationale) — accept.** Decision unchanged (no Preparation↔Aftercare
  cross-link); recorded basis swapped from PRD §5 (overclaim — that clause governs public
  discoverability) to FS §2 task-relevance, with an explicit note that a future cross-link would
  be a cheap blueprint-level change, not a PRD escalation. Applied to the Preparation section
  (Aftercare mirrors it by reference).
- **Q4 note (policies inbound-link check) — accept as implementation-acceptance item.** Verifying
  no inbound links to the superseded policies route remain site-wide (the shipped Home hero and
  Mini Process copy both link to it today) is recorded as an acceptance-check requirement for the
  implementation task files, not a blueprint change. Carried into STAGE_6_STRAT_BRIEF.md's
  task-file guidance.

**Краткое резюме для владельца (RU):** все три находки приняты. (1) Success получил bfcache-guard
(`pageshow`/`persisted` → повторный gate-check), идемпотентную формулировку read-once и явную
строку об очистке сохранённого стейта формы при успешной отправке — реальная дыра и реальный
пробел, оба закрыты. (2) Transport/parking на Location — подтверждённый конфликт с FS; по твоему
выбору закрыт вариантом (а): минимум одно предложение контента внутри «How to find us». (3)
Кросс-линк Preparation↔Aftercare — решение осталось (без линка), основание исправлено на
task-relevance по FS §2; PRD §5 такой линк не запрещает, и это зафиксировано, чтобы будущее
изменение не выглядело дороже, чем есть. Плюс заметка ревьюера про проверку входящих ссылок на
policies уехала в acceptance-требования будущих task-файлов.

## Consensus

All findings accepted and filed; no disputed items remain. Reviewer's recommended resolution for
Finding 2 was chosen by the owner, so no further round is needed.

| # | Finding | Outcome | Filed |
| --- | --- | --- | --- |
| 1 | Success: bfcache gap, non-idempotent read-once wording, missing form-state clearing | Accepted, all three fixed | PROJECT_DECISIONS.md — Success section (bfcache guard, form-state clearing bullets; one-time read reworded) |
| 2 | Location: transport/parking omission conflicts with FS §3.5 must-contain | Accepted; owner chose option (a) — minimal content | PROJECT_DECISIONS.md — Location section (corrected entry, correction history in place) |
| 3 | Cross-link rationale cites PRD §5 incorrectly | Accepted; decision kept, basis corrected to FS §2 task-relevance | PROJECT_DECISIONS.md — Preparation section |
| Q4 | Policies inbound-link check belongs to implementation acceptance | Accepted as task-file acceptance item | STAGE_6_STRAT_BRIEF.md — task-file guidance |

Rejected findings: none.
