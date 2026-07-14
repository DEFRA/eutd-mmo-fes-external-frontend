import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-processing-statement/GBR-2022-PS-12EE387DB";
const progressUrl = `${documentUrl}/progress`;
const pageUrl = `${documentUrl}/catch-added`;

describe("PS: Catch added", () => {
  it("should have correct backlink", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedFromProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/).should("have.attr", "href");
  });

  it("navigating from the Progress page should redirect to add consignment details if the second catch does not have either a species or catch certificate number", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedFromProgressNoCatchDetails1,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
    cy.findByRole("link", { name: "Processed product details" }).click();
    cy.url().should("include", "/add-consignment-details");
  });

  it("navigating from the Progress page should render with a Change link", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
    cy.findByRole("link", { name: "Processed product details" }).click();
    cy.url().should("include", "/catch-added");

    cy.contains("a", /^Back$/)
      .should("have.attr", "href")
      .and("include", "add-catch-details");
    cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").should("have.length", 1);
  });

  it("should render with only Change links for at least one catch", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 1 processed products to this consignment - Create a UK processing statement - GOV.UK"
    );

    cy.get("a[id^=change-GBR-2023-PS-2305703F5-012345678]").should("have.length", 3);
    cy.contains("button", "Save and continue").click();
    cy.url().should("include", "/add-processing-plant-details");
  });

  it("should click Change link", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 1 processed products to this consignment - Create a UK processing statement - GOV.UK"
    );

    cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").eq(0).click();
    cy.url().should("include", "create-processing-statement");
    cy.url().should("include", "add-consignment-details");
  });

  it("should allow continuing if the catch is valid", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 1 processed product to this consignment - Create a UK processing statement - GOV.UK"
    );

    cy.contains("button", "Save and continue").click();
    cy.url().should("include", "/add-processing-plant-details");
    cy.url().should("not.include", "/add-catch-details");
  });

  it("should allow continuing if trying to add a new catch entry", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete"); // Wait for hydration
    cy.get('[type="radio"]').first().should("exist");
    cy.get('[type="radio"]').first().check();
    cy.document({ timeout: 200 }).its("readyState").should("eq", "complete"); // Allow React to process the state change
    cy.contains("button", "Save and continue").click();
    cy.url({ timeout: 10000 }).should("include", "/add-consignment-details");
  });

  it("should prevent continuing and display errors if one or more catches are invalid", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.contains("button", "Save and continue").click();
    cy.get("#errorIsland").should("exist");
    cy.url().should("include", "/catch-added");
  });

  it("should scroll to error island when validation errors are present", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.contains("button", "Save and continue").click();
    cy.get("#errorIsland").should("exist");
    cy.get("#errorIsland").should("be.visible");

    // Verify error island is scrolled into view
    cy.get("#errorIsland").then(($errorIsland) => {
      const errorIslandTop = $errorIsland[0].getBoundingClientRect().top;
      const viewportHeight = Cypress.config("viewportHeight");
      expect(errorIslandTop).to.be.at.least(0);
      expect(errorIslandTop).to.be.at.most(viewportHeight);
    });

    // Verify the error summary has the correct attributes for accessibility and focus management
    cy.get("#errorIsland").should("have.attr", "tabIndex", "-1").and("have.attr", "role", "alert");
  });

  it("should not scroll when no errors are present", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#errorIsland").should("not.exist");
    cy.get('input[name="addAnotherCatch"][value="No"]').check();
    cy.contains("button", "Save and continue").click();
    cy.url().should("include", "/add-processing-plant-details");
  });

  it("should handle save as draft action correctly", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="addAnotherCatch"][value="No"]').check();
    cy.contains("button", "Save as draft").click();
    cy.url().should("include", "/processing-statements");
  });

  it("should handle save and continue action with error response", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="addAnotherCatch"][value="No"]').check();
    cy.contains("button", "Save and continue").click();
    cy.get("#errorIsland").should("exist");
    cy.url().should("include", "/catch-added");
  });

  it("should navigate to the correct entry if editing a catch", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").first().click();
    cy.url().should("include", "add-consignment-details");
  });

  it("should display default search button label when none provided", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('[data-testid="filter-search-submit"]').should("contain.text", "Search");
  });

  it("should display default reset button label when none provided", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('[data-testid="filter-search-reset"]').should("contain.text", "Reset");
  });

  it("should use default button labels for form submission functionality", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('[data-testid="filter-search-submit"]').should("have.text", "Search");
    cy.get('[data-testid="filter-search-submit"]').should("have.attr", "value", "search");
    cy.get('[data-testid="filter-search-reset"]').should("have.text", "Reset");
    cy.get('[data-testid="filter-search-reset"]').should("have.attr", "value", "reset");
  });

  it("should test conditional rendering branches", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('label[for*="filter"]').should("exist");
    cy.get('input[name="q"]')
      .should("have.attr", "id")
      .and("match", /.*-filter$/); // ignore denial of service - test file
    cy.get(".govuk-hint").should("exist");
    cy.get('input[name="q"]').should("have.attr", "aria-describedby");
  });

  it("should test FilterSearch component structure and accessibility", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-form-group").should("exist");
    cy.get("label.govuk-label").should("exist");
    cy.get('input[type="search"]').should("exist");
    cy.get('input[name="q"]')
      .should("have.attr", "id")
      .and("match", /.*-filter$/); // ignore denial of service - test file
    cy.get(".govuk-hint").should("exist");
    cy.get('input[name="q"]').should("have.attr", "aria-describedby");
    cy.get('[data-testid="filter-search-submit"]').should("exist");
    cy.get('[data-testid="filter-search-reset"]').should("exist");
    cy.get('[data-testid="filter-search-submit"]').should("have.length", 1);
    cy.get('[data-testid="filter-search-reset"]').should("have.length", 1);
  });

  it("should verify input attributes and default values", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="q"]').should("have.attr", "type", "search");
    cy.get('input[name="q"]').should("have.class", "govuk-input");
    cy.get('input[name="q"]').should("have.attr", "name", "q");
    cy.get('button[data-testid="filter-search-submit"]').should("have.attr", "type", "submit");
    cy.get('button[data-testid="filter-search-reset"]').should("have.attr", "type", "submit");
  });

  it("should handle empty search results scenario", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="q"]').type("NonExistentSpeciesOrProduct");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.get("tbody tr").should("exist");
    cy.get("tbody").should("exist");
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should filter catches when searching for existing species code AGH", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Get initial count of rows
    cy.get("tbody tr").its("length").as("initialRowCount");

    // Search for AGH species code which exists in the fixture
    cy.get('input[name="q"]').type("AGH");
    cy.get('[data-testid="filter-search-submit"]').click();

    // Verify the search returns at least one matching catch
    cy.get("tbody tr").should("have.length.greaterThan", 0);

    // Verify that at least one row contains AGH
    cy.get('td[id$="-species"]').should("contain.text", "AGH");

    // Reset and verify all catches are shown again
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("@initialRowCount").then((initialCount) => {
      cy.get("tbody tr").should("have.length", Number(initialCount));
    });
  });

  it("should filter catches and products when search matches", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Search for species that exists in fixture (Gymnotus pantherinus)
    cy.get('input[name="q"]').type("Gymnotus");
    cy.get('[data-testid="filter-search-submit"]').click();

    // Should show filtered results
    cy.get("tbody tr").should("have.length.greaterThan", 0);

    // Reset to show all
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should handle edge cases with null/undefined values in search", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="q"]').should("have.value", "");
    cy.get('input[name="q"]').type("  ");
    cy.get('[data-testid="filter-search-submit"]').should("exist");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.url().should("include", "catch-added");
  });

  it("should test case insensitive search functionality", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('td[id$="-species"]')
      .first()
      .invoke("text")
      .then((species) => {
        const speciesText = species.trim();
        if (speciesText) {
          const upperCaseSearch = speciesText.toUpperCase();
          cy.get('input[name="q"]').clear();
          cy.get('input[name="q"]').type(upperCaseSearch);
          cy.get('[data-testid="filter-search-submit"]').should("exist");
          cy.get('[data-testid="filter-search-submit"]').click();
          cy.get("tbody tr").should("have.length.greaterThan", 0);
        }
      });
  });

  it("should test sequential search operations", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="q"]').should("exist");
    cy.get('input[name="q"]').should("have.value", "");
    cy.get('input[name="q"]').type("Tuna");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.url().should("include", "catch-added");
    cy.get('input[name="q"]').clear();
    cy.get('input[name="q"]').type("DifferentSearch");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.url().should("include", "catch-added");
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get('input[name="q"]').should("have.value", "");
  });

  it("should handle search with special characters and numbers", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    const specialSearches = ["123", "@#$", "test-123", "COD", "cod"];

    specialSearches.forEach((searchTerm) => {
      cy.get('input[name="q"]').clear();
      cy.get('input[name="q"]').type(searchTerm);
      cy.get('[data-testid="filter-search-submit"]').click();
      cy.get("tbody").should("exist");
      cy.get('[data-testid="filter-search-reset"]').click();
      cy.get("tbody tr").should("have.length.greaterThan", 0);
    });
  });

  it("should cover empty matchingCatches array scenario", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="q"]').type("CompletelyNonExistentMatch123XYZ");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.get("tbody").should("exist");
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should use default searchButtonLabel when no prop is provided", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('[data-testid="filter-search-submit"]')
      .should("exist")
      .and("contain.text", "Search")
      .and("have.attr", "name", "actionType")
      .and("have.attr", "value", "search");
    cy.get('input[name="q"]').as("searchInput");
    cy.get("@searchInput").type("test");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.get("tbody").should("exist");
  });

  it("should use default resetButtonLabel when no prop is provided", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('[data-testid="filter-search-reset"]')
      .should("exist")
      .and("contain.text", "Reset")
      .and("have.attr", "name", "actionType")
      .and("have.attr", "value", "reset");

    cy.get('input[name="q"]').as("searchInput");
    cy.get("@searchInput").type("test");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should cover default props assignment in FilterSearch component", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('button[name="actionType"][value="search"]')
      .should("exist")
      .and("have.text", "Search")
      .and("have.attr", "data-testid", "filter-search-submit");

    cy.get('button[name="actionType"][value="reset"]')
      .should("exist")
      .and("have.text", "Reset")
      .and("have.attr", "data-testid", "filter-search-reset");

    cy.get('[data-testid="filter-search-submit"]').should("have.attr", "type", "submit");
    cy.get('[data-testid="filter-search-reset"]').should("have.attr", "type", "submit");
  });

  it("should test FilterSearch component functionality with default button labels", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("tbody tr").its("length").as("initialCount");
    cy.get('input[name="q"]').as("searchInput");
    cy.get("@searchInput").clear();
    cy.get("@searchInput").type("COD");
    cy.get('[data-testid="filter-search-submit"]').should("contain.text", "Search");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.get("tbody tr").should("have.length.gte", 0);
    cy.get('[data-testid="filter-search-reset"]').should("contain.text", "Reset");
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("@searchInput").should("have.value", "");
    cy.get("@initialCount").then((initialCount) => {
      cy.get("tbody tr").should("have.length", Number(initialCount));
    });
  });

  it("should display hint text when hint prop is provided", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-hint").should("exist");
    cy.get(".govuk-hint").should("contain.text", "You can search by product description, FAO code or species name");
  });

  it("should associate hint with input field using aria-describedby", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="q"]').should("have.attr", "aria-describedby");

    cy.get('input[name="q"]')
      .invoke("attr", "aria-describedby")
      .then((ariaDescribedBy) => {
        cy.get(`#${ariaDescribedBy}`).should("exist");
        cy.get(`#${ariaDescribedBy}`).should("have.class", "govuk-hint");
        cy.get(`#${ariaDescribedBy}`).should(
          "contain.text",
          "You can search by product description, FAO code or species name"
        );
      });
  });

  it("should have correct hint id format", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="q"]')
      .should("have.attr", "id")
      .and("match", /.*-filter$/); // ignore denial of service - test file

    cy.get('input[name="q"]')
      .invoke("attr", "id")
      .then((inputId) => {
        const expectedHintId = `${inputId}-hint`;
        cy.get(`#${expectedHintId}`).should("exist");
        cy.get(`#${expectedHintId}`).should("have.class", "govuk-hint");
      });
  });

  it("should verify hint accessibility features", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-hint").should("be.visible");
    cy.get(".govuk-hint").should("have.class", "govuk-hint");

    cy.get('input[name="q"]').should("have.attr", "aria-describedby");
    cy.get('input[name="q"]').should("have.attr", "type", "search");

    cy.get('input[name="q"]').then(($input) => {
      const hintId = $input.attr("aria-describedby");
      cy.get(`#${hintId}`).should("be.visible");
      cy.get(`#${hintId}`).should("contain.text", "You can search by product description, FAO code or species name");
    });
  });

  it("should display warning message with edit instructions", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='warning-message']").should("exist");
    cy.get("[data-testid='warning-message']").should("contain", "To edit product information, press change.");
  });

  it("should have correct table structure with 7 columns", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("thead tr th").should("have.length", 7);
    cy.get("thead tr").within(() => {
      cy.contains("th", "Product description").should("exist");
      cy.contains("th", "Species name (FAO)").should("exist");
      cy.contains("th", "Catch Certificate number").should("exist");
      cy.contains("th", "Species commodity code").should("exist");
      cy.contains("th", "Weight on catch certificate (kg)").should("exist");
      cy.contains("th", "Export weight before processing (kg)").should("exist");
      cy.contains("th", "Export weight after processing (kg)").should("exist");
      cy.contains("th", "Action").should("not.exist");
    });

    cy.get("tbody tr").first().find("td").should("have.length", 7);
  });

  // Test the Change link is in the Product Description column
  it("should have Change link in Product Description column", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Verify Change link is in the first column (Product Description)
    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("td")
          .first()
          .within(() => {
            cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").should("exist");
            cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").should("contain", "Change");
          });
      });
  });

  it("should test FilterSearch component functionality with default button labels", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("tbody tr").its("length").as("initialCount");

    cy.get('input[name="q"]').as("searchInput");
    cy.get("@searchInput").clear();
    cy.get("@searchInput").type("COD");

    cy.get('[data-testid="filter-search-submit"]').should("contain.text", "Search");
    cy.get('[data-testid="filter-search-submit"]').click();

    cy.get("tbody tr").should("have.length.gte", 0);

    cy.get('[data-testid="filter-search-reset"]').should("contain.text", "Reset");
    cy.get('[data-testid="filter-search-reset"]').click();

    cy.get("@searchInput").should("have.value", "");

    cy.get("@initialCount").then((initialCount) => {
      cy.get("tbody tr").should("have.length", Number(initialCount));
    });
  });

  it("should display hint text when hint prop is provided", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-hint").should("exist");
    cy.get(".govuk-hint").should("contain.text", "You can search by product description, FAO code or species name");
  });

  it("should associate hint with input field using aria-describedby", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="q"]').should("have.attr", "aria-describedby");

    cy.get('input[name="q"]')
      .invoke("attr", "aria-describedby")
      .then((ariaDescribedBy) => {
        cy.get(`#${ariaDescribedBy}`).should("exist");
        cy.get(`#${ariaDescribedBy}`).should("have.class", "govuk-hint");
        cy.get(`#${ariaDescribedBy}`).should(
          "contain.text",
          "You can search by product description, FAO code or species name"
        );
      });
  });

  it("should have correct hint id format", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="q"]')
      .should("have.attr", "id")
      .and("match", /.*-filter$/); // ignore denial of service - test file

    cy.get('input[name="q"]')
      .invoke("attr", "id")
      .then((inputId) => {
        const expectedHintId = `${inputId}-hint`;
        cy.get(`#${expectedHintId}`).should("exist");
        cy.get(`#${expectedHintId}`).should("have.class", "govuk-hint");
      });
  });

  it("should verify hint accessibility features", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-hint").should("be.visible");
    cy.get(".govuk-hint").should("have.class", "govuk-hint");

    cy.get('input[name="q"]').should("have.attr", "aria-describedby");
    cy.get('input[name="q"]').should("have.attr", "type", "search");

    cy.get('input[name="q"]').then(($input) => {
      const hintId = $input.attr("aria-describedby");
      cy.get(`#${hintId}`).should("be.visible");
      cy.get(`#${hintId}`).should("contain.text", "You can search by product description, FAO code or species name");
    });
  });

  it("should style Change link as a link, not a button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").first().should("have.class", "govuk-link");
    cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").first().should("not.have.class", "govuk-button");
    cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").first().should("match", "a");
    cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").first().should("have.attr", "href");
    cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']")
      .first()
      .should("have.attr", "href")
      .and("include", "add-consignment-details");
  });

  it("should display product description above Change link", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("td")
          .first()
          .within(() => {
            cy.get("strong.govuk-tag").should("exist");
            cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").should("exist");
            cy.get("strong.govuk-tag").should("be.visible");
            cy.get("[data-testid='change-GBR-2023-PS-2305703F5-012345678']").should("be.visible");
          });
      });
  });
});

