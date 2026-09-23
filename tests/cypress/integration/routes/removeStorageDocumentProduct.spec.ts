import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-SD-F71D98A30";
const productId = "6453a9b6036a819b8fc483cd";
const removeProductUrl = `/create-non-manipulation-document/${documentNumber}/remove-product/${productId}`;
const youHaveAddedAProductUrl = `/create-non-manipulation-document/${documentNumber}/you-have-added-a-product`;

describe("SD: remove-product confirmation page", () => {
  it("should display the confirmation title and hint text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(removeProductUrl, { qs: { ...testParams } });

    cy.contains("h1", "Are you sure you want to remove this product from the consignment?").should("be.visible");
    cy.contains("This product will be removed from your consignment.").should("be.visible");
  });

  it("should set the browser page title", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(removeProductUrl, { qs: { ...testParams } });

    cy.title().should("eq", "Remove a product - Create a UK non-manipulation document - GOV.UK");
  });

  it("should display Yes/No radios and a Save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(removeProductUrl, { qs: { ...testParams } });

    cy.get("#removeProduct").parent().should("contain", "Yes, remove this product");
    cy.get("#removeProductNo").parent().should("contain", "No, keep this product");
    cy.get('[data-testid="continue"]').should("be.visible").should("contain", "Save and continue");
  });

  it("should display all text in Welsh", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
      lng: "cy",
    };
    cy.visit(removeProductUrl, { qs: { ...testParams } });

    cy.contains("h1", "Ydych chi'n siŵr eich bod chi eisiau tynnu'r cynnyrch hwn o'r llwyth?").should("be.visible");
    cy.contains("Bydd y cynnyrch yma yn cael ei dynnu o'ch llwyth.").should("be.visible");
    cy.get("#removeProduct").parent().should("contain", "Ydw, tynnwch y cynnyrch yma");
    cy.get("#removeProductNo").parent().should("contain", "Nac ydw, cadwch y cynnyrch yma");
  });

  it("should display an error when no option is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(removeProductUrl, { qs: { ...testParams } });

    cy.get('[data-testid="continue"]').click();

    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").should(
      "contain",
      "Select yes if you want to remove this product from the consignment"
    );
  });

  it("should remove the product and return to the product list when confirmed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(removeProductUrl, { qs: { ...testParams } });

    cy.get("#removeProduct").check();
    cy.get('[data-testid="continue"]').click();

    cy.url().should("include", youHaveAddedAProductUrl);
    cy.get("tbody.govuk-table__body tr.govuk-table__row").should("have.length", 1);
  });

  it("should keep the product and return to the product list when cancelled", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(removeProductUrl, { qs: { ...testParams } });

    cy.get("#removeProductNo").check();
    cy.get('[data-testid="continue"]').click();

    cy.url().should("include", youHaveAddedAProductUrl);
    cy.get("tbody.govuk-table__body tr.govuk-table__row").should("have.length", 2);
  });

  it("should redirect to forbidden when the product does not exist on the consignment", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDYouHaveAddedAProduct,
    };
    cy.visit(`/create-non-manipulation-document/${documentNumber}/remove-product/does-not-exist`, {
      qs: { ...testParams },
    });

    cy.url().should("include", "/forbidden");
  });
});
