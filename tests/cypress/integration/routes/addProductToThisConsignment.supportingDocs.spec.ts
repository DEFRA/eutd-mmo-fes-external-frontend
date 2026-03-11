// Test Intent: Verify supporting document add/remove interactions in both JS-enabled
// (hydrated) and JS-disabled (server-rendered) modes.
// Hydration readiness is signalled by #add-supporting-doc-button being visible,
// eliminating all fixed cy.wait() calls.

import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-non-manipulation-document/GBR-2023-SD-83552D3E5";
const pageUrl = `${documentUrl}/add-product-to-this-consignment/0`;

describe("Add product to this consignment: supporting documents (JS enabled)", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: testParams });
    // Wait for Remix SSR hydration: the Add button only renders after isHydrated=true
    cy.get("#add-supporting-doc-button").should("be.visible");
  });

  it("should display one empty supporting document field on initial load", () => {
    cy.get("#catches-0-supportingDocuments-0").should("be.visible").and("have.value", "");
  });

  it("should display Add button and no Remove button with a single field", () => {
    cy.get("#add-supporting-doc-button").should("exist");
    cy.get('[id^="remove-supporting-doc-button"]').should("not.exist");
  });

  it("should show Remove buttons on both fields after adding a second document", () => {
    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#remove-supporting-doc-button-0").should("exist").and("be.visible");
    cy.get("#remove-supporting-doc-button-1").should("exist").and("be.visible");
    cy.get("#add-supporting-doc-button").should("exist");
  });

  it("should show three Remove buttons after adding two more documents", () => {
    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-2").should("exist");
    cy.get("#remove-supporting-doc-button-0").should("exist");
    cy.get("#remove-supporting-doc-button-1").should("exist");
    cy.get("#remove-supporting-doc-button-2").should("exist");
  });

  it("should hide Add button and show 5 Remove buttons when maximum 5 documents is reached", () => {
    for (let i = 0; i < 4; i++) {
      cy.get("#add-supporting-doc-button").click();
      cy.get(`#catches-0-supportingDocuments-${i + 1}`).should("exist");
    }
    cy.get("#add-supporting-doc-button").should("not.exist");
    cy.get("input[name='supportingDocuments']").should("have.length", 5);
    cy.get("#remove-supporting-doc-button-0").should("exist");
    cy.get("#remove-supporting-doc-button-4").should("exist");
  });

  it("should accept typed input in a supporting document field", () => {
    cy.get("#catches-0-supportingDocuments-0").type("Supporting Document 1");
    cy.get("#catches-0-supportingDocuments-0").should("have.value", "Supporting Document 1");
  });

  it("should remove the added document and hide Remove buttons when only one field remains", () => {
    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#remove-supporting-doc-button-1").click();
    cy.get("#catches-0-supportingDocuments-1").should("not.exist");
    cy.get('[id^="remove-supporting-doc-button"]').should("not.exist");
    cy.get("#catches-0-supportingDocuments-0").should("exist");
  });

  it("should remove the correct middle document, preserving values on either side", () => {
    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-2").should("exist");

    cy.get("#catches-0-supportingDocuments-0").clear().type("First Document");
    cy.get("#catches-0-supportingDocuments-1").clear().type("Second Document");
    cy.get("#catches-0-supportingDocuments-2").clear().type("Third Document");

    cy.get("#remove-supporting-doc-button-1").click();

    cy.get("input[name='supportingDocuments']").should("have.length", 2);
    cy.get("#catches-0-supportingDocuments-0").should("have.value", "First Document");
    cy.get("#catches-0-supportingDocuments-1").should("have.value", "Third Document");
    // 2 docs remain so both still have Remove buttons
    cy.get('[id^="remove-supporting-doc-button"]').should("have.length", 2);
  });

  it("should remove the first document and leave the remaining docs", () => {
    for (let i = 0; i < 3; i++) {
      cy.get("#add-supporting-doc-button").click();
      cy.get(`#catches-0-supportingDocuments-${i + 1}`).should("exist");
    }
    cy.get("#remove-supporting-doc-button-0").should("be.visible").click();
    cy.get("input[name='supportingDocuments']").should("have.length", 3);
  });

  it("should correctly remove two documents sequentially, leaving only the last", () => {
    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-2").should("exist");

    cy.get("#catches-0-supportingDocuments-0").clear().type("First Document");
    cy.get("#catches-0-supportingDocuments-1").clear().type("Second Document");
    cy.get("#catches-0-supportingDocuments-2").clear().type("Third Document");

    // Remove the middle document (index 1)
    cy.get("#remove-supporting-doc-button-1").click();
    cy.get("input[name='supportingDocuments']").should("have.length", 2);
    cy.get("#catches-0-supportingDocuments-0").should("have.value", "First Document");
    cy.get("#catches-0-supportingDocuments-1").should("have.value", "Third Document");

    // Remove the first document (index 0), leaving only the last
    cy.get("#remove-supporting-doc-button-0").click();
    cy.get("input[name='supportingDocuments']").should("have.length", 1);
    cy.get("#catches-0-supportingDocuments-0").should("have.value", "Third Document");
    cy.get('[id^="remove-supporting-doc-button"]').should("not.exist");
  });
});

