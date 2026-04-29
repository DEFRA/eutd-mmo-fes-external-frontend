# FI0-10852: Redundant Cypress Tests and Consolidation Suggestions

## Summary

This report flags repeated Cypress E2E patterns across route specs and proposes consolidation to reduce runtime, maintenance overhead, and flakiness exposure.

## Redundancy hotspots

| Area | Evidence | Redundancy observed | Consolidation suggestion |
|---|---|---|---|
| Transport documents across modes | Duplicate scenarios across `addTransportDocumentsContainerVessel.spec.ts`, `addTransportDocumentsPlane.spec.ts`, `addTransportDocumentsTrain.spec.ts`, `addTransportDocumentsTruck.spec.ts` | Same test cases repeated per mode (e.g. add-another limits, empty form errors, persisted values, save-as-draft routing) | Build a shared data-driven suite: `runTransportDocumentsContract({ mode, route, selectors })`. Keep one mode-specific smoke test each; move repeated validation matrix into shared helper. |
| Address lookup/selection pages | Same assertions repeated in `whatExportersAddress.spec.ts`, `processingStatementWhatExportersAddress.spec.ts`, `storageDocumentWhatExportersAddress.spec.ts`, `whatProcessingPlantAddress.spec.ts`, `whatStorageFacilityAddress.spec.ts`, `addProcessingPlantAddress.spec.ts` | Near-identical postcode, selected-address, and missing-selection validation tests | Create `runAddressLookupContractTests()` reusable suite with per-page config for route and labels. Retain only page-specific branching tests separately. |
| Copy/Void flow | Repeated behavior in `copyThisCatchCertificate.spec.ts`, `copyThisProcessingStatement.spec.ts`, `copyThisStorageDocument.spec.ts`, `copyVoidConfirmation.spec.ts`, `processingStatementCopyVoidConfirmation.spec.ts`, `storageDocumentCopyVoidConfirmation.spec.ts` | Same redirect/forbidden scenarios validated in multiple specs | Consolidate to one shared copy/void contract suite plus one happy-path E2E per document journey. |
| Progress pages | `catchCertificateProgress.spec.ts`, `processingStatementProgress.spec.ts`, `storageDocumentProgress.spec.ts` | Same structural assertions (including repeated error rendering checks) | Create shared `assertProgressPageBasics()` and keep journey-specific assertions only where content differs. |
| Save-as-draft redirect checks | Repeated save-as-draft redirect tests across transport and additional transport specs | Many identical redirect assertions with only route context changed | Replace with one parameterized redirect test helper and invoke from route matrix. |
| Storage transport container validations | Repeated “add 5 container numbers” and related validations in `storageDocumentAddArrivalTransportationDetailsContainerVessel.spec.ts`, `storageDocumentAddTrainTransportDetails.spec.ts`, `storageDocumentAddTruckTransportDetails.spec.ts` | Same container-number rules duplicated by transport type | Extract shared container validation contract with transport-specific setup. |
| Low-value UI boilerplate checks | Repeated checks like “render title”, “render form button”, “render back link”, “render input label and hint text” across many specs | High volume of repeated assertions with low defect-detection value | Reduce to route smoke contracts; avoid repeating generic UI assertions in all scenario specs. |
| E2E branch-coverage suites | Coverage-focused blocks in `whatAreYouExporting.spec.ts`, `addProductToThisConsignment.spec.ts`, `you-have-added-a-product.spec.ts` | Component-level logic branches are tested in E2E, increasing runtime and brittleness | Migrate branch-heavy logic tests to RTL/component tests; keep Cypress for critical end-to-end journeys only. |

## Prioritised consolidation plan

1. Consolidate the 4 transport-documents specs into one parameterized contract suite.
2. Consolidate address lookup specs into one shared address contract suite.
3. Refactor copy/void tests into one reusable suite + minimal journey smoke coverage.
4. Move branch-heavy “coverage” scenarios from Cypress to RTL where possible.
5. Standardize shared smoke checks (title/back-link/button) to avoid duplicated boilerplate.

## Expected impact

- Reduced Cypress runtime through fewer duplicated scenarios.
- Lower flake surface area by reducing repeated SSR/hydration interactions.
- Easier maintenance: one source of truth for common validation behavior.
- Better pyramid alignment: E2E for critical workflows, component tests for logic branches.
