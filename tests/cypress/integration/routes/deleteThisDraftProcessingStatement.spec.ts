import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-processing-statement/GBR-2022-PS-F0285BD8A";
const deleteThisProcessingStatementUrl = `${documentUrl}/delete-this-draft-processing-statement`;

describe("Delete this draft processing statement page", () => {
  it("should render the correct h1 title", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocumentBadRequest,
    };
    cy.visit(deleteThisProcessingStatementUrl, { qs: { ...testParams } });

    cy.contains("h1", "Are you sure you want to delete this processing statement?").should("be.visible");
  });

  it("should display an error summary and error validation at the form input when there is a bad request", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocumentBadRequest,
    };
    cy.visit(deleteThisProcessingStatementUrl, { qs: { ...testParams } });
    cy.get("form").submit();

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select yes if you want to delete the current document and start a new one$/).should(
      "be.visible"
    );
    cy.contains("p > span", /^Error:$/).should("be.visible");
  });

  it("Submit form with yes option on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocumentOptionYes,
    };
    cy.visit(deleteThisProcessingStatementUrl, { qs: { ...testParams } });
    cy.get("#documentDelete").check();
    cy.get("form").submit();
  });

  it("Submit form with no option on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocumentOptionNo,
    };
    cy.visit(deleteThisProcessingStatementUrl, { qs: { ...testParams } });
    cy.get("#documentDeleteNo").check();
    cy.get("form").submit();
  });

  it("forbidden 403", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocument403,
    };
    cy.visit(deleteThisProcessingStatementUrl, { qs: { ...testParams } });

    cy.get("#documentDeleteNo").check();
    cy.get("form").submit();
    cy.url().should("include", "/forbidden");
  });

  it("redirect to home 404", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocument404,
    };
    cy.visit(deleteThisProcessingStatementUrl, { qs: { ...testParams } });

    cy.get("#documentDelete").check();
    cy.get("form").submit();
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  it("should 404 if documentNumber is missing", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocumentNoRecord,
    };
    cy.visit("/create-processing-statement/delete-this-draft-processing-statement", { qs: { ...testParams } });

    cy.contains("h1", /^Page not found$/).should("be.visible");
  });
});
