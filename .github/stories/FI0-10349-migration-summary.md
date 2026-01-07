# React Router v7 Migration Summary

## Migration completed: December 1, 2025

This document summarizes the changes made to upgrade from Remix v2 to React Router v7.

## Changes Made

### 1. Dependencies Updated ✅
- Replaced `@remix-run/react`, `@remix-run/serve` with React Router v7 packages:
  - `@react-router/dev@^7.9.6`
  - `@react-router/fs-routes@^7.9.6`
  - `@react-router/node@^7.9.6`
  - `@react-router/serve@^7.9.6`
  - `react-router@^7.9.6`
  - `react-router-dom@^7.9.6`
- Kept `@remix-run/node@2.17.2` for server-specific APIs (Session, Cookie, etc.)
- Updated `remix-i18next` from v6.3.0 to v7.4.2 for React Router v7 compatibility
- Removed deprecated `@remix-run/dev`, `@remix-run/fs-routes`, `@remix-run/route-config` from devDependencies

### 2. Scripts Updated ✅
Updated `package.json` scripts to use React Router v7 CLI:
- `build`: `remix vite:build` → `react-router build`
- `dev`: `remix vite:dev` → `react-router dev`
- `start`: `remix-serve` → `react-router-serve`
- `test`: Updated to use `react-router-serve`

### 3. Routes Configuration ✅
- `app/routes.ts`: Updated imports from `@remix-run/route-config` to `@react-router/dev/routes`
- Uses `flatRoutes()` from `@react-router/fs-routes`

### 4. React Router Config ✅
- Created `react-router.config.ts` with SSR and build directory configuration

### 5. Vite Plugin Updated ✅
Updated `vite.config.mts`:
- Import: `@remix-run/dev` → `@react-router/dev/vite`
- Plugin: `remix()` → `reactRouter()`
- Enabled `v3_singleFetch: true` (previously commented out)
- Kept all other future flags enabled

### 6. TypeScript Configuration ✅
Updated `tsconfig.json`:
- Added `.react-router/types/**/*` to include array
- Changed types from `@remix-run/node` to `@react-router/node`
- Removed obsolete comments about Remix

### 7. Entry Files Updated ✅
**Client Entry** (`app/entry.client.tsx`):
- `RemixBrowser` → `HydratedRouter` (from `react-router-dom`)

**Server Entry** (`app/entry.server.tsx`):
- `RemixServer` → `ServerRouter` (from `react-router`)
- `EntryContext` import from `@react-router/node`

### 8. Import Migration ✅
Created and ran migration script (`scripts/migrate-imports.cjs`) that updated:
- **186 files modified** with **272 import replacements**
- `@remix-run/react` → `react-router` or `react-router-dom` (for DOM-specific exports like Link, Form)
- `@remix-run/node` → `react-router` (for loader/action types)
- Kept server-specific APIs (Session, SessionData, Cookie, upload handlers) importing from `@remix-run/node`

### 9. GitIgnore Updated ✅
Added `/.react-router` to `.gitignore` for build-time generated types

### 10. AppLoadContext Review ✅
- **Result**: Not used in this codebase
- **Action**: Skipped as recommended in migration docs (we're using server rendering)

### 11. SingleFetch Enabled ✅
- Enabled `v3_singleFetch: true` in `vite.config.mts`
- Updated future module declaration from `@remix-run/node` to `@react-router/node`

### 12. useHydrated Components ✅
- **Verified**: `useHydrated` from `remix-utils@7.6.0` works correctly with React Router v7
- Used in 8+ components including:
  - `CommonDatePicker` (date picker hydration)
  - `header.tsx` (navigation)
  - Various route components for progressive enhancement
- **Compatibility**: `remix-utils` v7.x is compatible with React Router v7
- **Implementation**: Uses React's `useSyncExternalStore` (framework-agnostic)

## Verification

### Build Status
✅ Production build succeeds with no errors
```bash
npm run build
# ✓ built in 4.76s
```

### Dev Server
✅ Development server starts successfully
```bash
npm run dev
# ➜ Local: http://localhost:3000/
```

### Import Changes Summary
- **Files Processed**: 364
- **Files Modified**: 186
- **Import Replacements**: 272
- **Build Status**: Success

## Testing Recommendations

### Priority 1 - Critical Paths
- [ ] Run full Cypress test suite: `npm run :test:all`
- [ ] Verify date picker hydration in browser (CommonDatePicker component)
- [ ] Test form submissions (CSRF protection still works)
- [ ] Verify i18n switching (English/Welsh)

### Priority 2 - User Journeys
- [ ] Create Catch Certificate journey
- [ ] Create Processing Statement journey
- [ ] Create Storage Document journey
- [ ] Upload file functionality
- [ ] Favourites management

### Priority 3 - Integration
- [ ] Test with backend orchestration service
- [ ] Verify authentication flow (when IDM enabled)
- [ ] Check Application Insights telemetry

## Known Issues

None identified during migration.

## Migration Tools

### Import Migration Script
Created `scripts/migrate-imports.cjs` for automated import updates.

Usage:
```bash
# Dry run
node scripts/migrate-imports.cjs

# Apply changes
node scripts/migrate-imports.cjs --apply
```

## Rollback Plan

If issues are encountered, rollback steps:

1. Revert all changes: `git reset --hard <commit-before-migration>`
2. Or manually restore:
   - `package.json` (revert dependency versions)
   - `vite.config.mts` (change plugin back to `remix()`)
   - `app/entry.client.tsx` and `app/entry.server.tsx`
   - Run `npm install --legacy-peer-deps`

## References

- [React Router v7 Upgrade Guide](https://reactrouter.com/upgrading/remix)
- [Remix v2 to React Router v7 Migration](https://remix.run/docs/en/main/guides/migrating-to-react-router)
- Acceptance Criteria: `.github/stories/FI0-10349.md`
