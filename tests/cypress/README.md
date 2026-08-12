# Cypress E2E Test Suite — MMO FES External Frontend

## Overview

End-to-end tests for the Remix-based FES External Frontend application.
Tests exercise full server-rendered page journeys with all backend APIs mocked at the network layer using MSW (Mock Service Worker).

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Test runner | Cypress 14.x | Browser automation and assertions |
| API mocking | MSW 1.x | Intercepts HTTP calls in the test build |
| Coverage | Istanbul (`babel-plugin-istanbul`) + `@cypress/code-coverage` | Statement/branch/line/function coverage from instrumented code |
| Reporters | `mocha-junit-reporter` + `cypress-multi-reporters` | JUnit XML for CI + console output |

## Directory Structure

```
tests/cypress/
├── README.md                   # This file
├── parallel-weights.json       # Spec weights for cypress-parallel
├── integration/routes/         # 114 spec files — one per route/feature
├── fixtures/                   # Static JSON mock data consumed by MSW handlers
├── support/
│   ├── commands.js             # Custom Cypress commands (JSDoc'd)
│   └── e2e.js                  # Global setup: coverage, testing-library, exception handler
└── downloads/                  # Files downloaded during tests (git-ignored)
```

## Running Tests

### Full instrumented suite (CI-equivalent)

```bash
# 1. Instrument application code with Istanbul
npm run pre:test:start

# 2. Build the instrumented app and start the test server
npm run :test:start

# 3. In a second terminal — run all specs and collect coverage
npm run :test:all

# 4. Generate the coverage report (also runs automatically post :test:all)
npm run :report:coverage
```

Coverage output is written to `coverage/` (lcov, text, cobertura formats).

### Single spec

```bash
npm run :test:spec tests/cypress/integration/routes/addLandings.spec.ts
```

Use `it.only(...)` or `it.skip(...)` within a file to isolate individual tests.

### Parallel execution

```bash
npm run :test:all:parallel
```

Uses `cypress-parallel` with `tests/cypress/parallel-weights.json` to distribute
specs across 2 workers. Tune weights in that file after profiling run times.

### Interactive / headed

```bash
npm run cy:open
```

## MSW Test-Case Pattern

Every spec selects mock data by passing a `testCaseId` query parameter on `cy.visit`.
The running app's loaders call `setApiMock(request.url)` which activates the matching
MSW handler for the duration of that test case.

```typescript
import { type ITestParams, TestCaseId } from "~/types";

const testParams: ITestParams = { testCaseId: TestCaseId.MyTestCase };
cy.visit("/my-route", { qs: { ...testParams } });
```

### Adding a new test case

1. **Add the ID** — `app/types/tests.ts` → `TestCaseId` enum
2. **Create fixture data** — `tests/cypress/fixtures/` (JSON files)
3. **Create MSW handler** — `tests/msw/handlers/<feature>.ts`; import and merge into `rootTestHandler` in `tests/msw/handlers/index.ts`
4. **Add `setApiMock`** — first line of the loader under test:
   ```typescript
   export const loader: LoaderFunction = async ({ request }) => {
     /* istanbul ignore next */
     setApiMock(request.url);
     // ...rest of loader
   };
   ```
5. **Write the Cypress spec** — `tests/cypress/integration/routes/<feature>.spec.ts`

> **Warning**: every API call made during a test journey must have a matching MSW handler.
> The server console will log `[MSW] Warning: captured a request without a matching request handler`
> for any unmocked calls — treat these as test failures.

## Custom Commands

Defined in `tests/cypress/support/commands.js`. All commands are JSDoc'd.

| Command | Signature | Description |
|---------|-----------|-------------|
| `cy.waitForHydration` | `(timeout?: number)` | Waits for the page body to be visible and non-empty. Semantic replacement for `cy.document().its("readyState")` anti-pattern. |
| `cy.waitForPage` | `(timeout?: number)` | **Deprecated** — delegates to `cy.waitForHydration()` for backward compatibility. |
| `cy.selectFirstNonEmptyOption` | `(selector: string)` | Selects the first `<option>` with a non-empty value from a `<select>` element. |
| `cy.findGovUkLabel` | `(text: string)` | Finds a GOV.UK `.govuk-label` element by visible text. |
| `cy.findGovUkHint` | `(text: string)` | Finds a GOV.UK `.govuk-hint` element by visible text. |
| `cy.waitForUiUpdate` | `(timeout?: number)` | Pauses for a fixed duration; only use when no stable DOM state can be asserted. |

## Pure-Function Unit Helpers

`tests/unit/testUtils.ts` exports pure data-transformation helpers that are consumed by
Cypress specs via import (no Cypress APIs required):

| Export | Description |
|--------|-------------|
| `pad2(n)` | Zero-pads a number or string to two characters |
| `findFieldIndex(section, field)` | Returns the index of a field within a text array, or -1 |
| `splitIntoLandingGroups(rows)` | Splits flat landing-row labels into per-landing groups |
| `getProductSectionEndIndex(...)` | Calculates the end boundary of a product section in the CYI page text |
| `PRODUCT_HEADER_FIELDS` | Ordered list of expected product header field names |
| `LANDING_FIELD_ORDER` | Ordered list of expected landing field names |

Import in specs:

```typescript
import { splitIntoLandingGroups, findFieldIndex } from "../../../unit/testUtils";
```

## Configuration Reference

All values are set in `cypress.config.ts`.

| Setting | Value | Notes |
|---------|-------|-------|
| `baseUrl` | `http://localhost:3000` | Overridable via `PORT` env var |
| `defaultCommandTimeout` | 10 000 ms | Applies to all `cy.get`, `cy.find`, etc. |
| `pageLoadTimeout` | 60 000 ms | Applies to `cy.visit` |
| `execTimeout` | 60 000 ms | Applies to `cy.exec` |
| `retries.runMode` | 3 | Retries in `cypress run` (CI) |
| `retries.openMode` | 3 | Retries in `cypress open` (local) |
| `video` | `false` | Disabled to reduce CI artefact size |
| `numTestsKeptInMemory` | 0 | Disables test snapshot retention |
| `experimentalMemoryManagement` | `true` | Enables Cypress GC between tests |
| `screenshotOnRunFailure` | `false` | Screenshots disabled |

## Coverage Thresholds

Configured in `.nycrc` or `package.json` under `nyc`:

| Metric | Threshold |
|--------|-----------|
| Branches | 80% |
| Lines | 80% |
| Functions | 80% |
| Statements | 80% |

Coverage is collected from the instrumented build (`instrumented/`) only when tests run
via the `npm run pre:test:start` → `npm run :test:start` → `npm run :test:all` pipeline.

## Global Exception Handler

`tests/cypress/support/e2e.js` registers a scoped `uncaught:exception` handler that
suppresses React SSR hydration errors and unhandled promise rejections (common during
initial page load in SSR apps). All other errors are surfaced normally.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `[MSW] Warning: captured a request without a matching request handler` | API call has no MSW mock | Add a handler in `tests/msw/handlers/` and register it in `rootTestHandler` |
| Coverage always 0% | App was not instrumented before running | Run `npm run pre:test:start` then rebuild with `npm run :test:start` |
| Port 3000 already in use | Previous server still running | `kill $(lsof -t -i:3000)` |
| Tests fail with hydration errors | React SSR mismatch | Check the exception handler in `e2e.js`; pattern may need updating |
| `cy.selectFirstNonEmptyOption` throws | All `<option>` values are empty | Verify MSW handler returns non-empty `value` attributes |
| Flaky timing failure | Race between server render and Cypress assertion | Use `cy.waitForHydration()` or assert on a stable element |
