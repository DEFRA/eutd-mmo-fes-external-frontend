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
    }
  }
}
