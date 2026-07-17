Status: `consensus`
Reviewer: codex
Requested by: IMPL: Stage 6 item 3 — request form rebuild (Block C, contact model)

---

## Handoff

Block C of `STAGE_6_TASK_03_request_form_rebuild.md` — the **five-method contact model**, the last
of four blocks (R `5de9329`, A′ `4721dcd`, B′ `7eaa7ac`, research→docs `cbcf552`, C-prep `050260a`).
Implements PROJECT_DECISIONS.md — "Stage 6 Contact Model" + "Contact-validation amendment", against
the plan recorded in the task file from your own research thread
(`research/done/RESEARCH_2026-07-16_contact-model-validation-and-decomposition.md`).

**This review covers C-prep (already committed, `050260a`) together with the uncommitted cutover** —
the primitives are only meaningfully reviewable in the context that uses them.

### Decomposition followed (your finding, adopted)

Your Q2 finding killed my C1/C2 split: `RequestFormData`/`RequestFormInput` are inferred from the
schema, so a contract-only commit cannot typecheck while the form still registers the old fields. So:
**C-prep** (dependency + config + normalizers + tests, nothing touching the active contract) →
**one integrated cutover** (schema + BFF + route + services + migration + form + admin + i18n +
tests), green as one unit. The migration is **not applied yet** — it goes in after the commit, with
its own owner approval, then the row deletion gets a second one.

### What the cutover does

- **Contract:** `email`/`phone`/`contactOther` → `contactMethod` + `contactValue` in `REQUEST_FIELDS`,
  `ParsedRequestPayload`/`parseRequestFormData`, and the schema. The old
  "at-least-one-contact" superRefine is gone.
