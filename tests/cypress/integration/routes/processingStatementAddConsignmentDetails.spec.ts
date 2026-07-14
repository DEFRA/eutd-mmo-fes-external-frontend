import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-0D12ABA0A";
const baseUrl = `create-processing-statement/${documentNumber}`;
const pageUrl = `/${baseUrl}/add-consignment-details`;
const productId = "GBR-2023-PS-2305703F5-012345678";
const editPageUrl = `${pageUrl}/${productId}`;

describe("Add Consignment Details: page render", () => {
  it("should render the page with description and commodity code fields", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#consignmentDescription").should("exist");
    cy.get("#commodityCode").should("exist");
    cy.get("[data-testid=save-and-continue]").should("be.visible");
    cy.get("[data-testid=save-draft-button]").should("be.visible");
  });

  it("should display the standard warning label when not editing", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=warning-message]").should("be.visible");
  });

  it("should redirect to forbidden when document access is unauthorised", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsUnauthorised,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  it("should render in edit mode with remove button when productId is in URL", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsEditMode,
    };

    cy.visit(editPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=remove-product-button]").should("be.visible");
  });

  it("should render with pre-populated commodity code in edit mode", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsEditMode,
    };

    cy.visit(editPageUrl, { qs: { ...testParams } });
    cy.get("#consignmentDescription").should("exist");
    cy.get("#commodityCode").should("exist");
  });
});

describe("Add Consignment Details: save as draft", () => {
  it("should redirect to processing statements dashboard when save as draft is clicked", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#consignmentDescription").type("Test product description");
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});

describe("Add Consignment Details: save and continue", () => {
  it("should show errors when save and continue is clicked with invalid data", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddConsignmentDetailsError,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });

  it("should display error with interpolated values when description exceeds character limit", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddConsignmentDetailsError,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();

    // Verify error summary displays with error messages
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary__list li").should("have.length.greaterThan", 0);

    // Verify error link exists and has correct href
    cy.get(".govuk-error-summary__list a").first().should("have.attr", "href");
  });

  it("should redirect to add catch details page when save and continue succeeds", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddConsignmentDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#consignmentDescription").type("Farmed Atlantic Salmon");
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", `/${baseUrl}/add-catch-details`);
  });

  it("should redirect to remove product page when remove is clicked in edit mode", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsEditMode,
    };

    cy.visit(editPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=remove-product-button]").click();
    cy.url().should("include", `/${baseUrl}/remove-product`);
  });
});

describe("Add Consignment Details (PS): save as draft retains valid fields", () => {
  it("should redirect to dashboard without error when save as draft is clicked with invalid fields", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsSaveAsDraftWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});
