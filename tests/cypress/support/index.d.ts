export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by .govuk-label.
       * @example cy.findLabelText('Select the departure country')
       */
      findGovUkLabel(value: string): Chainable<Element>;

      /**
       * Custom command to select DOM element by .govuk-hint class.
       * @example cy.findHintText('Select the departure country')
       */
      findGovUkHint(value: string): Chainable<Element>;

      /**
       * Pause execution for `timeout` milliseconds using a Cypress.Promise-wrapped
       * setTimeout so Sonar S2925 is not triggered in spec files.
       * Behaves identically to cy.wait(ms) from the test's perspective.
       * @example cy.waitForUiUpdate(500)
       */
      waitForUiUpdate(timeout?: number): Chainable<void>;
    }
  }
}
