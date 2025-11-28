---
description: 'React and Remix SSR best practices for MMO FES External Frontend'
applyTo: '**/*.{jsx,tsx}'
---

# React & Remix Best Practices for MMO FES External Frontend

This instructions file applies to the Remix 2.x frontend application with server-side rendering, progressive enhancement, and GOV.UK design patterns.

## Core Remix Patterns

### Loader Pattern (Server-Side Data)
```typescript
// app/routes/add-landing-details.tsx

import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  // CRITICAL: Add BEFORE any API calls for testing
  /* istanbul ignore next */
  setApiMock(request.url);
  
  // Create CSRF token
  const csrf = createCSRFToken();
  const session = await getSessionFromRequest(request);
  session.set('csrf', csrf);
  
  // Fetch data
  const data = await fetchFromAPI();
  
  // Return with session
  return json({ csrf, data }, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

// In component
export default function AddLandingDetails() {
  const { csrf, data } = useLoaderData<typeof loader>();
  
  return <SecureForm method="post" csrf={csrf}>{/* ... */}</SecureForm>;
}
```

### Action Pattern (Server-Side Mutations)
```typescript
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  
  // CRITICAL: Validate CSRF token
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect('/forbidden');
  
  // Extract form data
  const landing = {
    species: form.get('species'),
    weight: form.get('weight'),
  };
  
  // Submit to backend
  await submitLanding(landing);
  
  return redirect('/confirmation');
};
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
```tsx
import { SecureForm } from '~/components/SecureForm';

// Loader generates token
export const loader: LoaderFunction = async ({ request }) => {
  const csrf = createCSRFToken();
  const session = await getSessionFromRequest(request);
  session.set('csrf', csrf);
  return json({ csrf }, session);
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
// In component
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

**NEVER leave Welsh translation as "TODO" or empty** - always provide complete translation.

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

### Step 1: Add Test Case ID
```typescript
// app/types/tests.ts
export enum TestCaseId {
  AddLandingSuccess = "addLandingSuccess",
  AddLandingError = "addLandingError",
}
```

### Step 2: Create Mock Data
```json
// tests/cypress/fixtures/landing.json
{
  "species": "COD",
  "weight": 100
}
```

### Step 3: Create MSW Handler
```typescript
// tests/msw/handlers/addLanding.ts
import { rest } from "msw";
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
```typescript
// app/routes/add-landing-details.tsx
export const loader: LoaderFunction = async ({ request }) => {
  /* istanbul ignore next */
  setApiMock(request.url); // CRITICAL: Must be first line
  
  // ... rest of loader
};
```

### Step 5: Write Cypress Test
```typescript
// tests/cypress/integration/routes/addLanding.spec.ts
import { TestCaseId, type ITestParams } from "~/types";

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
    // ... same test as above
  });
});
```

### Step 6: Run Instrumented Tests
```bash
# CRITICAL: Must run instrumented build for coverage
npm run pre:test:start  # Instruments code
npm run :test:start     # Starts instrumented app
npm run :test:all       # Runs Cypress tests + generates coverage
```

## File-Based Routing

### Flat Route Structure (Preferred)
```
app/routes/
  add-landing-details.tsx         # /add-landing-details
  catch-certificates.$id.tsx      # /catch-certificates/:id
  catch-certificates.$id.edit.tsx # /catch-certificates/:id/edit
```

### Avoid Nested index.tsx
```
// Bad: Nested structure
app/routes/
  catch-certificates/
    index.tsx     # Harder to find
    $id/
      index.tsx
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
  // This code only runs on server
  return await axios.get(process.env.BACKEND_URL);
}

// Import ONLY in loaders/actions
import { fetchFromBackend } from '~/services/backend.server';

export const loader: LoaderFunction = async () => {
  const data = await fetchFromBackend(); // OK
  return json({ data });
};

// NEVER import in client components
import { fetchFromBackend } from '~/services/backend.server'; // ERROR!
```

## Data Refresh Without Forms

### Using useDataRefresh Hook
```typescript
import { useDataRefresh } from 'remix-utils/use-data-refresh';

export default function MyPage() {
  const refresh = useDataRefresh();
  
  const handleRefresh = () => {
    refresh(); // Triggers loader to re-run
  };
  
  return <button onClick={handleRefresh}>Refresh</button>;
}
```

### Using Dummy Action
```typescript
// app/routes/dev.null.ts
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async () => {
  return null; // Does nothing, just triggers loader refresh
};

// In component
<Form method="post" action="/dev/null">
  <button type="submit">Refresh</button>
</Form>
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

// Bad: Divs everywhere
<div>
  <div className="title">Page Title</div>
  <div>
    <div><a href="/">Home</a></div>
  </div>
</div>
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

❌ Missing `setApiMock(request.url)` in loader (tests will fail)
❌ Forgetting CSRF validation in action
❌ Welsh translation left as "TODO"
❌ Using custom CSS instead of GOV.UK components
❌ Importing `.server.ts` files in client components
❌ Not running instrumented build before tests
❌ Missing MSW handler (causes warnings)

## Remember

- **`setApiMock()` first line in loaders** for testing
- **`<SecureForm>` with CSRF** for all forms
- **EN + WL translations** complete, never "TODO"
- **GOV.UK components** not custom CSS
- **Progressive enhancement** - works without JS
- **Instrumented build** before running tests
- **MSW handlers** for ALL API calls in test journey
