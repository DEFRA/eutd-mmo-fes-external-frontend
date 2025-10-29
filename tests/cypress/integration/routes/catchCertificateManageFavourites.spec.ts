import { type ITestParams, TestCaseId } from "~/types";

const docummentNumber = "GBR-2022-CC-012345678";
const manageFavouritesUrl = `/create-catch-certificate/${docummentNumber}/manage-favourites`;

describe("Manage favourites page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ManageFavourites,
      args: ["catchCertificate"],
    };
    cy.visit(manageFavouritesUrl, { qs: { ...testParams } });
  });

  it("should render a back link", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-catch-certificate/${docummentNumber}/what-are-you-exporting?activeTab=favouritesTab#add-from-favourites`
      );
    cy.findByRole("link", { name: "Back" }).click({ force: true });
    cy.url().should(
      "include",
      "/create-catch-certificate/GBR-2022-CC-012345678/what-are-you-exporting?activeTab=favouritesTab#add-from-favourites"
    );
  });

  it("should render the correct page title", () => {
    cy.findByRole("heading", { name: "Product Favourites", level: 1 });
  });

  it("should check for field labels", () => {
    cy.contains("label", "Common name or FAO code");
    cy.contains("label", "State");
    cy.contains("label", "Presentation");
    cy.contains("label", "Commodity Code");
  });

  it("should render the input label and hint text", () => {
    cy.get("div .govuk-hint").contains("For example, Lobster or LBE.");
  });

  it("should show errors click of add product button", () => {
    cy.get("[data-testid='add-product']").click({ force: true });
  });

  it("should render form button", () => {
    cy.contains("[data-testid='add-product']", "Add product favourite");
    cy.contains("[data-testid='cancel']", "Cancel");
  });

  it("should check your products table", () => {
    cy.get(".govuk-table__head").find("th").should("have.length", 3);
    cy.get(".govuk-table__head").find("th").eq(0).contains("Product ID");
    cy.get(".govuk-table__head").find("th").eq(1).contains("Product");
    cy.get(".govuk-table__head").find("th").eq(2).contains("Action");
  });

  it("should render the  Edit and remove buttons", () => {
    cy.contains("[data-testid='remove-button-PRD465']", "Remove");
  });
});

describe("Manage favourites page: when JavaScript is disabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ManageFavourites,
      args: ["catchCertificate"],
      disableScripts: true,
    };
    cy.visit(manageFavouritesUrl, { qs: { ...testParams } });
  });

  it("should render add species, state and presentation buttons when JavaScript is disabled", () => {
    cy.contains("[data-testid='add-species']", "Add species");
    cy.contains("[data-testid='add-state']", "Add state");
    cy.contains("[data-testid='add-presentation']", "Add presentation");
  });

  it("should return an error when a species has not been selected", () => {
    cy.get("[data-testid='add-species']").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the common name or FAO code$/).should("be.visible");
  });

  it("should return an error when a state has not been selected", () => {
    cy.get("[data-testid='add-state']").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select the state$/).should("be.visible");
  });

  it("should return an error when a presentation has not been selected", () => {
    cy.get("[data-testid='add-presentation']").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select the presentation$/).should("be.visible");
  });

  it("should return to current page when clicking cancel", () => {
    cy.get("[data-testid='cancel']").click({ force: true });
    cy.url().should("include", "/manage-favourite");
  });

  it("should return to current page when clicking remove", () => {
    cy.get("[data-testid='remove-button-PRD465']").click({ force: true });
    cy.url().should("include", "/manage-favourite");
  });

  it("should redirect to #add-state", () => {
    cy.get("[name='species'").select("Albacore (ALB)");
    cy.get("[data-testid='add-species']").click({ force: true });
    cy.url().should("include", "/manage-favourites#add-state");
  });
});

describe("Manage favourites page with errors", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ManageFavouritesWithErrors,
      args: ["catchCertificate"],
    };
    cy.visit(manageFavouritesUrl, { qs: { ...testParams } });
  });

  it("should show errors click of add product button", () => {
    cy.get("[data-testid='add-product']").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.url().should("include", "/manage-favourites");
  });
});
