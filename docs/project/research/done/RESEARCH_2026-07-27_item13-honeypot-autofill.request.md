# External research request: browser/password-manager autofill risk for an off-screen honeypot

Date: 2026-07-27

We need a narrowly scoped, evidence-based answer about current browser and password-manager
behavior. Please research using current primary sources and/or reproducible tests. Do not review
the application generally and do not propose a code change.

## Exact implementation

The public request form contains this honeypot:

```tsx
<input
  ref={honeypotRef}
  type="text"
  name="website"
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  defaultValue=""
  style={{
    position: "absolute",
    left: "-9999px",
    width: "1px",
    height: "1px",
    opacity: 0,
  }}
/>
```

It has no `hidden` attribute and is not `display:none`; it is an ordinary text input positioned
off-screen. It is inside a larger form containing conventional visible fields including a person's
name, email, telephone/WhatsApp number, Instagram handle, and Telegram username. Exactly one contact
value field is shown at a time.

On submit, the browser's `FormData` is sent. The server trips the honeypot only when:

```ts
const honeypot = formData.get("website")
if (typeof honeypot === "string" && honeypot.trim() !== "") {
  // Return fake success and persist nothing.
}
```

Therefore an empty string, missing field, or whitespace-only value is harmless. The only question is
whether software can write non-empty text into this field without a legitimate visitor deliberately
interacting with it.

## Questions

1. In current stable Chrome/Chromium, Safari/WebKit, and Firefox, can built-in autofill plausibly
   populate this exact field despite `autocomplete="off"`, given its `name="website"`, off-screen
   CSS, `tabindex="-1"`, and `aria-hidden="true"`? Distinguish standards-required behavior from
   browser heuristics and documented exceptions.
2. Can common current password managers plausibly populate it? Cover at least 1Password, Bitwarden,
   and LastPass if reliable evidence exists. Distinguish page-load automatic fill from a user
   explicitly invoking "fill".
3. Does the field name `website` itself raise or lower risk? Is it recognized as a URL/profile field
   by browser or manager heuristics?
4. Give a plain sizing conclusion for a normal real visitor:
   - **plausible false positive**, or
   - **effectively unreachable**.
   Explain the threshold you use. Do not equate "not guaranteed impossible" with "plausible".

## Evidence requirements

- Prefer current official browser/password-manager documentation, specifications, source-code issue
  trackers, or a clearly described reproducible test on current stable versions.
- Cite direct links and dates/version numbers where available.
- Separate verified facts, test observations, and inference.
- If evidence is missing for a named product, say so rather than generalizing from another product.
- Keep the answer focused on whether this exact input can receive non-empty unsolicited text.
