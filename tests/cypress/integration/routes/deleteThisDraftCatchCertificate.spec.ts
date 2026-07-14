import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-catch-certificate/GBR-2022-CC-F0285BD8A";
const deleteThisDraftDocumentUrl = `${documentUrl}/delete-this-draft-catch-certificate`;

describe("Delete this draft catch certificate page", () => {
  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocumentBadRequest,
    };
    cy.visit(deleteThisDraftDocumentUrl, { qs: { ...testParams } });
    cy.get("form").submit();

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select yes if you want to delete the current document and start a new one$/).should(
      "be.visible"
    );
    cy.contains("p > span", /^Error:$/).should("be.visible");
  });
  it("Submit form with yes option on click of save and continue button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocumentOptionYes,
    };
    cy.visit(deleteThisDraftDocumentUrl, { qs: { ...testParams } });
    cy.get("#documentDelete").check();
    cy.get("form").submit();

    cy.get("body").should("exist");
  });
  it("Submit form with no option on click of save and continue button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocumentOptionNo,
    };
    cy.visit(deleteThisDraftDocumentUrl, { qs: { ...testParams } });
    cy.get("#documentDeleteNo").check();
    cy.get("form").submit();

    cy.get("body").should("exist");
  });
  it("forbidden 403", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocument403,
    };
    cy.visit(deleteThisDraftDocumentUrl, { qs: { ...testParams } });

    cy.get("#documentDeleteNo").check();
    cy.get("form").submit();
    cy.url().should("include", "/forbidden");
  });
  it("redirect to home 404", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DeleteThisDraftDocument404,
    };
    cy.visit(deleteThisDraftDocumentUrl, { qs: { ...testParams } });

    cy.get("#documentDelete").check();
    cy.get("form").submit();
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });
});
