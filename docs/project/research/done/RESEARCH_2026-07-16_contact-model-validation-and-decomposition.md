# Research: Block C contact-model — handle/phone validation facts + implementation decomposition

Status: `closed` · outcomes filed 2026-07-16 (see `## Outcome`)
Researcher: codex
Requested by: `IMPL: Stage 6 item 3 — request form rebuild (Block C, contact model)` (2026-07-16)

## Question

Block C of Task 03 replaces the shipped contact model (three optional fields `email`/`phone`/
`contactOther`, valid if ≥1) with the **five-method model** decided in PROJECT_DECISIONS.md →
"Stage 6 Contact Model" (2026-07-15): a method Select (WhatsApp / Email / Instagram / Telegram /
Phone) revealing exactly **one** value field, persisted into **five dedicated nullable columns**
(`email`/`phone`/`whatsapp`/`instagram`/`telegram`), one filled per request. It is the risk nucleus
of the task: it changes the public write-surface contract, recreates the `create_request` RPC a
second time (five contact columns), and touches the admin viewer.

Two things are worth an independent pass **before** I implement, and neither is a product decision
(those are settled or are the owner's):

- **Q1 is external facts** — the exact, current validation rules for Instagram/Telegram usernames
  and Israeli phone → E.164. I must not implement these from memory (AI_TASK_PROTOCOL — Name the
  basis of a claim the repo does not own); this is exactly a research question. Label every finding
  by provenance (repo-verified / model-knowledge / external-AI-unverified), and delegate outward
  for any current-external-fact part per the Research-Thread rules.
- **Q2 is a sanity-check of my implementation decomposition** — a second view on whether Block C
  should be one commit or a few, and in what order, given migration + contract + admin land together.

Baseline: HEAD is `7eaa7ac` (Blocks R/A′/B′ committed). Read before answering:
- PROJECT_DECISIONS.md → "Stage 6 Contact Model" (the decision this implements) and "Stage 6
  Upload-Flow Architecture" (the RPC/migration precedent) and "Migration Workflow Decisions" +
  "Staging Environment" (the staging gate, waived for these two Stage 6 `create_request` migrations).
- `STAGE_6_FUNCTIONAL_SPECIFICATION.md` §4.2 fields 9 / 10a–e, §A.2, §A.4.
- The current contract + form: `src/features/request/validation/schema.ts`,
  `src/features/request/validation/validationKeys.ts`, `src/bff/request.ts`,
  `src/shared/api/index.ts` (`REQUEST_FIELDS`), `src/features/request/ui/RequestForm.tsx` (the
  unchanged contact section), `src/features/request/store/requestDraft.ts` (`PERSISTED_FIELDS`,
  `FIELD_ORDER` live in `RequestForm.tsx`).
- The DB side: `supabase/migrations/20260715124427_stage6_reference_code_format.sql` (the current
  live `create_request` — Block C recreates it again), `supabase/migrations/20260629154719_domain_
  foundation.sql` (the `requests` table + the three contact columns), `src/services/db.ts`
  (`createRequest`, `getRequestForStudio` SELECT, `RequestDetailRow`/`mapRequestDetailRow`),
  `src/services/requests.ts` (`AdminRequestDetail`), `src/features/admin/ui/RequestDetail.tsx` (the
  contact rendering that must show only filled methods).

Owner decisions already fixed (do NOT reopen — treat as constraints):
- Five methods; exactly one chosen per request; five nullable columns (four NULL per row — accepted).
- Phone and WhatsApp are **both phone numbers**, E.164 Israeli formats, normalized on submit.
- Select has **no default** — a placeholder "Choose a contact method"; method order in the select is
  **WhatsApp, Email, Instagram, Telegram, Phone**.
- Staging gate is waived for this migration; it will be applied to the live (test-data) project with
  per-migration owner approval, verified by `migration list` parity + a live e2e (CO-1).

---

### Q1 — Exact validation rules (external facts, provenance-labelled)

For each, give the rule I should implement, the *source class* (repo-verified / model-knowledge /
external-AI-unverified — delegate outward if the honest answer is "current external fact I can't
verify from the repo"), and a few concrete accept/reject examples:

1. **Instagram username:** charset, length bounds, allowed punctuation (dots/underscores), leading
   `@` handling. Is the shipped rule in `validationKeys`/any prior code ("1–30 chars; leading @
   stripped; Instagram username charset", FS §4.2 field 10d) accurate and current?
2. **Telegram username:** the Contact-Model decision says "same @-strip and username charset as
   Instagram (a Telegram value may also be a phone number, but the handle form is the Stage 6
   target)." Is Telegram's real username rule actually the same as Instagram's, or materially
   different (e.g. min length 5, `[A-Za-z0-9_]` only, must not end in `_`, no dots)? If different,
   what should the Stage 6 rule be — mirror Instagram for simplicity, or Telegram-correct?
3. **Israeli phone → E.164:** what accept-forms should I take (e.g. `054-000-0000`, `0540000000`,
   `+972 54 000 0000`, `972540000000`), and what is the correct normalization to E.164
   (`+9725...`)? Is there an existing helper/library already in the repo (check `package.json` +
   `src/`), or is this a hand-rolled regex/normalizer? If a library is warranted, name a specific
   one, its current size/API, and whether it's worth the dependency for one country — vs. a small
   Israel-specific normalizer. This is the part most likely to need an external check.

For each rule, note the failure mode if I get it slightly wrong (e.g. a valid handle rejected, or a
number stored un-normalized so the artist can't click-to-call/WhatsApp).

### Q2 — Implementation decomposition sanity-check

I own commit granularity within the block (AI_TASK_PROTOCOL), but want a second view. My current
lean: build Block C as an **A′-then-B′-shaped pair within the block** —
- **C1 (contract + migration):** schema (method + one-value, discriminated per method), validationKeys,
  `REQUEST_FIELDS`, BFF parse/validate, the five-column migration + `create_request` recreation,
  `services/db.ts` `createRequest` params + read mapping — with tests; migration applied+verified.
- **C2 (form UI + admin):** the method-select→single-field UI, `PERSISTED_FIELDS`/`FIELD_ORDER`
  updates, and the admin-viewer changes (render only filled methods; rename "Consent given"→
  eligibility; add new size/color labels — the A′-deferred items).

Questions:
1. Is that the right seam, or does the migration deserve its own commit ahead of the contract code
   (as Block R was), given it touches the live DB? Is putting the admin changes with the form UI
   (C2) sound, or do they belong with the contract (they read the new columns)?
2. Any ordering hazard I'm missing — e.g. the schema's discriminated-union shape vs. how the BFF
   parses a single method+value from FormData; or a migration/rollback risk specific to recreating
   `create_request` a second time (the first recreation is `20260715124427`).
3. Anything in Blocks R/A′/B′ (already committed) that will bite Block C — e.g. the generic
   string-only `DraftFields` bag, the `consent`→`eligibility` column reuse, the `FIELD_ORDER`
   with Name now in Contact.

A usable answer: for Q1, implementable rules with provenance + examples; for Q2, options with
trade-offs (not a verdict — the seam is my call, informed by your view). Do not implement anything.

## Findings 1

### Provenance and external-answer handling

- **Verified against the repo:** findings labelled this way come from the files and current HEAD
  named below. No source, migration, dependency, or test was changed.
- **External AI, unverified:** the current Instagram/Telegram/Israeli-number/library facts below
  were supplied through the thread's external transport. I accepted only claims that were tied to
  a primary-looking source and kept the label because I did not independently browse or execute
  the claimed package version. The implementation session must still verify the installed package's
  actual API and behavior.
- **Model knowledge, unverified:** limited to implementation options/inferences not owned by the
  repo or the external answer. These are explicitly marked and should be confirmed before use.

I discarded two kinds of overclaim from the external answer rather than laundering them into repo
facts: undocumented Instagram dot-position rules are not treated as authoritative, and the stated
`libphonenumber-js` version/bundle measurements are not treated as locally verified dependency
facts. The raw external answer remains a transport buffer, not a finding.

---

### Q1.1 — Instagram username

**External AI, unverified — accepted factual core.** The answer reports partial official Meta
support for a maximum of 30 characters and the character classes ASCII letters, digits, period,
and underscore:

- [Meta/Instagram Help](https://help.instagram.com/513717858639392/)
- a Meta-hosted help surface quoted by the external answer for the 30-character/four-class rule

It did **not** find an authoritative public Meta grammar for minimum length, leading/trailing dots,
consecutive dots, or canonical casing. Therefore the FS's owner-fixed `1–30` bound is usable, but a
stricter dot-position regex would add rules the research did not verify.

**Implementable candidate IG-A (external AI, unverified; consistent with the fixed FS):**

1. trim surrounding whitespace;
2. strip exactly one optional leading `@`;
3. validate the remaining value with `^[A-Za-z0-9._]{1,30}$`;
4. persist the post-strip value; do not silently remove any other character.

Accept examples:

```text
masha
masha_tattoo
masha.tattoo
masha__tattoo
@Masha.Tattoo  -> Masha.Tattoo
```

Reject examples:

```text
@               -> empty after the one strip
@@masha         -> @ remains and fails
masha-tattoo    -> hyphen
masha tattoo    -> whitespace
masha/tattoo    -> slash
машатату        -> outside the externally reported ASCII alphabet
31 characters
```

**Alternative IG-B (external AI, unverified live-product approximation):** additionally reject a
leading dot, trailing dot, and consecutive dots. Trade-off: it may better approximate current
username creation, but the external pass found no authoritative public Meta rule for those
positions. IG-A has the smaller false-rejection risk and implements only the published/fixed
contract.

**Failure mode.** Too strict rejects a real contact handle and blocks submission. Too permissive
stores a value that looks handle-shaped but cannot be reached; the Success echo then reassures the
visitor with an unusable destination.

---

### Q1.2 — Telegram username

**External AI, unverified — accepted factual core.** Telegram is materially different from
Instagram. The answer reports the following from official Telegram surfaces:

- regular username length `5–32`;
- ASCII letters, digits, and underscore only;
- case-insensitive;
- no period;
- an official client error says the username cannot start with a digit.

Sources carried into this durable thread:

- [Telegram `account.checkUsername`](https://core.telegram.org/method/account.checkUsername)
- [Telegram `account.updateUsername`](https://core.telegram.org/method/account.updateUsername)
- [Telegram Android username help text](https://translations.telegram.org/en/android/settings/UsernameHelp)
- [Telegram macOS digit-first error text](https://translations.telegram.org/en/macos/settings/Error.Username.NumberStart)

The answer did not authoritatively resolve whether a leading underscore is accepted, and found no
official prohibition on trailing or consecutive underscores. Bot rules must not be reused: bots
have an additional `bot` suffix requirement that ordinary users do not.

**Implementable candidate TG-A (external AI, unverified, conservative):**

1. trim;
2. strip exactly one optional leading `@`;
3. validate `^[A-Za-z][A-Za-z0-9_]{4,31}$`;
4. persist the post-strip value.

This accepts only a letter as the first character. It is supported by the reported digit-first
prohibition but may falsely reject a real leading-underscore username if Telegram permits one.

**Candidate TG-B (external AI, unverified, narrower false-rejection risk):**

```regex
^(?![0-9])[A-Za-z0-9_]{5,32}$
```

This permits a leading underscore while still enforcing every reported rule. The unresolved edge
is `_masha`; it should be covered by a live Telegram check if TG-B vs. TG-A matters.

Common accept examples:

```text
masha
Masha_123
masha__tattoo
masha_
@masha_tattoo -> masha_tattoo
```

Common reject examples:

```text
mash            -> 4 characters
1masha          -> starts with digit
masha.tattoo    -> dot is not allowed
masha-tattoo    -> hyphen
masha tattoo    -> whitespace
33 characters
```

**Option trade-off.** Keeping the existing "same shape as Instagram" wording is simpler but, if
the external evidence is accepted, knowingly accepts Telegram-invalid dots, 1–4-character values,
and digit-first values. Telegram-correct validation is the factual fit; it requires Claude/owner
to reconcile FS §4.2 field 10e and the decision record's "same shape as Instagram" wording before
or with implementation so Source of Truth and code do not disagree. The decision already contains
"refine in implementation if needed", but the durable rule should still be made explicit.

**Failure mode.** Reusing the Instagram regex is mainly a false-accept risk: the request persists,
but the artist cannot reach the visitor. Inventing underscore restrictions is a false-reject risk.

---

### Q1.3 — Israeli phone to E.164

**Verified against the repo.** `package.json` contains no phone-number parsing dependency, and no
helper was found in `src/`. The current schema merely trims `phone` and caps it at 50 characters
(`src/features/request/validation/schema.ts:52`); it neither validates Israel nor normalizes.

**External AI, unverified — accepted factual core.**

- Use Israel as the required parsed country (`IL`) and persist `.number` in E.164 form.
- A general Phone field should accept valid Israeli geographic, mobile, and recognized `07`
  non-geographic/VoIP ranges rather than hard-code "mobile only".
- WhatsApp syntax validation should use the same valid-Israeli-number rule; offline validation
  cannot prove that the number is registered with WhatsApp.
- The national trunk `0` is removed when converting to `+972`: for example the externally supplied
  illustrative form `054-555-5555` becomes `+972545555555`.
- The answer reports that domestic, `+972…`, bare `972…`, and `00972…` forms were parseable in its
  tested library version. This is empirical external-AI output and must become an installed-version
  test, not an assumption.

Primary-looking sources carried into the thread:

- [Israel Ministry of Communications numbering plan (2024 PDF)](https://www.gov.il/BlobFolder/policy/number_policy/he/Numbering-scheme-30052024.pdf)
- [ITU national numbering plans](https://www.itu.int/ITU-T/inr/nnp/)
- [`libphonenumber-js` documentation](https://github.com/catamphetamine/libphonenumber-js)

The external browser could identify but not fetch the Ministry PDF (reported HTTP 502), so
prefix-level conclusions remain external and unverified here.

**Most defensible library candidate (external AI, unverified):**

```ts
const phone = parsePhoneNumberFromString(raw.trim(), "IL")
if (!phone || phone.country !== "IL" || !phone.isValid()) {
  // validation error
}
const e164 = phone.number
```

The answer recommends the full `max` metadata import because strict `isValid()` needs detailed
country patterns and the Phone method must not be mobile-only. It reports `libphonenumber-js`
`1.13.8` and an isolated `max` bundle around 48 KB gzip as of 2026-07-16, but neither number is
repo-verified. The exact supported import path must be taken from the version actually installed;
the external answer's `/max/es6` example should not be copied blindly.

Accept-form tests to run against the installed version, using a known-valid test/example number
rather than assuming every plausible digit sequence is allocated:

```text
05x-xxx-xxxx
05xxxxxxxx
+972 5x xxx xxxx
+9725xxxxxxxx
9725xxxxxxxx
00972 5x xxx xxxx
```

All accepted representations must produce one identical `+972…` value. Also test a landline and
a recognized `07` number if the product accepts all general Israeli contact numbers.

Reject classes:

```text
foreign country after parsing
unparseable text
possible length but invalid current Israeli digit/prefix pattern
short/service/star code
+972 with a duplicated domestic trunk zero
```

**Options and trade-offs:**

1. **`libphonenumber-js/max` in the shared schema.** One client/server contract and maintained
   numbering metadata; adds a dependency and client bundle cost because the current schema is
   imported by the client form.
2. **Small Israel-only parser/normalizer.** Small bundle and no dependency; the project owns prefix
   allocation updates, domestic/international parsing, and false-positive/false-negative risk.
3. **Strict library only on the server plus a lighter client rule.** Smaller client bundle, but
   creates two validation semantics and weakens the task's client/server-parity goal. The visitor
   can pass client validation and then receive a server rejection.

The answer's `isValid()` option reduces unusable submissions compared with `isPossible()`, at the
cost of possible temporary false rejection when a new range exists before metadata updates.

**Failure mode.** A hand-written "strip punctuation; replace leading 0" transform can normalize
garbage into a plausible value, accept unallocated ranges, mishandle foreign/`00972` input, or
double the trunk prefix. A too-strict mobile-only rule rejects valid call/WhatsApp destinations.

---

### Q2 — What the current repo makes a valid commit seam

#### 1. The proposed C1 contract / C2 UI split is not a naturally green seam

**Verified against the repo.**

- `RequestFormData` and `RequestFormInput` are inferred directly from `requestFormSchema`
  (`src/features/request/types/index.ts:1`).
- The current form directly registers and reads `email`, `phone`, and `contactOther`
  (`src/features/request/ui/RequestForm.tsx:50`, `:66`, `:156`, `:208`, `:424`).
- The server payload, route, and service call use the same old three names
  (`src/bff/request.ts:12`, `app/api/request/route.ts:84`, `src/services/db.ts:240`).

Replacing the schema with only `contactMethod` + `contactValue` in C1 while leaving the form for C2
removes keys that the form's inferred types and code still use. C1 therefore cannot pass typecheck
without temporary compatibility fields or simultaneous form changes.

The same coupling exists on the admin side:

- `AdminRequestDetail` currently exposes `contactOther`
  (`src/services/requests.ts:20`);
- `RequestDetail.tsx` reads it directly (`src/features/admin/ui/RequestDetail.tsx:126`).

Changing the DB/read DTO in C1 and deferring the admin component to C2 likewise either breaks
typecheck or requires an intentionally temporary DTO.

This is different from Block R: its migration changed the reference-code implementation while the
application/RPC signature remained unchanged. Block C changes the wire contract and RPC signature,
so a standalone applied migration is not equivalently isolated.

#### 2. Decomposition options

**Option C-A — one integrated cutover commit.**

Schema/config/normalizer + BFF + route + service/RPC migration + form + admin + i18n + tests land as
one green unit. Apply/verify the migration only when this entire cutover is ready.

- Benefit: no transient compatibility model; every inferred type and consumer changes together.
- Cost: largest review/commit surface, though Block C already has its own mandatory checkpoint.

**Option C-B — one safe preparatory commit, then one integrated cutover.**

The preparatory commit may add only pieces that do not change the active contract: the chosen
dependency, contact-method config/types, standalone handle/phone normalizers, and their tests. The
cutover commit then changes schema/BFF/route/form/services/admin/migration together.

- Benefit: gives the externally sensitive validation nucleus a small independently testable seam.
- Cost: the main cutover is still substantial; an unused helper/dependency exists briefly.

**Option C-C — compatibility-first multi-commit rollout.**

Add columns and a deliberately dual old/new contract first, deploy compatible backend support,
then switch the UI/admin, then remove `contact_other`/old compatibility in a later migration.

- Benefit: can avoid a live incompatibility window across separately deployed commits.
- Cost: temporary dual semantics, more migrations/tests, possible RPC-overload/routing complexity,
  and a larger deviation from the task's one-time test-data cutover. This option needs an explicit
  plan rather than emerging accidentally.

**Conclusion for the seam, not a verdict:** migration-as-its-own-applied-commit is unsafe unless it
is purely additive/compatible. Admin rendering belongs with the DTO/read-contract change, not
arbitrarily with the public form UI. The current C1/C2 proposal is viable only with compatibility
scaffolding; without that, C-A or C-B produces cleaner green commits.

#### 3. Live ordering hazard

**Verified against the repo + inference.** The live RPC currently has 13 parameters, including
`p_email`, `p_phone`, and `p_contact_other`
(`supabase/migrations/20260715124427_stage6_reference_code_format.sql:34`). The deployed-form code
still sends the old three fields. A migration replacing that signature with five contact params
before the new route/form is deployed makes old submissions fail; deploying new callers before the
new RPC/columns exist fails in the opposite direction.

Commit order, migration-application order, and deployment order are therefore separate decisions.
The task's live/test-data waiver removes the staging prerequisite; it does not make incompatible
intermediate states compatible. The implementation plan should state the coordinated cutover or
the compatibility mechanism explicitly.

#### 4. RPC/migration invariants that must survive the second recreation

**Verified against the repo.** The Block C migration must be based on the *current*
`20260715124427` function, not copied from `20260629154719`, or it will regress:

- the six-character ambiguity-free reference-code generator;
- the generate/insert retry loop;
- the distinction between reference-code collision and
  `requests_client_submission_id_key` idempotency race;
- `SET search_path = public, pg_temp`;
- file-row insertion and `{ id, referenceCode }` return shape.

The repo's earlier signature-changing migration explicitly drops the exact old signature and
recreates grants (`20260629154719_domain_foundation.sql:75`, `:183`). The new migration needs the
same discipline for the old 13-param and new signature:

- verify the live signature before applying (avoid an `IF EXISTS` silent no-op);
- remove/replace the intended old overload;
- revoke `PUBLIC`;
- grant `service_role`;
- verify `proconfig`/search path and Local=Remote parity afterward.

#### 5. Existing-row and DB-invariant hazard

**Verified against the repo.** The old schema permits any one **or several** of
`email`/`phone`/`contactOther`; its `superRefine` checks only that at least one exists
(`src/features/request/validation/schema.ts:64`). Therefore existing test rows cannot be assumed to
already satisfy "exactly one of five".

Before dropping/backfilling `contact_other` or adding an exactly-one constraint, query the live
distribution:

- rows with zero/one/multiple old contact values;
- actual `contact_other` shapes (Instagram vs. Telegram is not reliably inferable from arbitrary
  text);
- whether preserving test data matters or owner-approved deletion/reset is simpler.

**Model knowledge, unverified:** a database `CHECK` enforcing exactly one non-null among the five
columns would protect the decided invariant below the application layer. It also forces an explicit
disposition for historical rows. Omitting it keeps migration/backfill simpler but leaves the DB
able to hold zero/multiple methods even if TypeScript and Zod prevent that normally. This is an
implementation trade-off to surface, not silently decide.

#### 6. Prefer a one-value public/service contract over five independent optionals

**Verified against the repo + design inference.** The intended FormData shape is naturally:

```text
contactMethod
contactValue
```

and `requestDraft.ts` already reserves exactly that method/value pair in `SuccessPayload`
(`src/features/request/store/requestDraft.ts:40`). A discriminated contact value at the route/
service boundary can then map to the five nullable SQL params. Exposing five independent optional
arguments to `createRequest` mirrors storage but permits invalid zero/multi-method combinations in
TypeScript.

Two implementation shapes:

- **discriminated contact object in application/service code → five RPC params at the adapter:**
  stronger exactly-one invariant;
- **five optional service params:** mechanically direct, but relies on callers/tests to preserve
  exactly one.

This does not reopen the five-column persistence decision; it only determines where the storage
shape begins.

#### 7. Dynamic-field and normalization hazards

**Verified against the repo + inference.**

- A stable `contactValue` field avoids five stale registered values when the method changes. If the
  UI instead registers five field names, React Hook Form retention/unregistration must be handled
  explicitly so hidden methods are never submitted.
- Even with one stable field, changing `contactMethod` can reinterpret the prior value (an email
  becomes an Instagram candidate). Clear/reset `contactValue` on a real method change, or define
  and test an intentional preservation rule.
- The server must validate the selected method against the configured offered-method set, not only
  the global five-value enum; otherwise a caller can submit a method disabled for this studio.
- `PERSISTED_FIELDS` should become `contactMethod` + `contactValue`; the generic string bag in
  `requestDraft.ts` is deliberately schema-independent and is not a blocker.
- `FIELD_ORDER` should become `clientName` → `contactMethod` → `contactValue` → `eligibility`
  within the existing visual order, so server errors focus the rendered select/value correctly.

**Transform/raw-value hazard.** The shared Zod resolver currently passes transformed schema output
to `onSubmit`. If the schema strips `@` or converts a phone to E.164, `data.contactValue` is no
longer the exact string entered. FS §3.4 says Success echoes the value "as entered", while
persistence requires normalized values. Block C should preserve a raw display value separately
from the normalized persistence value (or explicitly leave that handoff for Item 4); it must not
make the existing `SuccessPayload.contactValue` incapable of meeting the Success requirement.

#### 8. Blocks R/A′/B′ compatibility summary

**Verified against the repo.**

- `DraftFields = Record<string, string>` is intentionally prepared for schema changes and is safe
  for `contactMethod`/`contactValue`.
- `SuccessPayload` is already method/value-shaped, which supports the new model.
- Eligibility is intentionally written to the legacy `consent` DB column and has a route regression
  test (`app/api/request/__tests__/route.test.ts:131`); no contact migration should rename that
  column. Only the admin presentation label changes.

## Response 1

Findings accepted — this pass changed the plan in four material ways, and caught one doc/fact
conflict I would otherwise have implemented wrong. Provenance discipline noted and honored: the
Instagram/Telegram/phone rules stay labelled external-unverified, and the parts that must become
**installed-version tests** (libphonenumber API/accept-forms) are carried into the task, not
assumed.

**What is usable as-is:**
- **Q1.1 Instagram — IG-A adopted.** `^[A-Za-z0-9._]{1,30}$` after trim + one optional `@`-strip.
  IG-B (dot-position rules) **rejected**: the research found no authoritative Meta grammar for it,
  so it would add unverified rules with false-rejection risk. IG-A implements exactly the fixed FS
  contract.
- **Q1.3 phone — library route adopted** (owner decision below). `parsePhoneNumberFromString(raw,
  "IL")` + `country === "IL"` + `isValid()`, persist `.number`. Codex's caution stands: the version,
  bundle size and import path are **not** repo-verified, so I will verify the installed package's
  actual API and prove the accept-forms (`05x…`, `+972…`, `972…`, `00972…` → one identical `+972…`)
  as tests against the installed version, not copy the example import path.
- **Q2 — my C1/C2 seam was wrong, and I'm dropping it.** The finding is decisive and repo-verified:
  `RequestFormData`/`RequestFormInput` are inferred from the schema, so a contract-only commit
  cannot typecheck while the form still registers `email`/`phone`/`contactOther`. Adopting **C-B**:
  a small preparatory commit (dependency + contact-method config/types + standalone handle/phone
  normalizers + their tests — none of which touch the active contract), then **one integrated
  cutover** (schema/BFF/route/services/migration/form/admin/i18n + tests) applied and verified
  together. Admin moves to the cutover with the DTO/read-contract, not to a UI commit — accepted.
- **Migration discipline — accepted in full.** The Block C migration will be derived from the
  **current** `20260715124427` body (6-char generator, retry loop, csid-vs-refcode discrimination,
  `SET search_path`, file rows, `{ id, referenceCode }`), not from `20260629154719`; it will drop
  the exact old 13-param signature (no `IF EXISTS` silent no-op), re-`REVOKE PUBLIC` + `GRANT
  service_role`, and verify `proconfig`/parity after.
- **Ordering hazard — accepted.** Commit order ≠ migration-application order ≠ deploy order. Since
  the cutover is one unit against a test-data DB, the plan is: land the cutover commit, then apply
  the migration, then verify live (CO-1). No compatibility window is needed because old rows are
  being deleted (owner decision below) and there is no separate deployed old client to protect.
- **Q2.6 one-value contract — adopted.** Wire/service shape is `contactMethod` + `contactValue`
  (which `SuccessPayload` already mirrors); the five nullable SQL params are produced at the
  service/adapter boundary from a discriminated value, so TypeScript cannot express zero/multi.
- **Q2.7 dynamic-field hazards — adopted.** One stable `contactValue` field (not five registered
  names); `contactValue` is cleared on a real method change; the server validates the method against
  the **configured offered set**, not just the enum; `PERSISTED_FIELDS` → `contactMethod`/
  `contactValue`; `FIELD_ORDER` → `clientName` → `contactMethod` → `contactValue` → `eligibility`.
- **Transform/raw-value hazard — adopted, important catch.** The Zod resolver hands `onSubmit` the
  *transformed* value, so a `@`-stripped/E.164-normalized `contactValue` is no longer "as entered"
  (FS §3.4 requires the Success echo to show it as entered). Block C will keep the raw entered value
  available alongside the normalized one so `SuccessPayload.contactValue` can still meet §3.4 when
  Item 4 consumes it.

**Owner decisions taken on the strength of these findings (2026-07-16):**
1. **Telegram validated Telegram-correctly**, not "same shape as Instagram" — `^(?![0-9])[A-Za-z0-9_]{5,32}$`
   (TG-B: permits a leading underscore, enforces every reported rule, smallest false-rejection risk
   among the verified constraints). This **contradicts the recorded decision's wording**, so the doc
   is corrected, not the code bent to it: FS §4.2 field 10e and PROJECT_DECISIONS.md → "Stage 6
   Contact Model" are amended to state the Telegram-correct rule and why (docs-first, PRD §9).
2. **`libphonenumber-js` (max metadata) adopted** as a new dependency, used isomorphically in the
   shared schema (option 1) — one client/server contract, at the cost of client bundle weight. The
   server-only variant (option 3) was rejected for creating two validation semantics, exactly the
   parity the task exists to hold.
3. **Existing test rows deleted** rather than backfilled, enabling the DB `CHECK` for "exactly one
   of five" from the start (Q2.5's invariant, taken rather than omitted). The data is test-only
   (5A.3 classification). Deletion gets its own explicit owner approval at apply time, separate from
   the migration approval.

**Still to verify at implementation time (not assumptions):** the installed `libphonenumber-js`
version's real API/import path and accept-form behavior; the live row distribution before deletion.

### Итог для владельца (RU)

Ресёрч окупился — поймал 4 вещи, которые я бы сделал неправильно:
1. **Telegram ≠ Instagram** по правилам (5–32, без точек, не с цифры). Решение в доке говорило «как
   Instagram» — это фактическая ошибка в доке. Правлю **док** (FS + PROJECT_DECISIONS), код делаю
   корректно.
2. **Моя разбивка C1/C2 не собралась бы** — типы выводятся из схемы, контракт нельзя поменять
   отдельно от формы. Беру план C-B: маленький подготовительный коммит (зависимость + нормализаторы
   + тесты) → один цельный cutover (схема+BFF+миграция+форма+админка вместе).
3. **Миграцию надо делать от `20260715124427`**, иначе потеряю 6-значный генератор кода и
   search_path — Кодекс прямо это подсветил.
4. **Success-эхо «как ввёл»**: нормализованное значение (E.164/@-strip) ≠ введённое — надо хранить
   оба, иначе Item 4 сломает FS §3.4.

Твои решения зафиксированы: Telegram-корректно, `libphonenumber-js/max`, старые тестовые строки
удаляем + ставим CHECK «ровно один контакт».

## Outcome

Filed into durable docs (a research thread never decides — the owner decided on the strength of
these findings, and the outcomes land where work lives):

1. **PROJECT_DECISIONS.md → "Stage 6 Contact Model"** — amended with the three owner decisions above
   (Telegram-correct rule superseding the "same shape as Instagram" wording; `libphonenumber-js`
   isomorphic E.164; delete-old-rows + `CHECK` exactly-one), each pointing at this thread.
2. **STAGE_6_FUNCTIONAL_SPECIFICATION.md §4.2 field 10e** — Telegram validation corrected (docs-first
   before implementation, PRD §9).
3. **`docs/project/tasks/STAGE_6_TASK_03_request_form_rebuild.md`** — Block C's implementation notes:
   the C-B decomposition (prep commit → integrated cutover), the migration-derivation discipline
   (from `20260715124427`), the raw-vs-normalized Success-echo requirement, the configured-method
   server check, and the installed-version verification duties.

The implementation itself is Task 03 Block C (this IMPL session), against those records.
- The current reference-code migration is the canonical function body Block C must preserve.
- The admin size/color label additions are presentation-only, but the contact rendering must move
  with the DTO change for a green commit.

No quality gates were run: this was a read-only research pass, and no execution-affecting file was
changed.
