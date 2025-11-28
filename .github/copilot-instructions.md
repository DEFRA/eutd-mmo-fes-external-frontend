# MMO Fish Export Service (FES) - External Frontend

## Project Overview
This is a UK government service built with **Remix 2.x** (React-based SSR framework) for managing fish export certificates. The application serves three document journeys: Catch Certificates, Processing Statements, and Storage Documents. It follows GDS (Government Digital Service) design patterns and emphasizes progressive enhancement with server-side rendering.

## Architecture & Technology Stack

### Core Framework
- **Remix 2.x** with Vite build system (not the classic Remix compiler)
- **TypeScript** with strict type checking
- **React 18.x** for UI components
- **GOV.UK Frontend 5.x** for styling (avoid creating custom styles; reuse GOV.UK components)
- **i18next** for internationalization (English/Welsh bilingual support)

### Key Architectural Decisions
- **Server-first rendering**: Most logic runs in `loader` and `action` functions on the server
- **Progressive enhancement**: Forms work without JavaScript; JavaScript enhances the experience
- **File-based routing**: Routes in `app/routes/` map to URLs (use flat structure, avoid `index.tsx` where possible)
- **Server-side modules**: Files ending in `.server.ts` contain server-only code; import them in loaders/actions only

### Directory Structure
```
app/
  ├── .server/           # Server-only business logic (orchestration, data fetching)
  ├── components/        # Base reusable components
  ├── composite-components/ # Complex components built from base components
  ├── controller/        # Controller methods
  ├── helpers/           # Utility functions
  ├── routes/            # File-based routing (flat structure preferred)
  ├── styles/            # GOV.UK Frontend styles (generated from Sass)
  ├── types/             # TypeScript type definitions
  ├── communication.server.ts # HTTP client for backend APIs
  ├── sessions.server.ts # Cookie session management
  └── urls.server.ts     # API endpoint URLs
```

## Development Workflow

### Running the App
```bash
npm run dev                    # Development mode (IDM auth disabled by default)
npm run dev:start-with-idm    # Development with identity management enabled
npm run debug                  # Development with Node debugger
npm start                      # Production mode (requires build)
```

### Building
```bash
npm run build    # Production build
npm run profile  # Build with profiling enabled
```

### Environment Setup
- Copy `.envSample` to `.env` and configure backend service URLs
- `DISABLE_IDM=true` in dev mode bypasses authentication for easier local development
- Backend services (orchestration, reference) typically run on ports 5500 and 9000

## Testing Strategy - MSW with Cypress

### Critical Testing Approach
This project uses an **unconventional testing strategy** due to Remix's server-side nature:

1. **All tests use Cypress** (e2e framework), not Jest or Vitest
2. **API mocking with MSW** (Mock Service Worker) replaces real backend calls during tests
3. **Code instrumentation** via Istanbul generates coverage reports

### Test Setup Workflow
1. **Instrument code**: `npm run pre:test:start` creates instrumented code in `instrumented/` folder
2. **Run app in test mode**: `npm run :test:start` (builds using instrumented code)
3. **Execute tests**: `npm run :test:all` (runs all Cypress tests + generates coverage)
4. **View coverage**: Check `coverage/` directory for reports

### Writing Tests for Pages with Remix Server Imports

#### Step 1: Define Test Cases
Add test case IDs to `app/types/tests.ts`:
```typescript
export enum TestCaseId {
  MyNewTestCase = "myNewTestCase",
  MyNewTestCaseWithError = "myNewTestCaseWithError",
}
```

#### Step 2: Create Mock Data
Add JSON fixtures to `tests/cypress/fixtures/` organized by API endpoint

#### Step 3: Create MSW Handlers
Create handler in `tests/msw/handlers/`:
```typescript
import { rest } from "msw";
import { TestCaseId, type ITestHandler } from "~/types";

const myPageHandler: ITestHandler = {
  [TestCaseId.MyNewTestCase]: () => [
    rest.get(SOME_API_URL, (req, res, ctx) => res(ctx.json(mockData))),
  ],
};

export default myPageHandler;
```

Import in `tests/msw/handlers/index.ts` and merge into `rootTestHandler`

#### Step 4: Enable Mocking in Loader
In the page's `loader` function, add **before any API calls**:
```typescript
/* istanbul ignore next */
setApiMock(request.url); // runs only when NODE_ENV === "test"
```

#### Step 5: Write Cypress Tests
In `tests/cypress/integration/`:
```typescript
const testParams: ITestParams = {
  testCaseId: TestCaseId.MyNewTestCase,
};

cy.visit("/my-page", { qs: { ...testParams } });
```

### Important Testing Notes
- **MSW ignores query-string parameters** in URLs; use mock URLs from `app/urls.server.ts` (e.g., `mockSearchVesselName`)
- Use `res` not `res.once` in handlers (test case ID persists across navigations)
- Mock **all API calls** in the test journey, including loader calls on destination pages
- To test without JavaScript: pass `disableScripts: true` in `testParams`
- Warning messages like `[MSW] Warning: captured a request without a matching request handler` indicate missing mocks

### Running Individual Tests
```bash
npm run :test:spec tests/cypress/integration/routes/myTest.spec.ts
```

