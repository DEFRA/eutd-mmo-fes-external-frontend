import { type ITestParams, TestCaseId } from "~/types";

describe("Add Your Reference", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-your-reference`;

  it("should render a valid hint message", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReference,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-hint").should(
      "have.text",
      "Enter a reference to help you identify this catch certificate within the service. This reference is for your own use and will not appear on the final certificate. For example, you could choose a reference number from your organisation."
    );
  });

  it("should update reference and continue to the add-exporter-details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReference,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "add-exporter-details");
  });

  it("should update reference and save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReference,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should redirect to the forbidden page if the user is unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReferenceForbidden,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should display an error when there is a server error with an array of error messages", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReferenceFailsWithErrors,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "add-your-reference");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-input.govuk-input--error").should("exist");
  });

  it("should go to the exporter dashboard page even if save as draft errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReferenceFailsWithErrors,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("contain", "/create-catch-certificate/catch-certificates");
  });

  it("should redirect to the forbidden page if the user is unauthorised but tries to save a reference", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReferenceFailsWith403,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/forbidden");
  });
});

describe("Add Your Reference - Processing Statement", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-your-reference`;

  it("should render a valid hint message", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddReference,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-hint").should(
      "have.text",
      "Enter a reference to help you identify this processing statement within the service. This reference is for your own use and will not appear on the final certificate. For example, you could choose a reference number from your organisation."
    );
  });

  it("should update reference and continue to the add-exporter-details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddReference,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "add-exporter-details");
  });

  it("should update reference and save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddReference,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-processing-statement/processing-statement");
  });

  it("should redirect to the forbidden page if the user is unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReferenceForbidden,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should display an error when there is a server error with an array of error messages", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddReferenceFailsWithErrors,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "add-your-reference");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-input.govuk-input--error").should("exist");
  });

  it("should go to the exporter dashboard page even if save as draft errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddReferenceFailsWithErrors,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("contain", "/create-processing-statement/processing-statement");
  });

  it("should redirect to the forbidden page if the user is unauthorised but tries to save a reference", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReferenceFailsWith403,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/forbidden");
  });
});

describe("Add Your Reference - Storage Document", () => {
  const documentUrl = "/create-storage-document/GBR-2021-SD-8EEB7E123";
  const pageUrl = `${documentUrl}/add-your-reference`;

  it("should render a valid hint message", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddReference,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-hint").should(
      "have.text",
      "Enter a reference to help you identify this storage document within the service. This reference is for your own use and will not appear on the final certificate. For example, you could choose a reference number from your organisation."
    );
  });

  it("should update reference and continue to the add-exporter-details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddReference,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "add-exporter-details");
  });

  it("should update reference and save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddReference,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-storage-document/storage-document");
  });

  it("should redirect to the forbidden page if the user is unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReferenceForbidden,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should display an error when there is a server error with an array of error messages", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddReferenceFailsWithErrors,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "add-your-reference");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-input.govuk-input--error").should("exist");
  });

  it("should go to the exporter dashboard page even if save as draft errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddReferenceFailsWithErrors,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("contain", "/create-storage-document/storage-document");
  });

  it("should redirect to the forbidden page if the user is unauthorised but tries to save a reference", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddReferenceFailsWith403,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#userReference").type("qwerty");
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/forbidden");
  });
});
