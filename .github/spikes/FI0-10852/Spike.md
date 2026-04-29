# Spike

## Ticket requirements

### Summary

Evaluate and improve the efficiency of the current Cypress E2E test suite to reduce execution time, eliminate redundancy, improve stability, and ensure meaningful coverage aligned with application workflows.

### Background / Context

The engineering team relies heavily on Cypress for browser‑level testing across multiple user journeys. Recent work has expanded the suite significantly, and periodic issues have surfaced relating to:
Slower overall execution times as the number of spec files increases
Redundant or overlapping test cases across dashboards and routes
Occasional flakiness caused by network stubbing, environment configuration, or DOM timing
Coverage gaps between Cypress E2E tests and component/unit tests (e.g., Istanbul coverage for component tests)
A structured review is required to validate that our E2E suite remains performant, maintainable, and aligned with testing best practices.

### Objectives

Assess current E2E test execution times
Identify slowest-running specs and commands.
Determine whether slowness is due to application flow, network waits, or Cypress retry behaviour.
Identify redundant or overlapping test cases
Review routes with multiple similar tests.
Consolidate where E2E coverage exceeds its intended scope.
Improve test stability (reduce flakiness)
Identify tests failing due to timing, environment configuration, or API mocking.
Introduce best‑practice patterns (e.g., deterministic network mocks where appropriate).
Evaluate test structure and maintainability
Review use of custom commands.
Ensure selectors and patterns follow recommended conventions.
Check whether global config in e2e.js or project config can be streamlined.
Align E2E suite with overall test pyramid
Shift non‑critical UI logic to component or integration tests where appropriate.
Ensure E2E tests focus on critical end‑user workflows.

### Scope

Full Cypress E2E suite across all relevant routes and spec files
Pipeline execution (CI) environment behaviour
Supporting configuration: fixtures, mocks, custom commands, environment config
Does not include rewriting application code outside test requirements

### Deliverables

[A report summarising:
[] Current execution metrics
[] Key inefficiencies or bottlenecks
[] Redundant / outdated tests
[] Areas of flakiness and root causes
[] A prioritised list of recommended improvements
[] Updated testing guidelines where required
[] Proposed changes to the test suite structure (if applicable)

### Acceptance Criteria

[x] Execution time benchmark documented (baseline)
[x] Slowest 10 tests identified with reasons
[x] Redundant tests flagged with consolidation suggestions
[x] Flaky tests tracked and stabilisation approach defined
[x] Updated guidelines for writing efficient Cypress E2E tests
[ ] Final recommendations reviewed with QA & development team

### Additional Notes

If needed, reference existing Cypress component test coverage, CI execution logs, or recent cross‑team discussions on test strategy. Coordination with QA may be required for test coverage alignment.
