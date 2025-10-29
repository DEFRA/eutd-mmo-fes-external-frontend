import { type ITestParams, TestCaseId, type Journey } from "~/types";

const processingStatementLandingUrl = `/create-processing-statement/processing-statements`;
const journey: Journey = "processingStatement";

describe("Processing Statement dashboard sidebar links", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(processingStatementLandingUrl, { qs: { ...testParams } });
  });
  it("should render links for send feedback for storage document", () => {
    cy.get('[data-testid="dashboard-feedback-url-link"]').contains("Take our survey now");
    cy.contains("a", "Take our survey now")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_1S5DVwag5rcTrAq");
  });

  it("should display feedback headings", () => {
    cy.contains("h3", "Send feedback");
  });
});
describe("Processing Statement Landing page: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(processingStatementLandingUrl, { qs: { ...testParams } });
  });

  it("should render a valid page title", () => {
    cy.title().should(
      "eq",
      "Automation Testing Ltd: processing statements - Create a UK processing statement - GOV.UK"
    );
  });

  it("should redirect to the dashboard page if didn't got expected response", () => {
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  it("should display Need help? heading", () => {
    cy.contains("h2", "Need help?");
  });

  it("should render link for Guidance on exporting fish (gov.uk)", () => {
    cy.contains("a", "Guidance on exporting fish (gov.uk)")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/guidance/exporting-and-importing-fish-if-theres-no-brexit-deal");
  });

  it("should render link for EU 2026 Changes Guidance (gov.uk)", () => {
    cy.contains("a", "EU 2026 Changes Guidance (gov.uk)")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/guidance/eu-iuu-regulation-2026-changes");
  });

  it("should display feedback headings", () => {
    cy.contains("h3", "Send feedback");
  });

  it("should render links catch certificate link", () => {
    cy.contains("a", "Create a UK catch certificate")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/guidance/create-a-uk-catch-certificate");
    cy.contains("a", "Create a UK storage document")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/guidance/create-a-uk-storage-document");
  });

  it("should render the correct page title and subtitle", () => {
    cy.get(".govuk-heading-xl").contains("processing statements");
    cy.get(".govuk-body").contains("A maximum of 5 draft processing statements is allowed at any time.");
  });

  it("should render dashboard headers", () => {
    cy.get(".govuk-heading-l").contains("In progress");
    cy.get(".govuk-heading-l").contains("Completed");
  });

  it("should render dashboard in progress table with columns and data", () => {
    cy.get(".govuk-table__header").contains("Document number");
    cy.get(".govuk-table__header").contains("Your reference");
    cy.get(".govuk-table__header").contains("Date started");
    cy.get(".govuk-table__header").contains("Action");
    cy.get(".govuk-table__header").contains("Date Created");

    cy.get(".govuk-table__cell").contains("GBR-2022-PS-F0285BD8A");
    cy.get(".govuk-table__cell").contains("GBR-2022-PS-1C9833456");
  });

  it("should render dashboard with create button and no warning message", () => {
    cy.get(".govuk-notification-banner__heading").should("not.exist");

    cy.contains("button", "Create a new processing statement").should("be.visible");
  });
});

describe("Processing Statement Landing page for Inprogress table: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSLoadDasboardWithInProgressAndEmptyCompleted,
    };
    cy.visit(processingStatementLandingUrl, { qs: { ...testParams } });
  });

  it("should render dashboard in progress table with columns and data", () => {
    cy.get(".govuk-table__header").contains("Document number");
    cy.get(".govuk-table__header").contains("Your reference");
    cy.get(".govuk-table__header").contains("Date started");
    cy.get(".govuk-table__header").contains("Action");
    cy.get(".govuk-grid-column-two-thirds").contains("No processing statement documents were created this month");

    cy.get(".govuk-table__cell").contains("GBR-2022-PS-407EAA477");
  });
});

describe("PS dashboard with query parameters", () => {
  it("should render a service notification banner", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(processingStatementLandingUrl, { qs: { ...testParams, month: 10, year: 2020, position: 0 } });

    cy.get(".govuk-pagination__item--current > .govuk-link.govuk-pagination__link").should(
      "have.attr",
      "href",
      "/create-processing-statement/processing-statements?month=10&year=2020&position=0"
    );
  });
});

describe("PS dashboard with user details", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardUserDetails,
      args: [journey],
    };
    cy.visit(processingStatementLandingUrl, { qs: { ...testParams } });
  });

  it("should render a header with user details", () => {
    cy.get(".govuk-notification-banner .govuk-heading-l").should("have.text", "Title");

    cy.get("h1.govuk-heading-xl").should("have.text", "Automation Testing Ltd: processing statements");
  });
});

describe("Processing Statement Landing page for completed table: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSLoadDasboardWithCompletedAndEmptyInProgress,
    };
    cy.visit(processingStatementLandingUrl, { qs: { ...testParams } });
  });

  it("should render dashboard complete table with columns and data", () => {
    cy.get(".govuk-table__header").contains("Document number");
    cy.get(".govuk-table__header").contains("Your reference");
    cy.get(".govuk-table__header").contains("Date Created");
    cy.get(".govuk-table__header").contains("Action");
    cy.get(".govuk-grid-column-two-thirds").contains("You do not have any processing statements in progress.");

    cy.get(".govuk-table__cell").contains("GBR-2022-PS-1C9833456");
  });
});

describe("Processing Statement Landing page for 50 or more draft documents: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSLoadDashboardMaxDraftLimitReached,
    };
    cy.visit(processingStatementLandingUrl, { qs: { ...testParams } });
  });

  it("should render notifcation with warning message and hide the create document button", () => {
    cy.get(".govuk-notification-banner__heading").contains(
      "You have reached the maximum limit allowed for draft processing statements."
    );
    cy.get(".govuk-button").should("not.exist");
  });
});

describe("Processing Statement Landing page: create a new document", () => {
  it("will redirect to the progress page after the document has been created", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCreateProcessingStatementSuccess,
    };
    cy.visit(processingStatementLandingUrl, { qs: { ...testParams } });

    cy.get("#create-export-document").click({ force: true });
    cy.url().should("include", "/create-processing-statement/GBR-2022-PS-0123456789/progress");
  });

  it("will redirect to the forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCreateProcessingStatementFailure,
    };
    cy.visit(processingStatementLandingUrl, { qs: { ...testParams } });

    cy.get("#create-export-document").click({ force: true });
    cy.url().should("include", "/forbidden");
  });
});
