## Conclusion

For the exact input shown, a non-empty value inserted without the visitor intentionally interacting with that field is **effectively unreachable for ordinary built-in browser autofill**.

A false positive becomes **plausible only in a narrower password-manager scenario**: the visitor explicitly asks a manager to fill an Identity/profile item across the form, and that manager treats the off-screen `website` input as a fillable website/URL identity field. Among the products reviewed, 1Password provides direct official evidence that it sometimes fills hidden identity fields under controlled conditions. Bitwarden supports explicit identity filling and name-based custom-field matching, but I found no current evidence proving that this exact off-screen field would be populated. Reliable field-level evidence was not found for LastPass.

Therefore, for a **normal real visitor who merely loads and completes the form**, the appropriate sizing is:

> **Effectively unreachable**, not a plausible false positive.

This conclusion does not mean mathematically impossible. It means there is no supported, ordinary browser path—and no documented default password-manager path—that is reasonably likely to write non-empty text into this particular input.

## Scope and evidence limits

This assessment is current to **July 27, 2026**. Chrome desktop stable was in the Chrome 150 rollout, with Chrome 151 available to an early-stable cohort. ([Chrome Releases][1])

I did not have instrumented installations of every browser/extension combination available in this environment, so the browser-specific conclusions below combine specifications, current official documentation, and implementation/source evidence. They should not be represented as a full cross-platform laboratory test matrix.

## 1. Built-in browser autofill

### Standards-level behavior

`autocomplete="off"` is a request to the user agent not to automatically complete the field. It is not a security boundary or an unconditional prohibition.

The HTML autofill model gives browsers discretion over automatic filling and defines semantic autofill tokens such as `name`, `email`, `tel`, and `url`. Your field supplies `off`, so it has **no author-declared URL semantic**. Its `name="website"` is merely a control name unless a browser’s heuristics independently classify it. ([html.spec.whatwg.org][2])

Current documentation states that browsers may ignore `autocomplete="off"` particularly for suspected login credentials. The documented exception concerns usernames and passwords, not arbitrary profile fields inside a non-login request form. ([MDN Web Docs][3])

The other attributes have different purposes:

- `tabIndex={-1}` removes the field from sequential keyboard navigation. It does not normatively disable autofill.
- `aria-hidden="true"` removes it from accessibility exposure. ARIA does not define autofill eligibility.
- Off-screen positioning and zero opacity affect visibility, but the field remains a successful form control and remains in `FormData`.

Thus, none of those attributes alone creates a standards-required autofill prohibition. The risk reduction comes from browser heuristics: the control is invisible, has `autocomplete="off"`, is not a recognized login field, and does not belong to a coherent visible address/profile section.

### Chrome / Chromium

Chrome Autofill fills saved addresses and related personal data by classifying form fields and grouping them into recognized forms. Chrome’s DevTools Autofill panel explicitly exposes the browser’s predicted field-to-value mapping, confirming that classification is heuristic rather than based only on `autocomplete` tokens. ([Chrome for Developers][4])

Current Chrome also has “Enhanced autofill,” which may fill more fields than traditional address autofill, although Google cautions that not all forms are compatible. That increases the general importance of heuristic classification, but it is not evidence that Chrome fills invisible arbitrary text controls. ([Поддержка Google][5])

For this field:

- `autocomplete="off"` weighs against ordinary address autofill.
- `website` is not one of the normal postal-address values Chrome stores and fills as part of a conventional address profile.
- The field is physically off-screen, one pixel large, and fully transparent.
- It appears alongside stronger, visible fields such as name, email, and telephone, while the honeypot itself has no visible label.

I found no current Chromium source, official test, or issue demonstrating Chrome address autofill placing a personal URL into an invisible `name="website"` field configured this way.

**Assessment:** technically not standards-forbidden, but **not a plausible Chrome built-in autofill false positive**.

Chrome password autofill is even less relevant: this form has no password field and the honeypot does not resemble a username field in a username-only login form.

### Firefox

Firefox distinguishes several providers, including Login Manager, Form Autofill, and Form History. Its source shows that address autofill first identifies recognized field types and treats address fields as a valid section rather than filling every text input in the form. ([Searchfox][6])

Firefox’s password-manager source also applies form-level username detection. A username-only form must have no password field and essentially one username-compatible candidate that looks like a username or belongs to a login-like form. Your larger request form, containing multiple conventional identity/contact fields, does not satisfy that pattern. ([Searchfox][7])

Firefox may heuristically identify fields without explicit autocomplete tokens, but its telemetry distinguishes fields identified by proper autocomplete attributes from fields found through regex-based heuristics. That confirms theoretical heuristic classification, not indiscriminate filling. ([Searchfox][8])

I found no current Firefox evidence that an off-screen, transparent, `autocomplete="off"` text input named `website` is populated during ordinary address, form-history, or login autofill.

**Assessment:** **not a plausible built-in Firefox false positive**.

### Safari / WebKit

Apple documents Safari AutoFill categories for:

- contact-card information,
- usernames and passwords,
- credit cards, and
- certain other saved form information. ([Поддержка Apple][9])

