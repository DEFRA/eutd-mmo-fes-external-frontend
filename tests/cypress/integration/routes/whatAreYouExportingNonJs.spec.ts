import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
const productsUrl = `${documentUrl}/what-are-you-exporting`;

describe("Errors on click of add product button from empty favourites", () => {
  it("should show errors click of add product button from favourites", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnSaveFromEmptyFavourites,
      disableScripts: true,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("[data-tab-id='favouritesTab']").click();
    cy.get('select[name="favourite"]').select("Aesop shrimp (AES) Fresh,Whole, 03063590");
    cy.get("[data-testid='add-product']").eq(1).click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a product favourite from the list$/).should("be.visible");
  });
});

describe("What are you exporting page: when JavaScript is disabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
      disableScripts: true,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
  });

  it("check and click on add product from favourites", () => {
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });
    cy.get('select[name="favourite"]').select("Aesop shrimp (AES) Fresh,Whole, 03063590");
    cy.get("[data-testid='add-product']").eq(1).click({ force: true });
  });

  it("should render add species, state and presentation buttons when JavaScript is disabled", () => {
    cy.contains("[data-testid='add-species']", "Add species");
    cy.contains("[data-testid='add-state']", "Add state");
    cy.contains("[data-testid='add-presentation']", "Add presentation");
  });

  it("should render add products and add products from favourites forms on the same page", () => {
    cy.get("#productsTab").should("be.visible");
    cy.get("#add-products").should("be.visible");

    cy.get("#favouritesTab").should("be.visible");
    cy.get("#add-from-favourites").should("be.visible");
  });

  it("should click and edit and check if the data is populated in input fields", () => {
    cy.get("[data-testid*='edit-button'").eq(0).click({ force: true });
    cy.get("#species").contains("Albacore (ALB)");
    cy.get("#state").contains("Fresh");
    cy.get("#presentation").contains("Whole");
    cy.get("#commodity_code").contains("03024400");
    cy.get("[data-testid='add-product']").contains("Update product");
  });

  it("should click and edit and click on add state button with value", () => {
    cy.get("[data-testid*='edit-button'").eq(0).click({ force: true });
    cy.get("#state").contains("Fresh");
    cy.get("#state").invoke("val", "Fresh").trigger("change");

    cy.get("[data-testid='add-state']").click({ force: true });
  });

  it("should click and edit and click on add presentation button with value", () => {
    cy.get("[data-testid*='edit-button'").eq(0).click({ force: true });
    cy.get("#presentation").contains("Whole");
    cy.get("#presentation").invoke("val", "Whole").trigger("change");

    cy.get("[data-testid='add-presentation']").click({ force: true });
  });

  it("should display an error validation at the form input when add species is clicked without selecting a value", () => {
    cy.get("[data-testid='add-species']").click({ force: true });

    cy.contains("span", /^Enter the common name or FAO code$/).should("be.visible");
  });

  it("should set the form input when add species is clicked with selected value", () => {
    cy.get("#species").invoke("val", "Atlantic bluefin tuna (BFT)").trigger("change");
    cy.get("#species").should("have.value", "Atlantic bluefin tuna (BFT)");
    cy.get("[data-testid='add-species']").click({ force: true });
  });

  it("should display an error validation at the form input when add state is clicked without selecting a value", () => {
    cy.get("[data-testid='add-state']").click({ force: true });
    cy.contains("span", /^Enter the common name or FAO code$/).should("be.visible");
    cy.get("#state-error-message").should("have.class", "govuk-error-message");
    cy.get("#state-error-message > span")
      .contains(/^Error:$/)
      .should("be.visible");
  });

  it("should display an error validations at the form inputs when add presentation is clicked without selecting a value", () => {
    cy.get("[data-testid='add-presentation']").click({ force: true });

    cy.contains("span", /^Enter the common name or FAO code$/).should("be.visible");
    cy.get("#state-error-message > span")
      .contains(/^Error:$/)
      .should("be.visible");
    cy.get("#presentation-error-message > span")
      .contains(/^Error:$/)
      .should("be.visible");
  });

  it("should set the selected input value when 'Add state' button is clicked", () => {
    cy.get("#species").invoke("val", "Atlantic bluefin tuna (BFT)").trigger("change");
    cy.get("[data-testid='add-species']").click({ force: true });
    cy.get("#state").then(() => {
      cy.get("#state").select(1, { force: true });
    });
  });

  it("should show state hint when JavaScript is disabled", () => {
    cy.get(".govuk-hint").contains("For example, Lobster or LBE.").should("be.visible");
    cy.get(".govuk-hint").contains("You must add species before selecting a state").should("be.visible");
    cy.get(".govuk-hint")
      .contains("You must add species and state before selecting a presentation")
      .should("be.visible");
    cy.get(".govuk-hint")
      .contains("You must add species, state and presentation before selecting a commodity code")
      .should("be.visible");
  });
});
