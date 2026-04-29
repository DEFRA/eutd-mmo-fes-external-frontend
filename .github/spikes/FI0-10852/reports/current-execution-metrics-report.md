# FI0-10852: Current Execution Metrics

## Source

Tests were executed by running:

```bash
docker compose -f tests/cypress/docker-compose.yml up
```

The compose file builds the app from the `test` stage of the `Dockerfile` (instrumented with Istanbul), starts the `frontend` service, waits for its health check, then runs the `cypress` service which executes `npm run :test:ci` against all specs. `mocha-junit-reporter` writes per-test JUnit XML files to `/app/test-results` inside the container.

The 122 XML files were then manually copied from the container to `runner-results/test-results/` and parsed to produce the metrics below.

## Overall metrics

| Metric | Value |
|---|---:|
| Spec result files | 122 |
| Specs represented | 122 |
| Total test cases | 2,615 |
| Passed | 2,614 |
| Failed | 1 |
| Skipped | 0 |
| Pass rate | 99.96% |
| Total testcase time | 1,092.336s (18.21 min) |
| Average per test | 0.418s |
| Median (p50) | 0.223s |
| p90 | 1.034s |
| p95 | 1.522s |
| p99 | 2.584s |
| Max single test | 5.309s |

## Top 5 slowest specs (cumulative testcase time)

| Rank | Spec | Testcases | Time (s) |
|---|---|---:|---:|
| 1 | `tests/cypress/integration/routes/whatAreYouExporting.spec.ts` | 148 | 111.191 |
| 2 | `tests/cypress/integration/routes/processingStatementAddCatchDetails.spec.ts` | 115 | 79.338 |
| 3 | `tests/cypress/integration/routes/directLanding.spec.ts` | 102 | 77.120 |
| 4 | `tests/cypress/integration/routes/addProductToThisConsignment.spec.ts` | 107 | 42.125 |
| 5 | `tests/cypress/integration/routes/addLandings.spec.ts` | 92 | 40.058 |
