import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-CC-4ED8CAE79";
const certificateUrl = `/create-catch-certificate/${documentNumber}`;
const ccPageUrl = `${certificateUrl}/add-transportation-details-container-vessel/0`;

describe("Container Vessel: Error Order Validation - UAT-499", () => {
  it("[UAT-499] should display required field errors before container format error in correct order", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselRequiredFieldsAndInvalidContainer,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    // Check if we're on the forbidden page
    cy.url().then((url) => {
      cy.log("Current URL:", url);
    });

    // Wait for page to load completely - use a longer timeout
    cy.get("#vesselName", { timeout: 10000 }).should("be.visible");

    // Fill only the container field with an invalid value
    cy.get('input[name="containerNumbers.0"]').type("££££££££££", { force: true });

    // Submit form without filling required fields
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify error summary appears
    cy.contains("h2", /^There is a problem$/).should("be.visible");

    // Verify all 4 errors appear in correct order
    cy.get(".govuk-error-summary__list li").should("have.length", 4);
    cy.get(".govuk-error-summary__list li").eq(0).should("contain", "Enter the vessel name");
    cy.get(".govuk-error-summary__list li").eq(1).should("contain", "Enter the flag state");
    cy.get(".govuk-error-summary__list li").eq(2).should("contain", "Enter the place the export leaves the UK");
    cy.get(".govuk-error-summary__list li")
      .eq(3)
      .should(
        "contain",
        "Enter a shipping container number in the correct format. This must be 11 characters: 3 letters, then U, J, Z or R, then 7 numbers."
      );
  });

  it("[UAT-499] should display required field errors before container format error in correct order (FI0-10940)", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselRequiredFieldsAndMaxLengthContainer,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    // Wait for page to load completely
    cy.get("#vesselName", { timeout: 10000 }).should("be.visible");

    // Fill only the container field with a value over 50 characters (FI0-10940: no 50-char limit, only format matters)
    cy.get('input[name="containerNumbers.0"]').type("A".repeat(51), { force: true });

    // Submit form without filling required fields
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify error summary appears
    cy.contains("h2", /^There is a problem$/).should("be.visible");

    // Verify all 4 errors appear in correct order
    cy.get(".govuk-error-summary__list li").should("have.length", 4);
    cy.get(".govuk-error-summary__list li").eq(0).should("contain", "Enter the vessel name");
    cy.get(".govuk-error-summary__list li").eq(1).should("contain", "Enter the flag state");
    cy.get(".govuk-error-summary__list li").eq(2).should("contain", "Enter the place the export leaves the UK");
    cy.get(".govuk-error-summary__list li")
      .eq(3)
      .should(
        "contain",
        "Enter a shipping container number in the correct format. This must be 11 characters: 3 letters, then U, J, Z or R, then 7 numbers."
      );
  });

  it("[UAT-499] should display container invalid format error ONLY when all required fields are filled", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportContainerInvalidCharacters,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    // Fill all required fields
    cy.get("#vesselName").type("Felicity Ace", { force: true });
    cy.get("#flagState").type("Greece", { force: true });
    cy.get("#departurePlace").type("Felixstowe Port", { force: true });

    // Add container with invalid format
    cy.get('input[name="containerNumbers.0"]').type("ABC123!@#", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.get(".govuk-error-summary__list li")
      .eq(0)
      .should("contain", "Enter a shipping container number in the correct format");
  });
});
