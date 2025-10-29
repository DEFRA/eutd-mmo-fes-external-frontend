import { type ITestParams, TestCaseId } from "~/types";

describe("DoYouHaveARoadTransportDocument", () => {
  const documentNumber = "GBR-2022-CC-3FE1169D1";
  const certificateUrl = `/create-catch-certificate/${documentNumber}`;
  const doYouHaveARoadTransportDocumentUrl = `${certificateUrl}/do-you-have-a-road-transport-document/0`;

  it("should render page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocument,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "Do you have a road transport document to go with this export? - Create a UK catch certificate - GOV.UK"
    );
    cy.contains("a", /^Back$/).should("be.visible");

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk/0`);

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
      expect($form.find("input[name='csrf']")).to.have.lengthOf(1);
    });
    cy.get("form input[type=hidden][name=csrf]")
      .should("have.attr", "value")
      .should("be.a", "string")
      .and("have.length", 136);
  });

  it("should redirect user to additional transport types page when user submits yes", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocument,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    // need to wait for UI hydration otherwise test can fail intermittently
    // .should("be.visible") does not seem to do the job
    cy.wait(250);

    cy.get('input[type="radio"][value="true"]').check();
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/do-you-have-additional-transport-types");
  });

  it("should redirect user to transportation details page when user submits no", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentFalse,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    // need to wait for UI hydration otherwise test can fail intermittently
    // .should("be.visible") does not seem to do the job
    cy.wait(250);

    cy.get('input[type="radio"][value="false"]').check();
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-transportation-details-truck/0");
  });

  it("should redirect user to transportation details page when user submits no and csrf does not match session", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentFalse,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    // need to wait for UI hydration otherwise test can fail intermittently
    // .should("be.visible") does not seem to do the job
    cy.wait(250);

    cy.get("form input[type=hidden][name=csrf]").should("exist").invoke("val", "abc123");
    cy.get('input[type="radio"][value="false"]').check();
    cy.get("[data-testid=save-and-continue").click({ force: true });
  });

  it("should redirect user to certificate summary page when saved as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocument,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    // need to wait for UI hydration otherwise test can fail intermittently
    // .should("be.visible") does not seem to do the job
    cy.wait(250);

    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should redirect user to landings entry page when no landings type has been selected previously", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentNoLandingsType,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });

    cy.url().should("include", "/landings-entry");
  });

  it("should display error summary and inline error message when user submits nothing", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentSaveFailsWithError,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });

  it("should redirect user to forbidden page when landings type has been selected as direct landing", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentDirectLanding,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { failOnStatusCode: false, qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should redirect user to forbidden page when transport vehicle is not truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocumentPlane,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl, { failOnStatusCode: false, qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should redirect user to how-does-the-export-leave-the-uk page when no transport ID is present in the URL", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveARoadTransportDocument,
    };

    cy.visit(doYouHaveARoadTransportDocumentUrl.replace("/0", ""), { failOnStatusCode: false, qs: { ...testParams } });

    cy.url().should("include", "/how-does-the-export-leave-the-uk");
  });
});
