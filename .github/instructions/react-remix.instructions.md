---
description: 'React and React Router v7 SSR best practices for MMO FES External Frontend'
applyTo: '**/*.{jsx,tsx}'
---

# React & React Router v7 Best Practices for MMO FES External Frontend

This instructions file applies to the React Router v7 frontend application with server-side rendering, progressive enhancement, and GOV.UK design patterns.

The application was migrated from Remix 2.x to React Router v7 (`react-router ~7.11.0`). All new code must use React Router v7 patterns.

## Core React Router v7 Patterns

### Imports

All framework types and utilities come from `react-router` (not `@remix-run/node` or `@remix-run/react`):

```typescript
import {
  type LoaderFunction,
  type ActionFunction,
  type LinksFunction,
  type MetaFunction,
  useLoaderData,
  useActionData,
  useNavigation,
  useRevalidator,
  redirect,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
```

Navigation hooks (`useNavigation`, `Link`, `Form`) can still be imported from `react-router-dom` (it re-exports from `react-router` in v7) but prefer `react-router` directly for new code.

### Loader Pattern (Server-Side Data)

Loaders return `new Response(JSON.stringify(...))` directly — **do not use `json()` helper** (removed in React Router v7):

```typescript
// app/routes/add-landing-details.tsx

import { type LoaderFunction, useLoaderData } from "react-router";

export const loader: LoaderFunction = async ({ request, params }) => {
  // CRITICAL: Call BEFORE any API calls for test mock setup
  setApiMock(request.url);

  const csrf = await createCSRFToken(request);
  const session = await getSessionFromRequest(request);
  session.set('csrf', csrf);

  const data = await fetchFromAPI();

  return new Response(JSON.stringify({ csrf, data }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function AddLandingDetails() {
  const { csrf, data } = useLoaderData<typeof loader>();

  return <SecureForm method="post" csrf={csrf}>{/* ... */}</SecureForm>;
}
```

### Action Pattern (Server-Side Mutations)

```typescript
import { type ActionFunction, redirect } from "react-router";

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const form = await request.formData();

  // CRITICAL: Validate CSRF token
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect('/forbidden');

  const landing = {
    species: form.get('species'),
    weight: form.get('weight'),
  };

  await submitLanding(landing);

  return redirect('/confirmation');
};
```

### Meta Export (Array Format)

`meta` must return an array of objects — the v1 object format is no longer supported:

```typescript
import { type MetaFunction } from "react-router";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { charset: "utf-8" },
  { title: data?.pageTitle ?? "Fish Export Service - GOV.UK" },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
];
```

### Headers Export

```typescript
export const headers = () => ({ "Cache-Control": "no-store" });
```

### Error Boundary (Unified — No CatchBoundary)

React Router v7 uses a single `ErrorBoundary` for both HTTP errors and runtime errors. `CatchBoundary` no longer exists:

```tsx
import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    // Previously handled by CatchBoundary
    return (
      <div className="govuk-error-summary">
        <h2 className="govuk-error-summary__title">{error.status}</h2>
        <p>{error.data}</p>
      </div>
    );
  }

  // Runtime error
  return <div>Unexpected error</div>;
}
```

## Configuration

### `react-router.config.ts` (replaces `remix.config.js`)

```typescript
import type { Config } from "@react-router/dev/config";

const isTestMode = process.env.NODE_ENV === "test";

export default {
  ssr: true,
  appDirectory: isTestMode ? "instrumented" : "app",
  buildDirectory: "build",
  ignoredRouteFiles: isTestMode
    ? ["**/.*", "**/*.test.{js,ts}", "**/*.css"]
    : ["**/.*", "**/*.test.{js,ts}", "coverage.tsx", "**/*.css"],
} satisfies Config;
```

Test mode switches the app directory to `instrumented/`, which is the Istanbul-instrumented copy of `app/` used for Cypress coverage.

### Build Commands

```bash
react-router build   # replaces: remix build
react-router dev     # replaces: remix dev
react-router-serve ./build/server/index.js  # production start
```

## Progressive Enhancement

### Forms Must Work Without JavaScript

```tsx
// Good: POST form with native submission
<SecureForm method="post" csrf={csrf}>
  <input type="text" name="species" className="govuk-input" />
  <button type="submit" className="govuk-button">Submit</button>
</SecureForm>

// Bad: onClick handler only (breaks without JS)
<button onClick={handleSubmit}>Submit</button>
```

### Error States Without JavaScript

```tsx
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="govuk-error-summary">
        <h2 className="govuk-error-summary__title">{error.status}</h2>
        <p>{error.data}</p>
      </div>
    );
  }

  return <div>Unexpected error</div>;
}
```

