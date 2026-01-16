import { type ITestParams, TestCaseId } from "~/types";

const storageDocumentDashboardUrl = "/create-non-manipulation-document/non-manipulation-documents";

describe("Storage Document dashboard sidebar links", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });
  });

  it("should display feedback hyperlinks", () => {
    cy.get('[data-testid="dashboard-feedback-url-link"]').contains("Take our survey now");
    cy.contains("a", "Take our survey now")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_1S5DVwag5rcTrAq");
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
});

describe("Storage Document Dashboard page: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });
  });

  it("should render a valid page title", () => {
    cy.title().should(
      "eq",
      "Automation Testing Ltd: non-manipulation documents - Create a UK storage document - GOV.UK"
    );
  });

  it("should redirect to the dashboard page if didn't got expected response", () => {
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should render links catch certificate link", () => {
    cy.contains("a", "Create a UK catch certificate")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/guidance/create-a-uk-catch-certificate");
    cy.contains("a", "Create a UK processing statement")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/guidance/create-a-uk-processing-statement");
  });

  it("should render the correct page title and subtitle", () => {
    cy.get(".govuk-heading-xl").contains("non-manipulation documents");
    cy.get(".govuk-body").contains("You can create up to 5 draft non-manipulation documents.");
    cy.get(".govuk-body").contains(
      "When you reach the limit, you'll need to delete a draft before you can start a new one."
    );
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

    cy.get(".govuk-table__cell").contains("GBR-2022-SD-F0285BD8A");
    cy.get(".govuk-table__cell").contains("GBR-2022-SD-1C9833456");
  });

  it("should render dashboard with create button and no warning message", () => {
    cy.get(".govuk-notification-banner__heading").should("not.exist");

    cy.contains("button", "Create a new non-manipulation document").should("be.visible");
  });
});

describe("Storage Document Dashboard page for in progress table: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithInProgressAndEmptyCompleted,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });
  });

  it("should render dashboard in progress table with columns and data", () => {
    cy.get(".govuk-table__header").contains("Document number");
    cy.get(".govuk-table__header").contains("Your reference");
    cy.get(".govuk-table__header").contains("Date started");
    cy.get(".govuk-table__header").contains("Action");
    cy.get(".govuk-body").contains("Your non-manipulation documents will appear here when you've submitted them.");

    cy.get(".govuk-table__cell").contains("GBR-2022-SD-407EAA477");
  });

  it("should display guidance text for in progress section", () => {
    cy.get(".govuk-body").contains("You can create up to 5 draft non-manipulation documents.");
    cy.get(".govuk-body").contains(
      "When you reach the limit, you'll need to delete a draft before you can start a new one."
    );
  });

  it("should display horizontal separator line after guidance", () => {
    cy.get(".govuk-section-break").should("exist");
  });
});

describe("Storage Document Dashboard page for completed table: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndEmptyInProgress,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });
  });

  it("should render dashboard complete table with columns and data", () => {
    cy.get(".govuk-table__header").contains("Document number");
    cy.get(".govuk-table__header").contains("Your reference");
    cy.get(".govuk-table__header").contains("Date Created");
    cy.get(".govuk-table__header").contains("Action");
    cy.get(".govuk-body").contains("Your draft non-manipulation documents will appear here when you've created them.");

    cy.get(".govuk-table__cell").contains("GBR-2022-SD-1C9833456");
  });

  it("should render EU CATCH integration column with check status links", () => {
    cy.get("table[data-testid='storageNotes-completed-table']")
      .find("thead th")
      .contains("EU CATCH integration")
      .should("be.visible");
  });

  it("should render check status links with correct href patterns for different statuses", () => {
    cy.get('[data-testid="storageNotes-check-eu-catch-status"]').each(($link) => {
      cy.wrap($link)
        .should("have.attr", "href")
        .and(
          "match",
          /\/create-non-manipulation-document\/[A-Z0-9-]+\/eu-data-integration-(successful|pending|failed)/
        );
    });
  });

  it("should render visually hidden context for screen readers on check status links", () => {
    cy.get('[data-testid="storageNotes-check-eu-catch-status"]')
      .first()
      .find(".govuk-visually-hidden")
      .should("exist")
      .and("include.text", "for document");
  });

  it("should verify column order: Document Number, Reference, Date, EU CATCH Integration, Action", () => {
    cy.get("table[data-testid='storageNotes-completed-table'] thead tr th").then(($headers) => {
      const headerTexts = $headers.toArray().map((el) => el.textContent?.trim());

      expect(headerTexts[0]).to.include("Document number");
      expect(headerTexts[1]).to.include("Your reference");
      expect(headerTexts[2]).to.include("Date Created");
      expect(headerTexts[3]).to.equal("EU CATCH integration");
      expect(headerTexts[4]).to.equal("Action");
    });
  });

  it("should display guidance text in inset box for completed section", () => {
    cy.get(".govuk-inset-text").should("exist");
    cy.get(".govuk-inset-text .govuk-body").contains(
      "Refresh the page to check for updates to your non-manipulation documents. Open failed submissions to find out how to fix the problem."
    );
  });

  it("should always display guidance text even when no drafts exist", () => {
    cy.get(".govuk-body").contains("You can create up to 5 draft non-manipulation documents.");
    cy.get(".govuk-body").contains(
      "When you reach the limit, you'll need to delete a draft before you can start a new one."
    );
  });

  it("should display horizontal separator lines around no drafts message", () => {
    cy.get(".govuk-section-break").should("have.length.at.least", 1);
  });
});

