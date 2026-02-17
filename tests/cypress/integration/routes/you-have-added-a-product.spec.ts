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

  it("should redirect to add-product-to-this-consignment when no catches", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDProductAddedNoCatches,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/add-product-to-this-consignment");
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
  });
});
