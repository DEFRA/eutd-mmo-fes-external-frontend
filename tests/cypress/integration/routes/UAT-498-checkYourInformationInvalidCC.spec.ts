import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-processing-statement/GBR-2023-PS-DE53D6E7C";
const checkYourInformationUrl = `${documentUrl}/check-your-information`;

describe("UAT-498: Check Your Information page - Invalid Catch Certificate Error Display", () => {
  describe("Scenario: Voided UK CC - Error should appear next to the invalid CC field", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PSCheckYourInformationInvalidCC,
      };
      cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    });

    it("should display the page correctly before submission", () => {
      cy.contains("h1", /^Check your answers before you create the processing statement$/).should("be.visible");
      cy.contains("dt", "Catch certificate").should("be.visible");
      cy.contains("button", /^Accept and create processing statement$/).should("be.visible");
    });

    it("should show error in error summary at the top when invalid CC is submitted", () => {
      cy.get("[data-testid=create-ps-button]").click({ force: true });

      // Error summary should be visible
      cy.contains("h2", /^There is a problem$/).should("be.visible");

      // Error link should be present in the error summary
      cy.contains("a", /^The catch certificate entered is no longer valid$/).should("be.visible");
    });

    it("should display inline error message next to the catch certificate field", () => {
      cy.get("[data-testid=create-ps-button]").click({ force: true });

      // Check for inline error message next to the catch certificate field
      cy.get(".govuk-error-message")
        .should("be.visible")
        .and("contain.text", "The catch certificate entered is no longer valid");
    });

    it("should apply error styling to the catch certificate field", () => {
      cy.get("[data-testid=create-ps-button]").click({ force: true });

      // The field should have error class
      cy.get(".govuk-form-group--error").should("exist");

      // Check that the error is associated with the catch certificate field
      cy.get("[id^='catches-'][id$='-catchCertificateNumber']").should("exist");
    });
  });

  describe("Scenario: Invalid CC with species error - Both errors should be displayed", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PSCheckYourInformationInvalidCCWithSpeciesError,
      };
      cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    });

    it("should display both catch certificate and species errors", () => {
      cy.get("[data-testid=create-ps-button]").click({ force: true });

      // Error summary should contain both errors
      cy.contains("a", /^The catch certificate entered is no longer valid$/).should("be.visible");
      cy.contains("a", /^Enter the FAO code or species name$/).should("be.visible");

      // Both inline error messages should be visible
      cy.get(".govuk-error-message").should("have.length", 2);
    });
  });

  describe("Scenario: Non-UK CC with invalid format", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PSCheckYourInformationIncorrectFormatCC,
      };
      cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    });

    it("should display format error next to the catch certificate field", () => {
      cy.get("[data-testid=create-ps-button]").click({ force: true });

      cy.contains("h2", /^There is a problem$/).should("be.visible");
      cy.contains("a", /^Catch certificate number must only contain letters, numbers/).should("be.visible");

      // Inline error should be visible
      cy.get(".govuk-error-message")
        .should("be.visible")
        .and("contain.text", "Catch certificate number must only contain");
    });
  });
});
