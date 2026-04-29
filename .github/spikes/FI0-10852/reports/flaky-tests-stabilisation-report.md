# FI0-10852: Flaky Tests Tracking and Stabilisation Approach

## Summary

This report captures currently tracked flaky Cypress tests and defines stabilisation actions for each hotspot.

## Tracked flaky tests

| Area                                                    | Test(s) / file(s)                                                                                                | Flakiness evidence                                                                                                                | Stabilisation approach                                                                                                                                                                                                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Exporter address selected-address flow (CC)             | `tests/cypress/integration/routes/whatExportersAddress.spec.ts` (block from line ~310)                           | Inline comment: `I skipped these tests as they are flaky in CI/CD`; multiple forced actions (`type/click` with `{ force: true }`) | Add deterministic readiness gate before interaction; remove forced actions where possible; register `cy.intercept()` before postcode lookup/get-address submit and `cy.wait('@alias')` before assertions; assert field enabled/visible before interaction.   |
| Catch-added save-as-draft filter reset                  | `tests/cypress/integration/routes/catchAdded.spec.ts` (`should clear search filter when clicking Save as Draft`) | Inline comment: `cy.wait(500)... only way around flaky test right now`                                                            | Remove fixed wait; keep hydration-ready gate; re-query elements between actions; use explicit POST alias waits for search and reset/submit; assert post-navigation state only after network completion.                                                      |
| Issuing-country reset behavior (PS add catch details)   | `tests/cypress/integration/routes/addCatchDetails.issuingCountry.spec.ts`                                        | One skipped test (`it.skip(...)`) and multiple fixed waits (`500/1000ms`) used for hydration/update timing                        | Replace sleeps with deterministic checkpoints (field presence/value reset and request completion); split chained interactions into fresh `cy.get()` calls; keep only critical journey checks in E2E, move state-transition edge cases to RTL where suitable. |
| useEffect/species-selection branch-heavy coverage tests | `tests/cypress/integration/routes/whatAreYouExporting.spec.ts`                                                   | High concentration of fixed waits (`1000–2000ms`) in coverage-focused sections (`Complete coverage`, `Function coverage`)         | Migrate branch-level logic tests to RTL/component tests; in retained Cypress tests, replace timed waits with DOM-ready and network-ready assertions.                                                                                                         |
| Session/species count update tests                      | `tests/cypress/integration/routes/processingStatementAddCatchDetails.spec.ts`                                    | Fixed waits (`1000ms`) before state/session assertions                                                                            | Use action-level network synchronization (`intercept + wait`) for add/remove submits; assert only after request completion and target UI state is stable.                                                                                                    |
| Transport change flow stability                         | `tests/cypress/integration/routes/checkYourInformation.spec.ts`                                                  | Fixed waits with explicit “form stability” comments                                                                               | Replace static waits with route transition checks (`cy.url`) + stable form-ready assertions (key controls visible and enabled).                                                                                                                              |

## Known skipped tests

1. `tests/cypress/integration/routes/whatExportersAddress.spec.ts` (selected-address block is marked as flaky in comments)
2. `tests/cypress/integration/routes/addCatchDetails.issuingCountry.spec.ts`
   - `it.skip("should clear issuing country after adding a catch", ...)`
3. `tests/cypress/integration/routes/pageNotFound.spec.ts`
   - `it.skip("should render CatchBoundary for thrown responses", ...)`
   - `it.skip("should render ErrorBoundary for uncaught thrown errors", ...)`

## Standard stabilisation pattern

1. Add a deterministic hydration-ready gate before interactions.
2. Avoid stale references by re-querying elements before each action.
3. Register `cy.intercept()` before submits and `cy.wait('@alias')` before assertions.
4. Eliminate `cy.wait(<number>)` sleeps where possible.
5. Move non-journey branch/logic coverage from Cypress to RTL.

## Prioritised next actions

1. Fix `whatExportersAddress.spec.ts` selected-address flow first (currently explicitly flagged flaky).
2. Remove hard waits from `catchAdded.spec.ts` and `addCatchDetails.issuingCountry.spec.ts`.
3. Refactor `whatAreYouExporting.spec.ts` coverage-heavy blocks into RTL tests.
4. Re-enable skipped tests once deterministic synchronization is in place.