describe("Add product to this consignment: supporting documents (default catch data)", () => {
  it("should show only Add button and no Remove button with a single existing document", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentData } });
    cy.get("#add-supporting-doc-button").should("exist");
    cy.get("#catches-0-supportingDocuments-0").should("be.visible").and("not.be.disabled");
    cy.get('[id^="remove-supporting-doc-button"]').should("not.exist");
  });

  it("should allow empty supporting documents on submit and redirect to you-have-added-a-product", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments } });
    cy.get("#catches-0-supportingDocuments-0").should("be.visible").and("have.value", "");
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "/you-have-added-a-product");
  });

  it("should submit the form with supporting documents without triggering remove logic", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments } });
    cy.get("#add-supporting-doc-button").should("be.visible");
    cy.get("#add-supporting-doc-button").click();
    cy.get("#catches-0-supportingDocuments-1").should("exist");

    cy.get("#catches-0-supportingDocuments-0").type("First Document");
    cy.get("#catches-0-supportingDocuments-1").type("Second Document");

    cy.get('input[value="uk"]').click({ force: true });
    cy.get("#catches-0-certificateNumber").type("TEST123");
    cy.get("#catches-0-weightOnCC").type("100");
    cy.get("#catches-0-product").type("COD").blur();
    cy.get("#catches-0-commodityCode").type("03").blur();

    // Submitting with save-and-continue should not trigger remove logic (getRemoveIndex returns -1)
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/you-have-added-a-product");
  });
});

describe("Add product to this consignment: supporting documents (JS disabled)", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
      disableScripts: true,
    };
    cy.visit(pageUrl, { qs: testParams });
  });

  it("should display 5 empty supporting document input fields", () => {
    cy.get("#catches-0-supportingDocuments-0").should("exist").and("have.value", "");
    cy.get("#catches-0-supportingDocuments-4").should("exist").and("have.value", "");
  });

  it("should not display the Add Another button", () => {
    cy.get("#add-supporting-doc-button").should("not.exist");
  });

  it("should not display Remove buttons", () => {
    cy.get('[id^="remove-supporting-doc-button"]').should("not.exist");
  });

  it("should allow filling in all 5 supporting document fields", () => {
    cy.get("#catches-0-supportingDocuments-0").type("Doc 1");
    cy.get("#catches-0-supportingDocuments-1").type("Doc 2");
    cy.get("#catches-0-supportingDocuments-2").type("Doc 3");
    cy.get("#catches-0-supportingDocuments-3").type("Doc 4");
    cy.get("#catches-0-supportingDocuments-4").type("Doc 5");

    cy.get("#catches-0-supportingDocuments-0").should("have.value", "Doc 1");
    cy.get("#catches-0-supportingDocuments-1").should("have.value", "Doc 2");
    cy.get("#catches-0-supportingDocuments-2").should("have.value", "Doc 3");
    cy.get("#catches-0-supportingDocuments-3").should("have.value", "Doc 4");
    cy.get("#catches-0-supportingDocuments-4").should("have.value", "Doc 5");
  });

  it("should submit supporting documents and redirect on save and continue", () => {
    cy.get("#catches-0-supportingDocuments-0").type("Supporting Doc 1");
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/you-have-added-a-product");
  });
});