## CSRF Protection

### Always Use SecureForm

`SecureForm` wraps React Router's `Form` and injects the CSRF hidden input:

```tsx
import { SecureForm } from '~/components/formWithCSRF';

// Loader creates and stores token
export const loader: LoaderFunction = async ({ request }) => {
  setApiMock(request.url);

  const csrf = await createCSRFToken(request);
  const session = await getSessionFromRequest(request);
  session.set('csrf', csrf);

  return new Response(JSON.stringify({ csrf }), {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

// Component uses SecureForm
export default function MyForm() {
  const { csrf } = useLoaderData<typeof loader>();

  return (
    <SecureForm method="post" csrf={csrf}>
      {/* form fields */}
    </SecureForm>
  );
}

// Action validates token
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect('/forbidden');
  // ... process form
};
```

## Bilingual Support (i18next)

### Always Provide EN + WL Translations

```typescript
import { useTranslation } from 'react-i18next';

export default function MyPage() {
  const { t } = useTranslation(['landings']);

  return (
    <h1>{t('landings:pageTitle')}</h1>
  );
}
```

### Translation Files (Both Required)

```json
// public/locales-v2/en/landings.json
{
  "pageTitle": "Add Landing Details"
}

// public/locales-v2/cy/landings.json
{
  "pageTitle": "Ychwanegu Manylion Glanio"
}
```

**NEVER leave Welsh translation as "TODO" or empty** — always provide a complete translation.

## GOV.UK Frontend Components

### Use GOV.UK Classes, Not Custom CSS

```tsx
// Good: GOV.UK Frontend components
<div className="govuk-form-group">
  <label className="govuk-label" htmlFor="species">
    {t('landings:speciesLabel')}
  </label>
  <input
    type="text"
    id="species"
    name="species"
    className="govuk-input"
  />
</div>

// Bad: Custom CSS
<div className="custom-form-group">
  <input className="custom-input" />
</div>
```

### Common GOV.UK Patterns
- Buttons: `govuk-button`, `govuk-button--secondary`, `govuk-button--warning`
- Inputs: `govuk-input`, `govuk-input--error`
- Labels: `govuk-label`, `govuk-label--l`
- Error messages: `govuk-error-message`
- Summary lists: `govuk-summary-list`

### Error Handling with GOV.UK Pattern

```tsx
<div className="govuk-form-group govuk-form-group--error">
  <label className="govuk-label" htmlFor="weight">
    Weight (kg)
  </label>
  {errors.weight && (
    <p className="govuk-error-message">
      <span className="govuk-visually-hidden">Error:</span>
      {errors.weight}
    </p>
  )}
  <input
    type="text"
    id="weight"
    name="weight"
    className="govuk-input govuk-input--error"
  />
</div>
```

## Testing with MSW + Cypress

The test architecture relies on MSW v1 (`rest` API — not v2 `http`) running in-process on the SSR server. The loader's `setApiMock(request.url)` call activates the correct mock handlers for each test case.

### Step 1: Add Test Case ID

```typescript
// app/types/tests.ts
export enum TestCaseId {
  AddLandingSuccess = "addLandingSuccess",
  AddLandingError = "addLandingError",
}
```

### Step 2: Create Mock Data (if needed)

```json
// tests/cypress/fixtures/landing.json
{
  "species": "COD",
  "weight": 100
}
```

### Step 3: Create MSW Handler (v1 `rest` API)

```typescript
// tests/msw/handlers/addLanding.ts
import { rest } from "msw";                         // v1 API — do NOT use `http` from msw v2
import { TestCaseId, type ITestHandler } from "~/types";

const addLandingHandler: ITestHandler = {
  [TestCaseId.AddLandingSuccess]: () => [
    rest.post('/v1/landings', (req, res, ctx) =>
      res(ctx.json({ success: true }))
    ),
  ],
  [TestCaseId.AddLandingError]: () => [
    rest.post('/v1/landings', (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ error: 'Invalid data' }))
    ),
  ],
};

export default addLandingHandler;
```

### Step 4: Enable Mock in Loader

`setApiMock` must be the **first call** in every loader, without an `/* istanbul ignore next */` comment (the instrumented build handles coverage):

```typescript
// app/routes/add-landing-details.tsx
export const loader: LoaderFunction = async ({ request, params }) => {
  setApiMock(request.url); // CRITICAL: Must be first line

  // ... rest of loader
};
```

### Step 5: Write Cypress Test

