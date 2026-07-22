const documentUrl = "/create-processing-statement/GBR-2022-PS-12EE387DB";
const pageUrl = `${documentUrl}/add-catch-details/0`;

import { type ITestParams, TestCaseId } from "~/types";

const waitForPage = () => cy.document({ timeout: 1000 }).its("readyState").should("eq", "complete");

const setSpecies = (value: string) => {
  cy.get("#catches-0-species", { timeout: 8000 }).then(($el) => {
    if ($el.is("select")) {
      cy.wrap($el).should("be.enabled").select(value);
      return;
    }

    cy.wrap($el).clear().type(value);
  });
};

const enableIssuingCountry = () => {
  cy.get('label[for="catchCertificateType-non_uk"]', { timeout: 8000 }).should("be.visible").click();
  waitForPage();
};

const setIssuingCountry = (value: string) => {
  cy.get("#catches-0-issuingCountry", { timeout: 8000 }).then(($el) => {
    if ($el.is("select")) {
      cy.get("#catches-0-issuingCountry option", { timeout: 8000 }).then(($options) => {
        const matched = [...$options].find((option) => {
          const opt = option as HTMLOptionElement;
          return opt.value === value || opt.text.trim() === value;
        }) as HTMLOptionElement | undefined;

        expect(!!matched, `issuing country option ${value} exists`).to.equal(true);
        cy.get("#catches-0-issuingCountry").should("be.enabled").invoke("val", matched!.value).trigger("change");
      });
      return;
    }

    cy.wrap($el).clear().type(value);
  });
};

describe("PS: Add Catch Details - Issuing Country behavior", () => {
  it("should clear issuing country after adding a catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    waitForPage();

    setSpecies("Bigeye tuna (BET)");
    waitForPage();

    enableIssuingCountry();

    setIssuingCountry("Spain");

    cy.get('input[name="catchCertificateNumber"]').type("CERT12345");
    cy.get('input[name="totalWeightLanded"]').type("10");
    cy.get('input[name="exportWeightBeforeProcessing"]').type("5");
    cy.get('input[name="exportWeightAfterProcessing"]').type("4");

    cy.get('[data-testid="add-product-details"]').click();
    waitForPage();

    cy.get('input[name="catchCertificateNumber"]', { timeout: 10000 }).should("have.value", "");
    cy.get("#catches-0-issuingCountry", { timeout: 2000 }).should("not.exist");
    cy.get('input[name="totalWeightLanded"]', { timeout: 10000 }).should("have.value", "");
    cy.get('input[name="exportWeightBeforeProcessing"]', { timeout: 10000 }).should("have.value", "");
    cy.get('input[name="exportWeightAfterProcessing"]', { timeout: 10000 }).should("have.value", "");
  });

  it("should clear issuing country when user removes it and clicks Add (issue reproduction)", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsContinueCatchError,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    waitForPage();

    setSpecies("Bigeye tuna (BET)");
    waitForPage();

    enableIssuingCountry();

    cy.get("#catches-0-issuingCountry", { timeout: 5000 }).should("exist");

    setIssuingCountry("Spain");

    cy.get("#catches-0-issuingCountry").then(($field) => {
      if ($field.is("select")) {
        cy.get("#catches-0-issuingCountry").should("be.enabled").invoke("val", "").trigger("change");
      } else {
        cy.wrap($field).should("be.enabled").focus().type("{selectall}{backspace}");
      }
    });
    cy.get("#catches-0-issuingCountry").should("have.value", "");

    cy.get('[data-testid="add-product-details"]').click();
    waitForPage();

    cy.get("#catches-0-issuingCountry", { timeout: 2000 }).then(($field) => {
      if ($field.length > 0) {
        cy.wrap($field).should("have.value", "");
      }
    });
  });
});
