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
} satisfies Config;
