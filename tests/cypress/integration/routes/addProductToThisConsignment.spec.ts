import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-non-manipulation-document/GBR-2023-SD-83552D3E5";
const pageUrl = `${documentUrl}/add-product-to-this-consignment/0`;

describe("Add product to this consignment  page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should show Remove and Add Another buttons correctly based on selection length", () => {
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete"); // Adding a wait to ensure the button is interactable
    for (let i = 0; i < 4; i++) {
      cy.get("#add-supporting-doc-button").click();
      cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");
    }
    // Check Remove button exists on the last element
    cy.get('input[id^="catches-0-supportingDocuments-"]').should("have.length.greaterThan", 0);
    cy.get("#remove-supporting-doc-button-0").should("exist");
    cy.get("#remove-supporting-doc-button-1").should("exist");
    cy.get("#remove-supporting-doc-button-2").should("exist");
    cy.get("#remove-supporting-doc-button-3").should("exist");
    cy.get("#remove-supporting-doc-button-4").should("exist");

    // Verify we have exactly 5 supporting documents (maximum allowed)
    cy.get('input[id^="catches-0-supportingDocuments-"]').should("have.length", 5);

    // Check Add Another button exists on the last element until length is 5
    cy.get('input[id^="catches-0-supportingDocuments-"]').then(($elements) => {
      const length = $elements.length;
      if (length < 5) {
        cy.get('input[id^="catches-0-supportingDocuments-"]').should("have.length.greaterThan", 0);
      } else {
        cy.get("#catches-0-supportingDocuments-4").within(() => {
          cy.get("#add-supporting-doc-button").should("not.exist");
        });
      }
    });
  });

  it("should show Remove and Add Another buttons correctly", () => {
    cy.get("#catches-0-supportingDocuments-0").should("be.visible").and("not.be.disabled");
    cy.get("#add-supporting-doc-button").should("exist");
    cy.get("#remove-supporting-doc-button-0").should("not.exist");
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete"); // Adding a wait to ensure the button is interactable
    cy.get("#add-supporting-doc-button").click();
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#remove-supporting-doc-button-0").should("exist");
    cy.get("#remove-supporting-doc-button-1").should("exist");
    cy.get("#add-supporting-doc-button").should("exist");
    cy.get("#add-supporting-doc-button").click();
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");
    cy.get("#catches-0-supportingDocuments-2").should("exist");
    cy.get("#remove-supporting-doc-button-0").should("exist");
    cy.get("#remove-supporting-doc-button-1").should("exist");
    cy.get("#remove-supporting-doc-button-2").should("exist");
  });
  it("should remove the last doc and update selectedSupportingDocuments", () => {
    cy.get("#add-supporting-doc-button").should("exist");
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete"); // Adding a wait to ensure the button is interactable
    cy.get("#add-supporting-doc-button").click();
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");
    cy.get("#add-supporting-doc-button").click();
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");
    cy.get("#add-supporting-doc-button").click();
    cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");
    cy.get('input[id^="catches-0-supportingDocuments-"]').should("have.length", 4);
    cy.get("#remove-supporting-doc-button-0").should("be.visible");
    cy.get("#remove-supporting-doc-button-0").click();
    cy.document({ timeout: 300 }).its("readyState").should("eq", "complete");
    cy.get('input[id^="catches-0-supportingDocuments-"]').should("have.length", 3);
  });

  describe("Accessibility", () => {
    it("should have proper accessibility attributes for additional supporting document fields", () => {
      // Add second supporting document
      cy.get("#add-supporting-doc-button").click();
      cy.document({ timeout: 300 }).its("readyState").should("eq", "complete");

      // Second field should have aria-label but no aria-describedby
      cy.get("#catches-0-supportingDocuments-1").should("have.attr", "aria-label", "catches-0-supportingDocuments-1");
      cy.get("#catches-0-supportingDocuments-1").should("not.have.attr", "aria-describedby");

      // Third field should also have aria-label
      cy.get("#add-supporting-doc-button").click();
      cy.document({ timeout: 300 }).its("readyState").should("eq", "complete");
      cy.get("#catches-0-supportingDocuments-2").should("have.attr", "aria-label", "catches-0-supportingDocuments-2");
      cy.get("#catches-0-supportingDocuments-2").should("not.have.attr", "aria-describedby");
    });

    it("should not reference non-existent hint IDs in aria-describedby for additional fields", () => {
      // Add multiple supporting documents
      for (let i = 0; i < 3; i++) {
        cy.get("#add-supporting-doc-button").click();
        cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");
      }

      // Check that fields 1-3 do not have aria-describedby with invalid IDs
      for (let i = 1; i < 4; i++) {
        const fieldId = `#catches-0-supportingDocuments-${i}`;
        cy.get(fieldId).then(($field) => {
          const ariaDescribedBy = $field.attr("aria-describedby");
          if (ariaDescribedBy) {
            // If aria-describedby exists, the referenced element should exist
            cy.get(`#${ariaDescribedBy}`).should("exist");
          }
        });
      }
    });
  });
});

describe("Add product to this consignment page: comprehensive coverage tests", () => {
  it("should allow adding multiple supporting documents", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#add-supporting-doc-button").should("be.visible");
    cy.get('input[id^="catches-0-supportingDocuments-"]')
      .its("length")
      .then((initialCount) => {
        cy.get("#add-supporting-doc-button").click();
        cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");
        cy.get("#catches-0-supportingDocuments-1").should("exist");

        cy.get("#add-supporting-doc-button").click();
        cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");
        cy.get("#catches-0-supportingDocuments-2").should("exist");

        cy.get('input[id^="catches-0-supportingDocuments-"]').should("have.length", initialCount + 2);
      });
  });
});
