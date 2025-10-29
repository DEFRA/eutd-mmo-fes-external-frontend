import { type ITestParams, TestCaseId } from "~/types";

const sdPageUrl = "create-storage-document/GBR-2022-SD-F71D98A30/you-have-added-a-product";

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
    cy.url().should("include", "/storage-documents");
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
      "http://localhost:3000/create-storage-document/GBR-2022-SD-F71D98A30/add-product-to-this-consignment/0"
    );
  });

  it("Add a new product radio check", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    // eslint-disable-next-line
    cy.wait(200);
    cy.get('[type="radio"]').first().check();
    cy.contains("button", "Save and continue").click({ force: true });
    cy.url().should("include", "/add-product-to-this-consignment");
  });

  it("should allow continuing if the catch is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDProductAddedValid,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "You have added 1 product to this consignment - Create a UK storage document - GOV.UK");
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
});
