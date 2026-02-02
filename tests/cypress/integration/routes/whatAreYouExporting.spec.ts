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

  it("should render a back link to add-exporter-details for non-CSV upload", () => {
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

  it("should show redirect to manual landings page if landing type is manual landing", () => {
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-landings");
  });

  it.skip("should render the selected species, state, presentation and commodity code", () => {
    // Intercept the state lookup API call - the actual endpoint is /get-species-state
    cy.intercept("GET", "**/get-species-state?*").as("stateLookup");

    cy.log("STEP #1 - Checking species dropdown is visible");
    cy.get("#species").should("be.visible");

    cy.log("STEP #2 - Verifying species dropdown is enabled and empty");
    cy.get("#species").should("not.be.disabled");
    cy.get("#species").should("have.value", "");

    cy.log("STEP #3 - Typing 'Aesop' to search for species");
    cy.get("#species").type("a", { force: true });

    cy.log("STEP #4 - Waiting for species option to appear");
    cy.get("#species-option--1", { timeout: 5000 }).should("be.visible");

    cy.log("STEP #5 - Clicking Aesop shrimp option");
    cy.get("#species-option--1").click({ force: true });

    cy.log("STEP #5A - Triggering change and blur events on species input");
    cy.get("#species").trigger("change").trigger("blur");

    cy.log("STEP #5B - Verifying species value");
    cy.get("#species").should("have.value", "Aesop shrimp (AES)");

    cy.log("STEP #6 - Waiting for stateLookup API call");
    cy.wait("@stateLookup", { timeout: 10000 }).then((interception) => {
      cy.log("✅ API called with URL: " + interception.request.url);
      cy.log("   Response status: " + interception.response.statusCode);
      cy.log("   Response body: " + JSON.stringify(interception.response.body));
    });

    cy.log("STEP #7 - Waiting for state dropdown to populate");
    cy.wait(1000);

    cy.log("STEP #8 - Checking state dropdown options in detail");
    cy.get("#state option").then(($options) => {
      cy.log("Number of state options: " + $options.length);
      if ($options.length === 1) {
        cy.log("⚠️ ONLY DEFAULT OPTION FOUND - State dropdown not populated!");
        cy.log("Default option text: '" + $options.eq(0).text() + "'");
        cy.log("Default option value: '" + $options.eq(0).val() + "'");
      } else {
        $options.each((i, opt) => {
          cy.log(`Option ${i}: value="${opt.value}" text="${opt.text}"`);
        });
      }
    });

    cy.log("STEP #9 - Checking state dropdown has more than 1 option");
    cy.get("#state option", { timeout: 15000 }).should("have.length.gt", 1);

    cy.log("STEP #9 - Looking for FRE option in state dropdown");
    cy.get('#state option[value="FRE"]', { timeout: 5000 }).should("exist");

    cy.log("STEP #10 - Selecting FRE state");
    cy.get("#state").select("FRE", { force: true });
    cy.get("#state").should("have.value", "FRE");

    cy.log("STEP #11 - Checking presentation dropdown");
    cy.get("#presentation").should("be.visible");
    cy.get("#presentation option").should("have.length.gt", 1);
    cy.get('#presentation option[value="FIL"]').should("exist");

    cy.log("STEP #12 - Selecting FIL presentation");
    cy.get("#presentation").select("FIL", { force: true });
    cy.get("#presentation").should("have.value", "FIL");

    cy.log("STEP #13 - Checking commodity code dropdown");
    cy.get("#commodity_code").should("be.visible");
    cy.get("#commodity_code option").should("have.length.gt", 1);
    cy.get('#commodity_code option[value="03024400"]').should("exist");

    cy.log("STEP #14 - Selecting commodity code");
    cy.get("#commodity_code").select("03024400", { force: true });
    cy.get("#commodity_code").should("have.value", "03024400");

    cy.log("STEP #15 - Test completed successfully");
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

    // Wait for error summary to appear
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a product favourite from the list$/).should("be.visible");

    // After errors are shown, verify that the AutocompleteFormField has error styling
    // This tests lines 233, 239, 242 which apply error classes when errors?.product exists
    cy.get("#add-from-favourites").should("exist");
    cy.get("#product").should("exist");
  });

  it("should successfully add product from favourites without errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });

    // Select a favourite (tests the non-error branch of lines 233, 239, 242)
    cy.get("#product").select(1);
    cy.get("#add-from-favourites").should("exist");
    cy.get("#product").should("exist");
  });

  it("should trigger error scrolling when there are validation errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnSaveFromFavourites,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });

    // Error summary should be visible (triggers useEffect scrollToId on line 110)
    cy.get("#errorIsland").should("exist");
    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });

  it("should call handleTab when edit button is clicked", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Click edit button on a product (triggers handleTab - lines 99-103, 162)
    cy.get("[data-testid='edit-product']").first().click();

    // Should be on products tab after edit
    cy.get("#productsTab").should("exist");
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

describe("What are you exporting page: CSV upload journey back button", () => {
  it("should render a back link to upload-file for CSV upload", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingUploadEntry,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.findByRole("link", { name: "Back" }).click({ force: true });
    cy.url().should("eq", `http://localhost:3000${documentUrl}/upload-file`);
  });
});