WebKit itself exposes autocomplete semantics, while Safari supplies the product-level autofill behavior. A WebKit implementation discussion explicitly notes this division: WebKit provides the attribute machinery, but embedding browsers such as Safari perform the actual autofill. ([WebKit Bugzilla][10])

Apple’s public documentation does not describe exact field-visibility rules or whether Safari honors `autocomplete="off"` for every contact field. I also found no current Safari/WebKit issue or test proving that Safari fills an off-screen `website` text field in a mixed contact form.

Since a website URL is not a normal core contact-card field in the same sense as name, email, phone, or postal address, and because this field is invisible and explicitly marked `off`, Safari has no evident ordinary reason to populate it.

**Assessment:** implementation details are less publicly documented than Chromium or Firefox, but **ordinary Safari autofill remains effectively unlikely rather than plausibly risky**.

## 2. Password managers

A key distinction is necessary:

1. **Automatic/page-load fill:** the extension fills immediately or after a normal login-field interaction.
2. **Explicit fill:** the user opens the extension, chooses an item, invokes a keyboard shortcut, or selects “Autofill identity.”

The second mode is intentionally broader and creates the only meaningful edge case here.

### 1Password

1Password provides the strongest relevant official evidence.

Its security documentation says it uses multiple checks to avoid filling hidden fields, **but may fill hidden Identity fields** when they meet certain criteria and another visible field of a similar kind exists. This exists to support conditional or dynamic forms. ([1Password][11])

That statement materially changes the answer for explicit Identity filling:

- Your form contains several visible identity fields.
- `website` can semantically resemble an identity/profile field.
- The honeypot is hidden visually but is not `display:none` or `hidden`.
- A user who explicitly chooses an Identity item could cause 1Password to inspect the whole form.

However, the documentation does not disclose the exact classification criteria, and it does not establish that the literal field name `website` qualifies. It also does not say hidden identity fields are filled merely on page load.

1Password’s normal filling is user-mediated through its popup, inline menu, or keyboard shortcut. Its documentation describes selecting Autofill or invoking the shortcut as explicit actions. ([1Password][12])

**Assessment:**

- **Page-load unsolicited fill:** not supported by the evidence.
- **Explicit Identity fill:** **plausible**, though unverified for this exact field.
- **Explicit Login fill:** implausible; the field is not part of a credential form.

This is the most credible route to a non-empty false positive.

### Bitwarden

Bitwarden explicitly supports filling Identity items across forms. A user may choose an Identity from the extension, context menu, or configured keyboard shortcut. ([Bitwarden][13])

Bitwarden also supports custom fields that can be matched to form field names. Its issue tracker shows that explicit identity/custom-field filling is affected by field names and IDs, and can target nonstandard fields. ([GitHub][14])

An old Bitwarden issue confirms that the extension has historically ignored `autocomplete="off"` for credential fields. That is relevant only as proof that `off` is not necessarily an extension-level hard barrier; it does not establish current identity-field or hidden-field behavior. ([GitHub][15])

I found no current official statement or source-backed test showing whether Bitwarden:

- excludes inputs based on off-screen geometry or opacity,
- fills invisible Identity fields,
- maps `name="website"` to an Identity website value by default, or
- would populate this field during an explicit whole-form Identity fill.

**Assessment:**

- **Page-load automatic fill:** no reliable evidence that this field would be filled.
- **Explicit Login fill:** highly unlikely.
- **Explicit Identity/custom-field fill:** theoretically possible, but evidence is insufficient to call this exact field plausibly affected without a matching custom field or a reproducible test.

Bitwarden therefore creates a weaker edge case than 1Password.

### LastPass

LastPass supports:

- login autofill,
- form-fill/identity items,
- manually triggered fill, and
- custom form fields associated with saved items. ([LastPass Support][16])

That means LastPass has the general capability to populate arbitrary non-credential form fields when a saved Form Fill or custom-field item matches.

However, I found no reliable current documentation or source evidence specifying:

- whether invisible/off-screen inputs are excluded,
- whether `autocomplete="off"` is honored for identity fields,
- whether `website` is a built-in recognized form-fill field, or
- whether explicit whole-form fill includes a field styled exactly this way.

**Assessment:** capability exists in principle, but the evidence is **insufficient to classify this exact field as plausibly fillable**. It should not be generalized from 1Password’s documented hidden-field behavior.

## 3. Effect of `name="website"`

### Standards meaning

`website` is **not** a standardized autofill field token.

The standardized token for a URL is:

```html
autocomplete="url"
```

Because your input says `autocomplete="off"`, the browser receives no author-supplied declaration that it contains a URL. ([html.spec.whatwg.org][2])

### Heuristic meaning

The literal name still has semantic weight for software that examines:

- `name`,
- `id`,
- labels,
- nearby text,
- form structure, or
- custom-field names.

`website` is a clear English synonym for a URL/profile-webpage field. Therefore, compared with a random name such as `fax_extra_17`, it **raises heuristic classification risk**.

But it is not especially dangerous for built-in browser address autofill because:

