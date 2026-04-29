# FI0-10852: Slowest 10 Cypress Tests (with reasons)

## Source

- Parsed from JUnit artifacts in `runner-results/test-results/*.xml`
- Total testcases parsed: `2615`

## Slowest 10 testcases

| Rank | Spec file | Test name | Duration (s) | Reason |
|---|---|---|---:|---|
| 1 | `tests/cypress/integration/routes/addStorageFacilityDetails.spec.ts` | Add Storage Facility page when javascript is disabled Add Storage Facility page save as draft should not show validation errors when clicking on draft | 5.309 | JavaScript-disabled journey with full server round-trip and page re-render on draft action. |
| 2 | `tests/cypress/integration/routes/processingStatementAddCatchDetails.spec.ts` | PS: Add catch details - Remove Functionality and Count Updates should not decrease unique species count when removing one of multiple catches with same species | 5.275 | Multi-step data setup/removal scenario with repeated navigation and state recalculation. |
| 3 | `tests/cypress/integration/routes/signOut.spec.ts` | Sign Out Page should redirect to logout page after 5s | 5.230 | Intentionally time-based test waiting for 5-second redirect behavior. |
| 4 | `tests/cypress/integration/routes/whatAreYouExporting.spec.ts` | AddProducts useEffect hooks: Complete coverage without intercepts useEffect for commonSpecies - Fetch states when species change should handle species change by updating states | 5.146 | Coverage-heavy interaction path that triggers multiple client state updates/re-renders. |
| 5 | `tests/cypress/integration/routes/whatAreYouExporting.spec.ts` | handleSpeciesSelection function: Complete coverage Function coverage - All execution paths should execute handleSpeciesSelection with various input values | 4.870 | Branch-heavy test exercising several selection paths in one E2E scenario. |
| 6 | `tests/cypress/integration/routes/processingStatementAddCatchDetails.spec.ts` | PS: Add catch details - Unique Species and Documents Session Management should increment unique species count when adding different species | 4.825 | Session mutation and species aggregation checks over multiple step transitions. |
| 7 | `tests/cypress/integration/routes/storageDocumentAddArrivalTransportationDetailsContainerVessel.spec.ts` | AddArrivalContainerVesselTransportSave scenarios Container Vessel Validation Scenarios should add 5 container numbers with correct format | 4.282 | High-input validation test (adds multiple container IDs) with repeated form operations. |
| 8 | `tests/cypress/integration/routes/whatAreYouExporting.spec.ts` | handleSpeciesSelection function: Complete coverage Multiple species selection scenarios should handle empty species selection (clearing species) | 4.179 | Clearing/reselection flow triggers repeated UI and dependent-state recomputation. |
| 9 | `tests/cypress/integration/routes/storageDocumentAddTrainTransportDetails.spec.ts` | Train Container Identification Number - Validation Scenarios should add 5 container numbers with correct format | 4.157 | Repeated container-number validation inputs in a single scenario. |
| 10 | `tests/cypress/integration/routes/storageDocumentAddTruckTransportDetails.spec.ts` | Truck Container Identification Number - Validation Scenarios should add 5 container numbers with correct format | 4.133 | Repeated container-number validation inputs in a single scenario. |

## Notes

- These are **per-testcase** timings from JUnit XML (`<testcase time="...">`), not estimated from file size.
- The main runtime themes are:
  1. Time-based waits/redirect logic
  2. Multi-step stateful workflows
  3. Coverage-heavy scenarios with many interaction branches
  4. High-input validation tests