describe("Storage Document Dashboard page for 50 or more draft documents: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDashboardMaxDraftLimitReached,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });
  });

  it("should render notifcation with warning message and hide the create document button", () => {
    cy.get(".govuk-notification-banner__heading").contains(
      "You have reached the maximum limit allowed for draft non-manipulation documents."
    );
    cy.get(".govuk-button").should("not.exist");
  });
});

describe("Storage Document Dashboard page: create a new document", () => {
  it("will redirect to the progress page after the document has been created", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCreateProcessingStatementSuccess,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });

    cy.get("#create-export-document").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/GBR-2022-SD-0123456789/progress");
  });

  it("will redirect to the forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCreateProcessingStatementFailure,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });

    cy.get("#create-export-document").click({ force: true });
    cy.url().should("include", "/forbidden");
  });
});

describe("Storage Document Dashboard page: continue a document", () => {
  it("should redirect user to the continue this storage document page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });

    cy.get("a#continue[href='/create-non-manipulation-document/GBR-2022-SD-F0285BD8A/progress']").click({
      force: true,
    });
    cy.url().should("include", "/create-non-manipulation-document/GBR-2022-SD-F0285BD8A/progress");
  });
});

describe("Storage Document Dashboard page: delete a document", () => {
  it("should redirect user to the delete this storage document page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });

    cy.get(
      "a#delete[href='/create-non-manipulation-document/GBR-2022-SD-F0285BD8A/delete-this-non-manipulation-document']"
    ).click({
      force: true,
    });
    cy.url().should(
      "include",
      "/create-non-manipulation-document/GBR-2022-SD-F0285BD8A/delete-this-non-manipulation-document"
    );
  });
});

describe("Storage Document Dashboard page: void a document", () => {
  it("should redirect user to the void this storage document page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });

    cy.get(
      "a[href='/create-non-manipulation-document/GBR-2022-SD-1C9833456/void-this-non-manipulation-document']"
    ).click({
      force: true,
    });
    cy.url().should(
      "include",
      "/create-non-manipulation-document/GBR-2022-SD-1C9833456/void-this-non-manipulation-document"
    );
  });
});

describe("Storage Document Dashboard page: copy a document", () => {
  it("should redirect user to the void this storage document page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });

    cy.get(
      "a[href='/create-non-manipulation-document/GBR-2022-SD-1C9833456/copy-this-non-manipulation-document']"
    ).click({
      force: true,
    });
    cy.url().should(
      "include",
      "/create-non-manipulation-document/GBR-2022-SD-1C9833456/copy-this-non-manipulation-document"
    );
  });
});

describe("Storage Document Dashboard page: view a document pdf", () => {
  it("should have a view pdf link", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndInProgress,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });
    cy.get("a[href='/pdf/export-certificates/_ce5a5ac6-6480-4583-9a66-265250b752b0.pdf']").should("be.visible");
  });
});

describe("Storage document dashboard with user details", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardUserDetails,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });
  });

  it("should render a header with user details", () => {
    cy.get(".govuk-notification-banner .govuk-heading-l").should("have.text", "Title");

    cy.get("h1.govuk-heading-xl").should("have.text", "Automation Testing Ltd: non-manipulation documents");
  });

  it("should render the progress page after creating a document", () => {
    cy.get("#create-export-document").click({ force: true });

    cy.url().should("include", "/progress");
  });
});

describe("Storage document dashboard with account details", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardAccountDetails,
    };
    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });
  });

  it("should render a header with account details", () => {
    cy.get(".govuk-notification-banner .govuk-heading-l").should("have.text", "Title");

    cy.get("h1.govuk-heading-xl").should("have.text", "Automation Testing Ltd: non-manipulation documents");
  });
});