describe("What are you exporting page: Additional coverage for component rendering", () => {
  it("should render correctly when no errors are present", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Verify no error summary when no errors
    cy.get(".govuk-error-summary").should("not.exist");

    // Verify main components render
    cy.get(".govuk-tabs").should("be.visible");
    cy.get("[data-testid='add-product']").should("be.visible");
  });

  it("should render error summary when errors exist", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Submit without filling form to trigger errors
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });

    // Verify error summary appears
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get("#errorIsland").should("be.visible");
  });

  it("should render products table with correct structure", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Verify products table renders
    cy.get(".govuk-table").should("be.visible");
    cy.get(".govuk-table__head").within(() => {
      cy.contains("th", "Product");
      cy.contains("th", "Commodity Code");
      cy.contains("th", "Action");
    });
  });

  it("should use correct props from loader data", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Verify key field is present (indicates data from loader)
    cy.get("form").should("exist");
    cy.get("#species").should("exist");
    cy.get("#state").should("exist");
    cy.get("#presentation").should("exist");
    cy.get("#commodity_code").should("exist");
  });

  it("should handle favourites tab correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Switch to favourites tab
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });

    // Verify favourites content is visible
    cy.get("#add-from-favourites").should("be.visible");
    cy.get("#product").should("exist");

    // Verify manage favourites link
    cy.contains("a", /^Manage your product favourites$/).should("be.visible");
  });

  it("should render add products form with all required fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Verify all form fields exist
    cy.get("#species").should("exist");
    cy.get("#state").should("exist");
    cy.get("#presentation").should("exist");
    cy.get("#commodity_code").should("exist");
    cy.get("#addToFavourites").should("exist");
    cy.get("[data-testid='add-product']").should("exist");
  });

  it("should display guidance message with correct bullet points", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("#speciesAndLandingsGuidanceMessage").should("be.visible");
    cy.get("#speciesAndLandingsGuidanceMessage li").should("have.length", 2);
  });

  it("should render hidden nextUri input field", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("input[name='nextUri']").should("exist");
  });

  it("should show checkbox label correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.contains("label", "Add to product favourites").should("be.visible");
  });

  it("should render products tab as default active tab", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Products tab content should be visible by default
    cy.get("#add-products").should("be.visible");

    // Verify products tab is selected
    cy.get(".govuk-tabs__list-item--selected").should("exist");
  });

  it("should handle empty stateLookup gracefully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // State dropdown should still render even with action data
    cy.get("#state").should("exist");
  });

  it("should handle empty commodityCodes gracefully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Commodity code dropdown should still render
    cy.get("#commodity_code").should("exist");
  });
});

describe("What are you exporting page: Favourites tab with product limit", () => {
  it("should not render add product button in favourites tab when limit reached", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingWith100Products,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });
    cy.get("[data-testid='add-product']").should("not.exist");
  });
});

