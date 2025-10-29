import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2023-SD-97DA962EC";
const storageDocumentUrl = `/create-storage-document/${documentNumber}/storage-document-created`;

describe("Storage document created page: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StorageDocumentCreated,
      args: [documentNumber],
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
  });

  it("should render links", () => {
    cy.contains("strong", /^Download the storage document$/).should("be.visible");
    cy.contains("a", /^View completed storage documents or create a new export document$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-storage-document/storage-documents");
  });

  it("should render links for user satisfaction survey feedback link for storage document", () => {
    cy.get('[data-testid="surveylink-feedback"]').contains("Take a 2 minute survey");
    cy.contains("a", "Take a 2 minute survey")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_734LbtQfQMrBoEu");
  });

  it("should render the correct page title and subtitle", () => {
    cy.title().should("eq", "The storage document has been created - Create a UK storage document - GOV.UK");
    cy.findByRole("heading", { name: "The storage document has been created", level: 1 });
    cy.get(".govuk-panel__body").contains("Storage document number");
    cy.get(".govuk-panel__body").contains(documentNumber);
  });

  it("should render other content", () => {
    cy.get(".govuk-heading-m").contains("What you need to do next");
    cy.contains("strong", /^Email the storage document to the importer$/).should("be.visible");
    cy.contains(
      "li",
      /^if you are using Firefox as an internet browser, please ensure JavaScript is enabled in order to view and download the certificate$/
    ).should("be.visible");
    cy.contains("li", /^if you are using a mobile device, please ensure you have installed a PDF viewer$/).should(
      "be.visible"
    );
  });

  it("should link to the storage document dashboard", () => {
    cy.findByRole("link", {
      name: "View completed storage documents or create a new export document",
    }).click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
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
    cy.url().should("include", "/create-storage-document/storage-documents");
  });
});
