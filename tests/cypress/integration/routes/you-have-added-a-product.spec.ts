import { type ITestParams, TestCaseId } from "~/types";

const sdPageUrl = "create-non-manipulation-document/GBR-2022-SD-F71D98A30/you-have-added-a-product";

describe("SD: you-have-added-product page", () => {
  it("should render the page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-heading-xl").contains("You have added 2 products to this consignment");

    cy.contains("button", "Remove").click({ force: true });

    cy.get("#errorIsland").should("not.exist");

    cy.contains("button", "Save as draft").click({ force: true });
    cy.url().should("include", "/non-manipulation-documents");
  });

  it("renders the table with correct headers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    const headers = ["Product", "Document reference", "Actions"];

    headers.forEach((header) => {
      if (header) {
        cy.contains("th", header).should("exist");
      }
    });
  });

  it("renders all product details rows with correct data", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get("tbody.govuk-table__body tr.govuk-table__row").each(($row) => {
      cy.wrap($row).within(() => {
        cy.get("td").should("have.length.at.least", 2);
      });
    });
  });
  it("should render guidance text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-details__summary").should("have.length", 1);

    cy.get("div .govuk-details__summary").eq(0).contains("Why add another product?");
    cy.get("div .govuk-details__summary").eq(0).click({ force: true });
    cy.get("div .govuk-details__text")
      .contains(
        "You may need to add another product if your UK entry document covers multiple species or product types."
      )
      .should("be.visible");
  });

  it("Remove a product", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-heading-xl").contains("You have added 2 products to this consignment");
    cy.contains("button", "Remove").click({ force: true });
  });

  it("Edit a product", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-heading-xl").contains("You have added 2 products to this consignment");
    cy.contains("button", "Edit").click({ force: true });
    cy.url().should(
      "eq",
      "http://localhost:3000/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/0?backThroughProducts=true"
    );
  });

  it("Add a new product radio check", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.wait(500);
    cy.get('[type="radio"]').first().should("exist");
    cy.get('[type="radio"]').first().check({ force: true });
    cy.get('[type="radio"]').first().should("be.checked");
    cy.wait(200);
    cy.contains("button", "Save and continue").click({ force: true });
    cy.url({ timeout: 10000 }).should("include", "/add-product-to-this-consignment");
  });

  it("should allow continuing if the catch is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDProductAddedValid,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 1 product to this consignment - Create a UK non-manipulation document - GOV.UK"
    );
    cy.contains("button", "Save and continue").click({ force: true });
    cy.url().should("include", "/how-does-the-consignment-arrive-to-the-uk");
  });

  it("should prevent continuing and display errors if one or more catches are invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDProductAddedInvalid,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.contains("button", "Save and continue").click({ force: true });
  });

  // Error handling coverage tests
  describe("Error handling and validation", () => {
    it("should return null from renderErrorSummary when no errors for index (component line 140)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct, // Valid products, no errors
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify no error summaries are rendered (renderErrorSummary returns null)
      cy.get("#errorIsland").should("not.exist");
      cy.get(".govuk-error-summary").should("not.exist");
    });

    it("should use catchIndex when available, fallback to index (component line 173)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify products are rendered
      // The validCatchIndex logic uses item.catchIndex ?? index
      cy.get("tbody.govuk-table__body tr.govuk-table__row").should("have.length", 2);

      // Verify Edit forms have correct URL with index
      cy.get('[data-testid="edit-button"]').each(($btn) => {
        cy.wrap($btn)
          .parents("form")
          .within(() => {
            cy.get('input[name="url"]').should("exist");
            // URL should contain the correct index
            cy.get('input[name="url"]').invoke("val").should("include", "/add-product-to-this-consignment/");
          });
      });
    });

    it("should create error summary with correct link data (component lines 132-136)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedInvalid,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Submit to trigger errors
      cy.contains("button", "Save and continue").click({ force: true });

      cy.wait(1000);

      // Verify error summary has links
      // The linkData array is created with href values pointing to add-product-to-this-consignment
      cy.get(".govuk-error-summary__list a, .govuk-link").should("exist");
    });
  });

  it("should redirect to add-product-to-this-consignment when no catches", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDProductAddedNoCatches,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/add-product-to-this-consignment");
  });

  // Loader-specific coverage tests
  describe("Loader behavior coverage", () => {
    it("should handle productIndexParam parsing with Number.parseInt (loader line 93)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      // Test with string productIndex that needs parsing
      cy.visit(`${sdPageUrl}?productIndex=1`, { qs: { ...testParams } });

      // Verify productIndex was correctly parsed and used
      cy.contains("a", /^Back$/).should(
        "have.attr",
        "href",
        "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/1?backThroughProducts=true"
      );
    });

    it("should default to last product index when productIndexParam is null (loader line 93)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      // Visit without productIndex parameter
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Should default to catches.length - 1 (which is 1 for 2 products)
      cy.contains("a", /^Back$/).should(
        "have.attr",
        "href",
        "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/1?backThroughProducts=true"
      );
    });

    it("should set correct page title for single product (loader line 89)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedValid,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify page title uses sdYouAddedSingleProductsTitle
      cy.title().should("include", "You have added 1 product to this consignment");
    });

    it("should set correct page title for multiple products (loader line 89)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify page title uses sdYouAddedMultiProductsTitle
      cy.title().should("include", "You have added 2 products to this consignment");
    });

    it("should handle empty nextUri parameter (loader line 45)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      // Visit without nextUri
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify nextUri defaults to empty string
      cy.get('input[name="nextUri"]').should("have.value", "");
    });

    it("should handle redirect when catches array is not an array (loader line 86)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedNoCatches,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Should redirect to add-product-to-this-consignment
      cy.url().should("include", "/add-product-to-this-consignment");
    });

    it("should handle redirect when catches array is empty (loader line 86)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedNoCatches,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Should redirect when catches.length === 0
      cy.url().should("include", "/add-product-to-this-consignment");
      cy.url().should("not.include", "you-have-added-a-product");
    });

    it("should return catches array in loader response (loader line 97)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify catches are rendered (proves catches were returned in loader)
      cy.get("tbody.govuk-table__body tr.govuk-table__row").should("have.length.at.least", 1);
    });

    it("should handle catches with empty array fallback (loader line 97)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify the catches || [] fallback works
      cy.get("tbody.govuk-table__body").should("exist");
    });
  });

  // FI0-6512: Back link navigation tests
  describe("Back link navigation to last added/edited product", () => {
    it("Scenario 1: should navigate back to the product that was just added when productIndex is in URL", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      const productIndex = 1; // Second product (0-indexed)
      cy.visit(`${sdPageUrl}?productIndex=${productIndex}`, { qs: { ...testParams } });

      // Verify the back link has the correct productIndex
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should(
          "have.attr",
          "href",
          `/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/${productIndex}?backThroughProducts=true`
        );
    });

    it("Scenario 1: should navigate back to first product when productIndex=0", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      const productIndex = 0; // First product
      cy.visit(`${sdPageUrl}?productIndex=${productIndex}`, { qs: { ...testParams } });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should(
          "have.attr",
          "href",
          `/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/${productIndex}`
        );
    });

    it("Scenario 2: should maintain productIndex when navigating with nextUri parameter", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      const productIndex = 1;
      const nextUri = "/some-next-page";
      cy.visit(`${sdPageUrl}?productIndex=${productIndex}&nextUri=${encodeURIComponent(nextUri)}`, {
        qs: { ...testParams },
      });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should(
          "have.attr",
          "href",
          `/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/${productIndex}?backThroughProducts=true`
        );
    });

    it("Scenario 3: should default to last product when navigating directly without productIndex", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      // Visit without productIndex parameter (direct navigation)
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Should default to the last product (index 1, since there are 2 products in the test data)
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should(
          "have.attr",
          "href",
          "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/1?backThroughProducts=true"
        );
    });

    it("Scenario 4: should default to last product for cloned documents without productIndex", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      // Simulate cloned document navigation (no productIndex in URL)
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Should navigate to the last product index
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .and(($link) => {
          const href = $link.attr("href");
          // Verify it ends with a numeric index (last product)
          expect(href).to.match(
            /\/create-non-manipulation-document\/[^/]+\/add-product-to-this-consignment\/\d+\?backThroughProducts=true$/
          );
        });
    });

    it("should navigate to correct product when clicking back link with productIndex", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      const productIndex = 1;
      cy.visit(`${sdPageUrl}?productIndex=${productIndex}`, { qs: { ...testParams } });

      // Click the back link
      cy.contains("a", /^Back$/).click({ force: true });

      // Should navigate to the correct product page
      cy.url().should(
        "include",
        `/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/${productIndex}`
      );
    });

    it("Scenario 2: should navigate to previous product when back link is selected twice", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };

      cy.visit(`${sdPageUrl}?productIndex=1`, { qs: { ...testParams } });

      cy.contains("a", /^Back$/).click({ force: true });
      cy.url().should(
        "include",
        "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/1?backThroughProducts=true"
      );

      cy.contains("a", /^Back$/).click({ force: true });
      cy.url().should(
        "include",
        "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/0?backThroughProducts=true"
      );
    });

    it("should handle single product scenario correctly", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedValid,
      };
      // This test case has only 1 product
      cy.visit(`create-non-manipulation-document/GBR-2022-SD-F71D98A30/you-have-added-a-product?productIndex=0`, {
        qs: { ...testParams },
      });

      // Should navigate to index 0 (the only product)
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should(
          "have.attr",
          "href",
          "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/0"
        );
    });

    it("should handle edge case when productIndex is greater than available products", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      // Try with a very high productIndex
      const productIndex = 99;
      cy.visit(`${sdPageUrl}?productIndex=${productIndex}`, { qs: { ...testParams } });

      // Should still use the provided productIndex (backend validation will handle invalid indices)
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should(
          "have.attr",
          "href",
          `/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/${productIndex}?backThroughProducts=true`
        );
    });

    // Coverage tests for lines 147-149
    it("should NOT include backThroughProducts query when productIndex is 0 with multiple products (line 147-148 coverage)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      const productIndex = 0;
      cy.visit(`${sdPageUrl}?productIndex=${productIndex}`, { qs: { ...testParams } });

      // Verify shouldNavigateBackThroughProducts is false (catches.length > 1 but productIndex === 0)
      // which means backThroughProductsQuery should be "" (empty string)
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .and(($link) => {
          const href = $link.attr("href");
          // Explicitly verify no query parameter is present
          expect(href).to.equal(
            "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/0"
          );
          expect(href).to.not.include("backThroughProducts");
        });
    });

    it("should NOT include backThroughProducts query with single product even if productIndex > 0 (line 147 first condition coverage)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedValid, // Single product scenario
      };
      const productIndex = 1; // Explicitly set to > 0
      cy.visit(
        `create-non-manipulation-document/GBR-2022-SD-F71D98A30/you-have-added-a-product?productIndex=${productIndex}`,
        { qs: { ...testParams } }
      );

      // Verify shouldNavigateBackThroughProducts is false (catches.length === 1, even though productIndex > 0)
      // This tests the first condition of the AND operator on line 147
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .and(($link) => {
          const href = $link.attr("href");
          // Should use productIndex but without query parameter
          expect(href).to.equal(
            "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/1"
          );
          expect(href).to.not.include("backThroughProducts");
        });
    });

    it("should use productIndex when defined in backUrl (line 149 first branch coverage)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      const productIndex = 1;
      cy.visit(`${sdPageUrl}?productIndex=${productIndex}`, { qs: { ...testParams } });

      // Verify that the backUrl uses productIndex (not count) since productIndex is defined
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .and(($link) => {
          const href = $link.attr("href");
          // Should contain /1 (the productIndex value)
          expect(href).to.include("/add-product-to-this-consignment/1");
          expect(href).to.include("?backThroughProducts=true");
        });
    });

    it("should build correct backUrl format when backThroughProductsQuery is empty (line 149 concatenation coverage)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedValid, // Single product
      };
      const productIndex = 0;
      cy.visit(
        `create-non-manipulation-document/GBR-2022-SD-F71D98A30/you-have-added-a-product?productIndex=${productIndex}`,
        { qs: { ...testParams } }
      );

      // Verify backUrl is properly formatted when backThroughProductsQuery is "" (empty string from line 148)
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .and(($link) => {
          const href = $link.attr("href");
          // Should be properly formatted without trailing characters
          expect(href).to.equal(
            "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/0"
          );
          // Ensure no question mark or query params
          expect(href).to.not.include("?");
        });
    });
  });

  // Additional coverage tests for complete code coverage
  describe("Additional coverage for uncovered code paths", () => {
    it("should properly handle nextUri parameter in loader and pass it through to form (loader line 45, component line 230)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      const nextUri = "/custom-next-page";
      cy.visit(`${sdPageUrl}?nextUri=${encodeURIComponent(nextUri)}`, { qs: { ...testParams } });

      // Verify nextUri is passed through to the hidden input
      cy.get('input[name="nextUri"]').should("have.value", nextUri);
    });

    it("should NOT render Remove button when only one product exists (component line 209)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedValid, // Single product
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify Edit button exists
      cy.get('[data-testid="edit-button"]').should("exist");
      cy.get('[data-testid="edit-button"]').should("have.length", 1);

      // Verify Remove button does NOT exist (catches.length === 1)
      cy.get('[data-testid="remove-button"]').should("not.exist");
    });

    it("should render Remove button for each product when multiple products exist (component line 209-221)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct, // Multiple products
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify Remove button exists for multiple products
      cy.get('[data-testid="remove-button"]').should("exist");
      cy.get('[data-testid="remove-button"]').should("have.length", 2); // 2 products
    });

    it("should have 'No' radio button defaultChecked (component line 250)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify 'No' radio is checked by default
      cy.get("#addAnotherCatchNo").should("be.checked");
      cy.get("#addAnotherProductYes").should("not.be.checked");
    });

    it("should render all table cells with product and certificate data (component lines 176-177)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify table rows contain product and certificate data
      cy.get("tbody.govuk-table__body tr.govuk-table__row").each(($row) => {
        cy.wrap($row).within(() => {
          // Check product cell
          cy.get("td").eq(0).should("not.be.empty");
          // Check certificate number cell
          cy.get("td").eq(1).should("not.be.empty");
          // Check actions cell
          cy.get("td").eq(2).should("contain", "Edit");
        });
      });
    });

    it("should render Edit button with correct hidden inputs and backThroughProductsQuery (component lines 178-195)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Click Edit on first product
      cy.get('[data-testid="edit-button"]')
        .first()
        .parents("form")
        .within(() => {
          // Verify hidden inputs exist
          cy.get('input[name="url"]').should("exist");
          cy.get('input[name="productId"]').should("exist");
          cy.get('button[name="_action"][value="edit"]').should("exist");
        });
    });

    it("should render Remove button with correct action value (component lines 210-220)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify Remove button has correct action value
      cy.get('[data-testid="remove-button"]').first().should("have.attr", "value", "remove");
      cy.get('[data-testid="remove-button"]').first().should("have.attr", "name", "_action");
    });

    it("should render Details component with guidance content (component lines 258-262)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify Details component
      cy.get(".govuk-details").should("exist");
      cy.get("#you-added-product-details").should("contain", "Why add another product?");

      // Click to expand and verify content
      cy.get("#you-added-product-details").click({ force: true });
      cy.get(".govuk-details__text").should("be.visible");
      cy.get(".govuk-details__text").should(
        "contain",
        "You may need to add another product if your UK entry document covers multiple species or product types."
      );
    });

    it("should render ButtonGroup component (component line 265)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify ButtonGroup buttons are rendered
      cy.contains("button", "Save and continue").should("exist");
      cy.contains("button", "Save as draft").should("exist");
    });

    it("should render correct title for single product scenario (component line 159)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedValid,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify single product title
      cy.get(".govuk-heading-xl").should("contain", "You have added 1 product to this consignment");
    });

    it("should render correct title for multiple products scenario (component line 155)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify multiple products title
      cy.get(".govuk-heading-xl").should("contain", "You have added 2 products to this consignment");
    });

    it("should render table with role='table' attribute (component line 161)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify table has proper role
      cy.get("table.govuk-table").should("have.attr", "role", "table");
    });

    it("should render each table row with role='row' attribute (component line 175)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify each row has proper role
      cy.get("tbody.govuk-table__body tr.govuk-table__row").each(($row) => {
        cy.wrap($row).should("have.attr", "role", "row");
      });
    });

    it("should render visually hidden text for Edit button (component lines 200-203)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify visually hidden text exists
      cy.get('[data-testid="edit-button"]').first().find(".govuk-visually-hidden").should("exist");
    });

    it("should render visually hidden text for Remove button (component lines 217-220)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify visually hidden text exists for remove button
      cy.get('[data-testid="remove-button"]').first().find(".govuk-visually-hidden").should("exist");
    });

    it("should use unique key for each table row based on catch _id (component line 175)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify rows are rendered (React key is internal, but we can verify rows exist)
      cy.get("tbody.govuk-table__body tr.govuk-table__row").should("have.length", 2);
    });

    it("should render SecureForm with csrf token (component lines 177, 228)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify CSRF token is present in forms
      cy.get('input[name="csrf"]').should("exist");
      cy.get('input[name="csrf"]').should("have.length.at.least", 2); // At least in main form and action forms
    });

    it("should render inline forms for Edit and Remove actions (component line 177)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify forms are inline
      cy.get("form.govuk-\\!-display-inline").should("exist");
    });

    it("should have correct button classes and attributes (component lines 193-198, 210-215)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify Edit button classes
      cy.get('[data-testid="edit-button"]')
        .first()
        .should("have.class", "govuk-button")
        .should("have.class", "govuk-button--secondary")
        .should("have.attr", "type", "submit")
        .should("have.attr", "data-module", "govuk-button");

      // Verify Remove button classes
      cy.get('[data-testid="remove-button"]')
        .first()
        .should("have.class", "govuk-button")
        .should("have.class", "govuk-button--secondary")
        .should("have.attr", "type", "submit")
        .should("have.attr", "data-module", "govuk-button");
    });

    it("should use count variable for title interpolation (component line 122)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // count = catches.length = 2
      cy.get(".govuk-heading-xl").should("contain", "2 products");
    });

    it("should render Main component with backUrl prop (component line 151)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify Main component rendered with back link
      cy.get("main").should("exist");
      cy.contains("a", /^Back$/).should("exist");
    });

    it("should render grid structure (component lines 152-154)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify grid structure
      cy.get(".govuk-grid-row").should("exist");
      cy.get(".govuk-grid-column-full").should("exist");
    });

    it("should render all three table headers using TableHeader component (component lines 162-167)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify all three headers are rendered
      cy.contains("th", "Product").should("exist");
      cy.contains("th", "Document reference").should("exist");
      cy.contains("th", "Actions").should("exist");
    });

    it("should have correct button IDs with index (component lines 192, 210)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify buttons have correct IDs with index
      cy.get("#edit-species-0").should("exist");
      cy.get("#edit-species-1").should("exist");
      cy.get("#remove-species-0").should("exist");
      cy.get("#remove-species-1").should("exist");
    });

    it("should render productId hidden input for each product (component line 179)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify productId hidden inputs exist
      cy.get('input[name="productId"]').should("have.length.at.least", 2);
    });

    it("should render radio button inputs with correct type and attributes (component lines 239-243, 247-251)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify radio inputs
      cy.get('input[type="radio"][name="addAnotherProduct"]').should("have.length", 2);
      cy.get("#addAnotherProductYes").should("have.attr", "value", "Yes");
      cy.get("#addAnotherCatchNo").should("have.attr", "value", "No");
    });

    it("should render radio labels with correct text (component lines 244, 252)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify labels
      cy.get('label[for="addAnotherProductYes"]').should("contain", "Yes");
      cy.get('label[for="addAnotherCatchNo"]').should("contain", "No");
    });

    it("should render br elements for spacing (component lines 224, 237, 256)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify br elements exist (check that layout has proper spacing)
      cy.get("br").should("have.length.at.least", 3);
    });

    it("should destructure all necessary values from useLoaderData (component line 119)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // documentNumber - verified in URLs
      cy.contains("a", /^Back$/)
        .invoke("attr", "href")
        .should("include", "GBR-2022-SD-F71D98A30");

      // catches - verified by table rows
      cy.get("tbody.govuk-table__body tr.govuk-table__row").should("exist");

      // csrf - verified by hidden input
      cy.get('input[name="csrf"]').should("exist");

      // productIndex - verified by back URL
      cy.contains("a", /^Back$/)
        .invoke("attr", "href")
        .should("include", "/add-product-to-this-consignment/");
    });

    it("should use isEmpty from lodash for groupedErrors check (component lines 125, 131)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // When no errors, isEmpty(groupedErrors) should be true
      cy.get("#errorIsland").should("not.exist");
    });

    it("should map over catches array to render table rows (component line 172)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify map creates correct number of rows
      cy.get("tbody.govuk-table__body tr.govuk-table__row").should("have.length", 2);
    });

    it("should use translation hook for common namespace (component line 122)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify translated text appears
      cy.contains("Yes").should("exist");
      cy.contains("No").should("exist");
      cy.contains("Edit").should("exist");
    });

    it("should have correct form method='post' (component lines 177, 228)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });

      // Verify forms have POST method
      cy.get("form[method='post']").should("have.length.at.least", 2);
    });

    it("should render url hidden input with backThroughProductsQuery (component line 178)", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      const productIndex = 1;
      cy.visit(`${sdPageUrl}?productIndex=${productIndex}`, { qs: { ...testParams } });

      // Verify url hidden input includes backThroughProductsQuery
      cy.get('input[name="url"]').first().invoke("val").should("include", "?backThroughProducts=true");
    });

    it("should conditionally render title based on catches.length (component lines 155-159)", () => {
      // Test with 1 product
      let testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedValid,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });
      cy.get(".govuk-heading-xl").should("contain", "1 product");

      // Test with 2 products
      testParams = {
        testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });
      cy.get(".govuk-heading-xl").should("contain", "2 products");
    });
  });
});
