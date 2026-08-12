import { type ITestParams, TestCaseId } from "~/types";

describe("Accessibility page", () => {
  it("renders the page and key accessibility links", () => {
    cy.visit("/accessibility");

    cy.contains("h1", "Accessibility statement").should("be.visible");
    cy.contains("h2", "Using this service").should("be.visible");
    cy.contains("h2", "Feedback and contact information").should("be.visible");
    cy.contains("h2", "Reporting accessibility problems with this service").should("be.visible");
    cy.contains("h2", "Enforcement procedure").should("be.visible");
    cy.contains("h2", /Technical information/i).should("be.visible");
    cy.get('a[href="https://www.gov.uk"]').should("exist");
    cy.get('a[href="https://www.gov.uk/help/accessibility-statement"]').should("exist");
    cy.get('a[href="https://mcmw.abilitynet.org.uk/"]').should("exist");
    cy.get('a[href="https://www.equalityadvisoryservice.com/"]').should("exist");
    cy.get('a[href="https://www.gov.uk/contact-local-marine-management-organisation"]').should("exist");
    cy.get('a[href="https://www.w3.org/TR/WCAG21/"]').should("exist");
    cy.get('a[href="https://digitalaccessibilitycentre.org/"]').should("exist");
    cy.get('a[href^="tel:"]').should("contain.text", "0330 159 1989");
    cy.get('a[href="mailto:dominic.Horsfall@marinemanagement.org.uk"]').should("exist");
  });

  it("shows service URL and expected bullet lists", () => {
    cy.visit("/accessibility");

    cy.contains("a", "https://manage-fish-exports.service.gov.uk/").should("have.attr", "href", "/").and("be.visible");
    cy.get("ul.govuk-list--bullet").should("have.length.at.least", 3);
    cy.get("ul.govuk-list--bullet").first().find("li").should("have.length", 5);
  });

  it("navigates to accessibility via in-app link", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.UserAttributes,
    };

    cy.visit("/cookies", { qs: { ...testParams } });
    cy.get('a[href="/accessibility"]').first().click();

    cy.url().should("include", "/accessibility");
    cy.contains("h1", "Accessibility statement").should("be.visible");
  });
});
