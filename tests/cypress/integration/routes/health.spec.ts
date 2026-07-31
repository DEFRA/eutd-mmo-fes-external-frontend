describe("Health Page", () => {
  it("should render health page content", () => {
    cy.visit("/health");

    cy.get("h1").should("be.visible").contains("This is a devOps page to test frontDoor");
  });

  it("should exercise coverage fixtures for legacy components", () => {
    cy.visit("/health?showCoverageFixtures=1");

    cy.get("[data-testid='coverage-fixtures']").should("be.visible");

    cy.get("[data-testid='client-filter-search-fixture']").should("be.visible");
    cy.get("#client-filter-search").should("have.value", "Cod");

    cy.get("[data-testid='filter-search-reset']").first().trigger("click");
    cy.get("input#q-filter").should("exist");

    cy.get("[data-testid='client-filter-search-fixture'] [data-testid='filter-search-reset']").trigger("click");
    cy.get("#client-filter-search").should("exist");

    cy.get("[data-testid='coverage-notification']").should("contain.text", "A sample notification message");
    cy.get(".client-mounted-error-summary").should("be.visible");

    cy.get("#hsa-option-yes").should("have.length", 1);
    cy.get("#hsa-option-no").should("have.length", 1);
    cy.get("#hsa-option-error-yes").should("have.length", 1);
    cy.get("#hsa-option-error-no").should("have.length", 1);

    cy.contains("summary", "RFMO help").click();
    cy.contains("details.govuk-details", "RFMO help").within(() => {
      cy.get("a.govuk-link").should("have.attr", "href").and("include", "fishing-area#rfmo");
    });

    cy.get("#hsa-option-yes").first().check();
    cy.get("#hsa-option-error-no").first().check();

    cy.get("#gearCategory").eq(0).select("Longline");
    cy.get("#gearType").eq(0).select("Pots (FPO)");
    cy.get("#gearType").last().select("Drift nets (GN)");
    cy.get("#rfmo").select("NEAFC");
    cy.get("[data-testid='client-rfmo-selector-fixture'] select[name='rfmo']").select("NEAFC");

    cy.get("[data-testid='mount-client-filter-search']").click();
    cy.get("[data-testid='mount-client-rfmo-selector']").click();
    cy.get("[data-testid='mount-client-error-summary']").click();

    cy.get("[data-testid='coverage-fixtures']").should("exist");
  });
});