```typescript
// tests/cypress/integration/routes/addLanding.spec.ts
import { type ITestParams, TestCaseId } from "~/types";

describe('Add Landing', () => {
  it('should submit landing successfully', () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingSuccess,
    };

    cy.visit('/add-landing-details', { qs: { ...testParams } });
    cy.get('[name="species"]').type('COD');
    cy.get('[name="weight"]').type('100');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/confirmation');
  });

  it('should work without JavaScript', () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingSuccess,
      disableScripts: true, // Progressive enhancement test
    };

    cy.visit('/add-landing-details', { qs: { ...testParams } });
    // ... same assertions as above
  });
});
```

### Step 6: Run Instrumented Tests

```bash
# CRITICAL: Must run instrumented build for coverage
npm run pre:test:start  # Transpiles app/ → instrumented/ with Istanbul
npm run :test:start     # Starts app in test mode (NODE_ENV=test)
npm run :test:all       # Runs Cypress tests + generates coverage
```

## File-Based Routing

### Flat Route Structure (Preferred)

```
app/routes/
  add-landing-details.tsx             # /add-landing-details
  catch-certificates.$id.tsx          # /catch-certificates/:id
  catch-certificates.$id.edit.tsx     # /catch-certificates/:id/edit
```

The router is configured via `@react-router/fs-routes` using the flat-file convention. Route discovery is set up in `react-router.config.ts`.

### Avoid Nested index.tsx

```
// Bad: Nested structure
app/routes/
  catch-certificates/
    index.tsx
    $id/
      edit.tsx

// Good: Flat structure
app/routes/
  catch-certificates.tsx
  catch-certificates.$id.tsx
  catch-certificates.$id.edit.tsx
```

## Server-Only Code

### Use .server.ts for Server-Only Modules

```typescript
// app/services/backend.server.ts
import axios from 'axios';

export async function fetchFromBackend() {
  return await axios.get(process.env.BACKEND_URL);
}

// Import ONLY in loaders/actions (never in client components)
import { fetchFromBackend } from '~/services/backend.server';

export const loader: LoaderFunction = async () => {
  const data = await fetchFromBackend();
  return new Response(JSON.stringify({ data }), {
    headers: { "Content-Type": "application/json" },
  });
};
```

Session and cookie utilities (`sessions.server.ts`, `cookies.server.ts`) are server-only. They currently import from `@remix-run/node` — do not change these imports unless explicitly migrating them.

## Revalidation

### Using useRevalidator

```typescript
import { useRevalidator } from "react-router";

export default function MyPage() {
  const { revalidate } = useRevalidator();

  return <button onClick={revalidate}>Refresh</button>;
}
```

## Accessibility

### Semantic HTML

```tsx
// Good: Semantic elements
<main>
  <h1>Page Title</h1>
  <nav>
    <ul>
      <li><Link to="/">Home</Link></li>
    </ul>
  </nav>
</main>
```

### Skip Links

```tsx
// In root.tsx
<a href="#main-content" className="govuk-skip-link">
  Skip to main content
</a>

<main id="main-content">
  <Outlet />
</main>
```

### Form Labels

```tsx
// Good: Label with htmlFor
<label className="govuk-label" htmlFor="species">
  Species
</label>
<input id="species" name="species" className="govuk-input" />

// Bad: Label without association
<label className="govuk-label">Species</label>
<input name="species" className="govuk-input" />
```

## Common Pitfalls

❌ Using `json()` helper — removed in React Router v7; use `new Response(JSON.stringify(...))` with `Content-Type: application/json`
❌ Importing from `@remix-run/node` or `@remix-run/react` in new code — use `react-router` and `@react-router/node`
❌ Using `CatchBoundary` — it no longer exists; use `ErrorBoundary` with `isRouteErrorResponse()`
❌ Using MSW v2 `http` API — this project uses MSW v1; always use `rest.get/post(url, (req, res, ctx) => ...)`
❌ Missing `setApiMock(request.url)` as first line in loader (tests will fail)
❌ Forgetting CSRF validation in action
❌ Welsh translation left as "TODO"
❌ Using custom CSS instead of GOV.UK components
❌ Importing `.server.ts` files in client components
❌ Not running instrumented build before tests
❌ Missing MSW handler (server is configured with `onUnhandledRequest: "error"`)

## Remember

- **Import from `react-router`** not `@remix-run/*` for all new code
- **`new Response(JSON.stringify(...))`** not `json()` in loaders/actions
- **Single `ErrorBoundary`** handles both HTTP and runtime errors
- **`setApiMock(request.url)` first line in loaders** for testing
- **MSW v1 `rest` API** — do not use v2 `http` API
- **`<SecureForm>` with CSRF** for all forms
- **EN + WL translations** complete, never "TODO"
- **GOV.UK components** not custom CSS
- **Progressive enhancement** — works without JS
- **Instrumented build** before running tests
