// ***********************************************
// This is for custom commands and for overwriting
// existing commands.
//
// https://on.cypress.io/custom-commands
// ***********************************************
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("findGovUkLabel", (textToFind) => {
  cy.get(".govuk-label").contains(textToFind);
});

Cypress.Commands.add("findGovUkHint", (textToFind) => {
  cy.get(".govuk-hint").contains(textToFind);
});

Cypress.Commands.add("waitForUiUpdate", (timeout = 0) => {
  if (timeout > 0) {
    cy.wrap(null, { log: false }).then(() => new Cypress.Promise((resolve) => setTimeout(resolve, timeout)));
  }
});

// Pages render a no-JS fallback (e.g. a <select>) that is visible until React hydrates and swaps it for the JS
// control. Use this before interacting with a JS-only control so the test does not act on the fallback.
Cypress.Commands.add("waitForHydration", () => {
  cy.get("html[data-hydrated='true']", { timeout: 20000 }).should("exist");
});
