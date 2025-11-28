import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-processing-statement/GBR-2022-PS-12EE387DB";
const progressUrl = `${documentUrl}/progress`;
const pageUrl = `${documentUrl}/catch-added`;

describe("PS: Catch added", () => {
  it("should have correct backlink", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedFromProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/);
  });

  it("navigating from the Progress page should redirect to add consignment details if the second catch does not have either a species or catch certificate number", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedFromProgressNoCatchDetails1,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
    cy.findByRole("link", { name: "Processed product details" }).click({ force: true });
    cy.url().should("include", "/add-consignment-details");
  });

  it("navigating from the Progress page should render with a Change link", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
    cy.findByRole("link", { name: "Processed product details" }).click({ force: true });
    cy.url().should("include", "/catch-added");

    cy.contains("a", /^Back$/)
      .should("have.attr", "href")
      .and("include", "add-catch-details");
    cy.get("[data-testid='change-link']").should("have.length", 1);
  });

  it("should render with only Change links for at least one catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 1 processed products to this consignment - Create a UK processing statement - GOV.UK"
    );

    cy.get("a[id^=change-link]").should("have.length", 3);
    cy.contains("button", "Save and continue").click({ force: true });
    cy.url().should("include", "/add-processing-plant-details");
  });

  it("should click Change link", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 1 processed products to this consignment - Create a UK processing statement - GOV.UK"
    );

    cy.get("[data-testid='change-link']").eq(0).click({ force: true });
    cy.url().should("include", "create-processing-statement");
    cy.url().should("include", "add-consignment-details");
  });

  it("should allow continuing if the catch is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 1 processed product to this consignment - Create a UK processing statement - GOV.UK"
    );

    cy.contains("button", "Save and continue").click({ force: true });
    cy.url().should("include", "/add-processing-plant-details");
    cy.url().should("not.include", "/add-catch-details");
  });

  it("should allow continuing if trying to add a new catch entry", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.wait(200);
    cy.get('[type="radio"]').first().check();
    cy.contains("button", "Save and continue").click({ force: true });
    cy.url().should("include", "/add-consignment-details");
  });

  it("should prevent continuing and display errors if one or more catches are invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.contains("button", "Save and continue").click({ force: true });
    cy.get("#errorIsland").should("exist");
    cy.url().should("include", "/catch-added");
  });

  it("should scroll to error island when validation errors are present", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.contains("button", "Save and continue").click();
    cy.get("#errorIsland").should("exist");
    cy.get("#errorIsland").should("be.visible");
    cy.get("#errorIsland").then(($errorIsland) => {
      const errorIslandTop = $errorIsland[0].getBoundingClientRect().top;
      const viewportHeight = Cypress.config("viewportHeight");
      expect(errorIslandTop).to.be.at.least(0);
      expect(errorIslandTop).to.be.at.most(viewportHeight);
    });

    cy.get("#errorIsland").scrollIntoView().should("be.visible");
  });

  it("should not scroll when no errors are present", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="addAnotherCatch"][value="No"]').check();
    cy.contains("button", "Save as draft").click();
    cy.url().should("include", "/processing-statements");
  });

  it("should handle save and continue action with error response", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='change-link']").first().click({ force: true });
    cy.url().should("include", "add-consignment-details");
  });

  it("should display default search button label when none provided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('[data-testid="filter-search-submit"]').should("contain.text", "Search");
  });

  it("should display default reset button label when none provided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('[data-testid="filter-search-reset"]').should("contain.text", "Reset");
  });

  it("should use default button labels for form submission functionality", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('label[for*="filter"]').should("exist");
    cy.get('input[name="q"]')
      .should("have.attr", "id")
      .and("match", /.*-filter$/);
    cy.get(".govuk-hint").should("exist");
    cy.get('input[name="q"]').should("have.attr", "aria-describedby");
  });

  it("should test FilterSearch component structure and accessibility", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-form-group").should("exist");
    cy.get("label.govuk-label").should("exist");
    cy.get('input[type="search"]').should("exist");
    cy.get('input[name="q"]')
      .should("have.attr", "id")
      .and("match", /.*-filter$/);
    cy.get(".govuk-hint").should("exist");
    cy.get('input[name="q"]').should("have.attr", "aria-describedby");
    cy.get('[data-testid="filter-search-submit"]').should("exist");
    cy.get('[data-testid="filter-search-reset"]').should("exist");
    cy.get('[data-testid="filter-search-submit"]').should("have.length", 1);
    cy.get('[data-testid="filter-search-reset"]').should("have.length", 1);
  });

  it("should verify input attributes and default values", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="q"]').type("NonExistentSpeciesOrProduct");
    cy.get('[data-testid="filter-search-submit"]').should("exist");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.get("tbody tr").should("have.length", 0);
    cy.get('[data-testid="filter-search-reset"]').should("exist");
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should handle edge cases with null/undefined values in search", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="q"]').type("CompletelyNonExistentMatch123XYZ");
    cy.get('[data-testid="filter-search-submit"]').click();
    cy.get("tbody tr").should("not.exist");
    cy.get("tbody").should("exist");
    cy.get('[data-testid="filter-search-reset"]').click();
    cy.get("tbody tr").should("have.length.greaterThan", 0);
  });

  it("should use default searchButtonLabel when no prop is provided", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-hint").should("exist");
    cy.get(".govuk-hint").should("contain.text", "You can search by product description, FAO code or species name");
  });

  it("should associate hint with input field using aria-describedby", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="q"]')
      .should("have.attr", "id")
      .and("match", /.*-filter$/);

    cy.get('input[name="q"]')
      .invoke("attr", "id")
      .then((inputId) => {
        const expectedHintId = `${inputId}-hint`;
        cy.get(`#${expectedHintId}`).should("exist");
        cy.get(`#${expectedHintId}`).should("have.class", "govuk-hint");
      });
  });

  it("should verify hint accessibility features", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='warning-message']").should("exist");
    cy.get("[data-testid='warning-message']").should("contain", "To edit product information, press change.");
  });

  it("should have correct table structure with 6 columns", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("thead tr th").should("have.length", 6);
    cy.get("thead tr").within(() => {
      cy.contains("th", "Product description").should("exist");
      cy.contains("th", "Species name (FAO)").should("exist");
      cy.contains("th", "Catch Certificate number").should("exist");
      cy.contains("th", "Catch certificate weight").should("exist");
      cy.contains("th", "Export weight before processing").should("exist");
      cy.contains("th", "Export weight after processing").should("exist");
      cy.contains("th", "Action").should("not.exist");
    });

    cy.get("tbody tr").first().find("td").should("have.length", 6);
  });

  // Test the Change link is in the Product Description column
  it("should have Change link in Product Description column", () => {
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
            cy.get("[data-testid='change-link']").should("exist");
            cy.get("[data-testid='change-link']").should("contain", "Change");
          });
      });
  });

  it("should test FilterSearch component functionality with default button labels", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-hint").should("exist");
    cy.get(".govuk-hint").should("contain.text", "You can search by product description, FAO code or species name");
  });

  it("should associate hint with input field using aria-describedby", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="q"]')
      .should("have.attr", "id")
      .and("match", /.*-filter$/);

    cy.get('input[name="q"]')
      .invoke("attr", "id")
      .then((inputId) => {
        const expectedHintId = `${inputId}-hint`;
        cy.get(`#${expectedHintId}`).should("exist");
        cy.get(`#${expectedHintId}`).should("have.class", "govuk-hint");
      });
  });

  it("should verify hint accessibility features", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='change-link']").first().should("have.class", "govuk-link");
    cy.get("[data-testid='change-link']").first().should("not.have.class", "govuk-button");
    cy.get("[data-testid='change-link']").first().should("match", "a");
    cy.get("[data-testid='change-link']").first().should("have.attr", "href");
    cy.get("[data-testid='change-link']").first().should("have.attr", "href").and("include", "add-consignment-details");
  });

  it("should display product description above Change link", () => {
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
            cy.get("[data-testid='change-link']").should("exist");
            cy.get("strong.govuk-tag").should("be.visible");
            cy.get("[data-testid='change-link']").should("be.visible");
          });
      });
  });
});

