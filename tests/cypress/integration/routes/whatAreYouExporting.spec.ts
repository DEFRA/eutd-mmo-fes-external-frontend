import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
const productsUrl = `${documentUrl}/what-are-you-exporting`;
const landingsUrl = `${documentUrl}/landings-entry`;

describe("What are you exporting page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
  });

  it("should render a back link", () => {
    cy.findByRole("link", { name: "Back" }).click({ force: true });
    cy.url().should("eq", `http://localhost:3000${documentUrl}/add-exporter-details`);
  });

  it("should render the insert text", () => {
    cy.get("p").contains("Please Note:");
    cy.get("#speciesAndLandingsGuidanceMessage")
      .find("li")
      .should("have.length", 2)
      .should(($list) => {
        expect($list[0]).to.contain("Each product must have at least one landing.");
        expect($list[1]).to.contain("A maximum of 100 landings is allowed per certificate.");
      });
  });

  it("should render the correct page title", () => {
    cy.findByRole("heading", { name: "What are you exporting?", level: 1 });
  });

  it("should check the tabs", () => {
    cy.get("#productTabs")
      .find("li")
      .should("have.length", 2)
      .should(($list) => {
        expect($list[0]).to.contain("Add products");
        expect($list[1]).to.contain("Add products from favourites");
      });
  });

  it("should toggle the tabs and find text", () => {
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });
    cy.get(".govuk-tabs__tab").contains("Add products from favourites");
    cy.get("[data-tab-id='productsTab']").click({ force: true });
    cy.get(".govuk-tabs__tab").contains("Add products");
  });

  it("should submit product with out any errors", () => {
    cy.get("[data-testid*='edit-button'").eq(0).click({ force: true });
    cy.get("#species").contains("Albacore (ALB)");
    cy.get("#state").contains("Fresh");
    cy.get("#presentation").contains("Whole");
    cy.get("#commodity_code").contains("16051000");
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });
  });

  it("should submit product with out any errors without adding to favourites", () => {
    cy.get("[data-testid*='edit-button'").eq(0).click({ force: true });
    cy.get("#species").contains("Albacore (ALB)");
    cy.get("#state").contains("Fresh");
    cy.get("#presentation").contains("Whole");
    cy.get("#commodity_code").contains("16051000");
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });
  });

  it("should check for field labels", () => {
    cy.contains("label", "Common name or FAO code");
    cy.contains("label", "State");
    cy.contains("label", "Presentation");
    cy.contains("label", "Commodity Code");
    cy.contains("label", "Product");
  });

  it("should render the input label and hint text", () => {
    cy.get("div .govuk-hint").contains("For example, Lobster or LBE.");
  });

  it("should render form button", () => {
    cy.contains("[data-testid='add-product']", "Add product");
    cy.contains("#add-product", "Add product");
    cy.contains("[data-testid='cancel']", "Cancel");
  });

  it("should render mangage favourites link", () => {
    cy.contains("a", /^Manage your product favourites$/).should("be.visible");
  });

  it("should select the checkbox", () => {
    cy.get("#addToFavourites").check();
    cy.contains("label", "Add to product favourites");
  });

  it("should check for your products section", () => {
    cy.findByRole("heading", { name: "Your products", level: 2 });
  });

  it("should check your products table", () => {
    cy.get(".govuk-table__head").find("th").should("have.length", 3);
    cy.get(".govuk-table__head").find("th").eq(0).contains("Product");
    cy.get(".govuk-table__head").find("th").eq(1).contains("Commodity Code");
    cy.get(".govuk-table__head").find("th").eq(2).contains("Action");
  });

  it("should render the  Edit and remove buttons", () => {
    cy.contains("[data-testid*='edit-button']", "Edit");
    cy.get("[data-testid*='edit-button'").eq(0).click({ force: true });
    cy.contains("[data-testid*='remove-button']", "Remove");
  });

  it("should check the products are visible and remove button functionality", () => {
    cy.get(".govuk-table__row").should("be.visible");
    cy.get(".govuk-table__row").find("td").should("have.length", 15);
    cy.get("[data-testid*='remove-button']").eq(0).click({ force: true });
  });

  it("should render the  save as draft button", () => {
    cy.findByRole("button", { name: "Save as draft" });
    cy.get("#saveAsDraft").click({ force: true });
    cy.url().should("include", "/catch-certificates");
  });

  it("should render the  cancel button", () => {
    cy.get("[data-testid='cancel']").click({ force: true });
  });

  it("should render the  Save and continue button", () => {
    cy.findByRole("button", { name: "Save and continue" });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/add-landings");
  });

  it("check input typing for finding the species", () => {
    cy.get("[data-tab-id='productsTab']").click({ force: true });
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });
  });

  it("should change the species information and select state, presentation", () => {
    cy.get("#species").invoke("val", "Atlantic bluefin tuna (BFT)").trigger("change");
    cy.get("#species").should("have.value", "Atlantic bluefin tuna (BFT)");
  });

  it("should render summary details species link and find out the count", () => {
    cy.get(".govuk-details__summary").should("have.length", 2);
    cy.get("div .govuk-details__summary").eq(0).contains("I cannot find the species");
    cy.get("div .govuk-details__summary").eq(0).click({ force: true });
    cy.get("div .govuk-details__text")
      .contains(
        "For best results, search for the common English name or the FAO code (if known) as species nicknames are not supported."
      )
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .contains("Some species are exempt: Species exempt from Catch Certificates (europa.eu)")
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .contains("If you cannot find the species and it is not exempt, call 0330 159 1989.")
      .should("be.visible");
  });

  it("should render summary details commodity code link and find out the count", () => {
    cy.get(".govuk-details__summary").should("have.length", 2);
    cy.get("div .govuk-details__summary").eq(1).contains("I cannot find the commodity code");
    cy.get("div .govuk-details__summary").eq(1).click({ force: true });
    cy.get("div .govuk-details__text")
      .contains("Call 0330 159 1989 if the commodity code you need is not shown.")
      .should("be.visible");
  });

  it("should show redirect to mannaul landings page if landing type is mannual landing", () => {
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-landings");
  });

  it("should render the selected species, state, presentation and commodity code", () => {
    cy.intercept(
      "GET",
      `${productsUrl}?testCaseId=${TestCaseId.WhatAreYouExporting}&_data=routes%2Fcreate-catch-certificate.%24documentNumber.what-are-you-exporting`
    ).as("getSpecies");
    cy.wait("@getSpecies");

    cy.get("#species").should("have.value", "");
    cy.get("#species").should("be.visible").and("not.be.disabled");
    cy.get("#species").type("a");
    cy.get("#species-option--1").click();
    cy.get("#species").should("have.value", "Aesop shrimp (AES)");

    cy.get("#state").should("have.value", "");
    cy.get("#state").select(1);
    cy.get("#state").should("have.value", "FRE");

    cy.get("#presentation").should("have.value", "");
    cy.get("#presentation").select(1);
    cy.get("#presentation").should("have.value", "FIL");

    cy.get("#commodity_code").should("have.value", "");
    cy.get("#commodity_code").select(1);
    cy.get("#commodity_code").should("have.value", "03024400");
  });
});

