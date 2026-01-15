import { type ITestParams, TestCaseId } from "~/types";

const storageDocumentUrl = "/create-storage-document/storage-documents";

describe("EU CATCH Integration - Storage Document Completed Documents Table", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndEmptyInProgress,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
  });

  it("should render EU CATCH integration column header", () => {
    cy.get("table[data-testid='storageNotes-completed-table']")
      .find("thead th")
      .contains("EU CATCH integration")
      .should("be.visible");
  });

  it("should render EU CATCH integration column in correct position (after Date Created, before Action)", () => {
    cy.get("table[data-testid='storageNotes-completed-table'] thead tr th").then(($headers) => {
      const headerTexts = $headers.toArray().map((el) => el.textContent?.trim());
      const dateCreatedIndex = headerTexts.map((text) => text?.includes("Date Created")).indexOf(true);
      const euCatchIndex = headerTexts.indexOf("EU CATCH integration");
      const actionIndex = headerTexts.indexOf("Action");

      expect(dateCreatedIndex).to.be.greaterThan(-1);
      expect(euCatchIndex).to.be.greaterThan(dateCreatedIndex);
      expect(actionIndex).to.be.greaterThan(euCatchIndex);
    });
  });

  it("should render 'Check status' link for each completed document", () => {
    cy.get('[data-testid="storageNotes-check-eu-catch-status"]').each(($link) => {
      cy.wrap($link).should("contain.text", "Check status");
    });
  });

  it("should render 'Check status' link with correct href attribute", () => {
    cy.get('[data-testid="storageNotes-check-eu-catch-status"]')
      .first()
      .should("have.attr", "href")
      .and("match", /\/create-storage-document\/[A-Z0-9-]+\/eu-data-integration-(successful|pending|failed)/);
  });

  it("should have accessible hidden text for screen readers on check status link", () => {
    cy.get('[data-testid="storageNotes-check-eu-catch-status"]')
      .first()
      .find(".govuk-visually-hidden")
      .should("exist")
      .and("contain.text", "for document");
  });

  it("should render guidance text below completed documents table", () => {
    cy.get(".govuk-inset-text")
      .should("be.visible")
      .find("p.govuk-body")
      .should(
        "contain.text",
        "Refresh the page to check for updates to your non-manipulation documents. Open failed submissions to find out how to fix the problem."
      );
  });

  it("should work without JavaScript (standard anchor tags)", () => {
    cy.get('[data-testid="storageNotes-check-eu-catch-status"]')
      .first()
      .should("have.prop", "tagName", "A")
      .and("not.have.attr", "data-discover");
  });
});

describe("EU CATCH Integration - Storage Document Welsh Translation", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndEmptyInProgress,
    };
    cy.visit(`${storageDocumentUrl}?lng=cy`, { qs: { ...testParams } });
  });

  it("should render Welsh translation for EU CATCH integration header", () => {
    cy.get("table[data-testid='storageNotes-completed-table']")
      .find("thead th")
      .contains("Integreiddio â system CATCH yr UE")
      .should("be.visible");
  });

  it("should render Welsh translation for Check status link", () => {
    cy.get('[data-testid="storageNotes-check-eu-catch-status"]').first().should("contain.text", "Gwirio statws");
  });

  it("should render Welsh translation for guidance text", () => {
    cy.get(".govuk-inset-text")
      .should("be.visible")
      .find("p.govuk-body")
      .should(
        "contain.text",
        "Adnewyddwch y tudalen i wirio am ddiweddariadau i'ch dogfennau dim triniaeth. Agorwch gyflwyniadau sydd wedi methu er mwyn gweld sut i ddatrys y broblem."
      );
  });
});

