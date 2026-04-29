# FI0-10852: Requirements Audit and Recommendations

> **Updated evaluation** — full cross-reference of `Spike.md` objectives, `Context.md` history, sub-reports, and live codebase analysis.

---

## Executive summary

The spike has produced evidence across all five acceptance criteria. Three Spike.md objectives were not addressed in the original sub-reports and require new findings:

- **Custom command review** — identified: only 2 commands registered, widely under-used
- **Selector & interaction conventions** — critical finding: 2,204 `force: true` usages, 0 `cy.wait('@alias')` calls
- **Global config streamlining** — identified: suppressed uncaught exceptions, retries in openMode, no failure screenshots/video

Two acceptance criteria remain formally open:

- `[ ]` Final recommendations reviewed with QA & development team — requires sign-off session

---

## Local test execution context

As documented in `Context.md § Running Cypress test suites locally`, the **only efficient way to run the full Cypress suite locally is via Docker Compose**:

```bash
docker compose -f tests/cypress/docker-compose.yml up
```

This is a hard constraint, not a preference. The reasons are:

1. **Memory pressure** — The `test` Docker image sets `ENV NODE_OPTIONS=--max-old-space-size=4096` (Dockerfile line 24). Without this, the Electron/Cypress process crashes mid-run under CI-equivalent load. Running outside Docker does not automatically apply this flag.

2. **`cypress-parallel` was evaluated and rejected** — Attempts to run specs in parallel locally via `cypress-parallel` were made but the gains were negated by the overhead and configuration cost.

3. **Determinism requirement** — As noted in `Context.md`: _"It is important to have stable deterministic tools in place to catch hallucination or insufficient vague instructions resulting in insinuations and therefore errors."_ The Docker-compose method provides a controlled, reproducible environment that mirrors CI behaviour. Ad-hoc local runs introduce environment variance that undermines confidence in results.

**Impact on this spike's evidence**: All 122 JUnit XML files in `runner-results/test-results/` were produced by this method — the compose run was executed, results written to `/app/test-results` inside the container, then manually copied out for analysis. This means the metrics baseline is CI-equivalent, not a faster local-only run.

---

## Requirement coverage matrix

| Spike.md objective                                        | Status     | Evidence                                                           | Gaps / Notes                                                                                         |
| --------------------------------------------------------- | ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Assess current E2E execution times                        | ✅ Met     | `current-execution-metrics-report.md`                              | 2,615 tests; 18.21 min total; p50=0.223s; p95=1.522s                                                 |
| Identify slowest specs                                    | ✅ Met     | `slowest-10-tests-report.md`                                       | Top 10 by JUnit test-case timing, with root causes                                                   |
| Identify slowest **commands**                             | ⚠️ Partial | `slowest-10-tests-report.md`                                       | Fixed `cy.wait(n)` calls identified; no per-command profiling available from JUnit                   |
| Determine cause of slowness (flow / waits / retries)      | ⚠️ Partial | `flaky-tests-stabilisation-report.md`                              | Fixed waits and hydration timing addressed; **retry impact not quantified** (retries=3, see §Config) |
| Identify redundant / overlapping tests                    | ✅ Met     | `redundant-tests-consolidation-report.md`                          | 8 hotspots; file groups and consolidation targets named                                              |
| Review routes with multiple similar tests                 | ✅ Met     | `redundant-tests-consolidation-report.md`                          | Transport docs and address-flow triplication are highest-yield targets                               |
| Consolidate where E2E scope exceeds intent                | ✅ Met     | `redundant-tests-consolidation-report.md` + `Context.md` RTL split | RTL migration direction defined                                                                      |
| Improve stability / reduce flakiness                      | ✅ Met     | `flaky-tests-stabilisation-report.md`                              | Patterns documented; CI memory hardening already applied                                             |
| Identify tests failing due to timing / env / mocking      | ✅ Met     | `flaky-tests-stabilisation-report.md` + `Context.md`               | Hydration race, stale-chain, MSW gap patterns all documented                                         |
| Introduce best-practice patterns                          | ✅ Met     | `Context.md` (hydration gate, intercept/wait, RTL-first)           | Guidance captured; **not yet enforced via linting or agent rules**                                   |
| **Review use of custom commands**                         | ❌ Gap     | _New finding (see §Custom commands below)_                         | Only 2 commands registered; major opportunity missed                                                 |
| **Ensure selectors follow conventions**                   | ❌ Gap     | _New finding (see §Selector conventions below)_                    | 2,204 `force: true`; 0 network-alias waits                                                           |
| **Streamline global config (e2e.js / cypress.config.ts)** | ❌ Gap     | _New finding (see §Config audit below)_                            | Suppressed exceptions, openMode retries, no debug artefacts                                          |
| Align E2E suite with test pyramid                         | ✅ Met     | `Context.md` Way forward section                                   | RTL-first + Cypress for critical journeys; Vitest recommended                                        |
| Shift non-critical UI logic to component tests            | ✅ Met     | `redundant-tests-consolidation-report.md`                          | Branch-heavy blocks named for RTL migration                                                          |

