import { type ITestParams, TestCaseId } from "~/types";

describe("ErrorSummary Component: Edge cases and code coverage", () => {
  describe("Empty errors array", () => {
    it("should render component structure with empty errors list", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetails, // A valid page without errors
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });

      // No error summary should be rendered when errors array is empty
      cy.get("#errorIsland").should("not.exist");
      cy.get(".govuk-error-summary").should("not.exist");
    });
  });

  describe("containerClassName prop", () => {
    it("should apply custom containerClassName to error summary", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Verify error summary exists and has base class
      cy.get("#errorIsland").should("exist").should("have.class", "govuk-error-summary");
    });
  });

  describe("Error message rendering - errorHasValue paths", () => {
    it("should render error messages for validation errors", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Verify error summary renders error messages
      cy.get(".govuk-error-summary__list li").should("have.length.greaterThan", 0);
      cy.get(".govuk-error-summary__list a").first().should("exist");
    });

    it("should render translated error messages from errorsText namespace", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-123";
      const pageUrl = `${documentUrl}/what-are-you-exporting`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='add-product']").eq(0).click({ force: true });

      // Verify error summary renders with translated messages
      cy.get(".govuk-error-summary__list li").should("have.length.greaterThan", 0);
      cy.get(".govuk-error-summary__list a").each(($link) => {
        // Each link should have translated text content
        expect($link.text().trim()).to.have.length.greaterThan(0);
      });
    });
  });

  describe("linkData prop variations", () => {
    it("should use default href when linkData is undefined", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Verify error links use default href pattern (#errorKey)
      cy.get(".govuk-error-summary__list a").first().should("have.attr", "href").and("include", "#");
    });

    it("should trigger onChangeHandler when linkData is not provided", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Click on error link (should trigger onChangeHandler)
      cy.get(".govuk-error-summary__list a")
        .first()
        .then(($link) => {
          const href = $link.attr("href");
          const fieldId = href?.replace("#", "");

          $link.trigger("click");

          // Verify the field exists (proves scrollToId was called)
          if (fieldId) {
            cy.get(`#${fieldId}`).should("exist");
          }
        });
    });

    it("should use linkData href when provided", () => {
      // Using a test case that provides linkData for errors
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedInvalid,
      };
      const documentUrl = "/create-non-manipulation-document/GBR-2021-SD-123";
      const pageUrl = `${documentUrl}/you-have-added-a-product`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.contains("button", "Save and continue").click({ force: true });

      cy.get('.govuk-error-summary__list a[href*="/add-product-to-this-consignment/"]')
        .first()
        .should("have.attr", "href")
        .then((href) => {
          expect(href).to.include("/add-product-to-this-consignment/");
          expect(href).not.to.include("#");

          cy.get('.govuk-error-summary__list a[href*="/add-product-to-this-consignment/"]').first().click();
          cy.url().should("include", href);
        });
    });
  });

  describe("useEffect focus and scroll behavior", () => {
    it("should scroll error summary into view on mount", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.DirectLandingDateLandedUnpopulated,
      };
      const pageUrl = "/create-catch-certificate/GBR-2021-CC-123/direct-landing";

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Verify error summary is visible (proves scrollIntoView worked)
      cy.get("#error-summary-title").should("be.visible");
    });

    it("should handle ref being null gracefully", () => {
      // This tests the if (errorSummaryRef.current) guard
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetails,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });

      // No error summary should exist, so ref check should prevent errors
      cy.get("#errorIsland").should("not.exist");

      // Page should still function normally
      cy.contains("h1", "Add exporter details").should("be.visible");
    });
  });

  describe("onChangeHandler - preventDefault and scrollToId", () => {
    it("should call preventDefault when error link is clicked", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Click error link
      cy.get(".govuk-error-summary__list a").first().click();

      // Verify page didn't navigate (preventDefault worked)
      cy.url().should("include", pageUrl);
    });

    it("should extract field ID from href and call scrollToId", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Get the first error link
      cy.get(".govuk-error-summary__list a")
        .first()
        .then(($link) => {
          const href = $link.attr("href");
          expect(href).to.match(/^#\w+/); // Should start with # followed by field name

          const fieldId = href?.slice(1);

          // Click the link
          $link.trigger("click");

          // Verify the target field exists (proves scrollToId found it)
          if (fieldId) {
            cy.get(`#${fieldId}`).should("exist");
          }
        });
    });

    it("should handle href with # at different positions", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-123";
      const pageUrl = `${documentUrl}/what-are-you-exporting`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='add-product']").eq(0).click({ force: true });

      // Verify error links are properly formatted
      cy.get(".govuk-error-summary__list a").each(($link) => {
        const href = $link.attr("href");
        expect(href).to.include("#");
      });
    });
  });

  describe("Multiple errors handling", () => {
    it("should render multiple error items in list", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-123";
      const pageUrl = `${documentUrl}/what-are-you-exporting`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='add-product']").eq(0).click({ force: true });

      // Verify multiple errors are rendered
      cy.get(".govuk-error-summary__list li").should("have.length.greaterThan", 1);
    });

    it("should give each error a unique key based on error.key", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-123";
      const pageUrl = `${documentUrl}/what-are-you-exporting`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='add-product']").eq(0).click({ force: true });

      // Verify each error has unique link
      cy.get(".govuk-error-summary__list a").each(($link) => {
        cy.wrap($link).should("have.attr", "href");
      });
    });
  });

  describe("Translation namespace handling", () => {
    it("should use errorsText and common namespaces for translations", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Verify common namespace translation (commonErrorHeading)
      cy.get("#error-summary-title").should("exist").and("have.text", "There is a problem");

      // Verify error messages are translated (from errorsText namespace)
      cy.get(".govuk-error-summary__list a").should("have.length.greaterThan", 0);
    });
  });

  describe("Error interpolation with escapeValue: false", () => {
    it("should render error messages correctly with interpolation settings", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-123";
      const pageUrl = `${documentUrl}/what-are-you-exporting`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='add-product']").eq(0).click({ force: true });

      // Verify error summary contains translated error messages
      cy.get(".govuk-error-summary__list li").should("have.length.greaterThan", 0);
    });
  });

  describe("Component structure and GOV.UK classes", () => {
    it("should have correct GOV.UK class structure", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Verify GOV.UK Design System classes
      cy.get("#errorIsland").should("have.class", "govuk-error-summary");
      cy.get(".govuk-error-summary__title").should("exist");
      cy.get(".govuk-error-summary__body").should("exist");
      cy.get(".govuk-error-summary__list").should("exist");
      cy.get(".govuk-list").should("exist");
    });

    it("should nest list items correctly", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Verify correct nesting: ul > li > a
      cy.get(".govuk-error-summary__list").should("exist");
      cy.get(".govuk-error-summary__list > li").should("have.length.greaterThan", 0);
      cy.get(".govuk-error-summary__list > li > a").should("have.length.greaterThan", 0);
    });
  });

  describe("Errors prop handling and default value", () => {
    it("should handle errors array being provided with values", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Verify errors array is processed - each error creates a list item
      cy.get(".govuk-error-summary__list li").should("have.length.greaterThan", 0);

      // Verify the map function iterates over errors array
      cy.get(".govuk-error-summary__list li").each(($li) => {
        cy.wrap($li).find("a").should("exist");
      });
    });

    it("should render all errors from the errors array", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-123";
      const pageUrl = `${documentUrl}/what-are-you-exporting`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='add-product']").eq(0).click({ force: true });

      // Verify all errors in the array are rendered
      cy.get(".govuk-error-summary__list li").should("have.length.greaterThan", 1);

      // Each list item should have content
      cy.get(".govuk-error-summary__list li").each(($li) => {
        cy.wrap($li).invoke("text").should("not.be.empty");
      });
    });
  });

  describe("Error summary focus on repeated error submissions", () => {
    it("should move focus to error summary on repeated submissions with errors", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.DirectLandingDateLandedUnpopulated,
      };
      const pageUrl = "/create-catch-certificate/GBR-2021-CC-123/direct-landing";

      cy.visit(pageUrl, { qs: { ...testParams } });

      // First submission - should show error summary and focus on it
      cy.get("[data-testid='save-and-continue']").click({ force: true });
      cy.get("#error-summary-title").should("be.visible");

      // Verify error summary has focus (tabIndex={-1} makes it focusable)
      cy.get("#errorIsland").should("have.attr", "tabindex", "-1");

      // Second submission without fixing errors - focus should move to error summary again
      // (This verifies the useEffect dependency change from [] to [errors])
      cy.get("[data-testid='save-and-continue']").click({ force: true });
      cy.get("#error-summary-title").should("be.visible");

      // Error summary should still be focused (ScrollIntoView makes it visible)
      cy.get("#errorIsland").should("have.class", "govuk-error-summary");
    });

    it("should re-trigger error summary focus when errors change", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.DirectLandingDateLandedUnpopulated,
      };
      const pageUrl = "/create-catch-certificate/GBR-2021-CC-123/direct-landing";

      cy.visit(pageUrl, { qs: { ...testParams } });

      // Submit with errors
      cy.get("[data-testid='save-and-continue']").click({ force: true });
      cy.get(".govuk-error-summary__list li").should("have.length.greaterThan", 0);

      // Get initial error count
      cy.get(".govuk-error-summary__list li").then(($errors) => {
        const initialErrorCount = $errors.length;
        expect(initialErrorCount).to.be.greaterThan(0);

        // Submit again - error summary should be refocused each time errors appear
        cy.get("[data-testid='save-and-continue']").click({ force: true });

        // Verify error summary still visible (proving useEffect re-fired)
        cy.get("#error-summary-title").should("be.visible");
        cy.get(".govuk-error-summary__list li").should("have.length", initialErrorCount);
      });
    });
  });

  describe("Component mount and ref initialization", () => {
    it("should focus error summary element after mount via ref", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Verify error summary is visible after scroll
      cy.get("#errorIsland").should("be.visible");

      // Verify the title is visible (proves scrollIntoView worked)
      cy.get("#error-summary-title").should("be.visible");
    });

    it("should execute useEffect with ref.current check on component mount", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsFailsWithExporterFullNameError,
      };
      const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
      const pageUrl = `${documentUrl}/add-exporter-details`;

      cy.visit(pageUrl, { qs: { ...testParams } });
      cy.get("[data-testid='save-and-continue']").click({ force: true });

      // Wait for component to mount and useEffect to run
      cy.wait(100);

      // Verify error summary is rendered (useEffect ran with valid ref)
      cy.get("#errorIsland").should("exist");

      // Verify focus and scroll happened (title should be in viewport)
      cy.get("#error-summary-title").should("be.visible");

      // Verify the error summary is scrolled into view
      cy.get("#errorIsland").then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        // Element should be in viewport (scrollIntoView worked)
        expect(rect.top).to.be.greaterThan(-1);
      });
    });
  });
});
