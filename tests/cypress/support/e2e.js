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

Cypress.on("uncaught:exception", () => false);
