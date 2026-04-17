---
name: develop
description: 'Expert Remix/React/TypeScript SSR developer for MMO FES External Frontend. Use when: implementing features, fixing bugs, refactoring code, researching codebase, planning solutions, writing production code. Covers Remix patterns, GOV.UK components, i18next, CSRF, progressive enhancement.'
---

# External Frontend — Developer Skill

Expert software engineer for the MMO FES External Frontend. Reads the codebase, researches, plans, reasons, writes production-ready code following Remix/GOV.UK patterns.

## When to Use

- Implementing new routes, loaders, or actions
- Building GOV.UK-styled components with i18next translations
- Setting up MSW handlers for new API endpoints
- Refactoring or restructuring Remix routes
- Any production code writing task

## Workflow

### Before Making Changes

1. Search codebase for similar route patterns and components
2. Check existing MSW handlers to understand API mocking patterns
3. Review `app/types/tests.ts` for existing test case IDs
4. Read `app/urls.server.ts` for API endpoint definitions

### During Implementation

1. Follow all mandatory rules from the auto-loaded instruction files (`react-remix.instructions.md`, `typescript.instructions.md`)
2. Always add `setApiMock(request.url)` as the first line in loaders (for test mode)
3. Provide both English and Welsh translations — never leave Welsh as TODO

### After Implementation

1. Run build: `npm run build`
2. Run lint: `npm run lint`
3. Verify no TypeScript errors in problems panel
4. Invoke the `/unit-tests` skill to set up MSW handlers and Cypress tests
5. Review git diff to ensure no accidental changes

## Project Conventions

### Route Pattern (Flat Structure)

```typescript
// app/routes/add-landing-details.tsx (NOT app/routes/landings/add/index.tsx)
export const loader: LoaderFunction = async ({ request }) => {
  /* istanbul ignore next */
  setApiMock(request.url); // CRITICAL: must be first, before any API calls

  const csrf = createCSRFToken();
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  const data = await fetchFromOrchestration(request);
  return json({ csrf, data }, session);
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  // Handle form submission
};
```

### CSRF Protection

```tsx
const { csrf } = useLoaderData<typeof loader>();
<SecureForm method="post" csrf={csrf}>
  {/* form fields */}
</SecureForm>
```

### Bilingual i18next

```typescript
const { t } = useTranslation(['namespace']);
// Provide BOTH translation files:
// public/locales-v2/en/namespace.json
// public/locales-v2/cy/namespace.json
```

### GOV.UK Component Usage

- Use `govuk-*` class names — never create custom CSS if GOV.UK provides the component
- Use `data-cy` or `data-testid` attributes for test selectors
- Ensure progressive enhancement — forms must work without JavaScript

### Server-Only Code

- Server logic in `*.server.ts` files — never import in client code
- API URLs centralized in `app/urls.server.ts`
- HTTP client in `app/communication.server.ts`

## Anti-Patterns

> Mandatory rules in the instruction files also apply. The items below are additional anti-patterns specific to this skill:

- Forgetting `setApiMock(request.url)` in loaders — breaks test mode
- Leaving Welsh translations as TODO placeholders
- Creating custom CSS when GOV.UK Frontend provides the component
- Using nested route directories instead of flat route structure
- Importing `.server.ts` modules in client-side code