Use `it.only(...)` to run a single test within a file, or `it.skip(...)` to skip tests.

## Remix Patterns

### Data Loading & Mutations
- **`loader`**: Runs server-side on GET requests; returns data for the page
- **`action`**: Runs server-side on POST/PUT/DELETE; handles form submissions
- Data from loaders: `const data = useLoaderData<typeof loader>()`
- Action data: `const actionData = useActionData<typeof action>()`

### CSRF Protection
All forms must use `<SecureForm>` component (from `~/components`) with CSRF token:
```typescript
export const loader: LoaderFunction = async ({ request }) => {
  const csrf = createCSRFToken();
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  return json({ csrf }, session);
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  // ... handle action
};
```

### Session Management
- Sessions stored in encrypted cookies via `sessions.server.ts`
- Use `getSessionFromRequest(request)` to access session
- Commit with `commitSession(session)` in response headers

### Data Refresh Without Forms
Use `useDataRefresh()` hook from `remix-utils` or post to `app/routes/dev.null.ts` (dummy action that triggers loader refresh)

### Error Handling
- Return `apiCallFailed(errors)` from `communication.server.ts` for validation errors
- `ErrorBoundary` in `root.tsx` handles uncaught errors
- Check `isRouteErrorResponse(error)` to distinguish route vs. runtime errors

## Integration Points

### Backend Services
- **Orchestration Service**: Business logic, document management (`MMO_ECC_ORCHESTRATION_SVC_URL`)
- **Reference Service**: Lookup data (species, countries, vessels) (`MMO_ECC_REFERENCE_SVC_URL`)
- **Dynamics CRM**: User/organization data via IDM (Identity Management)
- Communication via `app/communication.server.ts` with bearer token authentication

### Authentication & Authorization
- OpenID Connect with Azure AD B2C (when `DISABLE_IDM=false`)
- Bearer tokens passed to backend APIs
- User/org data fetched from Dynamics CRM endpoints

### External Dependencies
- **Application Insights**: Telemetry/logging (client + server)
- **Azure Blob Storage**: Document storage
- **Azure Event Hubs**: Event streaming

## Code Conventions

### Imports & File Extensions
- Server-only code: `*.server.ts` files (never import in client code)
- Use `~/*` alias for `app/*` imports
- Use `@/fixtures/*` alias for test fixtures
- Use `tests/*` alias for test utilities

### Naming Conventions
- Routes: kebab-case (e.g., `add-exporter-details.tsx`)
- Components: PascalCase
- Utilities/helpers: camelCase
- Constants: UPPER_SNAKE_CASE

### Internationalization
- Translation keys in `public/locales-v2/{en,cy}/*.json`
- Use `useTranslation()` hook: `const { t } = useTranslation(["namespace"])`
- All user-facing text must be translatable (English + Welsh)

### Styling
- **Never create custom CSS** if GOV.UK Frontend provides the component
- Use GOV.UK class names: `govuk-button`, `govuk-input`, etc.
- Styles generated from `node_modules/govuk-frontend/govuk` via Sass
- Run `npm run sass` to regenerate styles when GOV.UK Frontend updates

## Deployment & CI/CD

### Pipeline
- **Azure Pipelines** with GitFlow branching strategy
- Branches: `main` (prod), `develop` (dev), `feature/*`, `hotfix/*`, `epic/*`
- Docker multi-stage builds: `test` stage (Cypress base) + `production` stage
- Branch naming enforced; non-standard names fail deployment

### Environments
- Development, Pre-production (PRE1), Production
- Secondary region for disaster recovery (optional deployment)

## Common Gotchas

1. **Code Coverage Requires Instrumentation**: Always run `npm run :test:start` (not `npm run dev`) before Cypress tests
2. **MSW Handlers Must Cover All APIs**: Watch for MSW warnings; every API call in test journey needs a mock
3. **Query Strings Stripped on Form Submission**: Pass test case ID via session or use `args` parameter in handlers
4. **Don't Mix Client/Server Imports**: Server imports (`.server.ts`) throw errors in client bundles
5. **Progressive Enhancement**: Test critical flows with JavaScript disabled (`disableScripts: true`)
6. **Flat Route Structure**: Avoid nested `index.tsx` files; use explicit route names
7. **CSRF Validation**: Always use `<SecureForm>` and validate CSRF tokens in actions

## Debugging

### Development Mode
```bash
npm run debug              # Start with Node inspector
# Open chrome://inspect in Chrome, attach to process
```

### Test Mode
- Server console shows MSW warnings for unmocked APIs
- Check `coverage/lcov-report/index.html` for coverage visualizations
- Use `cy.pause()` in Cypress tests for interactive debugging

## Key Files Reference

- `app/root.tsx`: Root component, error boundaries, layout
- `app/entry.server.tsx`: Server-side rendering entry point (CSP headers, i18n)
- `app/communication.server.ts`: HTTP client for backend APIs
- `app/urls.server.ts`: Centralized API endpoint definitions
- `app/types/tests.ts`: Test case ID enum
- `tests/msw/handlers/index.ts`: Central MSW handler registry
- `vite.config.mts`: Vite/Remix configuration (code instrumentation for tests)