describe("EU CATCH Integration - Storage Document Status Pages", () => {
  it("should navigate to successful status page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithSuccessEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833123/eu-data-integration-successful");
    cy.url().should("include", "/eu-data-integration-successful");
    cy.contains("p", "Your non-manipulation document data has been sent to the EU CATCH system.").should("be.visible");
    cy.title().should(
      "eq",
      "Your data has been transferred to EU CATCH - Create a UK non-manipulation document - GOV.UK"
    );
  });

  it("should navigate to pending status page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithPendingEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833456/eu-data-integration-pending");
    cy.url().should("include", "/eu-data-integration-pending");
    cy.contains("h1", "Sending your data for EU integration").should("be.visible");
    cy.title().should("eq", "Sending your data for EU integration - Create a UK non-manipulation document - GOV.UK");
  });

  it("should navigate to failed status page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithFailedEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833456/eu-data-integration-failed");
    cy.url().should("include", "/eu-data-integration-failed");
    cy.contains("h1", "There is a problem with EU data integration").should("be.visible");
    cy.title().should(
      "eq",
      "There is a problem with EU data integration - Create a UK non-manipulation document - GOV.UK"
    );
  });

  it("should have back link on successful status page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithSuccessEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833456/eu-data-integration-successful");
    cy.get(".govuk-back-link")
      .should("be.visible")
      .and("have.attr", "href", "/create-storage-document/storage-documents");
  });

  it("should have back link on pending status page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithPendingEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833456/eu-data-integration-pending");
    cy.get(".govuk-back-link")
      .should("be.visible")
      .and("have.attr", "href", "/create-storage-document/storage-documents");
  });

  it("should have back link on failed status page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithFailedEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833456/eu-data-integration-failed");
    cy.get(".govuk-back-link")
      .should("be.visible")
      .and("have.attr", "href", "/create-storage-document/storage-documents");
  });

  it("should display pending page content correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithPendingEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833456/eu-data-integration-pending");
    cy.contains("h1", "Sending your data for EU integration").should("be.visible");
    cy.contains("Your non-manipulation document data is being sent to the EU CATCH system").should("be.visible");
    cy.contains("This can take a few minutes").should("be.visible");
    cy.contains("h2", "What you can do now").should("be.visible");
    cy.contains("Your non-manipulation document is still valid and ready to use").should("be.visible");
  });

  it("should display failed page content correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithFailedEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833456/eu-data-integration-failed");
    cy.contains("h1", "There is a problem with EU data integration").should("be.visible");
    cy.contains("h2", "What this means").should("be.visible");
    cy.contains("h2", "If you need to speak to someone").should("be.visible");
  });
});

describe("EU CATCH Integration - Storage Document Welsh Translation for Status Pages", () => {
  it("should render Welsh translation on pending status page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithPendingEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833456/eu-data-integration-pending?lng=cy");
    cy.contains("h1", "Anfon eich data i'w integreiddio â system yr UE").should("be.visible");
    cy.contains("h2", "Beth gallwch chi ei wneud nawr").should("be.visible");
    cy.contains("Mae eich dogfen dim triniaeth yn dal yn ddilys ac yn barod i'w defnyddio.").should("be.visible");
  });

  it("should render Welsh translation on failed status page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithFailedEUStatus,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.visit("/create-storage-document/GBR-2022-SD-1C9833456/eu-data-integration-failed?lng=cy");
    cy.contains("h1", "Mae yna broblem wrth integreiddio â data'r UE").should("be.visible");
  });
});

describe("EU CATCH Integration - Storage Document Accessibility", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndEmptyInProgress,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
  });

  it("should have proper table structure with scope attributes", () => {
    cy.get("table[data-testid='storageNotes-completed-table'] thead th").each(($th) => {
      cy.wrap($th).should("have.attr", "scope", "col");
    });
  });

  it("should have proper link structure with visible text and hidden context", () => {
    cy.get('[data-testid="storageNotes-check-eu-catch-status"]')
      .first()
      .within(() => {
        cy.contains("Check status").should("be.visible");
        cy.get(".govuk-visually-hidden").should("exist");
      });
  });
});
