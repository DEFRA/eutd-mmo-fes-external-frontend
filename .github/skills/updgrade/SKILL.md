---
name: review-service-upgrades
description: "Expert dependency upgrade reviewer for MMO FES services. Use when: reviewing npm dependencies for vulnerabilities, upgrading packages safely, running npm audits, producing upgrade PRs with before/after evidence."
---

# Service Dependency Upgrade Review Skill

Expert in safe npm dependency upgrades, vulnerability auditing, and producing clean upgrade PRs with full audit traceability.

## When to Use

- Reviewing npm dependencies for known vulnerabilities
- Applying safe non-breaking upgrades (patch/minor only)
- Fixing transitive vulnerabilities via `"overrides"` in `package.json`
- Producing auditable upgrade PRs with before/after evidence
- Establishing or verifying `.nvmrc` Node version alignment

## Key Commands

- Install from lockfile: `npm ci`
- Audit vulnerabilities: `npm audit`
- Non-breaking auto-fix: `npm audit fix`
- Check outdated packages: `npm outdated`
- Targeted upgrade: `npm install <pkg>@<version>`
- Install report tool (once): `npm i -g npm-audit-markdown`
- Generate audit report (Confluence/PR): `npm audit --json | npm-audit-markdown --output report.md`

## Upgrade Workflow (5 Steps)

### Step 0: Prep

1. **Ensure `npm-audit-markdown` is installed**

   - Check: `npm-audit-markdown --version`
   - If not found, install globally: `npm i -g npm-audit-markdown`
   - This is a one-time setup per machine. It converts `npm audit --json` output into a readable Markdown report for PRs and Confluence.

2. **Capture work identifiers before branching**

   - Ask for and confirm:
     - Ticket number (for example: `ABC-123`)
     - Sprint number (for example: `182`)
     - Short work summary slug (for example: `review-service-to-identify-if-upgrades-are-required`)

3. **Checkout a fresh branch**

   - `git checkout -b feature/<ticket>-sprint-<sprint>-<summary-slug>`

4. **Clean slate**

   - Ensure no local build artefacts; confirm correct Node version (use `.nvmrc` / `.node-version` if present).

5. **Ensure `.nvmrc` exists and is correct**
   - If absent, create from preferred source order:
     - `package.json` → `engines.node`
     - Existing `.node-version`
     - Team standard/default (document what was used)
   - Example: `echo "24" > .nvmrc`, then `nvm use`

### Step 1: Establish a Baseline

1. **Install exactly what the lockfile specifies**

   - `npm ci` (preferred for reproducibility)
   - If no lockfile exists, use `npm install` and consider adding one.

2. **Run tests/build once (baseline sanity)**

   - `npm test` and `npm run build`
   - Optional but helpful: `npm run lint`

3. **Create a rollback checkpoint**
   - `git add package.json package-lock.json .nvmrc 2>/dev/null || true`
   - `git commit -m "chore: baseline before dependency upgrades"`
   - To avoid a commit, keep working tree clean and use: `git checkout -- package.json package-lock.json`

### Step 2: Vulnerability Check

1. **Run the audit**: `npm audit`

2. **Capture the output** — note:

   - Package(s) affected
   - Severity
   - Whether it is **direct** or **transitive**
   - Recommended fix version (if available)

3. **Generate the BEFORE report** (for PR and Confluence):
   ```bash
   npm audit --json | npm-audit-markdown --output report-before.md
   ```
   Keep `report-before.md` — it will be attached to the PR and copied to Confluence.

> Tip: If the repo is noisy with transitive issues, focus on _direct deps_ first — upgrades there often lift the transitive chain.

### Step 3: Apply Fixes Safely

Work from least risky to most risky:

#### A) Safe automated patch/minor fix

1. `npm audit fix` — never use `--force`, it can introduce breaking majors
2. Re-run `npm audit`

#### B) Targeted upgrades for direct dependencies (minor/patch only)

1. `npm outdated` — see what is outdated
2. **Upgrade one dependency at a time with validation:**
   1. `npm install <pkg>@<target_non_breaking_version>`
   2. `npm test`
   3. `npm run build`
   4. If either fails:
      - Immediately revert: `git checkout -- package.json package-lock.json`
      - Record the package name and error summary in your report
      - Continue with the next package
   5. If both pass: keep the change and continue

#### C) Transitive-only vulnerabilities

1. **Upgrade the nearest direct dependency** that brings in the vulnerable transitive.
2. If still stuck, add an `"overrides"` entry in `package.json` to force a safe transitive version.
3. Document why overrides were used — they are powerful, and future maintainers need the context.

### Step 4: Validate the Repo Still Works

