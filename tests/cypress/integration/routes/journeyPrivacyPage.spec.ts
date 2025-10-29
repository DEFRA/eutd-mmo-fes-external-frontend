import { type ITestParams, TestCaseId } from "~/types";

const ccDashboardUrl = "/create-catch-certificate/catch-certificates";
const psDashboardUrl = "/create-processing-statement/processing-statements";
const sdDashboardUrl = "/create-storage-document/storage-documents";

describe("Privacy page for cc journey", () => {
  describe("Privacy Page when user accepted privacy notice", () => {
    it("Should redirect to dashboard page", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PrivacyAccepted,
      };
      cy.visit("/create-catch-certificate/privacy-notice", { qs: { ...testParams } });
      cy.url().should("include", "/create-catch-certificate/catch-certificates");
    });
  });

  describe("Privacy Page when user has not accepted the privacy notice", () => {
    it("Privacy Page for catch certificate", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PrivacyEmpty,
      };
      cy.visit("/create-catch-certificate/privacy-notice", { qs: { ...testParams } });
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", "/");
    });

    it("should redirect to home page on back link click", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PrivacyEmpty,
      };
      cy.visit("/create-catch-certificate/privacy-notice", { qs: { ...testParams } });

      cy.contains("a", /^Back$/).click({ force: true });
      cy.get(".govuk-heading-xl").contains("What do you want to do?");
    });
  });
});

describe("Privacy page for PS journey", () => {
  describe("Privacy Page when user accepted privacy notice", () => {
    it("Should redirect to dashboard page", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PrivacyAccepted,
      };
      cy.visit("/create-processing-statement/privacy-notice", { qs: { ...testParams } });
      cy.url().should("include", "/create-processing-statement/processing-statements");
    });
  });

  describe("Privacy Page when user has not accepted the privacy notice", () => {
    it("Privacy Page for catch certificate", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PrivacyEmpty,
      };
      cy.visit("/create-processing-statement/privacy-notice", { qs: { ...testParams } });
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", "/");
    });
  });
});

describe("Privacy page for sd journey", () => {
  describe("Privacy Page when user accepted privacy notice", () => {
    it("Should redirect to dashboard page", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PrivacyAccepted,
      };
      cy.visit("/create-storage-document/privacy-notice", { qs: { ...testParams } });
      cy.url().should("include", "/create-storage-document/storage-documents");
    });
  });

  describe("Privacy Page when user has not accepted the privacy notice", () => {
    it("Privacy Page for catch certificate", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PrivacyEmpty,
      };
      cy.visit("/create-storage-document/privacy-notice", { qs: { ...testParams } });
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", "/");
    });
  });
});

describe("Journey dashboards should redirect to privacy page when user has not accepted privacy notice", () => {
  it("CC dashboard should redirect to privacy notice", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PrivacyEmpty,
    };

    cy.visit(ccDashboardUrl, { qs: { ...testParams } });
    cy.url().should("include", "/privacy-notice");

    cy.get("#acceptAndContinue").should("be.visible");
  });

  it("PS dashboard should redirect to privacy notice", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PrivacyEmpty,
    };

    cy.visit(psDashboardUrl, { qs: { ...testParams } });
    cy.url().should("include", "/privacy-notice");

    cy.get("#acceptAndContinue").should("be.visible");
  });

  it("SD dashboard should redirect to privacy notice", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PrivacyEmpty,
    };

    cy.visit(sdDashboardUrl, { qs: { ...testParams } });
    cy.url().should("include", "/privacy-notice");

    cy.get("#acceptAndContinue").should("be.visible");
  });

  it("PS dashboard privacy notice - click on Submit button - jsenable set to false", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PrivacyEmpty,
    };

    cy.visit(psDashboardUrl, { qs: { ...testParams } });
    cy.url().should("include", "/privacy-notice");

    cy.get("#acceptAndContinue").should("be.visible");
    cy.get("#acceptAndContinue").click({ force: true });
  });

  it("PS dashboard privacy notice - click on Submit button - jsenable set to true", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PrivacyEmpty,
    };

    cy.visit(psDashboardUrl, { qs: { ...testParams } });
    cy.url().should("include", "/privacy-notice");

    cy.get("#acceptAndContinue").should("be.visible");
    cy.get("form").find("input").invoke("val", "true");
    cy.get("#acceptAndContinue").click({ force: true });
  });
});
