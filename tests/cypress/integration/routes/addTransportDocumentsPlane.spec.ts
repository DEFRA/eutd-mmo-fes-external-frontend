import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-CC-3FE1169D1";
const certificateUrl = `/create-catch-certificate/${documentNumber}`;
const planePageUrl = `create-catch-certificate/${documentNumber}/add-additional-transport-documents-plane/0`;

describe("Add Transportation Documents Plane", () => {
  it("should render plane transport details page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocuments,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-transportation-details-plane/0`);
    cy.get(".govuk-fieldset__heading").contains("Plane documents");
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
      expect(labels).to.deep.eq(["Plane document name (optional)", "Plane document reference (optional)"]);
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
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocuments,
    };

    cy.visit(planePageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click();
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should display errors", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocumentsErrors,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });

  it("should display error for (optional) fields", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocumentsOptionalError,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", `${certificateUrl}/do-you-have-additional-transport-types`);
  });

  it("should display error for adding an additional document for empty form", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocumentsOptionalError,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=add-another-document-button]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter at least one additional transport document$/).should("be.visible");
  });

  it("should display previously entered name and reference", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocumentsAddAnotherDocument,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=add-another-document-button]").click();
    cy.get("input[name=documentName1]").should("be.visible");
    cy.get("input[name=documentName1]").clear();
    cy.get("input[name=documentName1]").type("Invoice 2");
    cy.get("input[name=documentReference1]").should("not.be.disabled");
    cy.get("input[name=documentReference1]").clear();
    cy.get("input[name=documentReference1]").type("INV0002");

    cy.get('a[hreflang="cy"][lang="cy"]').click();
    cy.get('label[for="documents.0.name"]').should("have.text", "Enw'r ddogfen Awyren (dewisol)");
    cy.get('label[for="documents.0.reference"]').should("have.text", "Cyfeirnod y ddogfen awyren (dewisol)");
  });

  it("should redirect user to forbidden page when saveTransportDocuments fails with a 403 error", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocumentsFailsWith403,
    };

    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "/forbidden");
  });

  it("should navigate to cc dashboard page on click of save as draft button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocumentsSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#documents").get("input[name=documentName1]").type("Invoice");
    cy.get("#documents").get("input[name=documentReference1]").type("INV0001");
    cy.get("[data-testid=save-draft-button").click();
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should display errors when click without adding document name and reference", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocumentsErrors,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=add-another-document-button]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("h2", /^There is a problem$/).click();
  });

  it("should not display errors when click adding document name and reference", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocuments,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#documents").get("input[name=documentName1]").type("Invoice");
    cy.get("#documents").get("input[name=documentReference1]").type("INV0001");
    cy.get("[data-testid=add-another-document-button]").click();
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
        "Plane document name (optional)",
        "Plane document reference (optional)",
        "Plane document name (optional)",
        "Plane document reference (optional)",
      ]);
      expect(hints).to.deep.eq([
        "For example, an invoice, packing list or certificate of origin.",
        "For example, INV00001",
        "For example, an invoice, packing list or certificate of origin.",
        "For example, INV00001",
      ]);
    });
  });

  it("should not display the Add another document button when 5 transport documents have been added", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportDocumentsRestrictAddAnotherDocument,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.contains("button", "Add another document").should("not.exist");
  });
});
