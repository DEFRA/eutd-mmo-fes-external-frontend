import { type ITestParams, TestCaseId } from "~/types";

const certificateUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
const progressUrl = `${certificateUrl}/progress`;

describe("ProgressPage - Incomplete Application", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSIncompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display a processing statement header", () => {
    cy.contains("a", /^Create a UK processing statement$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-processing-statement/processing-statements");
  });

  it("should display back button and back button should have correct href pointing to processing statement dashboard", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-processing-statement/processing-statements");
  });

  it("should display the correct headings", () => {
    cy.contains("[data-testid='ps-progress-titling']", "Your Progress");
    cy.contains("[data-testid='ps-progress-heading']", "Processing Statement application: GBR-2021-PS-8EEB7E123");
  });

  it("should display Application incomplete when NOT all required sections have been completed", () => {
    cy.contains("[data-testid='Progress-completed-heading']", "Application incomplete");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 0 of 6 required sections.");
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('OPTIONAL')").should("have.length", 1);
    cy.get("li strong:contains('INCOMPLETE')").should("have.length", 6);
  });

  it("should redirect to the exporter processing statement dashboard", () => {
    cy.get("[data-testid=return-to-dashboard-button]").click({ force: true });
    cy.url().should("include", "/processing-statements");
  });

  it("should display errors", () => {
    cy.get("[data-testid=continue-button]").click({ force: true });
    cy.url().should("include", "/progress");
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^You must complete the exporter details section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the product details section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the processing plant ID section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the processing plant address section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the export health certificate section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the export destination section before being able to continue$/).should(
      "be.visible"
    );
  });
});

describe("ProgressPage - Completed Application", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display Application completed when all required sections have been completed", () => {
    cy.contains("[data-testid='Progress-completed-heading']", "Application completed");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 6 of 6 required sections.");
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('COMPLETE')").should("have.length", 6);
  });

  it("should redirect to check-your-information page when click on Check your answers button", () => {
    cy.get('[data-testid="continue-button"]').click({ force: true });
  });
});

describe("ProgressPage - Completed Application Unauthorised", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCompleteProgressUnauthorised,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should redirect to forbidden page when click on Check your answers button", () => {
    cy.get('[data-testid="continue-button"]').click({ force: true });
    cy.url().should("contain", "/forbidden");
  });
});

describe("should display the notificationBanner", () => {
  it("first visit copy page then click on green button to navigate progress page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyAllData,
      disableScripts: true,
    };
    cy.visit("create-processing-statement/GBR-2022-PS-F71D98A30/copy-this-processing-statement", {
      qs: { ...testParams },
    });
    cy.wait(500);
    cy.get("#voidOriginal").click({ force: true });
    cy.get("#copyDocumentAcknowledged").check();
    cy.get('[data-testid="continue"]').click({ force: true });
    cy.get(".govuk-notification-banner__heading").contains(
      "This draft was created by copying document GBR-2022-PS-F71D98A30. You are reminded that you must not use a processing statememt or data for catches that have already been exported as this is a serious offence and may result in enforcement action being taken."
    );
  });
});