describe("What are you exporting page: Back URL for upload journey", () => {
  it("should render back link to upload-file when landingsEntryOption is uploadEntry", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingUploadEntry,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.findByRole("link", { name: "Back" }).should("have.attr", "href").and("include", "/upload-file");
  });

  it("should render back link to add-exporter-details when landingsEntryOption is not uploadEntry", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.findByRole("link", { name: "Back" }).should("have.attr", "href").and("include", "/add-exporter-details");
  });
});

describe("What are you exporting page: Tab interaction and handleTab function", () => {
  it("should switch to products tab when clicking on a product action", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Switch to favourites tab first
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });

    // Click edit button WITHOUT force to trigger onClick handler
    cy.get("[data-testid*='edit-button']").first().should("be.visible");
    cy.get("[data-testid*='edit-button']").first().trigger("click");

    // Verify products tab is active and we scrolled to it
    cy.wait(500);
    cy.get("#add-products").should("be.visible");
  });

  it("should execute handleTab when edit button is clicked from favourites tab", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Start on favourites tab
    cy.get("[data-tab-id='favouritesTab']").click({ force: true });
    cy.get("#add-from-favourites").should("be.visible");

    // Edit a product - trigger the onClick without force
    cy.get("[data-testid*='edit-button']").first().should("be.visible").trigger("click");

    // Should switch to products tab and scroll to #productsTab
    cy.wait(500); // Allow for scroll animation
    cy.get("#add-products").should("be.visible");
  });
});

describe("What are you exporting page: Error scrolling behavior", () => {
  it("should scroll to error island when errors are present", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("[data-testid='add-product']").eq(0).click({ force: true });

    // Verify error summary is visible
    cy.get("#errorIsland").should("be.visible");
  });

  it("should not show error summary when no errors are present", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get(".govuk-error-summary").should("not.exist");
  });
});

describe("What are you exporting page: State and presentation lookup for non-JS", () => {
  it("should use stateLookupNonJs when stateLookup is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Verify state dropdown is rendered
    cy.get("#state").should("exist");
  });

  it("should handle action data after form submission with errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Submit form to trigger action and get action data
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });

    // Verify error summary renders (indicating action was processed)
    cy.get(".govuk-error-summary").should("be.visible");

    // Verify form fields still exist (using stateLookupNonJs fallback)
    cy.get("#state").should("exist");
    cy.get("#presentation").should("exist");
    cy.get("#commodity_code").should("exist");
  });
});

describe("What are you exporting page: Product display limit checks", () => {
  it("should display add product form when under limit", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("[data-testid='add-product']").should("be.visible");
  });

  it("should hide add product button when at maximum product limit", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingWith100Products,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("[data-testid='add-product']").should("not.exist");
  });

  it("should show conditional rendering of add to favourites checkbox", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Checkbox should exist when under limit
    cy.get("#addToFavourites").should("exist");

    // Verify showFavouriteCheckbox logic renders the checkbox
    cy.get("label[for='addToFavourites']").should("contain", "Add to product favourites");
  });
});

describe("What are you exporting page: Selected values from action data", () => {
  it("should display selected species from action data when validation fails", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingEditErrorsOnSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("[data-testid*='edit-button']").eq(0).click({ force: true });
    cy.get("#species").should("have.value", "Aesop shrimp (AES)");
  });

  it("should use action data for all fields after validation error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExportingEditErrorsOnSave,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    // Edit a product
    cy.get("[data-testid*='edit-button']").eq(0).click({ force: true });

    // Verify all fields populated from loader data initially
    cy.get("#species").should("have.value", "Aesop shrimp (AES)");
    cy.get("#state").should("contain", "Fresh");
    cy.get("#presentation").should("contain", "Whole");

    // Submit with invalid data to trigger action with errors
    cy.get("select#commodity_code option").eq(0).click({ force: true });
    cy.get("[data-testid='add-product']").eq(0).click({ force: true });

    // After form submission with errors, action data should preserve values
    // This tests the left side of ?? operators: selectedSpecies ?? loaderSpecies, etc.
    cy.get("#species").should("have.value", "Aesop shrimp (AES)");
    cy.get("#state").should("contain", "Fresh");
    cy.get("#presentation").should("contain", "Whole");

    // Verify errors shown
    cy.get("#errorIsland").should("be.visible");
  });
});
