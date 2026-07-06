import { type ITestParams, TestCaseId } from "~/types";

/**
 * FI0-10616: Back navigation tests for how-does-the-export-leave-the-UK page
 */

describe("How does the export leave the UK - Back Navigation", () => {
  const certificateUrl = "/create-catch-certificate/GBR-2025-CC-136BEC4E4";

  describe("Scenario 1: Back navigation when adding additional transport mode", () => {
    it("should navigate back to do-you-have-additional-transport-types when fromAdditionalTransport=true", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.HowDoesTheExportLeaveTheUkBackFromAdditionalTransport,
      };

      cy.visit(`${certificateUrl}/how-does-the-export-leave-the-uk?fromAdditionalTransport=true`, {
        qs: { ...testParams },
      });

      // Verify page renders
      cy.contains("h1", "How do you transport the export?").should("be.visible");

      // Check back link points to do-you-have-additional-transport-types
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/do-you-have-additional-transport-types`);

      // Click back and verify navigation
      cy.contains("a", /^Back$/).click();
      cy.url().should("include", "/do-you-have-additional-transport-types");
    });
  });

  describe("Scenario 2: Back navigation when on first transport mode", () => {
    it("should navigate back to what-export-journey when fromAdditionalTransport is not set", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.HowDoesTheExportLeaveTheUkBackFromWhatExportJourney,
      };

      cy.visit(`${certificateUrl}/how-does-the-export-leave-the-uk`, {
        qs: { ...testParams },
      });

      // Verify page renders
      cy.contains("h1", "How do you transport the export?").should("be.visible");

      // Check back link points to what-export-journey
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/what-export-journey`);

      // Click back and verify navigation
      cy.contains("a", /^Back$/).click();
      cy.url().should("include", "/what-export-journey");
    });
  });

  describe("Scenario 3: Back navigation when adding additional transport mode for cloned document", () => {
    it("should navigate back to do-you-have-additional-transport-types for cloned document", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.HowDoesTheExportLeaveTheUkBackFromAdditionalTransportCloned,
      };

      cy.visit(`${certificateUrl}/how-does-the-export-leave-the-uk?fromAdditionalTransport=true`, {
        qs: { ...testParams },
      });

      // Verify page renders
      cy.contains("h1", "How do you transport the export?").should("be.visible");

      // Check back link points to do-you-have-additional-transport-types
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/do-you-have-additional-transport-types`);

      // Click back and verify navigation
      cy.contains("a", /^Back$/).click();
      cy.url().should("include", "/do-you-have-additional-transport-types");
    });
  });

  describe("Scenario 4: Back navigation when on first transport mode for cloned document", () => {
    it("should navigate back to what-export-journey for cloned document", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.HowDoesTheExportLeaveTheUkBackFromWhatExportJourneyCloned,
      };

      cy.visit(`${certificateUrl}/how-does-the-export-leave-the-uk`, {
        qs: { ...testParams },
      });

      // Verify page renders
      cy.contains("h1", "How do you transport the export?").should("be.visible");

      // Check back link points to what-export-journey
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/what-export-journey`);

      // Click back and verify navigation
      cy.contains("a", /^Back$/).click();
      cy.url().should("include", "/what-export-journey");
    });
  });

  describe("Progressive Enhancement: Back navigation without JavaScript", () => {
    it("should work when adding additional transport mode without JS", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.HowDoesTheExportLeaveTheUkBackFromAdditionalTransport,
        disableScripts: true,
      };

      cy.visit(`${certificateUrl}/how-does-the-export-leave-the-uk?fromAdditionalTransport=true`, {
        qs: { ...testParams },
      });

      // Verify back link is correct even without JS
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/do-you-have-additional-transport-types`);
    });

    it("should work when on first transport mode without JS", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.HowDoesTheExportLeaveTheUkBackFromWhatExportJourney,
        disableScripts: true,
      };

      cy.visit(`${certificateUrl}/how-does-the-export-leave-the-uk`, {
        qs: { ...testParams },
      });

      // Verify back link is correct even without JS
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/what-export-journey`);
    });
  });
});
