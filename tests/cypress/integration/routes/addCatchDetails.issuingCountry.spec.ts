const documentUrl = "/create-processing-statement/GBR-2022-PS-12EE387DB";
const pageUrl = `${documentUrl}/add-catch-details/0`;

import { type ITestParams, TestCaseId } from "~/types";

describe("PS: Add Catch Details - Issuing Country behavior", () => {
  it("should clear issuing country after adding a catch", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#catches-0-species").should("be.enabled").select("Bigeye tuna (BET)");
    cy.get('input[name="catchCertificateType"][value="non_uk"]').check();
    cy.get("#catches-0-issuingCountry").should("be.enabled").select("Spain");
    cy.get('input[name="catchCertificateNumber"]').type("CERT12345");
    cy.get('input[name="totalWeightLanded"]').type("10");
    cy.get('input[name="exportWeightBeforeProcessing"]').type("5");
    cy.get('input[name="exportWeightAfterProcessing"]').type("4");

    // Click Add, then wait for validation/update to complete and assert
    cy.get('[data-testid="add-product-details"]').click();
    cy.wait(500); // Wait for hydration

    cy.get("#catches-0-species").should("exist").find(":selected").should("contain.text", "Bigeye tuna (BET)");
    cy.get('input[name="catchCertificateType"][value="non_uk"]').check(); // trigger visibility
    cy.get('input[name="catchCertificateNumber"]').should("have.value", "");
    cy.get("#catches-0-issuingCountry").should("have.value", "");
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
    cy.wait(1000); // Wait for page to fully load

    // Select species from the dropdown
    cy.get("#catches-0-species").should("be.enabled").select("Bigeye tuna (BET)");
    cy.wait(500); // Wait for value to be set

    cy.get('label[for="catchCertificateType-non_uk"]').click();
    cy.wait(200); // Wait for state update
    // Click Add and wait for validation to render
    cy.get('[data-testid="add-product-details"]').click();
    cy.wait(1000); // Wait for form submission and error rendering
    cy.get("#errorIsland").should("exist").and("be.visible");

    // Verify species field retained its value after validation error
    cy.get("#catches-0-species").should("exist").find(":selected").should("contain.text", "Bigeye tuna (BET)");
    cy.get('input[name="catchCertificateNumber"]').should("have.value", "");
    cy.get("#catches-0-issuingCountry").should("exist").and("have.value", "");
    cy.get('input[name="totalWeightLanded"]').should("have.value", "");
    cy.get('input[name="exportWeightBeforeProcessing"]').should("have.value", "");
    cy.get('input[name="exportWeightAfterProcessing"]').should("have.value", "");
  });
});
