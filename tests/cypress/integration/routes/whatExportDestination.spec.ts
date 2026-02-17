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

    cy.get('input[id="exportDestination"]').type("France");
    cy.get(".autocomplete__option").first().click();
    cy.get('[data-testid="save-draft-button"]').click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
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

  it("should save valid fields and redirect to dashboard when saving as draft with invalid pointOfDestination", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSWhatExportDestinationSaveAsDraftWithInvalidPointOfDestination,
    };
    cy.visit(whatExportDestinationUrl, { qs: { ...testParams } });

    // Fill in valid country
    cy.get('input[id="exportDestination"]').type("France");
    cy.get(".autocomplete__option").first().click();

    // Fill in invalid pointOfDestination (>101 chars)
    const longString =
      "q7N2vX9wL4kP1mR8zB3tY5jS0hG6fD9cA2xB7nV1mQ8wL4kP0zR5tY2jS9hG3fD6cA1xB8nV4mQ0wL7kP2zR5tY8jS3hG1fD4cA9dfsdfsdfsdf7644456";
    cy.get("#pointOfDestination").type(longString, { force: true });

    // Click save as draft
    cy.get('[data-testid="save-draft-button"]').click({ force: true });

    // Should redirect to PS dashboard without errors
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});
