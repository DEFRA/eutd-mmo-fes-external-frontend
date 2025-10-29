import { type ITestParams, TestCaseId } from "~/types";

describe("JourneySelection", () => {
  it("displays all possible journey options in the expected order", () => {
    cy.visit("/");

    cy.get("form").should(($form) => {
      expect($form.find("input[type='radio']")).to.have.lengthOf(3);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();

      expect(radios).to.have.length(3);
      expect(labels).to.have.length(3);
      expect(labels).to.deep.eq([
        "Create a UK catch certificate (Including links to direct landing documents)",
        "Create a UK processing statement",
        "Create a UK storage document",
      ]);
    });
  });

  it("should be able to choose the catchCertificate journey", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StartJourney,
      args: ["catchCertificate"],
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.get("#createCatchCertificate").check();
    cy.get("form").submit();
    cy.url().should("include", "create-catch-certificate");
  });

  it("should be able to choose the processingStatement journey", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StartJourney,
      args: ["processingStatement"],
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.get("#createProcessingStatement").check();
    cy.get("form").submit();
    cy.url().should("include", "create-processing-statement");
  });

  it("should be able to choose the storageNotes journey", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StartJourney,
      args: ["storageNotes"],
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.get("#createStorageDocument").check();
    cy.get("form").submit();
    cy.url().should("include", "create-storage-document");
  });

  it("should display an error when there is a server error with an array of error messages", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StartJourneyFailed,
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.get("#createStorageDocument").check();
    cy.get("form").submit();

    cy.url().should((url) => expect(url.endsWith("?index")));
  });

  it("should display an error when there is a server error but no array of error messages", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StartJourneyFailedNoErrors,
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.get("#createStorageDocument").check();
    cy.get("form").submit();

    cy.url().should((url) => expect(url.endsWith("?index")));
  });
});
