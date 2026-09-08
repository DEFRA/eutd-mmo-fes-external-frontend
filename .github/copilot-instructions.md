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

## Standards precedence (highest wins)

When guidance conflicts, follow this order:

1. **DEFRA Software Development Standards** (mandatory) — https://defra.github.io/software-development-standards/
2. **DEFRA Digital Service Manual** — https://digital.defra.gov.uk/service-manual
3. **GOV.UK Service Standard & Service Manual (GDS)** — https://www.gov.uk/service-manual (this is where the **GOV.UK Design System** and the **WCAG 2.2 AA accessibility** requirements for this public-facing service live)
4. **Community best practice** — [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/), [12-factor](https://12factor.net/), widely-adopted Remix/React/TypeScript patterns

> **DEFRA takes precedence over GDS. GDS takes precedence over community guidance.** Any deviation from a DEFRA standard MUST be raised as a formal exception through DEFRA's architectural governance (Delivery Architecture team: `delivery.architecture@defra.gov.uk`).

## The working framework (Triage → Read → Research → Clarify → Plan → Approval → Implement → Test → Iterate → Summarise)

This section is the **single source of truth** for the working loop. The custom agents ([Orchestrator](.github/agents/external-fe-orchestrator.agent.md), [Planner](.github/agents/external-fe-planner.agent.md), [Developer](.github/agents/external-fe-developer.agent.md) and [Reviewer](.github/agents/external-fe-reviewer.agent.md)) reference it and **must not restate or fork it**. The guiding principle is **match effort to risk**: do the least work that still delivers the change safely and to standard.

**Triage first — pick one of three gears by size and risk:**

- **Trivial** (typo, comment/doc tweak, a small localised change with no impact on architecture, user-facing UI or accessibility, bilingual (Welsh) content, CSRF/`<SecureForm>` handling, authentication or session/cookie handling, loaders/actions, server-only `.server.ts` isolation, external integrations, security or data correctness): skip the planner, research and review. Do a light **Read → Implement → Test → Summarise**, and research only the one point that is genuinely uncertain.
- **Standard** (a normal feature/page/route/fix with **no** new architecture, auth, session/cache strategy or security surface): use a **lightweight inline plan** (a short Objective · Plan · Files · Validation · Risks note from the Developer agent — no heavyweight Planner), get approval, then implement and test. Run a **single** risk-scoped research pass **only if** something is genuinely uncertain. UI changes still require accessibility (WCAG 2.2 AA / GOV.UK Design System) and full bilingual (English + Welsh) coverage even at this tier.
- **Complex** (any **accessibility** (WCAG 2.2 AA / GOV.UK Design System) architecture change; any change to loaders/actions, CSRF (`<SecureForm>` + `validateCSRFToken`), authentication or session/cookie handling, or server-only `.server.ts` architecture; a new external integration (Orchestration/Reference services, Dynamics/IDM, Application Insights, Azure Blob/Event Hubs); a security surface; or multi-item delivery): run the full loop with the Planner agent below.

**Manual override.** The user can force a gear — e.g. "treat this as trivial", "just a lightweight/standard plan", "force the full plan", "skip the planner" — and that instruction wins over the automatic classification. Always honour a request for **more** rigour. When the user asks for **less** rigour than the risk warrants, comply but **briefly flag the risk first**, and never drop the approval gate, accessibility, bilingual coverage or security for a change that genuinely touches architecture, auth, sessions/cookies, external integrations, data correctness or a security surface.

The loop (Standard and Complex; Trivial uses the light path above):

1. **Read** — Read the relevant files/config in the repo for context before acting. Never assume; verify.
2. **Research (single pass, risk-scoped)** — When something is genuinely uncertain — an unfamiliar or version-sensitive API, security, accessibility or DEFRA/GDS policy — do **one** thorough, risk-scoped research pass in the open and validate findings against DEFRA/GDS and framework/library guidance so advice reflects current APIs and policy. Cite sources. **Do not run a second, separate validation research round** — the plan is checked against these same cited sources. Well-trodden or cosmetic steps need little or no research.
3. **Clarify** — Ask the user targeted questions whenever requirements are ambiguous or missing. Surface requirement gaps explicitly with suggested fixes. Do not guess at intent.
4. **Plan** — For **Complex** work, delegate planning to the [Planner - External Frontend](.github/agents/external-fe-planner.agent.md) agent, which returns a complete plan with its research already cited. For **Standard** work, produce the lightweight inline plan directly — no separate planning agent. Either way, **check** the plan's risky/version-sensitive steps are covered and cited; only send a targeted revision back if a genuine gap is found (do not re-research what is already cited).
5. **Approval** — Present the plan to the user and obtain explicit approval before implementation. If changes are requested, update the plan and re-present. **Cap the plan → approve → implement cycle at 3 iterations**; if it is still unresolved, stop and surface the blocker to the user.
6. **Implement** — Deliver one task at a time (or parallel independent tasks) from the approved plan. Stay focused on the requested outcome; do not scope-creep or refactor unrelated code. When a change introduces or alters architecture, capture the decision as an ADR and update the relevant docs and ADRs **where the repo already keeps them** (e.g. `docs/`).
7. **Test / Validate** — Lint (`npm run lint`), run the instrumented Cypress + MSW flow (`npm run pre:test:start` → `npm run :test:start` → `npm run :test:all`, coverage via Istanbul), build (`npm run build`), check errors, and confirm each task works before moving on. For UI changes, confirm accessibility (WCAG 2.2 AA / GOV.UK Design System) and full bilingual (English + Welsh) coverage.
8. **Iterate** — Refine until the user is satisfied with each task.
9. **Summarise** — End with a detailed **executive summary** of what changed, why, how it was validated, and any follow-ups or risks.

**Code review is optional and on-request.** A full code review is **not** part of the default loop. Run it only when the user asks for one. At the end of implementation, if no review has been run, **offer** one (a single Yes/No question); invoke the reviewer only on an explicit Yes.

## Workflow agents

Standard and Complex work is coordinated through four custom agents that all run the framework above:

| Agent | Role |
|-------|------|
| [Orchestrator - External Frontend](.github/agents/external-fe-orchestrator.agent.md) | Plans, delegates, verifies and reports; owns the Yes/No user-approval gate and the end-of-work review offer. Does **not** implement. |
| [Planner - External Frontend](.github/agents/external-fe-planner.agent.md) | Internal planning subagent; produces the approval-ready plan and the single research pass behind it. Invoked for **Complex** work. |
| [Developer - External Frontend](.github/agents/external-fe-developer.agent.md) | Implements an already-approved plan end-to-end with tests; authors the lightweight inline plan for **Standard** work. |
| [Reviewer - External Frontend](.github/agents/external-fe-reviewer.agent.md) | Read-only review against DEFRA standards; reports findings by severity. **Optional, on-request only** — not run by default. |

Research (§4.2) uses the [deep-research-defra-alignment](.github/skills/deep-research-defra-alignment/SKILL.md) skill — a single risk-scoped pass run by the **Planner** (Complex work) or the **Developer** (Standard work). For user-facing accessibility and testing work the team also draws on the existing [Accessibility Advisor](.github/agents/accessibility-advisor.agent.md) and [Cypress Efficiency Tester](.github/agents/cypress-efficiency-tester.agent.md) agents and the [govuk-accessibility](.github/skills/govuk-accessibility/SKILL.md) skill.

## Skills

Use `/develop` for implementation, coding, and research tasks. Use `/unit-tests` for writing Cypress tests, MSW handlers, and coverage.

## Defra standards and governance

This service must comply with [Defra software development standards](https://github.com/DEFRA/software-development-standards) — the single source of truth. The rules below encode those standards; they do not replace them. When a standard changes, update this file.

### Quality gates

All code must pass these checks before merging:

- Linter passes (`npm run lint`)
- All tests pass via the instrumented Cypress flow (`npm run pre:test:start` → `npm run :test:start` → `npm run :test:all`)
- Coverage ≥90% global (Statements/Branches/Functions/Lines), ≥95% core business logic, 100% error-handling and security-critical paths — no decrease from the SonarCloud baseline
- SonarQube/SonarCloud quality gate passes; security hotspots reviewed and resolved
- At least one approving review from another developer
- No unresolved security vulnerabilities in dependencies

### Accessibility

- This is a public-facing government service — accessibility is mandatory, not optional
- All user-facing UI must meet [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) and use [GOV.UK Design System](https://design-system.service.gov.uk/) components — never build custom UI where a GOV.UK component exists
- Provide complete bilingual support (English + Welsh); never leave a Welsh translation as a TODO
- See the `govuk-accessibility` skill and `accessibility-advisor` agent, and comply with the [Public Sector Bodies Accessibility Regulations 2018](https://www.legislation.gov.uk/uksi/2018/952/made)

### Security and PII

- Follow [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- Never commit secrets — load all configuration and credentials from environment variables, never `process.env` scattered through code
- **Never log PII**: names, addresses, emails, phone numbers, NI numbers, bank details, usernames, passwords, API keys, tokens
- Validate and sanitise all input in server-side loaders/actions; protect state-changing routes with CSRF tokens (`<SecureForm>` + `validateCSRFToken`)
- Avoid `eval`, dynamic `Function()`, or executing user-supplied data; validate and normalise file paths
- Keep server-only code in `.server.ts` files — never import it into client bundles

### Dependencies

- New dependencies must be widely used, actively maintained, and compatible with the current Node.js LTS
- Do not introduce a second UI framework, styling system, or i18n library — reuse GOV.UK Frontend and i18next
- Prefer existing GOV.UK components and native platform APIs over new dependencies

### Logging

- Structured logging with correlation IDs propagated end-to-end (client + server via Application Insights)
- Levels: `error` (failures), `warn` (handled but unexpected), `info` (business events), `debug` (development only)

### How Copilot should respond

- Follow conventions already in the codebase — check existing patterns first
- Prefer modifying existing files over creating new ones when the change fits naturally
- Provide minimal diffs touching only the necessary files; do not refactor unrelated code
- Always include or update tests for changed behaviour (MSW handler + Cypress spec)
- If a request conflicts with these instructions — a discouraged library, a skipped test, a hard-coded secret, an inaccessible component, or a broken quality gate — flag it explicitly and do not proceed silently

### Licence

All code is published under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) unless an approved exception exists.

<!-- STANDARDS NOTE: These instructions reflect Defra software development standards (https://github.com/DEFRA/software-development-standards). Review this file periodically or after any Defra standards update. -->
