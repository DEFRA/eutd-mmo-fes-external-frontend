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
  const submitSelectedCommodityParams: ITestParams = {
    testCaseId: TestCaseId.PSAddConsignmentDetailsEditModeSubmitSelectedCommodity,
  };
  const selectedCommodityLabel = "03011100 - Live ornamental freshwater fish";

  it("locks description and commodity code by default in edit mode and does not render autocomplete menu", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });

    cy.get("#consignmentDescription").should("have.attr", "readonly");
    cy.get("#consignmentDescription").should("have.value", "Herring fillets and Atlantic cod fishcakes");
    cy.get("#consignmentDescription").should("have.class", "app-input--locked");

    cy.get("#commodityCode").should("have.attr", "readonly");
    cy.get("#commodityCode").should("have.value", "03026929 - Fresh or chilled fish, n.e.s.");
    cy.get("#commodityCode").should("have.class", "app-input--locked");
    cy.get("#commodityCode__listbox").should("not.exist");
    cy.contains("No results found").should("not.exist");

    cy.get("[data-testid=change-description-button]").should("be.visible").and("contain.text", "Change");
  });

  it("Change unlocks both fields and focuses description", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });

    cy.get("[data-testid=change-description-button]").click();

    cy.get("#consignmentDescription").should("not.have.attr", "readonly");
    cy.get("#consignmentDescription").should("have.focus");
    cy.get("#commodityCode").should("not.have.attr", "readonly");
    cy.get("[data-testid=change-description-button]").should("not.exist");
  });

  it("tabbing from description to commodity code keeps both fields editable", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });

    cy.get("[data-testid=change-description-button]").click();
    cy.get("#consignmentDescription").focus();
    cy.get("#commodityCode").focus();

    cy.get("#commodityCode").should("have.focus");
    cy.get("#commodityCode").should("not.have.attr", "readonly");
    cy.get("#consignmentDescription").should("not.have.attr", "readonly");
    cy.get("[data-testid=change-description-button]").should("not.exist");
  });

  it("re-locks both fields when focus leaves the editable pair", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });

    cy.get("[data-testid=change-description-button]").click();
    cy.get("#commodityCode").focus();
    cy.get("body").click(0, 0);

    cy.get("#consignmentDescription").should("have.attr", "readonly");
    cy.get("#commodityCode").should("have.attr", "readonly");
    cy.get("[data-testid=change-description-button]").should("be.visible");
  });

  it("allows commodity code selection by click while unlocked and closes the listbox", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });

    cy.get("[data-testid=change-description-button]").click();
    cy.get("#commodityCode").should("not.have.attr", "readonly");
    cy.get("#commodityCode").clear().type("03011100");

    cy.get("#commodityCode__listbox").should("have.class", "autocomplete__menu");
    cy.contains("#commodityCode__listbox [role='option']", selectedCommodityLabel).click();

    cy.get("#commodityCode").should("have.value", selectedCommodityLabel).and("have.attr", "aria-expanded", "false");
    cy.get("#commodityCode__listbox").should("not.exist");
  });

  it("allows commodity code selection by keyboard and closes the listbox", () => {
    cy.visit(editPageUrl, { qs: { ...editParams } });

    cy.get("[data-testid=change-description-button]").click();
    cy.get("#commodityCode").should("not.have.attr", "readonly");
    cy.get("#commodityCode").clear().type("03011100");

    cy.get("#commodityCode__listbox").should("have.class", "autocomplete__menu");
    cy.get("#commodityCode").type("{downarrow}{enter}");

    cy.get("#commodityCode").should("have.value", selectedCommodityLabel).and("have.attr", "aria-expanded", "false");
    cy.get("#commodityCode__listbox").should("not.exist");
  });

  it("submits selected commodity code on Save and Continue after unlocking", () => {
    cy.visit(editPageUrl, { qs: { ...submitSelectedCommodityParams } });

    cy.get("[data-testid=change-description-button]").click();
    cy.get("#commodityCode").should("not.have.attr", "readonly");
    cy.get("#commodityCode").clear().type("03011100");
    cy.contains("#commodityCode__listbox [role='option']", selectedCommodityLabel).click();

    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", `/${baseUrl}/add-catch-details`);
  });

  it("keeps both fields editable in add mode and hides Change", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSAddConsignmentDetails } });

    cy.get("#consignmentDescription").should("not.have.attr", "readonly");
    cy.get("#commodityCode").should("not.have.attr", "readonly");
    cy.get("[data-testid=change-description-button]").should("not.exist");
  });

  it("renders the Welsh Change button", () => {
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