- browsers generally fill known saved data types;
- a personal website URL is not a universally populated address-profile datum;
- the field lacks a visible label and is visually hidden;
- `autocomplete="off"` directly contradicts autofill; and
- the form contains more obvious visible contact targets.

The name matters more for password managers that support Identity items or custom field-name matching. In such managers, `website` is a plausible match for a stored URL or website property.

So the net answer is:

- **Built-in browser risk:** slightly higher than a meaningless name, but still very low.
- **Explicit Identity-manager fill risk:** meaningfully higher, especially if the identity item contains a website value or custom field named `website`.

## 4. Risk sizing

### Threshold used

I classify something as a **plausible false positive** when all of these are true:

1. It occurs through a normal, supported user workflow—not a contrived extension configuration or custom script.
2. The relevant product is documented or reproducibly observed to target this class of field.
3. The workflow is common enough that a normal visitor could reasonably trigger it.
4. No additional deliberate customization specifically matching the honeypot is required.

I use **effectively unreachable** where theoretical discretion remains, but the known product behavior provides no ordinary path likely to write a non-empty value.

### Final sizing

#### Normal visitor using browser autofill

**Effectively unreachable.**

The visible name, email, and telephone fields may be filled. There is no evidence that Chrome, Safari, or Firefox ordinarily extends that operation to this invisible `autocomplete="off"` text input solely because its name is `website`.

#### Normal visitor using a password manager for login credentials

**Effectively unreachable.**

This is not a login form and the field does not look like a password or credible username target.

#### Visitor explicitly choosing “Fill Identity” / “Fill personal information”

This is the exception:

- **1Password:** plausible, because 1Password officially acknowledges filling qualifying hidden Identity fields when related visible fields exist.
- **Bitwarden:** possible but not established for this exact field.
- **LastPass:** evidence missing.

Across the full real-user population, this remains a rare, intentional whole-form-fill edge case rather than an unsolicited routine event.

## Bottom line

The implementation does not present a **plausible autofill false-positive risk for ordinary visitors**. The honest classification is:

> **Effectively unreachable in normal use.**

The only evidence-backed qualification is that a visitor who **explicitly invokes 1Password Identity autofill** may plausibly cause a hidden identity-like field to receive a value. Because that requires a deliberate password-manager action and an undisclosed successful field-classification match, it does not raise the overall risk to “plausible false positive” for the normal visitor population.

[1]: https://chromereleases.googleblog.com/2026/?utm_source=chatgpt.com "Chrome Releases: 2026"
[2]: https://html.spec.whatwg.org/?utm_source=chatgpt.com "HTML Standard - Web Hypertext Application Technology ..."
[3]: https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Turning_off_form_autocompletion?utm_source=chatgpt.com "How to turn off form autocompletion - Security - MDN Web Docs"
[4]: https://developer.chrome.com/blog/new-in-devtools-124?utm_source=chatgpt.com "What's new in DevTools, Chrome 124 | Blog"
[5]: https://support.google.com/chrome/answer/142893?co=GENIE.Platform%3DDesktop&hl=en-GB&utm_source=chatgpt.com "Fill in forms automatically in Chrome - Computer"
[6]: https://searchfox.org/firefox-main/source/toolkit/actors/AutoCompleteParent.sys.mjs?utm_source=chatgpt.com "AutoCompleteParent.sys.mjs - mozsearch"
[7]: https://searchfox.org/firefox-main/source/toolkit/components/passwordmgr/LoginManagerChild.sys.mjs?utm_source=chatgpt.com "LoginManagerChild.sys.mjs - mozsearch"
[8]: https://searchfox.org/firefox-main/source/toolkit/components/telemetry/Events.yaml?utm_source=chatgpt.com "Events.yaml - mozsearch"
[9]: https://support.apple.com/guide/iphone/fill-in-forms-iphccfb450b7/ios?utm_source=chatgpt.com "Fill in personal information in Safari on iPhone"
[10]: https://bugs.webkit.org/show_bug.cgi?id=150731&utm_source=chatgpt.com "150731 – Implement support for the autocomplete attribute"
[11]: https://support.1password.com/browser-autofill-security/?utm_source=chatgpt.com "About the security of 1Password Autofill in your browser"
[12]: https://support.1password.com/autofill-confirmation/?utm_source=chatgpt.com "Manage autofill confirmation prompts"
[13]: https://bitwarden.com/help/auto-fill-card-id/?utm_source=chatgpt.com "Autofill Cards & Identities"
[14]: https://github.com/bitwarden/clients/issues/8300?utm_source=chatgpt.com "Auto-fill for a custom field with a specific name is not working"

[15]: https://github.com/bitwarden/clients/issues/979?utm_source=chatgpt.com "autocomplete=\"off\" gets ignored fills passwords but shouldn't"
[16]: https://support.lastpass.com/s/document-item?_LANG=enus&bundleId=lastpass&language=en_US&topicId=LastPass%2Flastpass_for_android_autofill_overview.html&utm_source=chatgpt.com "LastPass Password Manager app for Android autofill ..."
