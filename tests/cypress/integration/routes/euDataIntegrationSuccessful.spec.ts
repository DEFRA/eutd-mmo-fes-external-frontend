import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-CC-3FE1169D1";
const euDataIntegrationUrl = `/create-catch-certificate/${documentNumber}/eu-data-integration-successful`;
const dashboardUrl = `/create-catch-certificate/catch-certificates`;

describe("EU Data Integration Successful Page", () => {
  describe("Scenario 1 - New page to show EU data integration successful", () => {
    it("should display confirmation panel with heading and reference number", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationSuccessful,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams } });

      cy.contains("a.govuk-back-link", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", dashboardUrl);

      cy.get("[data-testid='eu-integration-success-banner']")
        .should("be.visible")
        .and("have.class", "govuk-panel--confirmation");

      cy.get(".govuk-panel__title").should("be.visible").should("contain.text", "EU data integration successful");
    });

    it("should display information about data transfer in two paragraphs", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationSuccessful,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams } });

      cy.contains("p", /Your catch certificate data has been sent to the EU CATCH system/).should("be.visible");

      cy.contains("p", /The EU has received your information/).should("be.visible");
    });

    it("should display 'What happens next' section", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationSuccessful,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams } });

      cy.get("h2.govuk-heading-m").should("be.visible").should("contain.text", "What happens next");

      cy.contains("p", /Your catch certificate is ready to use/).should("be.visible");

      cy.contains("a", /view or download it from your dashboard/)
        .should("be.visible")
        .should("have.attr", "href", dashboardUrl);
    });

    it("should navigate to dashboard when clicking dashboard link", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationSuccessful,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams } });

      cy.contains("a", /view or download it from your dashboard/).click();
      cy.url().should("include", dashboardUrl);
    });

    it("should navigate to dashboard when clicking Back link", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationSuccessful,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams } });

      cy.get("a.govuk-back-link").click();
      cy.url().should("include", dashboardUrl);
    });
  });

  describe("Scenario 2 - Welsh translations", () => {
    it("should display Welsh translations when Welsh language is selected", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationSuccessful,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams, lng: "cy" } });

      cy.contains("a.govuk-back-link", /^Yn ôl$/).should("be.visible");

      cy.get(".govuk-panel__title")
        .should("be.visible")
        .should("contain.text", "Integreiddio â data'r UE wedi llwyddo");

      cy.get(".govuk-panel__body").should("be.visible").should("contain.text", "Eich rhif cyfeirnod");

      cy.contains("p", /Mae data'ch tystysgrif dalfa wedi'i anfon i system CATCH yr UE/).should("be.visible");

      cy.contains("p", /Mae'r UE wedi cael eich gwybodaeth/).should("be.visible");

      cy.get("h2.govuk-heading-m").should("be.visible").should("contain.text", "Beth sy'n digwydd nesaf");

      cy.contains("a", /ei gweld neu ei lawrlwytho/).should("be.visible");
    });
  });

  describe("Scenario 3 - Non-JS compliance", () => {
    it("should function correctly with JavaScript disabled", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationSuccessful,
        disableScripts: true,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams } });

      cy.get(".govuk-panel__title", { timeout: 10000 }).should("be.visible");

      cy.get("a.govuk-back-link").should("exist");
      cy.get("[data-testid='eu-integration-success-banner']").should("exist");
      cy.get(".govuk-panel__body").should("exist");
      cy.get("h2.govuk-heading-m").should("exist");
    });
  });

  describe("Scenario 4 - Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationSuccessful,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams } });

      cy.get(".govuk-panel__title").should("match", "h1");

      cy.contains("What happens next").should("match", "h2");
    });

    it("should have accessible links with visible text", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationSuccessful,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams } });

      cy.get("a.govuk-back-link").should("be.visible").should("contain.text", "Back");
      cy.contains("a", /view or download it from your dashboard/).should("be.visible");
    });
  });

  describe("Error handling", () => {
    it("should redirect to forbidden page when unauthorised", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.EuDataIntegrationUnauthorised,
      };

      cy.visit(euDataIntegrationUrl, { qs: { ...testParams } });
      cy.url().should("include", "/forbidden");
    });
  });
});
