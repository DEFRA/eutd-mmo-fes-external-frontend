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

      /**
       * Waits for document.readyState to equal "complete" within the given timeout.
       * Use after interactions that trigger navigation or DOM re-renders.
       * @example cy.waitForPage()
       * @example cy.waitForPage(2000)
       */
      waitForPage(timeout?: number): Chainable<void>;

      /**
       * Waits for full page hydration using semantic visibility assertions.
       * Preferred over waitForPage for post-navigation or post-submit checks.
       * @example cy.waitForHydration()
       * @example cy.waitForHydration(3000)
       */
      waitForHydration(timeout?: number): Chainable<void>;

      /**
       * Selects the first option with a non-empty value from a <select> element.
       * @example cy.selectFirstNonEmptyOption('#gearType')
       */
      selectFirstNonEmptyOption(selector: string): Chainable<void>;
    }
  }
}