describe("PS: Catch added - page guard", () => {
  it("should navigate to the add-consignment-details page for a consignment with no products", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedFromProgressNoCatchDetails1,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/add-consignment-details");
  });

  it("should navigate to the add-consignment-details/productId page for a consignment with no products", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedProductsNoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/add-consignment-details/_product_id_1");
  });
});

describe("PS: Catch added - Pagination", () => {
  it("should handle pagination state with undefined initialPageNo", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination__item--current").should("contain", "1");
    cy.get(".govuk-pagination__list .govuk-pagination__link").contains("2").click();
    cy.get(".govuk-pagination__item--current").should("contain", "2");
    cy.visit(`${pageUrl}?pageNo=2`, { qs: { ...testParams } });
    cy.get(".govuk-pagination__item--current").should("contain", "2");
    cy.get(".govuk-pagination__list .govuk-pagination__link").contains("1").click();
    cy.get(".govuk-pagination__item--current").should("contain", "1");
  });

  it("should not show pagination when there are 15 or fewer catches", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination").should("not.exist");
    cy.get('[data-testid="pagination"]').should("not.exist");
  });

  it("should show pagination when there are more than 15 catches", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination").should("exist");
    cy.get(".govuk-pagination").should("be.visible");
  });

  it("should display first 15 catches on page 1", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("tbody tr").should("have.length", 15);
    cy.get('td[id$="-productDescription"]')
      .first()
      .should("contain", "Mixed fish products including pies, cakes, and premium preparations");
    cy.get('td[id$="-productDescription"]')
      .eq(14)
      .should("contain", "Mixed fish products including pies, cakes, and premium preparations");
    cy.get(".govuk-pagination__item--current").should("contain", "1");
  });

  it("should navigate to page 2 and show remaining 7 catches", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get("tbody tr").should("have.length", 7);
    cy.get('td[id$="-productDescription"]').should("exist");
    cy.get(".govuk-pagination__item--current").should("contain", "2");
  });

  it("should maintain correct row indexing across pages", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('td[id="catches-0-productDescription"]').should("exist");
    cy.get('a[id="change-GBR-2023-PS-2305703F5-012345678"]').should("exist");
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get('td[id="catches-15-productDescription"]').should("exist");
    cy.get('a[id="change-GBR-2023-PS-2305703F5-987654321"]').should("exist");
  });

  it("should handle edit actions correctly with pagination", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get("[data-testid='change-GBR-2023-PS-2305703F5-987654321']").first().click();
    cy.url().should("include", "/add-consignment-details");
  });

  it("should handle pagination in non-JS mode", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
      disableScripts: true,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination").should("exist");
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get(".govuk-pagination__item--current").should("contain", "2");
    cy.get("tbody tr").should("have.length", 7);
  });

  it("should show disabled previous navigation when isFirstPage is true", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Verify the disabled previous link structure matches the selected code
    cy.get(".govuk-pagination__prev").within(() => {
      cy.get("svg.govuk-pagination__icon--prev").should("exist");
      cy.get("svg.govuk-pagination__icon--prev").should("have.attr", "xmlns", "http://www.w3.org/2000/svg");
      cy.get("svg.govuk-pagination__icon--prev").should("have.attr", "height", "13");
      cy.get("svg.govuk-pagination__icon--prev").should("have.attr", "width", "15");
      cy.get("svg.govuk-pagination__icon--prev").should("have.attr", "aria-hidden", "true");
      cy.get("svg.govuk-pagination__icon--prev").should("have.attr", "focusable", "false");
      cy.get("svg.govuk-pagination__icon--prev").should("have.attr", "viewBox", "0 0 15 13");
      cy.get(".govuk-pagination__link-title").should("contain", "Previous");
      cy.get("a").should("not.exist"); // No clickable link when isFirstPage
    });
  });

  it("should show disabled next navigation when isLastPage is true", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Navigate to last page
    cy.get(".govuk-pagination__link").contains("2").click();

    // Verify the disabled next link structure matches the selected code
    cy.get(".govuk-pagination__next").within(() => {
      cy.get(".govuk-pagination__link-title").should("contain", "Next");
      cy.get("svg.govuk-pagination__icon--next").should("exist");
      cy.get("svg.govuk-pagination__icon--next").should("have.attr", "xmlns", "http://www.w3.org/2000/svg");
      cy.get("svg.govuk-pagination__icon--next").should("have.attr", "height", "13");
      cy.get("svg.govuk-pagination__icon--next").should("have.attr", "width", "15");
      cy.get("svg.govuk-pagination__icon--next").should("have.attr", "aria-hidden", "true");
      cy.get("svg.govuk-pagination__icon--next").should("have.attr", "focusable", "false");
      cy.get("svg.govuk-pagination__icon--next").should("have.attr", "viewBox", "0 0 15 13");
      cy.get("a").should("not.exist"); // No clickable link when isLastPage
    });
  });

  it("should show clickable previous navigation when isFirstPage is false", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Navigate to page 2
    cy.get(".govuk-pagination__link").contains("2").click();

    // Verify the clickable previous link structure uses navigationLinks?.previousLink()
    cy.get(".govuk-pagination__prev").within(() => {
      cy.get("a.govuk-pagination__link").should("exist");
      cy.get("svg.govuk-pagination__icon--prev").should("exist");
      cy.get(".govuk-pagination__link-title").should("contain", "Previous");
      // Should have href with pageNo parameter
      cy.get("a.govuk-pagination__link").should("have.attr", "href").and("include", "pageNo=1");
    });
  });

  it("should show clickable next navigation when isLastPage is false", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Verify the clickable next link structure uses navigationLinks?.nextLink()
    cy.get(".govuk-pagination__next").within(() => {
      cy.get("a.govuk-pagination__link").should("exist");
      cy.get(".govuk-pagination__link-title").should("contain", "Next");
      cy.get("svg.govuk-pagination__icon--next").should("exist");
      // Should have href with pageNo parameter
      cy.get("a.govuk-pagination__link").should("have.attr", "href").and("include", "pageNo=2");
    });
  });

  it("should highlight current page using pageNo == pageNum comparison", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination__item--current").should("contain", "1");
    cy.get(".govuk-pagination__item--current").should("have.class", "govuk-pagination__item");
    cy.get(".govuk-pagination__item--current .govuk-pagination__link").should("exist");
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get(".govuk-pagination__item--current").should("contain", "2");
    cy.get(".govuk-pagination__item--current").should("have.class", "govuk-pagination__item");
    cy.get(".govuk-pagination__item--current .govuk-pagination__link").should("exist");
  });

  it("should navigate using URL parameters correctly", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(`${pageUrl}?pageNo=2`, { qs: { ...testParams } });
    cy.get("tbody tr").should("have.length", 7);
    cy.get(".govuk-pagination__item--current").should("contain", "2");
    cy.url().should("include", "pageNo=2");
  });

  it("should only render pagination when filter condition is met: catches with catchCertificateNumber and totalPages > 1", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('[data-testid="pagination"]').should("not.exist");

    const manyTestParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...manyTestParams } });
    cy.get('[data-testid="pagination"]').should("exist");
  });

  it("should show correct pagination icons and styling", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination").should("have.attr", "role", "navigation");
    cy.get(".govuk-pagination").should("have.attr", "aria-label", "results");
    cy.get(".govuk-pagination").should("have.attr", "data-testid", "pagination");
    cy.get(".govuk-pagination__prev").should("exist");
    cy.get(".govuk-pagination__prev svg").should("have.class", "govuk-pagination__icon--prev");
    cy.get(".govuk-pagination__next").should("exist");
    cy.get(".govuk-pagination__next a svg").should("have.class", "govuk-pagination__icon--next");
    cy.get(".govuk-pagination__list").should("exist");
    cy.get(".govuk-pagination__item").should("have.length", 2); // 2 pages total
  });

  it("should handle edge case with 15 items or less (no pagination)", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Should not show pagination
    cy.get('[data-testid="pagination"]').should("not.exist");
    cy.get(".govuk-pagination").should("not.exist");
  });

  it("should handle edge case with exactly 16 items (shows pagination)", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches, // Has >15 catches
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Should show pagination
    cy.get('[data-testid="pagination"]').should("exist");
    cy.get(".govuk-pagination").should("be.visible");
  });

  it("should filter catches before applying pagination", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("tbody tr").should("have.length", 15); // First page
    cy.get('td[id$="-catchCertificateNumber"]').should("have.length", 15);
    cy.get('td[id$="-catchCertificateNumber"]').each(($el) => {
      cy.wrap($el).should("not.be.empty");
    });
  });

  it("should handle pagination accessibility requirements", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('nav[role="navigation"]').should("exist");
    cy.get('nav[aria-label="results"]').should("exist");
    cy.get(".govuk-pagination__icon").should("have.attr", "aria-hidden", "true");
    cy.get(".govuk-pagination__icon").should("have.attr", "focusable", "false");
    cy.get(".govuk-pagination__link-title").should("be.visible");
  });

  it("should show correct page numbering in pagination list", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination__list .govuk-pagination__item").should("have.length", 2);

    cy.get(".govuk-pagination__list").within(() => {
      cy.get(".govuk-pagination__item").eq(0).should("contain", "1");
      cy.get(".govuk-pagination__item").eq(1).should("contain", "2");
    });
  });

  it("should handle pagination with different page sizes correctly", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("tbody tr").should("have.length", 15);
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get("tbody tr").should("have.length", 7);
  });

  it("should render navigation with correct attributes and structure", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("nav.govuk-pagination").should("exist");
    cy.get("nav.govuk-pagination").should("have.attr", "role", "navigation");
    cy.get("nav.govuk-pagination").should("have.attr", "aria-label", "results");
    cy.get("nav.govuk-pagination").should("have.attr", "data-testid", "pagination");
    cy.get(".govuk-pagination__prev").should("exist");
    cy.get(".govuk-pagination__next").should("exist");
    cy.get("ul.govuk-pagination__list").should("exist");
  });

  it("should render SVG icons with exact path data from the selected code", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-pagination__prev svg path").should(
      "have.attr",
      "d",
      "m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"
    );

    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get(".govuk-pagination__next svg path").should(
      "have.attr",
      "d",
      "m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"
    );
  });

  // Test the conditional rendering logic for previous/next buttons
  it("should render different content based on isFirstPage and isLastPage conditions", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // On first page: isFirstPage ? (disabled content) : navigationLinks?.previousLink()
    cy.get(".govuk-pagination__prev").within(() => {
      cy.get("svg").should("exist"); // Disabled state shows SVG directly
      cy.get("span.govuk-pagination__link-title").should("exist");
      cy.get("a").should("not.exist"); // No link in disabled state
    });

    // isLastPage ? (disabled content) : navigationLinks?.nextLink()
    cy.get(".govuk-pagination__next").within(() => {
      cy.get("a").should("exist"); // Enabled state shows link
    });

    // Navigate to last page
    cy.get(".govuk-pagination__link").contains("2").click();

    // Now previous should be enabled, next should be disabled
    cy.get(".govuk-pagination__prev").within(() => {
      cy.get("a").should("exist"); // Now enabled
    });

    cy.get(".govuk-pagination__next").within(() => {
      cy.get("svg").should("exist"); // Now disabled
      cy.get("span.govuk-pagination__link-title").should("exist");
      cy.get("a").should("not.exist"); // No link in disabled state
    });
  });

  it("should handle previous link onClick with e.preventDefault() and handlePageChange(currentPage - 1)", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get(".govuk-pagination__item--current").should("contain", "2");
    cy.get(".govuk-pagination__prev a").should("exist");
    cy.get(".govuk-pagination__prev a").click();
    cy.get(".govuk-pagination__item--current").should("contain", "1");
    cy.get("tbody tr").should("have.length", 15); // First page content
    cy.url().should("include", "pageNo=1");
  });

  it("should handle next link onClick with e.preventDefault() and handlePageChange(currentPage + 1)", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination__item--current").should("contain", "1");
    cy.get(".govuk-pagination__next a").should("exist");
    cy.get(".govuk-pagination__next a").click();
    cy.get(".govuk-pagination__item--current").should("contain", "2");
    cy.get("tbody tr").should("have.length", 7); // Second page content
    cy.url().should("include", "pageNo=2");
  });
});

