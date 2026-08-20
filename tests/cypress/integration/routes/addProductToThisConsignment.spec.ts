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

describe("Add product to this consignment: entry document type question", () => {
  const documentUrl = "/create-non-manipulation-document/GBR-2023-SD-83552D3E5";
  const pageUrl = `${documentUrl}/add-product-to-this-consignment/0`;

  it("should always show 'Which entry document did you use?' regardless of UK document selection", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Question is visible with non-UK selected (fixture default)
    cy.contains("Which entry document did you use?").should("be.visible");

    // Still visible after switching to UK
    cy.get(`input[name="docIssuedInUk"][value="uk"]`).click();
    cy.contains("Which entry document did you use?").should("be.visible");
  });

  it("should pre-select the entry document type when an existing value is loaded", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentWithEntryDocumentType,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(`#catches-0-entryDocumentType`).should("be.checked");
    cy.get(`input[name="entryDocumentType"][value="processingStatement"]`).should("not.be.checked");
    cy.get(`input[name="entryDocumentType"][value="storageNotes"]`).should("not.be.checked");
  });

  it("should allow selecting each entry document type option", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(`input[name="entryDocumentType"][value="processingStatement"]`).click();
    cy.get(`input[name="entryDocumentType"][value="processingStatement"]`).should("be.checked");
    cy.get(`#catches-0-entryDocumentType`).should("not.be.checked");

    cy.get(`input[name="entryDocumentType"][value="storageNotes"]`).click();
    cy.get(`input[name="entryDocumentType"][value="storageNotes"]`).should("be.checked");
    cy.get(`input[name="entryDocumentType"][value="processingStatement"]`).should("not.be.checked");
  });

  it("should show Welsh translation for 'Which entry document did you use?'", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
      lng: "cy",
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.contains("Pa ddogfen mynediad wnaethoch chi ei defnyddio?").should("be.visible");
    cy.contains("Tystysgrif dalfa").should("be.visible");
    cy.contains("Datganiad prosesu").should("be.visible");
    cy.contains("Dogfen dim triniaeth").should("be.visible");
  });

  it("should show 'Which entry document did you use?' question without JavaScript (non-JS always renders conditional fields)", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
      disableScripts: true,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Without JS, conditional fields are always rendered (isHydrated = false)
    cy.contains("Which entry document did you use?").should("be.visible");
    cy.get(`input[name="entryDocumentType"][value="catchCertificate"]`).should("exist");
    cy.get(`input[name="entryDocumentType"][value="processingStatement"]`).should("exist");
    cy.get(`input[name="entryDocumentType"][value="storageNotes"]`).should("exist");
    // In non-JS mode, the fallback entry document field is always visible
    cy.get(`input[name="entryDocument"]`).should("exist");
  });

  it("should not show entry document field when no entry document type is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // No option selected initially — entry document field not visible
    cy.get(`input[name="entryDocument"]`).should("not.be.visible");
  });

  it("should show entry document field when Catch certificate is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(`#catches-0-entryDocumentType`).click();
    cy.get(`#catches-0-entryDocumentType`).should("be.checked");
    cy.get(`input[name="entryDocument"]`).filter(":visible").should("exist");
  });

  it("should show entry document field when Processing statement is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(`input[name="entryDocumentType"][value="processingStatement"]`).click();
    cy.get(`input[name="entryDocument"]`).filter(":visible").should("exist");
  });

  it("should show entry document field when Non manipulation document is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(`input[name="entryDocumentType"][value="storageNotes"]`).click();
    cy.get(`input[name="entryDocument"]`).filter(":visible").should("exist");
  });

  it("should pre-populate entry document field when loaded with existing entryDocumentType", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentWithEntryDocumentType,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Fixture has entryDocumentType: "catchCertificate" — field should be visible and pre-filled
    cy.get(`input[name="entryDocument"]`).filter(":visible").should("exist");
  });
});

describe("Add product to this consignment: entry document type error", () => {
  const documentUrl = "/create-non-manipulation-document/GBR-2023-SD-83552D3E5";
  const pageUrl = `${documentUrl}/add-product-to-this-consignment/0`;

  it("should show error in summary and above radio group when no entry document type is selected for non-UK document", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentEntryDocumentTypeRequired,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Select non-UK to make the question visible, then submit
    cy.get(`input[name="docIssuedInUk"][value="non_uk"]`).click();
    cy.get("[data-testid*='save-and-continue']").eq(0).click();

    cy.get("#error-summary-title").should("contain.text", "There is a problem");
    cy.contains("a", "Select which entry document you used").should("be.visible");
    cy.get(".govuk-error-message").should("contain.text", "Select which entry document you used");
  });

  it("should show Welsh error message when no entry document type is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentEntryDocumentTypeRequired,
      lng: "cy",
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(`input[name="docIssuedInUk"][value="non_uk"]`).click();
    cy.get("[data-testid*='save-and-continue']").eq(0).click();

    cy.get("#error-summary-title").should("be.visible");
    cy.get(".govuk-error-message").contains("Dewiswch pa ddogfen mynediad a ddefnyddioch chi");
  });

  it("should not show entry document type error when 'Yes' (UK) is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentEntryDocumentTypeRequired,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Question is always visible — but the error element should not exist without submitting
    cy.get(`input[name="docIssuedInUk"][value="uk"]`).click();
    cy.contains("Which entry document did you use?").should("be.visible");
    cy.get("#entryDocumentType-error").should("not.exist");
  });
});
