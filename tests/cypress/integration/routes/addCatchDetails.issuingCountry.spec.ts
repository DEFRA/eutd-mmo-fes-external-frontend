const documentUrl = "/create-processing-statement/GBR-2022-PS-12EE387DB";
const pageUrl = `${documentUrl}/add-catch-details/0`;

import { type ITestParams, TestCaseId } from "~/types";

describe("PS: Add Catch Details - Issuing Country behavior", () => {
  it.skip("should clear issuing country after adding a catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="species"]').first().type("Tuna{enter}");
    cy.get('input[name="catchCertificateType"][value="non_uk"]').check();
    cy.get('[data-testid="issuing-country-0"]').type("Spain{enter}");
    cy.get('input[name="catchCertificateNumber"]').type("CERT12345");
    cy.get('input[name="totalWeightLanded"]').type("10");
    cy.get('input[name="exportWeightBeforeProcessing"]').type("5");
    cy.get('input[name="exportWeightAfterProcessing"]').type("4");

    // Click Add, then wait for validation/update to complete and assert
    cy.get('[data-testid="add-product-details"]').click();
    cy.wait(500); // Wait for hydration

    cy.get('input[name="species"]').should("exist").and("have.value", "Bigeye tuna (BET)");
    cy.get('input[name="catchCertificateType"][value="non_uk"]').check(); // trigger visibility
    cy.get('input[name="catchCertificateNumber"]').should("have.value", "");
    cy.get('[data-testid="issuing-country-0"]').should("have.value", "");
    cy.get('input[name="catchCertificateNumber"]').should("have.value", "");
    cy.get('input[name="totalWeightLanded"]').should("have.value", "");
    cy.get('input[name="exportWeightBeforeProcessing"]').should("have.value", "");
    cy.get('input[name="exportWeightAfterProcessing"]').should("have.value", "");
  });

  it("should clear issuing country when user removes it and clicks Add (issue reproduction)", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsContinueCatchError,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="species"]').first().type("Tuna{enter}");
    cy.get('input[name="catchCertificateType"][value="non_uk"]').check();
    // Click Add and wait for validation to render
    cy.get('[data-testid="add-product-details"]').click();
    cy.wait(500); // Wait for hydration
    cy.wait(200); // Allow React to process the state change
    cy.get("#errorIsland").should("exist").and("be.visible");

    // select 'No' to trigger visibility of issuing country input
    cy.get('input[name="catchCertificateType"][value="non_uk"]').check();

    cy.get('input[name="species"]').should("exist").and("have.value", "Bigeye tuna (BET)");
    cy.get('input[name="catchCertificateNumber"]').should("have.value", "");
    cy.get('input[name="issuingCountry"]').should("have.value", "");
    cy.get('input[name="catchCertificateNumber"]').should("have.value", "");
    cy.get('input[name="totalWeightLanded"]').should("have.value", "");
    cy.get('input[name="exportWeightBeforeProcessing"]').should("have.value", "");
    cy.get('input[name="exportWeightAfterProcessing"]').should("have.value", "");
  });
});
