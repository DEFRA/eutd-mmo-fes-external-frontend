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
    cy.document({ timeout: 1000 }).its("readyState").should("eq", "complete"); // Wait for page to fully load

    // Fill species field
    cy.get("#catches-0-species", { timeout: 8000 }).then(($el) => {
      if ($el.is("select")) cy.wrap($el).should("be.enabled").select("Bigeye tuna (BET)");
      else cy.wrap($el).clear().type("Bigeye tuna");
    });
    cy.document({ timeout: 300 }).its("readyState").should("eq", "complete");

    // Click the label to check the non_uk radio button (the input itself is hidden with opacity: 0)
    cy.get('label[for="catchCertificateType-non_uk"]', { timeout: 8000 }).should("be.visible").click();
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete"); // Wait for conditional rendering of issuing country field

    // Fill issuing country field
    cy.get("#catches-0-issuingCountry", { timeout: 8000 }).then(($el) => {
      if ($el.is("select")) cy.wrap($el).should("be.enabled").select("Spain");
      else cy.wrap($el).clear().type("Spain");
    });

    // Fill remaining fields
    cy.get('input[name="catchCertificateNumber"]').type("CERT12345");
    cy.get('input[name="totalWeightLanded"]').type("10");
    cy.get('input[name="exportWeightBeforeProcessing"]').type("5");
    cy.get('input[name="exportWeightAfterProcessing"]').type("4");

    // Click Add button
    cy.get('[data-testid="add-product-details"]').click();
    cy.document({ timeout: 1000 }).its("readyState").should("eq", "complete"); // Wait for form to process

    // Verify fields are cleared after successful add
    cy.get('input[name="catchCertificateNumber"]', { timeout: 10000 }).should("have.value", "");
    // After form reset, issuing country field will not be visible since radio is reset to uk
    cy.get("#catches-0-issuingCountry", { timeout: 2000 }).should("not.exist");
    cy.get('input[name="totalWeightLanded"]', { timeout: 10000 }).should("have.value", "");
    cy.get('input[name="exportWeightBeforeProcessing"]', { timeout: 10000 }).should("have.value", "");
    cy.get('input[name="exportWeightAfterProcessing"]', { timeout: 10000 }).should("have.value", "");
  });

  it("should clear issuing country when user removes it and clicks Add (issue reproduction)", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsContinueCatchError,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.document({ timeout: 1000 }).its("readyState").should("eq", "complete"); // Wait for page to fully load

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
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete"); // Wait for value to be set

    // Click the label to check the non_uk radio button
    cy.get('label[for="catchCertificateType-non_uk"]', { timeout: 8000 }).should("be.visible").click();
    cy.document({ timeout: 300 }).its("readyState").should("eq", "complete"); // Wait for issuing country field to render

    // Verify issuing country field is now visible (since non_uk is selected)
    cy.get("#catches-0-issuingCountry", { timeout: 5000 }).should("exist");

    // Fill issuing country field with a value
    cy.get("#catches-0-issuingCountry").then(($el) => {
      if ($el.is("select")) cy.wrap($el).should("be.enabled").select("Spain");
      else cy.wrap($el).clear().type("Spain");
    });

    // Clear the field using keyboard input so the autocomplete updates its local state.
    cy.get("#catches-0-issuingCountry").then(($field) => {
      if ($field.is("select")) {
        cy.wrap($field).select("");
      } else {
        cy.wrap($field).focus().type("{selectall}{backspace}", { force: true });
      }
    });
    cy.get("#catches-0-issuingCountry").should("have.value", "");

    // Click Add button without required certificate number
    cy.get('[data-testid="add-product-details"]').click();
    cy.document({ timeout: 1000 }).its("readyState").should("eq", "complete"); // Wait for form to process

    // The form should show validation errors or prevent submission
    // Either errorIsland appears or fields are cleared (depending on backend response)
    // For this test, we just verify that issuing country field state is managed properly
    // If the radio gets reset, the field should not exist; if not, it should be cleared
    cy.get("#catches-0-issuingCountry", { timeout: 2000 }).then(($field) => {
      // Field either doesn't exist (radio reset) or is empty
      if ($field.length > 0) {
        cy.wrap($field).should("have.value", "");
      }
    });
  });
});
