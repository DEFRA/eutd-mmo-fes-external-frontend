import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-processing-statement/GBR-2022-PS-F0285BD8A";
const voidThisProcessingStatementUrl = `${documentUrl}/void-this-processing-statement`;

describe("void this draft processing statement page", () => {
  it("should render the correct h1 title", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocumentBadRequest,
    };
    cy.visit(voidThisProcessingStatementUrl, { qs: { ...testParams } });

    cy.contains("h1", "Are you sure you want to void this processing statement?").should("be.visible");
  });

  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocumentBadRequest,
    };
    cy.visit(voidThisProcessingStatementUrl, { qs: { ...testParams } });

    cy.get('[data-testid="void-certificate-confirm"]')
      .contains("Are you sure you want to void this processing statement?")
      .should("be.visible");
    cy.get('[data-testid="continue"]').click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");

    cy.get(".govuk-list > li > a").contains("Select yes if you want to void the current document").should("be.visible");
    cy.get(".govuk-error-message").contains("Select yes if you want to void the current document").should("be.visible");
  });

  it("Submit form with yes option click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocumentOptionYes,
    };
    cy.visit(voidThisProcessingStatementUrl, { qs: { ...testParams } });
    cy.get("#documentVoid").check();
    cy.get('[data-testid="continue"]').click({ force: true });
  });

  it("Submit form with no option click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocumentOptionNo,
    };
    cy.visit(voidThisProcessingStatementUrl, { qs: { ...testParams } });
    cy.get("#documentVoidNo").check();
    cy.get('[data-testid="continue"]').click({ force: true });
  });

  it("forbidden 403", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocument403,
    };
    cy.visit(voidThisProcessingStatementUrl, { qs: { ...testParams } });
    cy.get("#documentVoid").check();
    cy.get("form").submit();
    cy.url().should("include", "/forbidden");
  });
});
