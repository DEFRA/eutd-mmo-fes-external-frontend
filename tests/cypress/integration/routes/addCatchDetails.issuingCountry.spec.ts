import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-processing-statement/GBR-2022-PS-0D12ABA0A";
const productId = "GBR-2025-PS-FDC3D66E1-1760436601";
const pageUrl = `${documentUrl}/add-catch-details/${productId}?pageNo=1`;

// Hydration-complete gate: root.tsx useEffect focuses this span after hydrateRoot() settles
const waitForHydration = () => cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");

// Types then clicks the matching listbox option so the menu collapses before any later interaction
const selectAutocompleteOption = (inputId: string, value: string) => {
  cy.get(`#${inputId}`, { timeout: 8000 }).should("be.visible").and("be.enabled").clear().type(value);
  cy.get(`#${inputId}__listbox`).contains("li", value).click();
  cy.get(`#${inputId}`).should("have.value", value).and("have.attr", "aria-expanded", "false");
};

const setSpecies = () => selectAutocompleteOption("catches-0-species", "Bigeye tuna (BET)");
const setIssuingCountry = () => selectAutocompleteOption("catches-0-issuingCountry", "Spain");

const enableIssuingCountry = () => {
  cy.get('label[for="catchCertificateType-non_uk"]', { timeout: 8000 }).should("be.visible").click();
  cy.get('[data-testid="issuing-country-wrapper"]').should("not.have.class", "app-hide-when-js");
};

describe("PS: Add Catch Details - Issuing Country behavior", () => {
  it("should clear issuing country after adding a catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    waitForHydration();

    setSpecies();
    enableIssuingCountry();
    setIssuingCountry();

    cy.get('input[name="catchCertificateNumber"]').type("CERT12345");
    cy.get('input[name="totalWeightLanded"]').type("10");
    cy.get('input[name="exportWeightBeforeProcessing"]').type("5");
    cy.get('input[name="exportWeightAfterProcessing"]').type("4");

    cy.get('[data-testid="add-product-details"]').should("be.visible").click();

    cy.get('input[name="catchCertificateNumber"]', { timeout: 10000 }).should("have.value", "");
    cy.get("#catches-0-issuingCountry").should("have.value", "");
    cy.get('input[name="totalWeightLanded"]').should("have.value", "");
    cy.get('input[name="exportWeightBeforeProcessing"]').should("have.value", "");
    cy.get('input[name="exportWeightAfterProcessing"]').should("have.value", "");
  });

  it("should collapse the issuing country dropdown after selecting a country", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    waitForHydration();

    setSpecies();
    enableIssuingCountry();
    setIssuingCountry();

    cy.get("#catches-0-issuingCountry").should("have.value", "Spain").and("have.attr", "aria-expanded", "false");
  });

  it("should clear issuing country when user removes it and clicks Add (issue reproduction)", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsContinueCatchError,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    waitForHydration();

    setSpecies();
    enableIssuingCountry();
    setIssuingCountry();

    cy.get("#catches-0-issuingCountry").should("be.enabled").focus().type("{selectall}{backspace}");
    cy.get("#catches-0-issuingCountry").should("have.value", "");

    cy.get('[data-testid="add-product-details"]').should("be.visible").click();

    cy.get(".govuk-error-summary", { timeout: 10000 }).should("be.visible");
    cy.get("#catches-0-issuingCountry").should("be.visible").and("have.value", "");
  });
});
