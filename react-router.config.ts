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
  //
  // NOTE: values must be host-only patterns (no scheme). React Router extracts
  // `new URL(origin).host` before matching, so including "https://" breaks the
  // comparison. Use standalone "**" as the leading wildcard segment, not "**cui".
  allowedActionOrigins: [
    "**.cui.defra.gov.uk", // Defra CUI custom domain (SND/TST/PRE/PROD)
    "**.b2clogin.com", // Azure B2C default domain (used when no custom domain)
    "login.microsoftonline.com", // Azure AD (admin login callback)
  ],
} satisfies Config;