1. `npm test`
2. `npm run build`
3. Smoke check the app (if it is a UI)
4. Optional: run e2e or contract tests if the repo has them

5. **Generate the AFTER report** (for PR and Confluence):
   ```bash
   npm audit --json | npm-audit-markdown --output report.md
   ```
   - `report.md` = final clean state — attach to the PR and paste into Confluence.
   - `report-before.md` = baseline captured in Step 2 — keep both for a clear before/after diff.

### Step 5: Produce a Clean PR

1. **Commit only what is needed**: `package.json` and `package-lock.json`

2. **Commit message** — ticket number is mandatory in every message:

   - Format: `<type>(<scope>): <change summary> <TICKET-NUMBER>`
   - Example: `chore(deps): upgrade direct dependencies and patch transitive tar vulnerability ABC-123`

3. **Suggested commit sequence**:

   - Baseline/setup (optional): `git commit -m "chore(setup): align node version and baseline checks ABC-123"`
   - Dependency upgrade: `git commit -m "chore(deps): apply non-breaking dependency upgrades ABC-123"`
   - Overrides (only if used): `git commit -m "chore(deps): add npm overrides for transitive vulnerability mitigation ABC-123"`

4. **PR description must include**:

   - What you ran: `npm ci`, `npm audit`, `npm audit fix`, `npm outdated`, update approach
   - What changed (high level)
   - Before/after audit summary (vuln counts by severity)
   - Any overrides and why
   - Test evidence (commands + results)
   - Rollback log (packages reverted due to test/build failures)
   - `.nvmrc` status (created/updated + value)

5. **Print the completed PR description** using the template below — fill in all placeholders, then output it in full so it can be copied directly into the GitHub PR and Confluence:

```markdown
---
**Branch:** `feature/<ticket>-sprint-<sprint>-<summary-slug>`

### .nvmrc

<Created / Already existed> with `<node-version>` (from `package.json engines.node: <engines-value>`).

### Audit: before → after

| Severity | Before | After |
| :-- | --: | --: |
| Critical | <n> | **<n>** |
| High | <n> | **<n>** |
| Moderate | <n> | **<n>** |
| Low | <n> | **<n>** |

### Upgrades applied (all tests + build pass)

| Package | Change |
| :-- | :-- |
| `<pkg>` | `<old>` → `<new>` |

### Overrides added

| Override key | Version | Reason |
| :-- | :-- | :-- |
| `<pkg>` | `<version>` | `<why>` |

_Remove this section if no overrides were added._

### Reverted

_<List any packages reverted due to test/build failures, or `None.`>_

### Final state

- `npm test` ✅
- `npm run build` ✅
- `npm run lint` ✅
- `npm audit` → `found 0 vulnerabilities` ✅

Full evidence in [report.md](report.md).

---

### What was run

1. `npm ci`
2. `npm audit` (baseline — see `report-before.md`)
3. `npm audit fix`
4. `npm outdated`
5. Targeted one-by-one upgrades (minor/patch only) with `npm test && npm run build` after each
6. `npm audit` (final — see `report.md`)

---
```

## Key Rules

- **Never** use `npm audit fix --force` — it can introduce breaking major versions
- Upgrade **one dependency at a time** and validate after each change
- **Immediately revert** `package.json` + `package-lock.json` on any test or build failure
- Include the **ticket number** in every commit message
- `"overrides"` are powerful — always document why they were added
- Run `npm audit --json | npm-audit-markdown --output report-before.md` **before** fixes and `npm audit --json | npm-audit-markdown --output report.md` **after** — attach both to the PR and copy to Confluence
- `npm-audit-markdown` is a reporting tool only — it does not fix vulnerabilities

## Workflow

1. Check `npm-audit-markdown` is installed: `npm-audit-markdown --version` (install with `npm i -g npm-audit-markdown` if absent)
2. Ask for ticket number + sprint number + summary slug
3. `git checkout -b feature/<ticket>-sprint-<sprint>-<summary-slug>`
4. Ensure `.nvmrc` exists/updated, then `nvm use`
5. `npm ci`
6. Baseline: `npm test && npm run build`
7. `npm audit`
8. Generate BEFORE report: `npm audit --json | npm-audit-markdown --output report-before.md`
9. `npm audit fix`
10. `npm audit`
11. `npm outdated`
12. Upgrade direct deps one-by-one (minor/patch only)
13. After each package: `npm test && npm run build`
14. On failure: revert `package.json` + `package-lock.json`, log failure, continue
15. Final: `npm test && npm run build && npm audit`
16. Generate AFTER report: `npm audit --json | npm-audit-markdown --output report.md`
17. Commit using ticket in message
18. Print the completed PR description template (see Step 5 above) for copy-paste into GitHub PR and Confluence
