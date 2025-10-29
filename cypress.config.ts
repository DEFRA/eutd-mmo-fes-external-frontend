import { defineConfig } from "cypress";
import registerCodeCoverageTasks from "@cypress/code-coverage/task";

const port = process.env.PORT ?? 3000;
const hostname = "localhost";
const url = `http://${hostname}:${port}`;

export default defineConfig({
  e2e: {
    baseUrl: url,
    specPattern: "tests/cypress/integration/**/*.spec.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);

      return config;
    },
    supportFile: "tests/cypress/support/e2e.js",
  },
  env: {
    codeCoverage: {
      url: `http://${hostname}:${port}/coverage`,
    },
  },
  downloadsFolder: "tests/cypress/downloads",
  fixturesFolder: "tests/cypress/fixtures",
  screenshotsFolder: "tests/cypress/screenshots",
  videosFolder: "tests/cypress/videos",
  video: false,
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    configFile: "cypress-reporter-config.json",
  },
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 3,
    openMode: 3,
  },
});