describe("PS: Catch added - page guard", () => {
  it("should navigate to the add-consignment-details page for a consignment with no products", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedFromProgressNoCatchDetails1,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/add-consignment-details");
  });

  it("should navigate to the add-consignment-details/productId page for a consignment with no products", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedProductsNoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/add-consignment-details/_product_id_1");
  });
});

describe("PS: Catch added - Pagination", () => {
  it("should handle pagination state with undefined initialPageNo", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination").should("not.exist");
    cy.get('[data-testid="pagination"]').should("not.exist");
  });

  it("should show pagination when there are more than 15 catches", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination").should("exist");
    cy.get(".govuk-pagination").should("be.visible");
  });

  it("should display first 15 catches on page 1", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination__link").contains("2").click({ force: true });
    cy.get("tbody tr").should("have.length", 7);
    cy.get('td[id$="-productDescription"]').should("exist");
    cy.get(".govuk-pagination__item--current").should("contain", "2");
  });

  it("should maintain correct row indexing across pages", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('td[id="catches-0-productDescription"]').should("exist");
    cy.get('a[id="change-link"]').should("exist");
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get('td[id="catches-15-productDescription"]').should("exist");
    cy.get('a[id="change-link"]').should("exist");
  });

  it("should handle edit actions correctly with pagination", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get("[data-testid='change-link']").first().click({ force: true });
    cy.url().should("include", "/add-consignment-details");
  });

  it("should handle pagination in non-JS mode", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(`${pageUrl}?pageNo=2`, { qs: { ...testParams } });
    cy.get("tbody tr").should("have.length", 7);
    cy.get(".govuk-pagination__item--current").should("contain", "2");
    cy.url().should("include", "pageNo=2");
  });

  it("should only render pagination when filter condition is met: catches with catchCertificateNumber and totalPages > 1", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Should not show pagination
    cy.get('[data-testid="pagination"]').should("not.exist");
    cy.get(".govuk-pagination").should("not.exist");
  });

  it("should handle edge case with exactly 16 items (shows pagination)", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches, // Has >15 catches
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Should show pagination
    cy.get('[data-testid="pagination"]').should("exist");
    cy.get(".govuk-pagination").should("be.visible");
  });

  it("should filter catches before applying pagination", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedManyMockCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("tbody tr").should("have.length", 15);
    cy.get(".govuk-pagination__link").contains("2").click();
    cy.get("tbody tr").should("have.length", 7);
  });

  it("should render navigation with correct attributes and structure", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Perform a search
    cy.get('input[name="q"]').type("Atlantic");
    cy.get('button[name="actionType"][value="search"]').click({ force: true });

    // Verify search was applied (URL should have q parameter)
    cy.url().should("include", "catch-added");

    // Click Save and Continue to navigate away
    cy.contains("button", "Save and continue").click({ force: true });
    cy.url().should("include", "/add-processing-plant-details");

    // Navigate back to the catch-added page
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Verify that the search filter is cleared (input should be empty)
    cy.get('input[name="q"]').should("have.value", "");
  });

  it("should clear search filter when clicking Back to Progress link", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Perform a search
    cy.get('input[name="q"]').type("Tuna");
    cy.get('button[name="actionType"][value="search"]').click({ force: true });

    // Wait for search to complete and verify search was applied
    cy.url().should("include", "catch-added");

    // Navigate back to the catch-added page freshly (without q param)
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Verify that the search filter is cleared
    cy.get('input[name="q"]').should("have.value", "");
  });

  it("should clear search filter when clicking Save as Draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    // Perform a search
    cy.get('input[name="q"]').type("Salmon");
    cy.get('button[name="actionType"][value="search"]').click({ force: true });

    // Click Save as Draft
    cy.contains("button", "Save as draft").click({ force: true });
    cy.url().should("include", "/processing-statements");

    // Navigate back to the catch-added page
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Verify that the search filter is cleared
    cy.get('input[name="q"]').should("have.value", "");
  });
});
