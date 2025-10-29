import { type ITestParams, TestCaseId } from "~/types";
const psPageUrl = "create-processing-statement/GBR-2022-PS-F71D98A30/copy-void-confirmation";

function copyvoidpage(testParams) {
  cy.visit("create-processing-statement/GBR-2022-PS-F71D98A30/copy-this-processing-statement", {
    qs: { ...testParams },
  });
  cy.get("#voidDocumentConfirm").invoke("prop", "checked", true).trigger("change");
  cy.get("#voidDocumentConfirm").invoke("prop", "checked").should("eq", true);
  cy.get("#copyDocumentAcknowledged").check();
  cy.get("form").submit();
}

describe("Copy void confirmation page", () => {
  it("should redirect to copy-void-confirmation page when voidDocumentConfirm option is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyAllowed,
      disableScripts: true,
    };
    copyvoidpage(testParams);
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-processing-statement/GBR-2022-PS-F71D98A30/copy-this-processing-statement");
    cy.contains("button", "Cancel").should("be.visible");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='radio']")).to.have.lengthOf(2);
      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();
      expect(radios).to.have.length(2);
      expect(labels).to.have.length(2);
      expect(labels).to.deep.eq([
        "Yes, create a copy of the processing statement then void the original",
        "No, create a copy of the processing statement only",
      ]);
    });
    cy.get("[data-testid=cancel]").click({ force: true });
    cy.url().should("include", "/processing-statements");
  });

  it("Should display errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyVoidSave,
      disableScripts: true,
    };
    copyvoidpage(testParams);
    cy.contains("h1", "Are you sure you want to void the original processing statement?");
    cy.get("[data-testid=continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select an option to continue$/).should("be.visible");
  });

  it("Submit form with no option on click of continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyAllData,
      disableScripts: true,
    };
    copyvoidpage(testParams);
    cy.get("#documentVoidOriginalNo").click({ force: true });
    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", "/progress");
  });
});

describe("Copy this processing statement address page: Disallowed", () => {
  it("should redirect to the forbidden page if copying is not permitted", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyDisallowed,
    };

    cy.visit(psPageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });
});