### Acceptance criteria status

| Criterion                                                  | Status                                                                                                                                                                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Execution time benchmark documented (baseline)             | ✅ Done                                                                                                                                                                                  |
| Slowest 10 tests identified with reasons                   | ✅ Done                                                                                                                                                                                  |
| Redundant tests flagged with consolidation suggestions     | ✅ Done                                                                                                                                                                                  |
| Flaky tests tracked and stabilisation approach defined     | ✅ Done                                                                                                                                                                                  |
| Updated guidelines for writing efficient Cypress E2E tests | ✅ Done — codified in `.github/agents/cypress-efficiency-tester.agent.md` (deterministic waits, hydration gate, intercept/alias sync, RTL-first split, no `force: true`, no fixed waits) |
| Final recommendations reviewed with QA & development team  | ❌ Open — requires review session                                                                                                                                                        |

---

## New findings from codebase analysis

### Custom commands

`tests/cypress/support/commands.js` contains only **2 custom commands**:

| Command                   | Purpose                       | Usage                                       |
| ------------------------- | ----------------------------- | ------------------------------------------- |
| `cy.findGovUkLabel(text)` | Locate `.govuk-label` by text | 1 spec file (`whoseWatersWereTheyCaughtIn`) |
| `cy.findGovUkHint(text)`  | Locate `.govuk-hint` by text  | Not found in active specs                   |

**Impact**: Without shared journey helpers, every spec duplicates boilerplate setup (visit, hydration gate, intercept setup). This increases spec file length, duplicates fragile selector strings, and makes cross-cutting changes (e.g., renaming a `data-testid`) a multi-file effort.

**Recommendation**: Create typed custom commands for shared journey fragments — e.g., `cy.visitAndWaitForHydration(url, testParams)`, `cy.submitForm(alias)`, `cy.assertErrorSummary(messages[])`. Register them in `commands.js` with TypeScript declarations in `index.d.ts`.

---

### Selector and interaction conventions

| Pattern                             | Count     | Risk                                                                                                      |
| ----------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `force: true` clicks                | **2,204** | Bypasses actionability checks; masks hidden/disabled element bugs; leading cause of false-positive passes |
| `cy.wait(@alias)` network waits     | **0**     | Zero tests use proper intercept/alias synchronization                                                     |
| `cy.wait(<number>)` fixed waits     | **194**   | Arbitrary timing; slow in nominal runs; flaky on slower CI agents                                         |
| `data-cy` / `data-testid` selectors | 96 specs  | Good — intent-driven, change-resistant                                                                    |
| `.govuk-*` CSS class selectors      | 81 specs  | Brittle to GOV.UK Frontend upgrades; should be supplemented with semantic queries                         |