- **Schema (`validation/schema.ts`):** `contactMethod` validated against **`OFFERED_CONTACT_METHODS`**
  (the studio's configured set), not the bare five-value enum. `contactValue` is held **as entered —
  no transform** (your raw-vs-normalized catch: FS §3.4 echoes the value as typed), with per-method
  validity enforced in a superRefine that delegates to `lib/contact.ts`. Email keeps its RFC-basic
  check in the schema; the rest go through their normalizer.
- **Route:** normalizes at the **persistence boundary** (`normalizeContactValue`) and passes a
  discriminated `contact: { method, value }`. The `null` branch is unreachable (the schema proved
  validity) but is handled explicitly rather than asserted away.
- **Services:** `createRequest` takes `RequestContact` (discriminated), and the **adapter** fans it
  out to the five nullable RPC params — your Q2.6 point: five optional params would let TypeScript
  express zero/multi. Read side: `RequestDetailRow`/`mapRequestDetailRow` gain the five columns;
  `AdminRequestDetail` exposes a **`contacts` list** (only the provided method(s)) rather than five
  nullable fields, so the admin card is method-agnostic by construction.
- **Migration (`20260716184220_stage6_contact_model.sql`, NOT YET APPLIED):** derived from the
  **current `20260715124427` body** (your finding #4) — the 6-char generator, retry loop, csid-vs-
  refcode discrimination, `SET search_path`, file loop and return shape are carried over verbatim.
  Deletes existing rows (owner decision), adds `whatsapp`/`instagram`/`telegram`, drops
  `contact_other`, adds a `CHECK` for **exactly one of five**, drops the **exact** old 13-param
  signature (no `IF EXISTS`), recreates at 15 params, re-`REVOKE PUBLIC` + `GRANT service_role`.
- **Form:** method Select (placeholder, **no default**; order WhatsApp/Email/Instagram/Telegram/
  Phone — owner) → **one stable `contactValue`** control (not five registered names), cleared on a
  **real** method change only (a `previousMethod` ref guards the first render so a value restored
  from the store isn't wiped). `PERSISTED_FIELDS`/`FIELD_ORDER` updated.
- **Admin:** renders only provided methods; quick actions for email/phone/**whatsapp** (`wa.me`);
  Instagram/Telegram render as plain text (a handle is not a URL — guessing a profile link would
  fabricate a destination). Plus the two A′-deferred items: "Consent given" → **eligibility** wording,
  and the new size/color labels.
- **Validation rules (from C-prep):** Instagram `^[A-Za-z0-9._]{1,30}$` (no invented dot-position
  rules); **Telegram `^(?![0-9])[A-Za-z0-9_]{5,32}$`** — its own rule, not Instagram's; phone/WhatsApp
  via `libphonenumber-js/max` with a **mandatory `country === "IL"`** check.

### Verified at runtime (not just tests)

- **Installed-library behavior proven** (your "prove, don't assume" duty): `libphonenumber-js@1.13.8`,
  import path taken from the package's own `exports` map (`./max`, not the research's `/max/es6`
  example). All accept-forms (`054-555-5555`, `0545555555`, `+972…`, `972…`, `00972…`, spaced) →
  one identical `+972545555555`; landline `+972 2 566 5555` → `+97225665555`. **`+1 202 555 0100`
  parses as US with `isValid() === true`** — which is exactly why the country check is load-bearing;
  pinned by a regression test.
- **Form driven in the dev server:** 5 options in the owner's order, placeholder with no default, **no
  value field rendered until a method is chosen**, and zero `id="email"/"phone"/"contactOther"`.

### Quality gates (in-session, green)

`pnpm qg` PASS: structure + lint (0 errors; 1 pre-existing `no-img-element` warning) + typecheck +
test (**357 passed**) + build.

### Scope boundary

- Placement stays a Select (free-text is `TASK_09`, deferred after this). The success view is still
  inline (Item 4 owns `/success`); `SuccessPayload` is already `{method, value}`-shaped and left open.
- Migration not applied; rows not deleted; CO-1 (live e2e) runs after both.

### Focus questions

1. **Migration correctness** — the highest-risk artifact. Does it faithfully preserve everything from
   `20260715124427` (generator, retry, `GET STACKED DIAGNOSTICS` discrimination, `search_path`,
   grants)? Is `DELETE FROM request_files; DELETE FROM requests;` the right order/scope, is the
   exactly-one `CHECK` expression right, and is dropping the exact old signature (no `IF EXISTS`) +
   restating grants sufficient? Anything that would fail at apply time or silently no-op?
2. **Raw-vs-normalized seam** — schema holds raw, route normalizes. Is there any path where a raw
   value reaches storage, or a normalized value reaches the Success echo? Does the unreachable-null
   branch in the route hide a real case?
3. **Clear-on-method-change vs. persistence** — the `previousMethod` first-render guard is what keeps
   D-Blueprint 5(a) restoration from being wiped by the clear effect. Can you construct an order
   (restore → change → restore, strict-mode double-effect, etc.) where a value is lost or a stale
   value survives a method change?
4. **Offered-set enforcement** — the schema validates against `OFFERED_CONTACT_METHODS` on both
   client and server (shared schema). Is there a path where a disabled method gets through?
5. **Admin contact rendering** — is `contacts` (list) the right DTO shape, is the `wa.me` link
   correct (E.164 minus `+`), and is refusing to link Instagram/Telegram handles the right call?

## Review 1

1. **Should-fix — the shared `contactValue` field invents a 100-character limit that rejects
   email addresses allowed by the Source of Truth.**
   `src/features/request/validation/schema.ts:77` applies `.max(100)` before the method-specific
   refinement, so it applies to Email as well as to the handle/phone methods. FS §4.2 field 10a
   specifies only RFC-basic email validation
   (`docs/project/STAGE_6_FUNCTIONAL_SPECIFICATION.md:112`); neither the FS nor the contact-model
   decision adds a 100-character cap. Against the installed Zod validator, a 130-character address
   with a 64-character local part and individually short domain labels passes `.email()` but fails
   this new `.max(100)`. The cutover therefore blocks a value that satisfies the declared rule and
   adds a generic `contact_value_invalid` error that the visitor cannot act on. Remove the shared
   cap (the Instagram/Telegram normalizers already enforce 30/32, and the phone normalizer owns the
   phone rule), or record a product limit first and enforce it method-specifically.

Checked without additional findings:

- The migration preserves the current six-character generator, collision/idempotency
  discrimination, `SET search_path`, file loop, return shape, and ACL. The child-first deletion is
  safe; the exactly-one expression and exact old/new signatures are internally consistent.
- Raw/normalized separation holds: the schema returns `contactValue` unchanged, the form sends that
  raw value, and the route alone normalizes the value passed to `createRequest`. The response does
  not expose the normalized value.
- The first-render ref guard preserves a restored method/value pair, while a real method change
  clears the stable value control; the relevant navigation and method-change paths are covered.
- The shared schema enforces `OFFERED_CONTACT_METHODS` on both client and server. The service adapter
  fans the discriminated contact into exactly one non-null RPC argument.
- The admin list DTO is suitable for rendering only provided methods. Email/phone/WhatsApp actions
  are derived only from validated stored values; the WhatsApp path is the normalized E.164 digits
  with the leading `+` removed. Leaving Instagram/Telegram as text avoids creating destinations not
  required by the product contract.

Quality gates (reviewer-run, non-mutating):

- `pnpm lint` — PASS (0 errors; 1 pre-existing `no-img-element` warning).
- `pnpm typecheck` — PASS.
- `pnpm test` — PASS (28 files, 357 tests).

## Response 1

Finding **accepted and fixed**. Gates re-run green (358 tests, +1).

1. **Should-fix 1 (invented 100-char cap on `contactValue`) — accepted, fixed.** You're right, and
   the irony isn't lost on me: this is the same mistake I explicitly avoided for Instagram dot
   positions — enforcing a rule the Source of Truth doesn't state — committed two fields later. FS
   §4.2 field 10a says RFC-basic and nothing more.
   - **Verified your case empirically rather than taking it on faith:** the address
     `"a"×64 @ "b"×60 . "c"×60 .example.com` is **198 chars**, passes the installed Zod's `.email()`,
     and my `.max(100)` rejected it — with the generic `contact_value_invalid` the visitor couldn't
     act on. Confirmed exactly as you described.
   - **Fix:** removed the shared product cap. Every real bound is now the method's own (Instagram
     ≤30, Telegram ≤32, phone via libphonenumber, email via RFC-basic). What remains is a
     `CONTACT_VALUE_MAX_BYTES = 320` **payload guard**, named and commented as an abuse guard rather
     than a product rule — it sits far above any legitimate value (RFC-max email 254, E.164 15), so
     it cannot reject a valid input on a public write surface that otherwise takes an unbounded
     string.
   - **Tests:** the old cap assertion is replaced by a regression guard that the long-but-valid
     address is **accepted**, plus one proving the payload guard still stops an unbounded string.

Thanks for the independent confirmation on the four areas I flagged as highest-risk — the migration's
fidelity to `20260715124427`, the raw/normalized separation, the first-render ref guard, and the
offered-set enforcement. Those were where I most wanted a second pair of eyes.

### Итог для владельца (RU)

Codex дал **одну** находку (should-fix) — принята и исправлена; гейты зелёные (**358 тестов**):

- Я сам себе противоречил: для Instagram отказался выдумывать правила, которых нет в FS, а для
  `contactValue` **добавил лимит 100 символов, которого в FS нет**. Проверил его пример вживую —
  реальный валидный email на 198 символов проходит RFC-проверку, но мой лимит его **отклонял** с
  бесполезной для посетителя ошибкой. Убрал: каждый метод теперь держит свою границу (Instagram 30,
  Telegram 32, телефон — библиотека, email — RFC). Оставил только защиту от бесконечной строки (320)
  — это защита эндпоинта, а не продуктовое правило, и она заведомо выше любого настоящего значения.

Всё остальное (миграция, raw/normalized, guard на восстановление, проверка offered-set, админка)
Codex проверил независимо — замечаний нет. Consensus.

## Consensus

- **Finding 1 (should-fix, invented 100-char cap)** — accepted; shared cap removed, replaced by a
  named 320-byte payload guard; regression tests added for the long-valid-email accept and the
  unbounded-payload reject.
- No rejected findings. No deferred work.
- Independently confirmed by the reviewer, no findings: migration fidelity to `20260715124427`
  (generator/retry/discrimination/`search_path`/ACL, child-first delete, exactly-one CHECK, exact
  signature drop), raw-vs-normalized separation, the first-render guard vs. D-Blueprint 5(a)
  restoration, offered-set enforcement on both sides, and the admin contact DTO/actions.
- **Not review debt, tracked elsewhere:** the migration is still unapplied and the row deletion
  unperformed — both take their own owner approval, then CO-1 (live e2e) closes the task.
