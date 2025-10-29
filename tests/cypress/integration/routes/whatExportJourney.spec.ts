import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-catch-certificate/GBR-2022-CC-A2BC627FE";
const whatExportJourneyUrl = `${documentUrl}/what-export-journey`;
describe("what export journey page for Direct Landing", () => {
  it("it shoud render the page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyDirectLanding,
    };
    cy.visit(whatExportJourneyUrl, {
      qs: { ...testParams },
    });
    cy.get("form");
    cy.get("form").should(($form) => {
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObject = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();
      const text = textObject.get();
      expect(radios).to.have.length(4);
      expect(labels).to.have.length(5);
      expect(text).to.have.length(1);
      expect(labels).to.deep.eq([
        "United Kingdom",
        "Guernsey",
        "Isle of Man",
        "Jersey",
        "Select the destination country",
      ]);
      expect($form.find("input[type='radio']")).to.have.lengthOf(4);
    });
    cy.get(".govuk-heading-xl").contains("What journey does the export take?");
    cy.get(".govuk-fieldset__legend").contains("Select the departure country");
    cy.get("#departure-country-hint").contains(
      "This is also known as the country of exportation, or vessel flag state (for direct landings)"
    );
    cy.contains("a", /^Back$/).should("be.visible");
  });

  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDirectLandingJourneyBadRequest,
    };
    cy.visit(whatExportJourneyUrl, {
      qs: { ...testParams },
    });
    cy.get('[data-testid="save-and-continue"]').click({ force: true });
    cy.get(".govuk-list > li > a").contains("Select a valid destination country");
    cy.get(".govuk-error-message").contains("Select a valid destination country");
  });
  it("should redirect to the forbidden page if there is an error as page is rendered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDirectLandingJourneyFailsToRenderWith403,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the forbidden page if the user is unauthorised to access a document number", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDirectLandingJourney403,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get('[data-testid="save-and-continue"]').click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the progess page if the user click on draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyDirectLandingDraft,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get("#exportedFromGU").check();
    cy.get('[data-testid="save-draft-button"]').click({ force: true });
  });

  it("should redirect to the landings-entry if the if landing entry is null", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyDirectLandingNull,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
  });

  it("should redirect to the progess page if the user click on save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDirectLandingJourneySaveAndContinue,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get("#exportedFromIOM").check();
    cy.get("#exportDestination").invoke("val", "Pakistan");
    cy.get('[data-testid="save-and-continue"]').click({ force: true });
    cy.url().should("include", "/progress");
  });
});

describe("what export journey page for Manual Entry", () => {
  it("it shoud render the page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntry,
    };
    cy.visit(whatExportJourneyUrl, {
      qs: { ...testParams },
    });
    cy.get("form");
    cy.get("form").should(($form) => {
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObject = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();
      const text = textObject.get();
      expect(radios).to.have.length(4);
      expect(labels).to.have.length(5);
      expect(text).to.have.length(1);
      expect(labels).to.deep.eq([
        "United Kingdom",
        "Guernsey",
        "Isle of Man",
        "Jersey",
        "Select the destination country",
      ]);
      expect($form.find("input[type='radio']")).to.have.lengthOf(4);
    });
    cy.get(".govuk-heading-xl").contains("What journey does the export take?");
    cy.get(".govuk-fieldset__legend").contains("Select the departure country");
    cy.get("#departure-country-hint").contains(
      "This is also known as the country of exportation, or vessel flag state (for direct landings)"
    );
    cy.contains("a", /^Back$/).should("be.visible");
  });

  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportManualEntryJourneyBadRequest,
    };
    cy.visit(whatExportJourneyUrl, {
      qs: { ...testParams },
    });
    cy.get('[data-testid="save-and-continue"]').click({ force: true });
    cy.get(".govuk-list > li > a").contains("Select a valid destination country");
    cy.get(".govuk-error-message").contains("Select a valid destination country");
  });
  it("should redirect to the forbidden page if there is an error as page is rendered m", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportManualEntryJourneyFailsToRenderWith403,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
  it("should redirect to the forbidden page if the user is unauthorised to access a document number", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportManualEntryJourney403,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get('[data-testid="save-and-continue"]').click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the progess page if the user click on draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntryDraft,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get("#exportedFromGU").check();
    cy.get('[data-testid="save-draft-button"]').click({ force: true });
  });

  it("should redirect to the landings-entry if the if landing entry is null", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntryNull,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
  });

  it("should redirect to the how-does-the-export-leave-the-uk page if the user click on save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportManualEntryJourneySaveAndContinue,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get("#exportedFromIOM").check();
    cy.get("#exportDestination").invoke("val", "Pakistan");
    cy.get('[data-testid="save-and-continue"]').click({ force: true });
    cy.url().should("include", "/how-does-the-export-leave-the-uk");
  });
});
