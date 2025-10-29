import { type ITestParams, TestCaseId } from "~/types";

describe("DoYouHaveARoadTransportDocument", () => {
  const certificateUrl = "/create-storage-document/GBR-2021-SD-8EEB7E123";
  const doYouHaveARoadTransportDocumentUrl = `${certificateUrl}/do-you-have-a-road-transport-document`;

  it("should render page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocument,
      args: ["storageNotes"],
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/).should("be.visible");

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk`);

    cy.get(".govuk-fieldset__heading")
      .contains("Do you have a road transport document to go with this export?")
      .should("be.visible");
    cy.get(".govuk-hint")
      .contains(
        "This document is sometimes called a CMR note. It’s a contract between you and the haulier, and includes details about your export."
      )
      .should("be.visible");

    cy.get("form").should(($form) => {
      expect($form.find("input[type='radio']")).to.have.lengthOf(2);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();

      expect(radios).to.have.length(2);
      expect(labels).to.have.length(2);
      expect(labels).to.deep.eq(["Yes", "No"]);
    });
  });

  it("should redirect user to forbidden page when transport vehicle is not truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentPlane,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { failOnStatusCode: false, qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should redirect user to CC dashboard page when user clicks on Save as Draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocument,
      args: ["storageNotes"],
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-storage-document/storage-documents");
  });

  it("should redirect user to departure summary page when user selects and submits YES", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocument,
      args: ["storageNotes"],
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    // eslint-disable-next-line
    cy.wait(200);
    cy.get("#cmr").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/departure-product-summary");
  });

  it("should redirect user to truck transportation details page when user selects and submits NO", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentFalse, //setting cmr value to false so the next page does not redirect to progress page
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });

    cy.get("#separateCmrFalse").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-transportation-details-truck");
  });

  it("should redirect user to forbidden page when saveTruckCMR fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentSaveFailsWith403,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    cy.get("#cmr").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/forbidden");
  });

  it("should display error summary and inline error message when saving fails with an error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentSaveFailsWithError,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });
});
