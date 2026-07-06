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

Cypress.Commands.add("waitForUiUpdate", (timeout = Cypress.config("defaultCommandTimeout")) => {
  cy.document({ log: false, timeout }).its("readyState").should("eq", "complete");
  cy.get("body", { log: false, timeout }).should("be.visible");
  cy.wrap(null, { log: false, timeout }).then(
    () =>
      new Cypress.Promise((resolve) => {
        globalThis.requestAnimationFrame(() => {
          globalThis.requestAnimationFrame(resolve);
        });
      })
  );
});
