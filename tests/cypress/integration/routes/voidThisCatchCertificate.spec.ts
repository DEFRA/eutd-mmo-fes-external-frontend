import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-catch-certificate/GBR-2022-CC-F0285BD8A";
const voidThisCatchCertificateUrl = `${documentUrl}/void-this-catch-certificate`;

describe("void this draft catch certificate page", () => {
  it("should display a correctly typed h1", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocumentOptionYes,
    };
    cy.visit(voidThisCatchCertificateUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "Are you sure you want to void this catch certificate? - Create a UK catch certificate - GOV.UK"
    );
    cy.contains("h1", "Are you sure you want to void this catch certificate?").should("be.visible");
  });

  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocumentBadRequest,
    };
    cy.visit(voidThisCatchCertificateUrl, { qs: { ...testParams } });
    cy.get('[data-testid="continue"]').click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");

    cy.get(".govuk-list > li > a").contains("Select yes if you want to void the current document").should("be.visible");
    cy.get(".govuk-error-message").contains("Select yes if you want to void the current document").should("be.visible");
  });

  it("Submit form with yes option click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocumentOptionYes,
    };
    cy.visit(voidThisCatchCertificateUrl, { qs: { ...testParams } });
    cy.get("#documentVoid").check();
    cy.get('[data-testid="continue"]').click({ force: true });
  });

  it("Submit form with no option click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocumentOptionNo,
    };
    cy.visit(voidThisCatchCertificateUrl, { qs: { ...testParams } });
    cy.get("#documentVoidNo").check();
    cy.get('[data-testid="continue"]').click({ force: true });
  });

  it("forbidden 403", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VoidThisDocument403,
    };
    cy.visit(voidThisCatchCertificateUrl, { qs: { ...testParams } });
    cy.get("#documentVoid").check();
    cy.get("form").submit();
    cy.url().should("include", "/forbidden");
  });
});