**`force: true` — the single largest quality risk in the suite.**
Most usages follow a pattern like `cy.get("[data-testid='save-and-continue']").click({ force: true })`. This means the button is not yet visible or interactive when Cypress attempts the click. The correct fix is a hydration-ready gate before the click, not bypassing the check. The 2,204 occurrences span at least 80 spec files and represent systemic misuse, not isolated cases.

Top offenders by `force: true` count:
| Spec | Count |
|---|---|
| `processingStatementAddCatchDetails.spec.ts` | 44 |
| `directLanding.spec.ts` | 33 |
| `addExporterDetails.spec.ts` | 24 |
| `whatAreYouExporting.spec.ts` | 23 |
| `addProductToThisConsignment.spec.ts` | 17 |

---

### Global config audit

**`cypress.config.ts`**

| Setting                  | Current value             | Assessment                                                                                                                   |
| ------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `defaultCommandTimeout`  | 10,000 ms                 | Reasonable; was previously 20,000 (commented out). **However**, high timeout + 3 retries = worst-case 40s per flaky test     |
| `pageLoadTimeout`        | 60,000 ms                 | Generous; appropriate for SSR but contributes to long tail on slow agents                                                    |
| `retries.runMode`        | 3                         | Acceptable for CI resilience                                                                                                 |
| `retries.openMode`       | 3                         | **Anti-pattern** — retries in open (interactive) mode hide flakiness during local development; should be 0                   |
| `video`                  | false                     | Saves CI disk space but **removes debugging capability** for CI failures                                                     |
| `screenshotOnRunFailure` | false                     | **Removes the primary debugging artefact for failures** — screenshots are very low-cost; disabling this is counterproductive |
| `numTestsKeptInMemory`   | 0                         | Correct for CI memory hardening                                                                                              |
| `reporter`               | `cypress-multi-reporters` | Correct                                                                                                                      |

**`tests/cypress/support/e2e.js`**

```js
Cypress.on("uncaught:exception", () => false);
```

This **swallows all uncaught browser exceptions** silently. If the application throws a JS runtime error during a test, the test continues and may pass. This has masked real application bugs in the past and should be replaced with a targeted allow-list (e.g., ignore only known third-party script errors).

**`@testing-library/cypress`** is imported via `e2e.js` but no spec uses its queries (`cy.findByRole`, `cy.findByLabelText`, etc.). The import adds setup cost with no current benefit — or alternatively, tests should migrate to using its accessible queries.

### Recommended Alternative: Targeted Allow-list

Instead of a global "ignore all" rule, you should use a conditional allow-list in your support/e2e.js file to ignore only specific, known errors (like those from third-party scripts) while letting actual application errors fail the test.

---

## Data-quality caveats (180-day pipeline exports) Azure DevOps

The Azure DevOps Analytics OData exports in `.github/spikes/FI0-10852/180days/` were used to satisfy the spike objective of identifying **key inefficiencies and bottlenecks** at the pipeline level — specifically to determine whether Cypress failures are the primary CI failure surface and whether infra instability is a confounding factor. This data is the only available source of CI failure-rate evidence beyond the single local Docker Compose run.

The following caveats must be understood before drawing conclusions from the figures:

1. Scaped files use mixed aggregation grains (run, stage, task) — counts are **not directly additive**.
2. `SucceededCount = 0` across the extracted window likely reflects filter/scope bias or that "partially succeeded" captures successful-with-warnings runs.
3. `FailedCount`, `FailedStageCount`, and task-level `FailedCount` are different metrics with different denominators.
4. `Publish test results` and `Publish coverage for SonarCloud` each had 10 failures — these are **cascade symptoms** of the primary Cypress failure, not root causes.
5. TST1 had 13 `Job Failure For Agent` events — infra instability separate from test code quality.
6. The folder is named `180days` because that was the lookback window configured in the Azure DevOps Analytics OData query. However the actual data returned only covers April 16–29 2026 (~14 days), most likely because the pipeline definition had no runs older than that. Anyone reading the folder name and assuming 6 months of evidence would significantly overstate the statistical weight of the figures — 188 runs over 14 days is a narrow sample, not a 180-day baseline.