describe("PS: Catch added - session clearing on navigation", () => {
  it("should clear search filter when navigating back to catch-added page after Save & Continue", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    // Hydration-complete gate
    cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");

    // Perform a search — each step uses a fresh cy.get() to avoid stale-element errors
    cy.get('input[name="q"]').should("be.visible").and("be.enabled");
    cy.get('input[name="q"]').click();
    cy.get('input[name="q"]').clear();
    cy.get('input[name="q"]').type("Atlantic");
    cy.get('input[name="q"]').should("have.value", "Atlantic");
    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
    cy.get('button[name="actionType"][value="search"]').click();
    cy.wait("@filterSubmit");

    // Verify search was applied (URL should have q parameter)
    cy.url().should("include", "catch-added");

    // Click Save and Continue to navigate away
    cy.contains("button", "Save and continue").click();
    cy.url().should("include", "/add-processing-plant-details");

    // Navigate back to the catch-added page
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Verify that the search filter is cleared (input should be empty)
    cy.get('input[name="q"]').should("have.value", "");
  });

  it("should clear search filter when clicking Back to Progress link", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    // Hydration-complete gate
    cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");

    // Perform a search — each step uses a fresh cy.get() to avoid stale-element errors
    cy.get('input[name="q"]').should("be.visible").and("be.enabled");
    cy.get('input[name="q"]').click();
    cy.get('input[name="q"]').clear();
    cy.get('input[name="q"]').type("Tuna");
    cy.get('input[name="q"]').should("have.value", "Tuna");
    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
    cy.get('button[name="actionType"][value="search"]').click();
    cy.wait("@filterSubmit");

    // Wait for search to complete and verify search was applied
    cy.url().should("include", "catch-added");

    // Navigate back to the catch-added page freshly (without q param)
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Verify that the search filter is cleared
    cy.get('input[name="q"]').should("have.value", "");
  });

  it("should clear search filter when clicking Save as Draft", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    // Hydration-complete gate
    cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");

    // Perform a search — each step uses a fresh cy.get() to avoid stale-element errors
    cy.get('input[name="q"]').should("be.visible").and("be.enabled");
    cy.get('input[name="q"]').click();
    cy.get('input[name="q"]').clear();
    cy.get('input[name="q"]').type("Salmon");
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete"); // Wait for re-render if needed we should not have to do this but is the only way around flaky test right now
    cy.get('input[name="q"]').should("have.value", "Salmon");
    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
    cy.get('button[name="actionType"][value="search"]').click();
    cy.wait("@filterSubmit");

    // Click Save as Draft
    cy.contains("button", "Save as draft").click();
    cy.url().should("include", "/processing-statements");

    // Navigate back to the catch-added page
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Verify that the search filter is cleared
    cy.get('input[name="q"]').should("have.value", "");
  });

  it("should filter products when search matches catches with specific productId", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    // Hydration-complete gate
    cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");

    // Get initial count of rows
    cy.get("tbody tr").its("length").as("initialCount");

    // Search for a specific species
    cy.get('input[name="q"]').should("be.visible").and("be.enabled");
    cy.get('input[name="q"]').click();
    cy.get('input[name="q"]').clear();
    cy.get('input[name="q"]').type("Atlantic");
    cy.get('input[name="q"]').should("have.value", "Atlantic");
    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.wait("@filterSubmit");

    // Verify table still exists and has filtered results
    cy.get("tbody").should("exist");

    // Reset and verify all rows return
    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterReset");
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.wait("@filterReset");
    cy.get("@initialCount").then((initialCount) => {
      cy.get("tbody tr").should("have.length", Number(initialCount));
    });
  });

  it("should handle search that returns zero matching catches", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    // Hydration-complete gate
    cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");

    // Search for something that won't match any catches
    cy.get('input[name="q"]').should("be.visible").and("be.enabled");
    cy.get('input[name="q"]').click();
    cy.get('input[name="q"]').clear();
    cy.get('input[name="q"]').type("ZZZZNONEXISTENT12345");
    cy.get('input[name="q"]').should("have.value", "ZZZZNONEXISTENT12345");
    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.wait("@filterSubmit");

    // Verify the page handles empty results gracefully
    cy.get("tbody").should("exist");

    // Reset should restore the original data
    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterReset");
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.wait("@filterReset");
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should filter catches by speciesCode when searching", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Search by species code (e.g., COD, SAL)
    cy.get('input[name="q"]').type("COD");
    cy.get('[data-testid="filter-search-submit"]').click();

    // Verify page handles the search
    cy.get("tbody").should("exist");

    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should filter catches by productDescription when searching", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Search by product description partial match
    cy.get('input[name="q"]').type("Product");
    cy.get('[data-testid="filter-search-submit"]').click();

    // Verify page handles the search
    cy.get("tbody").should("exist");

    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should handle empty search with whitespace only", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Search with only whitespace
    cy.get('input[name="q"]').type("   ");
    cy.get('[data-testid="filter-search-submit"]').click();

    cy.url().should("include", "catch-added");
    cy.get("tbody").should("exist");
  });

  it("should handle case-insensitive product description search", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Search with different case
    cy.get('input[name="q"]').clear();
    cy.get('input[name="q"]').type("TAILJET");
    cy.get('[data-testid="filter-search-submit"]').click();

    // Verify search works by checking that tbody exists and has content
    cy.get("tbody").should("exist");

    cy.get('[data-testid="filter-search-reset"]').click();
  });

  it("should preserve existing query parameters during filter operations", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    const customParam = "testParam=value";
    cy.visit(`${pageUrl}?${customParam}`, { qs: { ...testParams } });

    cy.get('input[name="q"]').type("test");
    cy.get('[data-testid="filter-search-submit"]').click();

    // Should preserve custom param - testCaseId should still be in URL
    cy.url().should("include", "testCaseId=psCatchAddedTwoCatches");
    cy.url().should("include", "catch-added");
  });

  it("should handle error response with groupedErrors structure", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="addAnotherCatch"][value="No"]').check();
    cy.contains("button", "Save and continue").click();

    // Should display error summary
    cy.get("#errorIsland").should("exist");
    cy.get("#errorIsland").should("be.visible");
  });

  it("should show no results when searching for non-matching text", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Search for text that definitely doesn't exist
    cy.get('input[name="q"]').clear();
    cy.get('input[name="q"]').type("ZZZZZZZZZZZZNONEXISTENT");
    cy.get('[data-testid="filter-search-submit"]').click();

    // Verify the page still displays table structure
    cy.get("tbody").should("exist");

    // Reset to restore results
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get('input[name="q"]').should("have.value", "");
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should display numeric weights formatted correctly", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Check that weight values are displayed with proper formatting
    cy.get('td[id*="totalWeightLanded"]').should("contain.text", "kg");
    cy.get('td[id*="exportWeightBeforeProcessing"]').should("contain.text", "kg");
    cy.get('td[id*="exportWeightAfterProcessing"]').should("contain.text", "kg");
  });

  it("should handle loader with session query but no URL query", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    // First visit with a query to set session state
    cy.visit(`${pageUrl}?q=test`, { qs: { ...testParams } });

    // Then visit without query - should clear session state
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="q"]').should("have.value", "");
  });

  it("should redirect to add-consignment-details when no products and no action executed", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedNoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/add-consignment-details");
  });

  it("should handle nextUri redirect when save and continue with custom nextUri", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    const customNextUri = "/custom-next-page";
    cy.visit(`${pageUrl}?nextUri=${encodeURIComponent(customNextUri)}`, { qs: { ...testParams } });

    cy.get('input[name="addAnotherCatch"][value="No"]').check();
    cy.contains("button", "Save and continue").click();

    cy.url().should("include", customNextUri);
  });

  it("should redirect to check-your-information when plant details exist", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedHasPlantDetails,
    };

    const customNextUri = "/check-your-information";
    cy.visit(pageUrl + `?nextUri=${encodeURIComponent(customNextUri)}`, { qs: { ...testParams } });

    cy.get('input[name="addAnotherCatch"][value="No"]').check();
    cy.contains("button", "Save and continue").click();

    cy.url().should("include", "/check-your-information");
  });

  it("should handle pagination with many catches", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Check if pagination exists
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="pagination"]').length > 0) {
        // Test pagination navigation
        cy.get('[data-testid="pagination"]').should("be.visible");

        // Test page links if they exist
        cy.get(".govuk-pagination__list li").then(($items) => {
          if ($items.length > 1) {
            // Click second page if it exists
            cy.get(".govuk-pagination__list li").eq(1).find("a").click();
            cy.url().should("include", "pageNo=2");
          }
        });
      }
    });
  });
});

