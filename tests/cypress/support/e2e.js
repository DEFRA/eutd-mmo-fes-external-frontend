// ***********************************************************
// This file is processed and loaded automatically before
// test files.
//
// This is for global configuration and behavior that
// modifies Cypress.
//
// Change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// https://on.cypress.io/configuration
// ***********************************************************

import "@cypress/code-coverage/support";
import "@testing-library/cypress/add-commands";
import "./commands";

// Suppress known React SSR/hydration errors and unhandled promise rejections only.
// Returning false for unrecognised errors would mask genuine application failures.
Cypress.on("uncaught:exception", (err, runnable, promise) => {
  if (promise) return false; // suppress unhandled promise rejections (common during SSR hydration)
  if (
    err.message.includes("Hydration failed") ||
    err.message.includes("There was an error while hydrating") ||
    err.message.includes("Minified React error") ||
    err.message.includes("Expected server HTML to contain")
  ) {
    return false;
  }
  // All other uncaught exceptions fail the test as intended
});
