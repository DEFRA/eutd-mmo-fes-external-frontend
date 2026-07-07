import type { Config } from "@react-router/dev/config";

const isTestMode = process.env.NODE_ENV === "test";

export default {
  // Config options
  ssr: true,
  appDirectory: isTestMode ? "instrumented" : "app",
  buildDirectory: "build",
  ignoredRouteFiles: isTestMode
    ? ["**/.*", "**/*.test.{js,ts}", "**/*.css"]
    : ["**/.*", "**/*.test.{js,ts}", "coverage.tsx", "**/*.css"],
  // React Router 7.12+ added CSRF protection that rejects cross-origin POST
  // requests to UI routes (400 Bad Request). The OIDC login flow uses
  // response_mode=form_post, where the external IdP POSTs the auth code back
  // to /login/return from a different origin. Similarly, the admin login
  // callback receives a cross-origin POST from Azure AD.
  // allowedActionOrigins explicitly permits these IdP origins while keeping
  // CSRF protection active for all other routes.
  allowedActionOrigins: [
    "https://**cui.defra.gov.uk", // Defra CUI identity platform (all envs)
    "https://login.microsoftonline.com", // Azure AD (admin login)
  ],
} satisfies Config;
