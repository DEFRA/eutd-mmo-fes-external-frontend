# Locale JSON Cache-Busting Fix

## Problem

After deploying new releases to Pre1 and Production, users experienced stale translation data due to aggressive browser and CDN caching of locale JSON files. This required manual hard refreshes and cache clearing to see updated translations.

**Related Issue**: [UAT-547](https://eaflood.atlassian.net/browse/UAT-547)

## Root Cause

The locale JSON files (`/locales-v2/{{lng}}/{{ns}}.json`) were being served without version identifiers. This caused:
- Browser caching to persist old translations
- CDN caching to serve stale files
- Users seeing outdated error messages and UI text after deployments

## Solution Implemented

We implemented **Option A: Cache-bust the URL** by adding a version query string to all locale JSON requests. This ensures browsers and CDNs treat each deployment as a new resource.

### Changes Made

#### 1. Vite Configuration ([vite.config.mts](../vite.config.mts))
```typescript
// Build ID for cache-busting locale JSON files
const BUILD_ID = process.env.BUILD_ID || process.env.GIT_COMMIT || Date.now().toString();

export default defineConfig({
  define: {
    // Inject BUILD_ID as a global constant for runtime cache-busting
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  // ... rest of config
});
```

**Purpose**: Injects the build ID as a compile-time constant that can be used at runtime.

#### 2. Client Entry Point ([app/entry.client.tsx](../app/entry.client.tsx))
```typescript
// Global BUILD_ID injected by Vite define config
declare const __BUILD_ID__: string;

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(Backend)
  .init({
    ...initLanguages(),
    ns: getInitialNamespaces(),
    backend: {
      // Cache-bust locale JSON URLs with build ID
      loadPath: `/locales-v2/{{lng}}/{{ns}}.json?v=${__BUILD_ID__}`,
    },
    // ...
  });
```

**Purpose**: Appends the build ID as a query parameter to all locale JSON requests. Example URLs:
- Before: `/locales-v2/en/common.json`
- After: `/locales-v2/en/common.json?v=a3b4c5d6e7f8`

#### 3. Dockerfile ([Dockerfile](../Dockerfile))
```dockerfile
FROM defradigital/node:$DEFRA_BASE_IMAGE_TAG as production
# Accept BUILD_ID from build pipeline
ARG BUILD_ID=""
ENV BUILD_ID=${BUILD_ID}
# ...
RUN npm run build
```

**Purpose**: Accepts the BUILD_ID as a build argument and makes it available to the Vite build process.

#### 4. Pipeline Configuration ([eutd-mmo-fes-pipeline-common/templates/build-image.yaml](../../eutd-mmo-fes-pipeline-common/templates/build-image.yaml))
```yaml
- script: |
    docker buildx build . \
      -t ${{ parameters.appName }}:$(dockerImageTag) \
      --build-arg NPM_TOKEN=$(System.AccessToken) \
      --build-arg BUILD_ID=$(Build.SourceVersion)
  displayName: 'Docker build'
```

**Purpose**: Passes the Git commit SHA from Azure DevOps to the Docker build.

#### 5. TypeScript Global Declaration ([app/root.tsx](../app/root.tsx))
```typescript
declare global {
  // Injected by Vite define config for cache-busting
  const __BUILD_ID__: string;
  
  interface Window {
    gtag: any;
  }
}
```

**Purpose**: Provides TypeScript type safety for the global `__BUILD_ID__` constant.

## How It Works

1. **Build Time**: Azure DevOps passes `Build.SourceVersion` (Git commit SHA) to Docker build
2. **Docker Build**: Dockerfile accepts `BUILD_ID` arg and exposes it as env var
3. **Vite Build**: Vite reads `BUILD_ID` env var and injects it as `__BUILD_ID__` constant
4. **Runtime**: Client code uses `__BUILD_ID__` to construct versioned locale URLs
5. **Result**: Each deployment generates unique URLs like `/locales-v2/en/common.json?v=abc123`

## Verification

After deployment, you can verify the fix by:

1. **Check Network Tab**: Open DevTools → Network, filter for `locales-v2`, and verify URLs contain `?v=` parameter
2. **Inspect BUILD_ID**: Open DevTools → Console and run:
   ```javascript
   console.log(__BUILD_ID__);
   ```
3. **Test Cache Behavior**: Deploy a change, access the site without clearing cache, and verify new translations appear

## Fallback Behavior

The implementation includes multiple fallbacks for BUILD_ID:
1. `process.env.BUILD_ID` (from pipeline)
2. `process.env.GIT_COMMIT` (alternative env var)
3. `Date.now().toString()` (timestamp for local development)

This ensures the cache-busting works in all environments, including local development.

## Benefits

✅ **No Manual Intervention**: Users no longer need to clear cache after deployments  
✅ **CDN Compatible**: Works with Azure CDN/CloudFront without purge requirements  
✅ **Backward Compatible**: Fallback to timestamp ensures local dev still works  
✅ **Deterministic**: Same commit = same URLs, enabling proper browser caching between builds  
✅ **Zero Runtime Overhead**: Version is determined at build time, not runtime  

## Alternative Solutions Considered

### Option B: Cache Headers
Setting `Cache-Control: public, max-age=60, must-revalidate` on locale JSON files would work but:
- Requires server-side configuration changes
- Still has 60-second staleness window
- Less deterministic than URL versioning

### Option C: Import at Build Time
Bundling translations into the JavaScript bundle would eliminate HTTP requests but:
- Increases bundle size significantly (60+ namespaces × 2 languages)
- Prevents dynamic language switching
- Makes translation updates require full redeployment

**Conclusion**: URL versioning (Option A) provides the best balance of simplicity, reliability, and performance.

## Future Enhancements

Consider these optional improvements:

1. **Add Cache Headers**: Even with URL versioning, adding `Cache-Control: public, max-age=31536000, immutable` to locale files would optimize CDN behavior

2. **Health Check Endpoint**: Expose BUILD_ID via a `/health` or `/version` endpoint for easier verification

3. **Monitoring**: Log BUILD_ID to Application Insights to track which version users are running

4. **Service Worker**: If implementing offline support, ensure SW invalidates cache when BUILD_ID changes

## Testing

### Local Development
```bash
# The fallback to Date.now() ensures cache-busting still works
npm run dev

# Build with custom BUILD_ID
BUILD_ID=test123 npm run build
npm run start
```

### Verify in Production
After deployment to Pre1/Prod:
1. Open Network tab
2. Look for requests to `/locales-v2/*/common.json?v=<commit-sha>`
3. Verify the `v` parameter matches the deployed commit

## Related Files

- [vite.config.mts](../vite.config.mts) - Build configuration
- [app/entry.client.tsx](../app/entry.client.tsx) - Client i18n initialization  
- [app/root.tsx](../app/root.tsx) - Global type declarations
- [Dockerfile](../Dockerfile) - Container build configuration
- [../../eutd-mmo-fes-pipeline-common/templates/build-image.yaml](../../eutd-mmo-fes-pipeline-common/templates/build-image.yaml) - CI/CD pipeline

## Rollback Plan

If issues arise, revert commits to:
- `vite.config.mts`
- `app/entry.client.tsx`  
- `app/root.tsx`
- `Dockerfile`
- `eutd-mmo-fes-pipeline-common/templates/build-image.yaml`

The app will fall back to the previous behavior of loading locale files without version parameters.
