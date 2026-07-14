import { type ITestParams, TestCaseId } from "~/types";

const manageFavouritesUrl = "/manage-favourites";

describe("Manage favourites page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ManageFavourites,
      args: ["catchCertificate"],
    };
    cy.visit(manageFavouritesUrl, { qs: { ...testParams } });
  });

  it("should render a back link", () => {
    cy.wrap(true).should("be.true");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-catch-certificate/catch-certificates");
    cy.findByRole("link", { name: "Back" }).click();
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should render the correct page title", () => {
    cy.wrap(true).should("be.true");
    cy.findByRole("heading", { name: "Product Favourites", level: 1 });
  });

  it("should render Your product favourites as h2 heading", () => {
    cy.wrap(true).should("be.true");
    cy.findByRole("heading", { name: "Your product favourites", level: 2 }).should("be.visible");
  });

  it("should check for field labels", () => {
    cy.wrap(true).should("be.true");
    cy.contains("label", "Common name or FAO code");
    cy.contains("label", "State");
    cy.contains("label", "Presentation");
    cy.contains("label", "Commodity Code");
  });

  it("should render the input label and hint text", () => {
    cy.wrap(true).should("be.true");
    cy.get("div .govuk-hint").contains("For example, Lobster or LBE.");
  });

  it("should render form button", () => {
    cy.wrap(true).should("be.true");
    cy.contains("[data-testid='add-product']", "Add product favourite");
    cy.contains("[data-testid='cancel']", "Cancel");
  });

  it("should show errors click of add product button", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid='add-product']").click();
  });

  it("should check your products table", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-table__head").find("th").should("have.length", 3);
    cy.get(".govuk-table__head").find("th").eq(0).contains("Product ID");
    cy.get(".govuk-table__head").find("th").eq(1).contains("Product");
    cy.get(".govuk-table__head").find("th").eq(2).contains("Action");
  });

  it("should render the  Edit and remove buttons", () => {
    cy.wrap(true).should("be.true");
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
    cy.wrap(true).should("be.true");
    cy.contains("[data-testid='add-species']", "Add species");
    cy.contains("[data-testid='add-state']", "Add state");
    cy.contains("[data-testid='add-presentation']", "Add presentation");
  });

  it("should return an error when a species has not been selected", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid='add-species']").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the common name or FAO code$/).should("be.visible");
  });

  it("should return an error when a state has not been selected", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid='add-state']").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select the state$/).should("be.visible");
  });

  it("should return an error when a presentation has not been selected", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid='add-presentation']").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select the presentation$/).should("be.visible");
  });

  it("should return to current page when clicking cancel", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid='cancel']").click();
    cy.url().should("include", "/manage-favourite");
  });

  it("should return to current page when clicking remove", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid='remove-button-PRD465']").click();
    cy.url().should("include", "/manage-favourite");
  });

  it("should redirect to #add-state", () => {
    cy.wrap(true).should("be.true");
    cy.get("[name='species'").select("Albacore (ALB)");
    cy.get("[data-testid='add-species']").click();
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
    cy.wrap(true).should("be.true");
    cy.get("[data-testid='add-product']").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.url().should("include", "/manage-favourites");
  });
});

describe("Loader function", () => {
  beforeEach(() => {
    const testParams = {
      testCaseId: TestCaseId.ManageFavourites,
      args: ["catchCertificate"],
    };
    cy.visit(manageFavouritesUrl, { qs: { ...testParams } });
  });

  it("should load with default stateCode and presentationCode", () => {
    cy.wrap(true).should("be.true");
    cy.get("[name='stateCode']").should("exist").should("have.value", "");
    cy.get("[name='presentationCode']").should("exist").should("have.value", "");
  });

  it("should set loaderSpecies when faoName and faoCode are present", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid='loaderSpecies']").should(($loaderSpecies) => {
      const faoName = $loaderSpecies.attr("data-fao-name");
      const faoCode = $loaderSpecies.attr("data-fao-code");
      if (faoName && faoCode) {
        expect($loaderSpecies.text()).to.equal(`${faoName} (${faoCode})`);
      }
    });
  });
});
