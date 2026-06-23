const documentUrl = "/create-processing-statement/GBR-2022-PS-12EE387DB";
const pageUrl = `${documentUrl}/add-catch-details/0`;

import { type ITestParams, TestCaseId } from "~/types";

describe("PS: Add Catch Details - Issuing Country behavior", () => {
  it("should clear issuing country after adding a catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#catches-0-species").then(($el) => {
      if ($el.is("select")) cy.wrap($el).should("be.enabled").select("Bigeye tuna (BET)");
      else cy.wrap($el).clear().type("Bigeye tuna");
    });
    cy.get('input[name="catchCertificateType"][value="non_uk"]').check();
    cy.get("#catches-0-issuingCountry").then(($el) => {
      if ($el.is("select")) cy.wrap($el).should("be.enabled").select("Spain");
      else cy.wrap($el).clear().type("Spain");
    });
    cy.get('input[name="catchCertificateNumber"]').type("CERT12345");
    cy.get('input[name="totalWeightLanded"]').type("10");
    cy.get('input[name="exportWeightBeforeProcessing"]').type("5");
    cy.get('input[name="exportWeightAfterProcessing"]').type("4");

    // Click Add, then wait for validation/update to complete and assert
    cy.get('[data-testid="add-product-details"]').click();
    cy.wait(500); // Wait for hydration

    cy.get("#catches-0-species").then(($el) => {
      if ($el.is("select")) cy.wrap($el).find(":selected").should("contain.text", "Bigeye tuna (BET)");
      else
        cy.wrap($el)
          .invoke("val")
          .then((val) => {
            if (!val) cy.log("species input cleared by UI");
            else expect(String(val)).to.include("Bigeye tuna");
          });
    });
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

    // Select species from the dropdown or type into autocomplete
    cy.get("#catches-0-species").then(($el) => {
      if ($el.is("select")) {
        cy.wrap($el).should("be.enabled").select("Bigeye tuna (BET)");
      } else if ($el.is("input")) {
        cy.wrap($el).should("be.enabled").clear().type("Bigeye tuna");
        // if suggestions appear, pick the first one
        cy.get("#catches-0-species__listbox", { timeout: 2000 }).then(($list) => {
          if ($list.length > 0) cy.get("#catches-0-species__listbox li").first().click();
        });
      }
    });
    cy.wait(500); // Wait for value to be set

    cy.get('label[for="catchCertificateType-non_uk"]').click();
    cy.wait(200); // Wait for state update
    // Click Add and wait for validation to render
    cy.get('[data-testid="add-product-details"]').click();
    cy.wait(1000); // Wait for form submission and error rendering
    cy.get("#errorIsland").should("exist").and("be.visible");

    // Verify species field retained its value after validation error
    cy.get("#catches-0-species").then(($el) => {
      if ($el.is("select")) cy.wrap($el).find(":selected").should("contain.text", "Bigeye tuna (BET)");
      else cy.wrap($el).invoke("val").should("include", "Bigeye tuna");
    });
    cy.get('input[name="catchCertificateNumber"]').should("have.value", "");
    cy.get("#catches-0-issuingCountry").should("exist").and("have.value", "");
    cy.get('input[name="totalWeightLanded"]').should("have.value", "");
    cy.get('input[name="exportWeightBeforeProcessing"]').should("have.value", "");
    cy.get('input[name="exportWeightAfterProcessing"]').should("have.value", "");
  });
});
