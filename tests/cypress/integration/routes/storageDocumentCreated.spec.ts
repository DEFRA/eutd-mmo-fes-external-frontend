import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2023-SD-97DA962EC";
const storageDocumentUrl = `/create-non-manipulation-document/${documentNumber}/non-manipulation-document-created`;

describe("Storage document created page: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StorageDocumentCreated,
      args: [documentNumber],
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
  });

  it("should render links", () => {
    cy.contains("strong", /^Download the non-manipulation document$/).should("be.visible");
    cy.contains("a", /^View completed non-manipulation documents or create a new export document$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should render links for user satisfaction survey feedback link for storage document", () => {
    cy.get('[data-testid="surveylink-feedback"]').contains("Take a 2 minute survey");
    cy.contains("a", "Take a 2 minute survey")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_734LbtQfQMrBoEu");
  });

  it("should render the correct page title and subtitle", () => {
    cy.title().should(
      "eq",
      "The non-manipulation document has been created - Create a UK non-manipulation document - GOV.UK"
    );
    cy.findByRole("heading", { name: "The non-manipulation document has been created", level: 1 });
    cy.get(".govuk-panel__body").contains("Non-manipulation document number");
    cy.get(".govuk-panel__body").contains(documentNumber);
  });

  it("should render all step-by-step instructions with correct text", () => {
    cy.get(".govuk-heading-m").contains("What you need to do next").should("be.visible");
    cy.contains("strong", "Download the non-manipulation document").should("be.visible");
    cy.contains(
      "li",
      "If you are using Firefox as an internet browser, please ensure JavaScript is enabled in order to view and download the certificate"
    ).should("be.visible");
    cy.contains("li", "If you are using a mobile device, please ensure you have installed a PDF viewer").should(
      "be.visible"
    );
    cy.contains("strong", "Email the non-manipulation document to the importer.").should("be.visible");
    cy.contains(
      "li",
      "It is the importer’s responsibility to submit it to the import control authority where your export will enter the EU."
    ).should("be.visible");
    cy.contains(
      "li",
      "The importing authority will complete and sign their section of the document at the Border Inspection Post (BIP)."
    ).should("be.visible");
    cy.contains("View completed non-manipulation documents or create a new export document").should("be.visible");
  });

  it("should render important notice with exclamation icon", () => {
    cy.get('svg[viewBox="0 0 35.000000 35.000000"]').should("be.visible");
    cy.get("svg title").contains("icon important").should("exist");
    cy.contains("strong", "Do not amend the non-manipulation document.").should("be.visible");
  });

  it("should link to the storage document dashboard", () => {
    cy.findByRole("link", {
      name: "View completed non-manipulation documents or create a new export document",
    }).click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should render survey component", () => {
    cy.get('[data-testid="surveylink-feedback"]').contains("Take a 2 minute survey");
  });
});

describe("Storage document created page: pageguard", () => {
  it("should redirect to the dashboard page if didn't got expected response", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StorageDocumentPageGuard,
      args: [documentNumber],
    };
    cy.visit(storageDocumentUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });
});