describe("What are you exporting page when js is enabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingEditErrorsOnSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
  });

  it("should submit product and display any errors", () => {
    cy.get("[data-testid*='edit-button'").eq(0).click({ force: true });
    cy.get("#species").contains("Albacore (ALB)");
    cy.get("#state").contains("Fresh");
    cy.get("#presentation").contains("Whole");
    cy.get("#commodity_code").contains("16051000");
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });
});

describe("What are you exporting page direct landing", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingDirectLanding,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
  });
  it("should render the  Save and continue button and redirect to direct-landing", () => {
    cy.findByRole("button", { name: "Save and continue" });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/direct-landing");
  });
});

describe("Errors on click of add product button", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
  });

  it("should show errors click of add product button", () => {
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the common name or FAO code$/).should("be.visible");
    cy.contains("a", /^Select the state$/).should("be.visible");
    cy.contains("a", /^Select the presentation$/).should("be.visible");
    cy.contains("a", /^Select a commodity code$/).should("be.visible");
  });
});

describe("Errors on click of add product button from favourites", () => {
  it("should show errors click of add product button from favourites", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnSaveFromFavourites,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a product favourite from the list$/).should("be.visible");
  });
});

describe("Save and continue what are you exporting page", () => {
  it("should show errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter at least one product$/).should("be.visible");
  });
});

describe("Add a product when addedToFavourites is false", () => {
  it("should submit product with out any errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingNoFavourite,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("#add-product").click({ force: true });
  });
});

describe("What are you exporting page: page guard", () => {
  it("should redirect to the forbidden page if the user is unauthorised to access a document number", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingFailsWith403,
    };

    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should redirect to landings entry page when the user tries to access the products page with null landings entry", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingPageGuard,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.url().should("include", landingsUrl);
  });
});

describe("What are you exporting page: with 100 products", () => {
  it("should not render a products button to add product", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingWith100Products,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.get("#add-product").should("not.exist");
  });

  it("should render in edit mode", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingWith100Products,
    };
    cy.visit(`${productsUrl}?productId=GBR-2022-CC-C9B55725C-54573020-44ee-401c-b437-47dc869ef148`, {
      qs: { ...testParams },
    });
    cy.get("#add-product").should("not.exist");
  });

  it("should render in edit mode for unknown products", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingWith100Products,
    };
    cy.visit(`${productsUrl}?productId=Invalid`, { qs: { ...testParams } });
    cy.get("#add-product").should("not.exist");
  });
});

describe("What are you exporting page: add Product to favourites", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingProductAddedToFavourites,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
  });

  it("should add product to favourites when add product button is clicked", () => {
    cy.get("#add-product").click({ force: true });
  });
  it("click on save and continue with unauthorised response", () => {
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/forbidden");
  });
});

describe("What are you exporting page: editing product with errors", () => {
  it("should error if trying to submit an incorrect commodity_code", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingEditErrorsOnSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("[data-testid*='edit-button'").eq(0).click({ force: true });
    cy.get("#species").should("have.value", "Aesop shrimp (AES)");
    cy.get("#state").contains("Fresh");
    cy.get("#presentation").contains("Whole");
    cy.get("#commodity_code").contains("16051000");
    cy.get("select#commodity_code option").eq(0).click({ force: true });
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });
    cy.get("#errorIsland").contains("Select a commodity code");
    // Double checks that even after a submission and error the values are displayed correctly
    cy.get("#species").should("have.value", "Aesop shrimp (AES)");
    cy.get("#state").contains("Fresh");
    cy.get("#presentation").contains("Whole");
    cy.get("#commodity_code").contains("16051000");
  });
});
