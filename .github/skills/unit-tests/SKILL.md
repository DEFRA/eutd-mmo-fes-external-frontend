---
name: unit-tests
description: 'Expert test engineer for MMO FES External Frontend. Use when: writing Cypress E2E tests, creating MSW handlers, setting up test fixtures, improving code coverage, fixing SonarQube issues.'
---

# External Frontend — Unit Tests Skill

Expert in Cypress E2E + MSW API mocking + Istanbul code coverage for the Remix SSR application.

## When to Use

- Writing Cypress tests for new or modified routes
- Creating MSW handlers for API mocking
- Setting up test fixtures and test case IDs
- Improving code coverage to meet thresholds
- Fixing SonarQube issues or test quality problems

## Coverage Requirements

- **Overall target**: >90% coverage
- Instrumented build required before testing: `npm run pre:test:start`
- Start test server: `npm run :test:start`
- Run all tests: `npm run :test:all`
- Run single spec: `npm run :test:spec tests/cypress/integration/routes/myTest.spec.ts`

## Test Setup Workflow (5 Steps)

### Step 1: Add Test Case ID

```typescript
// app/types/tests.ts
export enum TestCaseId {
  MyNewTestCase = "myNewTestCase",
}
```

### Step 2: Create Mock Data Fixtures

Add JSON fixtures to `tests/cypress/fixtures/` organized by API endpoint.

### Step 3: Create MSW Handlers

```typescript
// tests/msw/handlers/myPage.ts
import { rest } from "msw";
import { TestCaseId, type ITestHandler } from "~/types";

const myPageHandler: ITestHandler = {
  [TestCaseId.MyNewTestCase]: () => [
    rest.get(SOME_API_URL, (req, res, ctx) => res(ctx.json(mockData))),
  ],
};

export default myPageHandler;
// Import in tests/msw/handlers/index.ts and merge into rootTestHandler
```

### Step 4: Add setApiMock in Loader

```typescript
export const loader: LoaderFunction = async ({ request }) => {
  /* istanbul ignore next */
  setApiMock(request.url); // runs only when NODE_ENV === "test"
  // ... rest of loader
};
```

### Step 5: Write Cypress Test

```typescript
// tests/cypress/integration/routes/myTest.spec.ts
const testParams: ITestParams = {
  testCaseId: TestCaseId.MyNewTestCase,
};

cy.visit("/my-page", { qs: { ...testParams } });
cy.get('[data-testid="submit-button"]').click();
// Assert expected outcome
```

## Key Testing Rules

- Use `res` not `res.once` in MSW handlers (test case ID persists across navigations)
- Mock **ALL API calls** in the test journey including destination page loaders
- Watch for `[MSW] Warning: captured a request without a matching request handler`
- Use `data-cy` or `data-testid` selectors — never brittle CSS chains
- Test with `disableScripts: true` for progressive enhancement validation
- Do not use `cy.wait(<number>)` — use network alias waits or DOM readiness assertions

## SonarQube Issue Resolution

When fixing SonarQube issues, **NEVER modify functionality**. If existing tests fail after a fix, revert it. Only structural refactoring is allowed.

## Workflow

1. Identify the route/component that needs tests
2. Add test case ID to `app/types/tests.ts`
3. Create fixture data and MSW handlers
4. Ensure `setApiMock(request.url)` is in the loader
5. Write Cypress spec following the patterns above
6. Run instrumented build: `npm run pre:test:start`
7. Start test server: `npm run :test:start`
8. Run tests: `npm run :test:all`
9. Check coverage report in `coverage/` directory
