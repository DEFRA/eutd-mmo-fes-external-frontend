import { type ITestParams, TestCaseId } from "~/types";
const documentUrl1 = "/create-processing-statement/GBR-2022-PS-A2BC627FE";
const whatExportDestinationUrl = `${documentUrl1}/what-export-destination`;

describe("what export destination page", () => {
  it("it shoud render the page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDestinationDraft,
    };
    cy.visit(whatExportDestinationUrl, { qs: { ...testParams } });
    cy.get(".govuk-heading-xl").contains("What is the export destination?");
    cy.contains("a", /^Back$/).should("be.visible");
  });

  it("should redirect to the forbidden page if the user is unauthorised to access a document number", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDestination403,
    };
    cy.visit(whatExportDestinationUrl, { qs: { ...testParams } });
    cy.get('[data-testid="save-and-continue"]').click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the progess page if the user click on draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDestinationDraft,
    };
    cy.visit(whatExportDestinationUrl, { qs: { ...testParams } });

    cy.get('input[type="text"]').eq(0).type("India");
    cy.get(".autocomplete__option").eq(0).click({ force: true });

    cy.get('[data-testid="save-draft-button"]').click({ force: true });
  });

  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDestinationBadRequest,
    };
    cy.visit(whatExportDestinationUrl, {
      qs: { ...testParams },
    });
    cy.get('[data-testid="save-and-continue"]').click({ force: true });
    cy.get(".govuk-list > li > a").contains("Select a valid destination country");
    cy.get(".govuk-error-message").contains("Select a valid destination country");
  });
  it("should redirect to the forbidden page if there is an error as page is rendered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDestinationFailsToRenderWith403,
    };
    cy.visit(whatExportDestinationUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
