import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2022-CC-24F279E85";
const checkYourInformationUrl = `${documentUrl}/check-your-information`;
const howDoesTheExportLeaveTheUkUrl = `${documentUrl}/how-does-the-export-leave-the-uk`;

describe("CC - Transport Mode Change - Scenario 1: No change to transport mode", () => {
  it("should navigate from check-your-information to how-does-the-export-leave-the-uk via Change link", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

    // Find and click the Change link for transport mode
    // The transport mode is typically in the 4th summary list (Transport section)
    // Looking for "Transport type" or similar label
    cy.contains("dt.govuk-summary-list__key", /Transport type|How does the export leave/i)
      .parent()
      .find("dd.govuk-summary-list__actions a")
      .contains("Change")
      .click({ force: true });

    // Verify navigation to how-does-the-export-leave-the-uk page
    cy.url().should("include", "/how-does-the-export-leave-the-uk");
  });

  it("should return to check-your-information when transport mode is not changed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveTruck,
    };

    // Visit the how-does-the-export-leave-the-uk page with nextUri parameter
    cy.visit(howDoesTheExportLeaveTheUkUrl + `?nextUri=${checkYourInformationUrl}`, { qs: { ...testParams } });

    // Verify the page loads
    cy.get(".govuk-fieldset__heading").contains("How does the export leave the UK?");

    // Verify that truck is already selected (pre-selected from the test case)
    cy.get("#truck").should("be.checked");

    // Don't change the selection, just click Save and continue
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify navigation back to check-your-information
    cy.url().should("include", "/check-your-information");
  });

  it("should preserve the existing transport mode when returning to check-your-information", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

    // Verify the transport type is displayed (should be Truck based on test case)
    cy.contains("dt.govuk-summary-list__key", /Transport type|How does the export leave/i)
      .next("dd.govuk-summary-list__value")
      .should("contain", "Truck");
  });
});

describe("CC - Transport Mode Change - Scenario 2: Changed transport mode", () => {
  it("should navigate to add-transportation-details page when transport mode is changed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveTruck,
    };

    // Visit the how-does-the-export-leave-the-uk page with nextUri parameter
    cy.visit(howDoesTheExportLeaveTheUkUrl + `?nextUri=${checkYourInformationUrl}`, { qs: { ...testParams } });

    // Verify the page loads
    cy.get(".govuk-fieldset__heading").contains("How does the export leave the UK?");

    // Verify that truck is currently selected
    cy.get("#truck").should("be.checked");

    // Change to a different transport mode (e.g., plane)
    cy.get("#plane").click({ force: true });

    // Click Save and continue
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify navigation to add-transportation-details-plane page
    cy.url().should("include", "/add-transportation-details-plane");
  });

  it("should navigate to add-transportation-details-train when changing from truck to train", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveTruck,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl + `?nextUri=${checkYourInformationUrl}`, { qs: { ...testParams } });

    // Change to train
    cy.get("#train").click({ force: true });

    // Click Save and continue
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify navigation to add-transportation-details-train page
    cy.url().should("include", "/add-transportation-details-train");
  });

  it("should navigate to add-transportation-details-container-vessel when changing from truck to container vessel", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveTruck,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl + `?nextUri=${checkYourInformationUrl}`, { qs: { ...testParams } });

    // Change to container vessel
    cy.get("#containerVessel").click({ force: true });

    // Click Save and continue
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify navigation to add-transportation-details-container-vessel page
    cy.url().should("include", "/add-transportation-details-container-vessel");
  });

  it("should navigate to add-transportation-details-truck when changing from plane to truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeavePlane,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl + `?nextUri=${checkYourInformationUrl}`, { qs: { ...testParams } });

    // Verify plane is currently selected
    cy.get("#plane").should("be.checked");

    // Change to truck
    cy.get("#truck").click({ force: true });

    // Click Save and continue
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify navigation to add-transportation-details-truck page
    cy.url().should("include", "/add-transportation-details-truck");
  });
});

describe("CC - Transport Mode Change - Complete Flow", () => {
  it("should complete the full flow: check-your-information -> change transport -> how-does-export-leave -> no change -> back to check-your-information", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    // Step 1: Navigate to check-your-information
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.url().should("include", "/check-your-information");

    // Step 2: Click Change link for transport mode
    cy.contains("dt.govuk-summary-list__key", /Transport type|How does the export leave/i)
      .parent()
      .find("dd.govuk-summary-list__actions a")
      .contains("Change")
      .should("be.visible")
      .and("have.attr", "href")
      .and("include", "/how-does-the-export-leave-the-uk")
      .and("include", "nextUri")
      .and("include", "check-your-information");
  });

  it("should verify Change link includes nextUri parameter to return to check-your-information", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

    // Verify the Change link has the correct structure
    cy.contains("dt.govuk-summary-list__key", /Transport type|How does the export leave/i)
      .parent()
      .find("dd.govuk-summary-list__actions a")
      .should("have.attr", "href")
      .and("include", "nextUri=")
      .and("include", encodeURIComponent(checkYourInformationUrl));
  });
});
