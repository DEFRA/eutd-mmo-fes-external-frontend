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

/**
 * Finds a GOV.UK label element by its visible text content.
 *
 * @param {string} textToFind - The label text to search for
 * @example
 * cy.findGovUkLabel("Date of landing");
 */
Cypress.Commands.add("findGovUkLabel", (textToFind) => {
  cy.get(".govuk-label").contains(textToFind);
});

/**
 * Finds a GOV.UK hint element by its visible text content.
 *
 * @param {string} textToFind - The hint text to search for
 * @example
 * cy.findGovUkHint("For example, 27 3 2007");
 */
Cypress.Commands.add("findGovUkHint", (textToFind) => {
  cy.get(".govuk-hint").contains(textToFind);
});

/**
 * Optionally pauses execution for a fixed duration, used to wait for async UI
 * updates that have no reliable observable state to assert against.
 * Prefer asserting on a visible element instead of using a fixed timeout.
 *
 * @param {number} [timeout=0] - Duration in milliseconds; 0 means no-op
 * @example
 * cy.waitForUiUpdate(500); // wait 500ms for an animation to complete
 */
Cypress.Commands.add("waitForUiUpdate", (timeout = 0) => {
  if (timeout > 0) {
    cy.wrap(null, { log: false }).then(() => new Cypress.Promise((resolve) => setTimeout(resolve, timeout)));
  }
});

/** @deprecated Use cy.waitForHydration() — delegates to it for backward compatibility. */
Cypress.Commands.add("waitForPage", (timeout = 1000) => {
  cy.waitForHydration(timeout);
});

/** Selects the first option with a non-empty value from a <select> element. */
Cypress.Commands.add("selectFirstNonEmptyOption", (selector) => {
  cy.get(`${selector} option`).then(($options) => {
    const firstNonEmpty = [...$options].find((opt) => opt.value);
    if (!firstNonEmpty) {
      throw new Error(`No non-empty option found for ${selector}`);
    }
    cy.get(selector).select(firstNonEmpty.value);
  });
});

/**
 * Waits for full page hydration by asserting the GOV.UK main wrapper is visible.
 * Semantic replacement for cy.document().its("readyState") anti-pattern.
 *
 * Falls back to checking for a generic <main> element, then a body assertion
 * with a minimum wait, when no GOV.UK wrapper is present (e.g. error pages).
 *
 * @param {number} [timeout=1000] - Maximum wait time in milliseconds
 * @example
 * cy.waitForHydration(); // Default 1s timeout
 * cy.waitForHydration(2000); // 2s timeout for slow pages
 */
Cypress.Commands.add("waitForHydration", (timeout = 1000) => {
  cy.get("body", { timeout: 100 }).then(($body) => {
    if ($body.find(".govuk-main-wrapper").length > 0) {
      cy.get(".govuk-main-wrapper", { timeout }).should("be.visible");
    } else if ($body.find("main").length > 0) {
      cy.get("main", { timeout }).should("be.visible");
    } else {
      cy.get("body", { timeout }).should("be.visible").and("not.be.empty");
      cy.wait(Math.min(timeout, 500));
    }
  });
});
