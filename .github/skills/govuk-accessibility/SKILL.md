---
name: govuk-accessibility
description: WCAG 2.2 AA compliance and GOV.UK Design System patterns for government services. Use when writing or reviewing React/JSX components, HTML, SCSS, or any user-facing UI in a GOV.UK Frontend service. Activates for accessibility, forms, focus, contrast, and screen-reader concerns.
license: OGL-UK-3.0
metadata:
  author: mmo-fes
  version: "1.0"
compatibility: Requires GOV.UK Frontend 5.x or later
---

# GOV.UK Accessibility

UK government services must meet WCAG 2.2 Level AA under the [Public Sector Bodies Accessibility Regulations 2018](https://www.legislation.gov.uk/uksi/2018/952/made). Apply the guidance below when generating or reviewing any user-facing code. This service renders UI with React/JSX and GOV.UK Frontend components.

## Core principle

Prefer native HTML over ARIA. Use semantic elements (`<button>`, `<nav>`, `<main>`, `<fieldset>`, `<table>`) before reaching for `aria-*` attributes. ARIA supplements HTML — it does not replace it.

## GOV.UK Design System first

Use GOV.UK Frontend components/patterns for all standard UI (buttons, inputs, radios, checkboxes, date inputs, error summary, notification banner, tables, tags, breadcrumbs, pagination). Do not hand-roll custom HTML/CSS for a component the design system already provides. Reuse the project's existing GOV.UK component wrappers rather than duplicating markup.

## Forms

Every form must:

1. Associate every input/select/textarea with a visible `<label>` via `for`/`id` (or wrapping)
2. Group related inputs (radios, checkboxes) in a `<fieldset>` with a `<legend>`
3. Mark required fields with `required` and indicate them in the visible label text
4. Set `autocomplete` on personal-data fields: `name`, `email`, `tel`, `postal-code`, `bday-day`/`bday-month`/`bday-year`
5. Use GOV.UK Frontend form components rather than bare HTML

## Error handling

When a submission fails:

1. Show a GOV.UK error summary at the top of the page, before the form
2. Link each summary error to its field via the field `id` (`href="#field-id"`)
3. Show an inline error message on the individual field (linked with `aria-describedby`)
4. Move focus to the error summary on load (GOV.UK Frontend does this via `data-module="govuk-error-summary"`)

## Headings and page structure

- One `<h1>` per page — the first visible heading, matching the `<title>`
- Logical heading hierarchy — never skip levels (h1 → h2, not h1 → h3)
- Landmark regions: `<main>`, `<nav>`, `<header>`, `<footer>`
- `<title>` pattern: `Page name — Service name — GOV.UK`

## Colour and contrast

- Body text ≥ 4.5:1 contrast (WCAG 1.4.3); large text (18pt / 14pt bold) ≥ 3:1
- Focus indicators ≥ 3:1 against adjacent colours (WCAG 2.4.11, new in 2.2)
- Never use colour as the sole indicator — pair with text, pattern, or icon
- Use GOV.UK Frontend colour tokens — do not hard-code hex for design-system colours

## Images

- Decorative: `alt=""`; informative: meaningful `alt` describing content, not appearance
- Do not use images of text (WCAG 1.4.5)
- Complex images (charts): extended description in surrounding text or `aria-describedby`

## Links and buttons

- `<button>` for actions; `<a>` for navigation
- Link text must describe the destination — no "click here", "read more", or bare URLs
- Links opening a new tab warn the user: "… (opens in new tab)"

## Dynamic content and JavaScript

- Status messages (success banners, alerts) use `role="alert"` or `aria-live="polite"`
- Modal dialogs trap focus and restore focus to the trigger on close
- On client-side navigation, update `<title>` and move focus to the main heading
- Bilingual (English/Welsh) UI: ensure `lang` attributes are correct and both languages meet the same standards

## What requires manual testing

Automated tools catch ~30% of issues. Always test manually: screen-reader announcement of dynamic content; keyboard-only navigation through forms/modals; contrast in dark/high-contrast mode; layout at 320px width (WCAG 1.4.10); 400% zoom without horizontal scroll (WCAG 1.4.4). Mark such code:

```jsx
{/* NEEDS SCREEN READER TESTING: focus management on modal close */}
```

## References

- [Public Sector Bodies Accessibility Regulations 2018](https://www.legislation.gov.uk/uksi/2018/952/made)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [GOV.UK Service Standard](https://www.gov.uk/service-manual/service-standard)
