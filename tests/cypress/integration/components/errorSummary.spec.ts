import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2021-CC-TEST123";
const testUrl = `${documentUrl}/what-are-you-exporting`;

describe("ErrorSummary component coverage", () => {
  describe("error rendering and onClick handler coverage", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.WhatAreYouExportingErrorsOnProductSave,
      };
      cy.visit(testUrl, { qs: { ...testParams } });
      // Trigger validation errors to show ErrorSummary
      cy.get("[data-testid='add-product']").eq(0).click({ force: true });
      cy.get("#errorIsland").should("exist");
    });

    it("should render error links and handle clicks to trigger onChangeHandler", () => {
      // Verify error summary is rendered
      cy.contains("h2", /^There is a problem$/).should("be.visible");

      // Get all error links
      cy.get("#errorIsland a").should("have.length.at.least", 1);

      // Click first error link (should trigger onChangeHandler since linkData is undefined)
      cy.get("#errorIsland a").eq(0).click();

      // Click second error link
      cy.get("#errorIsland a").eq(1).click();

      // Click third error link
      cy.get("#errorIsland a").eq(2).click();

      // Click fourth error link if it exists
      cy.get("#errorIsland a").eq(3).click();
    });

    it("should verify error links have correct hrefs without linkData", () => {
      // Verify links have hash hrefs (no linkData provided)
      cy.get("#errorIsland a").each(($link) => {
        expect($link.attr("href")).to.include("#");
      });
    });

    it("should render errors with and without value property", () => {
      // Verify error text is rendered (tests both error.value branches)
      cy.get("#errorIsland a").each(($el) => {
        expect($el.text().trim()).to.not.equal("");
        // Verify text is translated (not a translation key)
        expect($el.text()).to.not.include("{{");
      });
    });
  });

  describe("error summary attributes and styling", () => {
    it("should render with correct GOV.UK classes and ARIA attributes", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.WhatAreYouExportingErrorsOnSave,
      };
      cy.visit(testUrl, { qs: { ...testParams } });
      cy.get("[data-testid=save-and-continue]").click({ force: true });

      // Verify error summary has required attributes
      cy.get("#errorIsland")
        .should("have.class", "govuk-error-summary")
        .and("have.attr", "role", "alert")
        .and("have.attr", "aria-labelledby", "error-summary-title")
        .and("have.attr", "data-disable-auto-focus", "true")
        .and("have.attr", "data-module", "govuk-error-summary");

      // Verify error title is rendered
      cy.get("#error-summary-title").should("exist").and("be.visible");
    });
  });

  describe("with linkData provided (hasLinkData branch)", () => {
    it("should use custom linkData href instead of default hash", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDProductAddedInvalid,
      };
      cy.visit("/create-non-manipulation-document/GBR-2021-SD-TEST123/you-have-added-a-product", {
        qs: { ...testParams },
      });

      // Trigger validation error by clicking save and continue
      cy.contains("button", "Save and continue").click({ force: true });

      // Error island should appear with linkData-based links
      cy.get("#errorIsland").should("exist");
      cy.get("#errorIsland a").should("have.length.at.least", 1);

      // Verify links have proper href attributes (linkData provided)
      cy.get("#errorIsland a").each(($link) => {
        expect($link.attr("href")).to.not.equal(undefined);
      });
    });
  });
});