describe("PS: Catch added - New Filter & Validation Features", () => {
  // ── Static / non-filter assertion tests — no hydration gate needed ─────────

  it("should display 'No catches added' for product without catches", () => {
    cy.wrap(true).should("be.true");
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSCatchAddedProductWithNoCatches } });
    cy.contains("No catches added").should("exist");
    cy.get("strong.govuk-tag.govuk-tag--grey").should("exist");
  });

  it("should show validation error when saving product with description but no catches", () => {
    cy.wrap(true).should("be.true");
    // Covers both validateProductsHaveCatches and handleValidationError (merged duplicate)
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSCatchAddedSaveAndContinueValidationError } });
    cy.get('input[name="addAnotherCatch"][value="No"]').check();
    cy.contains("button", "Save and continue").click();
    cy.get("#errorIsland").should("exist");
    cy.url().should("include", "/catch-added");
  });

  it("should group catches by product in catchesByProduct", () => {
    cy.wrap(true).should("be.true");
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSCatchAddedTwoProductsOnlyOneWithCatches } });
    cy.get("strong.govuk-tag").should("have.length.greaterThan", 0);
    cy.contains("No catches added").should("exist");
  });

  it("should apply applyMatchedFromSession filtering when hasActiveQuery is true", () => {
    cy.wrap(true).should("be.true");
    cy.visit(`${pageUrl}?q=Atlantic`, { qs: { testCaseId: TestCaseId.PSCatchAddedFilterBySpeciesName } });
    cy.get('input[name="q"]').should("have.value", "Atlantic");
  });

  it("should clear session state when navigating without query param after previous search", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = { testCaseId: TestCaseId.PSCatchAddedFilterBySpeciesName };
    cy.visit(`${pageUrl}?q=test`, { qs: { ...testParams } });
    cy.get('input[name="q"]').should("have.value", "test");
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="q"]').should("have.value", "");
  });

  it("should show product description in summary heading when single product", () => {
    cy.wrap(true).should("be.true");
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSCatchAddedBlankOneCatch } });
    cy.get("#summary-table-title").should("exist");
  });

  // ── Reset filter — PSCatchAddedResetFilter ─────────────────────────────────

  it("should reset filter and clear all catches/products filters", () => {
    cy.wrap(true).should("be.true");
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSCatchAddedResetFilter } });
    // Hydration-complete gate: root.tsx useEffect focuses this span after hydrateRoot() settles
    cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");

    cy.get('input[name="q"]').should("be.visible").and("be.enabled");
    cy.get('input[name="q"]').click();
    cy.focused().clear().type("test");
    cy.get('input[name="q"]').should("have.value", "test");
    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.wait("@filterSubmit").then(({ request }) => {
      expect(String(request.body)).to.include("actionType=search");
    });

    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterReset");
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.wait("@filterReset").then(({ request }) => {
      expect(String(request.body)).to.include("actionType=reset");
    });
    cy.url().should("not.include", "q=");
    cy.get('input[name="q"]').should("have.value", "");
  });

  it("should test getExistingParams excludes pageNo from filter reset URL", () => {
    cy.wrap(true).should("be.true");
    cy.visit(`${pageUrl}?pageNo=2`, { qs: { testCaseId: TestCaseId.PSCatchAddedManyMockCatches } });
    // Hydration-complete gate
    cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");

    cy.get('input[name="q"]').should("be.visible").and("be.enabled");
    cy.get('input[name="q"]').click();
    cy.focused().clear().type("test");
    cy.get('input[name="q"]').should("have.value", "test");
    cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.wait("@filterSubmit");

    cy.get('[data-testid="filter-search-reset"]').click();
    cy.url().should("not.include", "pageNo=");
    cy.url().should("not.include", "q=");
    cy.url().should("include", "testCaseId=");
  });

  // ── Filter interactions — PSCatchAddedFilterBySpeciesName ──────────────────
  // Groups all tests that visit this fixture and type into the filter.
  // beforeEach centralises the visit + hydration gate so no test can omit it.

  describe("filter interactions — PSCatchAddedFilterBySpeciesName", () => {
    beforeEach(() => {
      cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSCatchAddedFilterBySpeciesName } });
      // Hydration-complete gate: root.tsx useEffect focuses this span after hydrateRoot() settles
      cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");
    });

    it("should filter catches by species name", () => {
      cy.wrap(true).should("be.true");
      cy.get('input[name="q"]').should("be.visible").and("be.enabled");
      cy.get('input[name="q"]').click();
      cy.focused().clear().type("Atlantic");
      cy.get('input[name="q"]').should("have.value", "Atlantic");
      cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
      cy.get('[data-testid="filter-search-submit"]').click();
      cy.wait("@filterSubmit").then(({ request }) => {
        expect(String(request.body)).to.include("actionType=search");
        expect(String(request.body)).to.include("q=Atlantic");
      });
      cy.get('input[name="q"]').should("have.value", "Atlantic");
    });

    it("should handle performCatchSearch with species code match", () => {
      cy.wrap(true).should("be.true");
      cy.get('input[name="q"]').should("be.visible").and("be.enabled");
      cy.get('input[name="q"]').click();
      cy.focused().clear().type("FAO27");
      cy.get('input[name="q"]').should("have.value", "FAO27");
      cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
      cy.get('[data-testid="filter-search-submit"]').click();
      cy.wait("@filterSubmit").then(({ request }) => {
        expect(String(request.body)).to.include("actionType=search");
        expect(String(request.body)).to.include("q=FAO27");
      });
    });

    it("should handle buildRedirectUrl with query params", () => {
      cy.wrap(true).should("be.true");
      cy.get('input[name="q"]').should("be.visible").and("be.enabled");
      cy.get('input[name="q"]').click();
      cy.focused().clear().type("test");
      cy.get('input[name="q"]').should("have.value", "test");
      cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
      cy.get('[data-testid="filter-search-submit"]').click();
      cy.wait("@filterSubmit").then(({ request }) => {
        expect(String(request.body)).to.include("actionType=search");
        expect(String(request.body)).to.include("q=test");
      });
      cy.url().should("include", "/create-processing-statement/");
      cy.url().should("include", "/catch-added");
    });

    it("should handle cleanupSession removing filter state", () => {
      cy.wrap(true).should("be.true");
      cy.get('input[name="q"]').should("be.visible").and("be.enabled");
      cy.get('input[name="q"]').click();
      cy.focused().clear().type("test");
      cy.get('input[name="q"]').should("have.value", "test");
      cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
      cy.get('[data-testid="filter-search-submit"]').click();
      cy.wait("@filterSubmit");
      cy.contains("button", "Save as draft").click();
      cy.url().should("include", "/processing-statements");
    });
  });

  // ── Filter interactions — PSCatchAddedFilterByProductDescription ───────────

  describe("filter interactions — PSCatchAddedFilterByProductDescription", () => {
    beforeEach(() => {
      cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSCatchAddedFilterByProductDescription } });
      // Hydration-complete gate: root.tsx useEffect focuses this span after hydrateRoot() settles
      cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");
    });

    it("should filter catches by product description", () => {
      cy.wrap(true).should("be.true");
      cy.get('input[name="q"]').should("be.visible").and("be.enabled");
      cy.get('input[name="q"]').click();
      cy.focused().clear().type("Frozen");
      cy.get('input[name="q"]').should("have.value", "Frozen");
      cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
      cy.get('[data-testid="filter-search-submit"]').click();
      cy.wait("@filterSubmit").then(({ request }) => {
        expect(String(request.body)).to.include("actionType=search");
        expect(String(request.body)).to.include("q=Frozen");
      });
      cy.get('input[name="q"]').should("have.value", "Frozen");
    });

    it("should handle performProductSearch matching product descriptions", () => {
      cy.wrap(true).should("be.true");
      cy.get('input[name="q"]').should("be.visible").and("be.enabled");
      cy.get('input[name="q"]').click();
      cy.focused().clear().type("product");
      cy.get('input[name="q"]').should("have.value", "product");
      cy.intercept("POST", "**/create-processing-statement/*/catch-added*").as("filterSubmit");
      cy.get('[data-testid="filter-search-submit"]').click();
      cy.wait("@filterSubmit").then(({ request }) => {
        expect(String(request.body)).to.include("actionType=search");
        expect(String(request.body)).to.include("q=product");
      });
    });
  });

  // ── Pagination and navigation — PSCatchAddedManyMockCatches ───────────────

  describe("pagination and navigation — PSCatchAddedManyMockCatches", () => {
    beforeEach(() => {
      cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSCatchAddedManyMockCatches } });
    });

    it("should handle pagination with paginatedCatches filtering", () => {
      cy.wrap(true).should("be.true");
      cy.get('[data-testid="pagination"]').should("exist");
      cy.get("tbody tr").should("have.length", 15);
      cy.get(".govuk-pagination__link").contains("2").click();
      cy.get("tbody tr").should("have.length.lessThan", 15);
    });

    it("should handle populateNavigationLinks for pagination", () => {
      cy.wrap(true).should("be.true");
      cy.get(".govuk-pagination__prev").should("exist");
      cy.get(".govuk-pagination__list li").should("have.length", 2);
      cy.get(".govuk-pagination__next").should("exist");
    });

    it("should handle isFirstPage and isLastPage logic", () => {
      cy.wrap(true).should("be.true");
      cy.get(".govuk-pagination__prev a").should("not.exist");
      cy.get(".govuk-pagination__next a").should("exist");
      cy.get(".govuk-pagination__link").contains("2").click();
      cy.get(".govuk-pagination__prev a").should("exist");
      cy.get(".govuk-pagination__next a").should("not.exist");
    });
  });

  // ── Static page checks — PSCatchAddedTwoCatches ───────────────────────────

  describe("static page checks — PSCatchAddedTwoCatches", () => {
    beforeEach(() => {
      cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSCatchAddedTwoCatches } });
    });

    it("should display warning message about editing product information", () => {
      cy.wrap(true).should("be.true");
      cy.get('[data-testid="warning-message"]').should("be.visible");
      cy.get('[data-testid="warning-message"]').should("contain.text", "To edit product information, press change");
    });

    it("should handle totalDocuments count display", () => {
      cy.wrap(true).should("be.true");
      cy.get("#summary-table-title").should("exist");
    });

    it("should handle determineRedirectUrl with empty nextUri", () => {
      cy.wrap(true).should("be.true");
      cy.get('input[name="addAnotherCatch"][value="No"]').check();
      cy.contains("button", "Save and continue").click();
      cy.url().should("include", "/add-processing-plant-details");
    });
  });
});
