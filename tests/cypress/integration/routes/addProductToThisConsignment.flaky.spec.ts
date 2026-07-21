import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-non-manipulation-document/GBR-2023-SD-83552D3E5";
const pageUrl = `${documentUrl}/add-product-to-this-consignment/0`;

describe("Add product to this consignment  page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  describe("Accessibility", () => {
    it("should not reference non-existent hint IDs in aria-describedby for additional fields", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
      };
      cy.visit(pageUrl, { qs: { ...testParams } });

      // Add multiple supporting documents
      for (let i = 1; i < 4; i++) {
        cy.get("#add-supporting-doc-button").click();
        cy.get(`#catches-0-supportingDocuments-${i}`).should("exist");
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
    cy.get('input[id^="catches-0-supportingDocuments-"]').should("have.length", 1);

    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-1").should("exist");

    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-2").should("exist");

    cy.get('input[id^="catches-0-supportingDocuments-"]').should("have.length", 3);
  });
});
