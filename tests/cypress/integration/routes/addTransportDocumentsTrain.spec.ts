import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-CC-3FE1169D1";
const certificateUrl = `/create-catch-certificate/${documentNumber}`;
const trainPageUrl = `create-catch-certificate/${documentNumber}/add-additional-transport-documents-train/0`;

describe("Add Transportation Documents Train", () => {
  it("should render train transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocuments,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-transportation-details-train/0`);
    cy.get(".govuk-fieldset__heading").contains("Train documents");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(2);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(2);
      expect(labels).to.have.length(2);
      expect(labels).to.deep.eq(["Train document name (optional)", "Train document reference (optional)"]);
      expect(hints).to.deep.eq([
        "For example, an invoice, packing list or certificate of origin.",
        "For example, INV00001",
      ]);
    });
    cy.contains("button", "Add another document").should("be.visible");
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
  });

  it("should redirect user to CC dashboard page when user clicks on Save as Draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocuments,
    };

    cy.visit(trainPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should display errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocumentsErrors,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });

  it("should display error for (optional) fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocumentsOptionalError,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", `${certificateUrl}/do-you-have-additional-transport-types`);
  });

  it("should display error for adding an additional document for empty form", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocumentsOptionalError,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=add-another-document-button]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter at least one additional transport document$/).should("be.visible");
  });

  it("should display previously entered name and reference", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocumentsAddAnotherDocument,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=add-another-document-button]").click();
    cy.get("input[name=documentName1]").type("Invoice 2");
    cy.get("input[name=documentReference1]").type("INV0002");

    cy.get('a[hreflang="cy"][lang="cy"]').click();
    cy.get('label[for="documents.0.name"]').should("have.text", "Enw'r ddogfen drên (dewisol)");
    cy.get('label[for="documents.0.reference"]').should("have.text", "Cyfeirnod y ddogfen drên (dewisol)");
  });

  it("should redirect user to forbidden page when saveTransportDocuments fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocumentsFailsWith403,
    };

    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should navigate to cc dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocumentsSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#documents").get("input[name=documentName1]").type("Invoice", { force: true });
    cy.get("#documents").get("input[name=documentReference1]").type("INV0001", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should display errors when click without adding document name and reference", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocumentsErrors,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=add-another-document-button]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("h2", /^There is a problem$/).click({ force: true });
  });

  it("should not display errors when click adding document name and reference", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDocuments,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#documents").get("input[name=documentName1]").type("Invoice", { force: true });
    cy.get("#documents").get("input[name=documentReference1]").type("INV0001", { force: true });
    cy.get("[data-testid=add-another-document-button]").click({ force: true });
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(4);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(4);
      expect(labels).to.have.length(4);
      expect(labels).to.deep.eq([
        "Train document name (optional)",
        "Train document reference (optional)",
        "Train document name (optional)",
        "Train document reference (optional)",
      ]);
      expect(hints).to.deep.eq([
        "For example, an invoice, packing list or certificate of origin.",
        "For example, INV00001",
        "For example, an invoice, packing list or certificate of origin.",
        "For example, INV00001",
      ]);
    });
  });
});
