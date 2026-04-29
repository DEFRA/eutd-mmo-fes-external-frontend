# Context

## What we already know

Test historically have been very slow.
Some work has been done by GitHub user 'jvaccalluzzo' to help alleviate timeout issues by adding 'cypress-efficiency-tester.agent.md' in order to write test as efficiently as possible.

## Running Cypress test suites locally

The only efficient way to run local Cypress test suite is to run them using 'tests/cypress/docker-compose.yml' with `docker compose up` and amending the Dockerfile to include 'ENV NODE_OPTIONS=--max-old-space-size=4096' on line 24.

Attempts have also been made to execute the Cypress test suite locally by leveraging `cypress-parallel`. Any gaines made with AI are lost when having to run tests locally.

It is important to have stable deterministic tools in place to catch hallucination or insufficient vague instructions resulting in insinuations and therefore errors.

## Past issue and how it was resolved

### Issues Faced

Hydration race condition in SSR flow:
The app delayed hydrateRoot until i18n initialized, so Cypress sometimes interacted before the page was fully stable.
Input instability:
The filter input used uncontrolled behavior (defaultValue), so hydration/re-render could reset typed values.
Flaky Cypress command chaining:
Chained actions like cy.focused().clear().type(...) sometimes held stale DOM references and caused “element detached” failures.
Inconsistent network synchronization:
Some tests submitted forms without a matching cy.intercept() + cy.wait('@alias'), so assertions ran before POST/navigation completed.
CI-only timing sensitivity:
Slower Azure pipeline timing amplified all of the above, even when local runs looked fine.
Occasional mock gaps:
MSW warnings for unmatched requests introduced additional non-determinism.
How It Was Resolved

Added a deterministic hydration-ready gate before interactions:
Waited for the route-level readiness signal (span[tabindex="-1"] focused) before typing/clicking.
Reworked input interaction patterns:
Removed brittle forced typing where unnecessary.
Split interactions into separate cy.get() steps to re-query fresh elements before each action.
Standardized POST synchronization:
Registered cy.intercept() before submit/reset actions and added cy.wait('@filterSubmit') / cy.wait('@filterReset') before asserting outcomes.
Refactored spec organization for efficiency and consistency:
Grouped related tests with shared beforeEach setup (visit + hydration gate), reducing repeated fragile setup.
Improved assertion reliability:
Replaced fragile .then(...) count captures with Cypress-retryable alias patterns (e.g., .its('length').as(...)).
Applied fixes to the specific failing session-clearing tests:
Broke stale chains, added hydration gating, and aligned them with intercept/wait patterns.
Result

Tests became significantly more deterministic, especially in CI.
Main flaky failure modes (“disabled element”, “detached element”, race-after-submit assertions) were directly addressed with repeatable patterns.

### Issues Faced

1. CI instability in Cypress runs

- The pipeline data shows repeated failures in the Cypress step over recent runs, with Run Cypress tests being the top failing task in Build.
- Evidence is captured in PipelineRunActivityResults-TaskDisplayName.json and PipelineRunActivityResults-TaskDisplayName.json.

1. Electron/Cypress process crashes in CI

- You hit runner exits/crashes (SIGABRT style failure behavior), which is consistent with memory pressure and long-running spec load in CI.

1. Test flakiness from SSR hydration and timing races

- Intermittent failures were caused by interaction timing before hydration settled, stale element references, and assertions running before POST/search/reset completed.
- This is documented in your spike notes at Spike.md.

1. Broad pipeline noise across stages

- Beyond Cypress, there are stage failures and agent/job failures visible in analytics exports.
- See PipelineRunActivityResults-FailedStageCount.json and PipelineRuns.json.

**How It Was Resolved**

1. CI memory hardening for test container

- Added Node heap increase in Docker test stage:
- Dockerfile
- Change: set NODE_OPTIONS to --max-old-space-size=4096
- Purpose: reduce Cypress/Electron crash risk under CI memory pressure.

2. Test stability pattern standardization

- Hydration-ready gating before interactions.
- Safer input interaction patterns for SSR/hydration behavior.
- Explicit network synchronization with intercept + wait before assertions.
- These remediation patterns are summarized in Spike.md.

3. Data-backed failure analysis

- Added 14-day and 180-day pipeline exports to identify where failures cluster and prioritize fixes.
- Example files:
- PipelineRunActivityResults.json
- PipelineRunActivityResults.json

**Current Outcome**

- You now have:

1. A concrete infrastructure mitigation (increased Node memory in CI test container).
2. A documented, repeatable stability approach for flaky Cypress SSR tests.
3. Quantified pipeline evidence to track whether failure rates improve after the changes.

If you want, I can also turn this into a short PR-ready summary (Problem, Fix, Evidence, Risk) you can paste directly into your ticket or merge request.

## Way forward

Here’s the concise summary of this conversation, with emphasis on the Cypress → React Testing Library (RTL) requirement and rationale.

The conversation moved through three stages:

1. Clarifying E2E purpose

- You asked what end-to-end tests like Cypress are for.
- The key point was: Cypress validates real user journeys across the full stack (browser + SSR + loaders/actions + routing + progressive enhancement), and is valuable for regression protection on critical flows.

2. Identifying current pain

- You described pipeline issues: Cypress is slow, memory-constrained, and flaky around hydration in CI.
- We discussed that these failures are expected in large-org constrained CI because Cypress requires heavy runtime (browser + app server + instrumentation), and hydration timing introduces nondeterministic failures.

3. Defining the required testing split (most important outcome)

- You asked how RTL would help.
- The recommended requirement was established as:
  - Use RTL by default for component/state behavior.
  - Keep Cypress only for critical E2E journeys that truly need a real browser + full SSR stack.

Why move many tests from Cypress to RTL

- Speed: RTL runs in jsdom, so tests are much faster.
- Memory: RTL has much lower resource usage than browser-based Cypress.
- Stability: RTL avoids most hydration-race flake by testing React behavior directly with deterministic update flushing (`act()`), rather than waiting for browser hydration timing.
- Better test-level fit: Logic like `useEffect` state transitions, conditional rendering, field add/remove behavior, and error rendering are component concerns, not full E2E concerns.

What should remain in Cypress

- Critical happy-path user journeys across pages.
- Progressive enhancement checks (JS disabled).
- True cross-route/navigation/full-stack assertions.

Agent/config changes requested and implemented

- You asked to rename and update the testing agent to enforce this split.
- The agent was renamed and rewritten to be RTL-first, Cypress-only-for-critical-paths, including guidance to migrate over-scoped Cypress tests into RTL where appropriate.

Vitest question outcome

- You asked if Vitest is required.
- Answer: not strictly required, but recommended in this Vite-based repo because it is the lowest-friction runner for RTL.
- Alternatives like Jest are possible but need more configuration; Cypress component testing would not solve the CI memory/speed objective.

Bottom line

- The conversation’s key requirement is a testing strategy shift:
  - “Cypress for a small critical-path set”
  - “RTL for most UI/component logic”
- The reason is to reduce CI time, memory pressure, and hydration-related flakiness while maintaining confidence.

## High-value insights from pipeline reports over the last 180 days

Build-stage dominance in failures (primary bottleneck surface).
Run Cypress tests is the largest single failing task (largest stabilization lever).
Agent/job failures in TST1/DEV1/SND1 indicate infra noise contributing to perceived flakiness.
Publish coverage/results failures are often secondary, so treat them as cascade symptoms in reporting.
