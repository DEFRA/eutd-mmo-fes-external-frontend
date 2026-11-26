import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-0D12ABA0A";
const baseUrl = `create-processing-statement/${documentNumber}`;
const pageUrl = `/${baseUrl}/add-consignment-details`;
const productId = "GBR-2023-PS-2305703F5-012345678";
const editPageUrl = `${pageUrl}/${productId}`;

describe("Add Consignment Details: page render", () => {
  it("should render the page with description and commodity code fields", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=warning-message]").should("be.visible");
    cy.get("[data-testid=warning-message]").should("have.attr", "role", "note");
  });

  it("should redirect to forbidden when document access is unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsUnauthorised,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  it("should render in edit mode with remove button when productId is in URL", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsEditMode,
    };

    cy.visit(editPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=remove-product-button]").should("be.visible");
  });

  it("should render with pre-populated commodity code in edit mode", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsEditMode,
    };

    cy.visit(editPageUrl, { qs: { ...testParams } });
    cy.get("#consignmentDescription").should("exist");
    cy.get("#commodityCode").should("exist");
  });
});

describe("Add Consignment Details: lock and change product description", () => {
  const editParams: ITestParams = { testCaseId: TestCaseId.PSAddConsignmentDetailsEditMode };

  it("should lock the description by default in edit mode with a Change button", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });
    cy.get("#consignmentDescription").should("have.attr", "readonly");
    cy.get("#consignmentDescription").should("have.value", "Herring fillets and Atlantic cod fishcakes");
    cy.get("#consignmentDescription").should("have.class", "app-input--locked");
    cy.get("[data-testid=change-description-button]").should("be.visible").and("have.class", "govuk-button--secondary");
    cy.get("[data-testid=change-description-button]").should("contain.text", "Change");
    cy.get("#commodityCode").should("exist");
    cy.get("[data-testid=remove-product-button]").should("be.visible");
  });

  it("should unlock and focus the description when Change is clicked", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });
    cy.get("[data-testid=change-description-button]").click();
    cy.get("#consignmentDescription").should("not.have.attr", "readonly");
    cy.get("#consignmentDescription").should("not.have.class", "app-input--locked");
    cy.get("#consignmentDescription").should("have.focus");
    cy.get("[data-testid=change-description-button]").should("not.exist");
  });

  it("should allow editing and re-lock the description with the edited value on blur", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });
    cy.get("[data-testid=change-description-button]").click();
    cy.get("#consignmentDescription").clear();
    cy.get("#consignmentDescription").type("Smoked haddock");
    cy.get("#consignmentDescription").blur();
    cy.get("#consignmentDescription").should("have.attr", "readonly");
    cy.get("#consignmentDescription").should("have.value", "Smoked haddock");
    cy.get("[data-testid=change-description-button]").should("be.visible");
  });

  it("should re-lock the description when focus moves to another field", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });
    cy.get("[data-testid=change-description-button]").click();
    cy.get("#commodityCode").focus();
    cy.get("#consignmentDescription").should("have.attr", "readonly");
    cy.get("[data-testid=change-description-button]").should("be.visible");
  });

  it("should still save and continue while the description is locked", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", `/${baseUrl}/add-catch-details`);
  });

  it("should save and continue when Save and Continue is clicked while editing", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });
    cy.get("[data-testid=change-description-button]").click();
    cy.get("#consignmentDescription").type(" updated");
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", `/${baseUrl}/add-catch-details`);
  });

  it("should not lock the description when adding a new product", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSAddConsignmentDetails } });
    cy.get("#consignmentDescription").should("not.have.attr", "readonly");
    cy.get("[data-testid=change-description-button]").should("not.exist");
  });

  it("should render the Welsh Change button", () => {
    cy.visit(editPageUrl, { qs: { ...editParams, lng: "cy" } });
    cy.get("[data-testid=change-description-button]").should("contain.text", "Newid");
  });
});

describe("Add Consignment Details: save as draft", () => {
  it("should redirect to processing statements dashboard when save as draft is clicked", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddConsignmentDetailsError,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^Error:There is a problem$/).should("be.visible");
  });

  it("should display error with interpolated values when description exceeds character limit", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddConsignmentDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#consignmentDescription").type("Farmed Atlantic Salmon");
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", `/${baseUrl}/add-catch-details`);
  });

  it("should redirect to remove product page when remove is clicked in edit mode", () => {
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
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsSaveAsDraftWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});