---

(Pipeline failure report)[https://dev.azure.com/defragovuk/DEFRA-MMO-FES/_pipeline/analytics/stageawareoutcome?definitionId=10060&contextType=build]

## Prioritised recommendations

### P1 — Immediate (highest impact, lowest risk)

1. **Enable `screenshotOnRunFailure: true`** in `cypress.config.ts` — restores the primary debugging artefact for CI failures at near-zero cost.
2. **Set `retries.openMode: 0`** — prevents flakiness being masked during local development.
3. **Replace the blanket `uncaught:exception` suppressor** with a targeted allow-list in `e2e.js`.
4. **Remove `force: true`** from `save-and-continue` and primary action clicks — replace with hydration-ready gate (`cy.get('[tabindex="-1"]').should('be.focused')` or equivalent) before the click. Start with the top 5 offender specs (244 forced clicks between them).

### P2 — Short term (high value, moderate effort)

5. **Introduce `cy.intercept()` + `cy.wait('@alias')`** for all POST/navigation-triggering actions — the current count of 0 alias waits means no spec correctly synchronizes on network outcomes. This is the root cause of most `cy.wait(<number>)` workarounds.
6. **Create 3–5 shared custom commands** for the most-repeated journey fragments (visit + hydration, form submit, error summary assertion). This reduces boilerplate across ~120 specs.
7. **Consolidate transport-document and address-lookup spec triplication** as identified in `redundant-tests-consolidation-report.md`.

### P3 — Medium term (structural)

8. **Migrate branch-heavy Cypress blocks to RTL + Vitest** — this is the most strategically significant recommendation in this report and addresses three problems simultaneously:

   - **Heavy CI burden**: Cypress requires a real browser, app server, and instrumentation stack running concurrently. RTL runs in jsdom with no server — the same component logic tests run in milliseconds instead of seconds, directly reducing the 18-minute suite time.
   - **Separation of concerns**: The current suite uses Cypress as a catch-all — unit-level conditional rendering, field validation, error state logic, and true end-to-end journeys all live in the same tool. RTL should own component and state behaviour; Cypress should own only critical full-stack journeys that require a real browser and SSR. This is the correct test pyramid for this application.
   - **Deterministic verification of AI-generated code**: As noted in `Context.md`, *"It is important to have stable deterministic tools in place to catch hallucination or insufficient vague instructions resulting in insinuations and therefore errors."* RTL's `act()` flushes state updates synchronously — assertions run against a known, settled state. Cypress's retry-ability can mask subtle logic errors by eventually passing on a timing fluke. For AI-assisted development, RTL fails fast and precisely on wrong behaviour where Cypress may not.

   Start the migration with conditional rendering and error-state logic in the top 5 slowest specs (`whatAreYouExporting`, `processingStatementAddCatchDetails`, `directLanding`, `addProductToThisConsignment`, `addLandings`) — these account for 350s (~32%) of total suite time and contain the highest density of branch-coverage tests that belong in RTL.

9. **Extract testing guidelines** from `Context.md` into a standalone `docs/testing-guidelines.md` or update the `unit-tests` skill to enforce them as authoring rules.
10. **Update `findTests.sh`** to bin-pack on JUnit-measured timing rather than `it(` count — current weight function diverges significantly from actual runtime distribution.
11. **Track two KPIs** post-improvement: (a) Build-stage Cypress failure share from pipeline analytics; (b) p50/p95/p99 testcase runtimes from JUnit artefacts.

### P4 — Formal closure

12. **Hold QA + Dev review session** on this report set, record sign-off, and commit a brief sign-off note to close the final `Spike.md` acceptance criterion.
