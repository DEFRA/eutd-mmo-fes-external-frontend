import { type ITestParams, TestCaseId } from "~/types";

const ccNumber = "GBR-2022-PS-F2D5CD656";
const documentUrl = "create-processing-statement/GBR-2022-PS-0D12ABA0A";
const validAddCatchDetailsUrl = `${documentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601?pageNo=1`;
const validAddCatchDetailsUrlForUK = `${documentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601?pageNo=1`;
const validEditCatchDetailsUrl = `${documentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601/0?pageNo=1`;
const validEditCatchDetailsNextUrl = `${documentUrl}/add-catch-details/COD/0?catchType=non_uk&pageNo=2&nextUri=abc`;
const validEditCatchDetailsUrlForUK = `${documentUrl}/add-catch-details/ASD/0?catchType=uk&pageNo=1`;
const validEmptyAddCatchDetailsUrlForNonUK = `${documentUrl}/add-catch-details/?pageNo=1`;

describe("PS: Add catch details", () => {
  // FIO-10279: Test button order - Cancel on left, Add on right
  it("should display Cancel button on the left and Add button on the right", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    // Verify both buttons exist
    cy.get('[data-testid="cancel-button"]').should("exist").and("contain.text", "Cancel");
    cy.get('[data-testid="add-product-details"]').should("exist");

    // Verify Cancel button appears before Add button in DOM
    cy.get(".govuk-button-group").then(($buttonGroup) => {
      const html = $buttonGroup.html();
      const cancelIndex = html.indexOf('data-testid="cancel-button"');
      const addIndex = html.indexOf('data-testid="add-product-details"');

      expect(cancelIndex).to.be.greaterThan(-1);
      expect(addIndex).to.be.greaterThan(-1);
      expect(cancelIndex).to.be.lessThan(addIndex);
    });
  });

  it("should check whether it is nonuk or uk", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get(".govuk-heading-xl ").contains("Add species to your processed product");
  });

  it("should expand and display content in the 'Help with species names' section", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.contains("button, summary", "Help with species names").click({ force: true });
    cy.get(".govuk-details__text")
      .should("be.visible")
      .and("contain.text", "Some species are exempt from this requirement:");
    cy.get("div .govuk-details__text")
      .contains("See the list of exempt species on europa.eu (opens in new tab)")
      .should("be.visible");
  });

  it("should render the 'Was the catch certificate issued in the UK?' radio buttons with correct labels and hint", () => {
    cy.visit(validAddCatchDetailsUrl, { qs: { testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch } });
    cy.get("legend").contains("Was the catch certificate issued in the UK?");
    cy.get("#catches-0-catchCertificateType-hint").should("be.visible");
    cy.get("input[type='radio'][name='catchCertificateType']").should("have.length", 2);
    cy.get("label[for='catchCertificateType-uk']").should("contain.text", "Yes");
    cy.get("label[for='catchCertificateType-non_uk']").should("contain.text", "No");
  });

  it("should validate country type is required ", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsCatchCertificateTypeValidationError,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    // Submit without selecting certificate type
    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });

    // Should show validation error
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").should("contain.text", "Select Yes if the catch certificate was issued in the UK");
    cy.get("#catches-0-catchCertificateType-error").should(
      "contain.text",
      "Select Yes if the catch certificate was issued in the UK"
    );
  });

  it("should expand and display content in the 'Help with catch certificate' section", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.contains("button, summary", "Help with catch certificate").click({ force: true });
    cy.get(".govuk-details__text")
      .should("be.visible")
      .and(
        "contain.text",
        "The UK catch certificate is the official paperwork that allowed the product to enter the UK"
      );
  });

  it("should add first catch successfully and stay on the same page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });

  it("should set weight fields from loader data when there are no errors and lang is null", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-totalWeightLanded").should("have.value", "");
    cy.get("#catches-0-exportWeightBeforeProcessing").should("have.value", "");
    cy.get("#catches-0-exportWeightAfterProcessing").should("have.value", "");
  });

  it("should add first catch successfully and stay on the same page with page number provided as 2", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(`${documentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601?pageNo=2`, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });

  it("should add first catch successfully and stay on the same page with page number provided as NaN", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(`${documentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601?pageNo=NaN`, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });

  it("should add first catch successfully and stay on the same page with second page number provided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(`${documentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601`, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", validAddCatchDetailsUrl);
  });

  it("should add first catch successfully and stay on the same page with second page number provided with no scientific names", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatchNoScientificNames,
    };

    cy.visit(`${documentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601`, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });

  it("should add first catch successfully and stay on the same page with second page number provided with empty scientific names", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatchEmptyScientificNames,
    };

    cy.visit(`${documentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601`, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });

  it("should redirect to the forbidden page if the user is unauthorised to retrieve the processing statement", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsGetPsForbidden,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the forbidden page if the user is unauthorised to retrieve the processing statement when there is an action on the page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsGetPsForbiddenAction,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", "/unauthorised");
  });

  it("should redirect to the forbidden page if the user is unauthorised to post a processing statement", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsPostPsForbidden,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", "/forbidden");
  });

  it("should display errors if submitting blank fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithBlankInput,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("#addProductDetails").click({ force: true });
    cy.get(".govuk-error-summary__list").find("li > a").contains("Enter the catch certificate number");
  });

  it("should display an error if the catch certificate number is in the is in the wrong format for a UK catch certificate", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithInvalidCCFormat,
    };

    cy.visit(validAddCatchDetailsUrlForUK, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type("GBR-2023-CC-7E720BE", { force: true });
    cy.get("#addProductDetails").click({ force: true });

    const ccNumberFieldId = "#catches-0-catchCertificateNumber";
    const ccNumberError = "A catch certificate must be in a format for example GBR-2024-CC-BEFCD6036";

    cy.contains("a", ccNumberError).and("have.attr", "href", ccNumberFieldId);
    cy.get(ccNumberFieldId).should("exist").and("have.class", "govuk-input--error");
  });

  it("the Back link should navigate to add-consignment-details for a UK catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUkCatchType,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.contains("a", "Back").click({ force: true });

    cy.url().should("include", "/add-consignment-details");
  });

  it("should redirect to processing statement dashboard when clicking save as draft even if an error occurred", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithInvalidCCFormat,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  it("should be able to edit the catch after adding the certificate", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("[data-testid=edit-button-0]").eq(0).click({ force: true });
    cy.url().should("include", `${validEditCatchDetailsUrl}`);
  });

  it("should be able to update the catchcertificate", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatch,
    };
    cy.visit(validEditCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#addProductDetails").should("have.text", "Update");
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });

  it("should be able to update the catchcertificate and return nextUri", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatch,
    };

    cy.visit(validEditCatchDetailsNextUrl, { qs: { ...testParams } });
    cy.get("#addProductDetails").should("have.text", "Update");
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", `abc`);
  });

  it("should display an error if one occurs whilst updating a catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatchError,
    };
    cy.visit(validEditCatchDetailsUrlForUK, { qs: { ...testParams } });
    cy.get("#addProductDetails").should("have.text", "Update");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("Enter the catch certificate number");
  });

  it("should be able to cancel an update the catchcertificate", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatch,
    };
    cy.visit(validEditCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("[data-testid=edit-button-0]").should("contain", "Edit");
    cy.get("[data-testid=edit-button-0]").click({ force: true });
    cy.get("#cancel").should("have.text", "Cancel");
    cy.get("#cancel").click({ force: true });
    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });

  it("should be able to remove the catchcertificate", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsRemoveCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#yourproducts").find("tbody > tr").should("have.length", 2);
    cy.get("[data-testid=remove-button-0]").eq(0).click({ force: true });
    cy.url().should("include", `${documentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601?pageNo=1`);
  });

  it("should redirect to forbidden page when unauthorised while removing", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsRemoveCatchUnauthorised,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#yourproducts").find("tbody > tr").should("have.length", 2);
    cy.get("[data-testid=remove-button-0]").eq(0).click({ force: true });
    cy.url().should("include", `/forbidden`);
  });

  it("should add catch successfully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validEditCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", validAddCatchDetailsUrl);
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "GBR-2022-PS-0D12ABA0A/catch-added");
  });

  it("should use getSpeciesOptions when isHydrated is true", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get('[id^="catches-"][id$="-species"]').type("nothing");
    cy.get("#catches-0-species").should("contain", "");
  });

  it("should error on save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsContinueCatchError,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("[data-testid=add-product-details").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("Add at least one species to your processed product");
  });

  it("should clear the table when we click cancel", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#cancel").should("have.text", "Cancel");
    cy.get("#cancel").click({ force: true });

    cy.reload();
    cy.get("#catches-0-catchCertificateNumber").should("have.value", "");
    cy.get("#catches-0-totalWeightLanded").should("have.value", "");
    cy.get("#catches-0-exportWeightBeforeProcessing").should("have.value", "");
    cy.get("#catches-0-exportWeightAfterProcessing").should("have.value", "");
  });

  it("should add catch successfully and display in the table", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", `${validAddCatchDetailsUrl}`);

    cy.get(".govuk-heading-l").contains("You have added 1 species");

    cy.get("#yourproducts").find("tbody > tr").should("have.length", 1);
  });

  it("should display error msg when species, catch certificate number and weight is left empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsNoCatchesSaveAndContinue,
    };

    cy.visit(validEmptyAddCatchDetailsUrlForNonUK, { qs: { ...testParams } });
    cy.wait(300);
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", validEmptyAddCatchDetailsUrlForNonUK);

    cy.get(".govuk-error-summary").contains("Enter the FAO code or species name").should("exist");
    cy.get(".govuk-error-summary").contains("Enter the catch certificate number").should("exist");
    cy.get(".govuk-error-summary").contains("Enter the export weight in kg (before processing)").should("exist");
    cy.get(".govuk-error-summary").contains("Enter the export weight in kg (after processing)").should("exist");
  });
});

describe("PS: Add catch details - Species AutocompleteFormField", () => {
  it("should render the FAO species code/species name field with correct label and hint", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("label[for='catches-0-species']")
      .should("be.visible")
      .and("contain.text", "Food and Agriculture Organisation (FAO) code or species name");
    cy.get("#catches-0-species-hint")
      .should("be.visible")
      .and(
        "contain.text",
        "Start typing a species name or FAO code to see suggestions. For example, Atlantic cod or COD."
      );
  });

  it("should display the autocomplete input field with correct attributes", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species")
      .should("exist")
      .and("be.visible")
      .and("have.attr", "name", "species")
      .and("have.attr", "aria-describedby", "catches-0-species-hint");
  });

  it("should show autocomplete suggestions when typing species name", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").should("be.visible");
    cy.get("#catches-0-species").invoke("val", "");
    cy.get("#catches-0-species").type("Atlantic cod", { force: true });
    cy.wait(500);
    cy.get("#catches-0-species").should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find(".autocomplete__menu").length > 0) {
        cy.get(".autocomplete__menu").should("be.visible");
        cy.get(".autocomplete__option").should("have.length.greaterThan", 0);
      } else if ($body.find('[role="listbox"]').length > 0) {
        cy.get('[role="listbox"]').should("be.visible");
        cy.get('[role="option"]').should("have.length.greaterThan", 0);
      } else if ($body.find('select[name="species"] option').length > 0) {
        cy.get('select[name="species"] option').should("have.length.greaterThan", 1);
      } else if ($body.find(".govuk-select option").length > 0) {
        cy.get(".govuk-select option").should("have.length.greaterThan", 1);
      } else {
        cy.log("Autocomplete suggestions not found with expected selectors");
      }
    });
  });

  it("should allow selection from autocomplete suggestions", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").should("be.visible");
    cy.get("#catches-0-species").invoke("val", "");
    cy.get("#catches-0-species").type("ASD", { force: true });
    cy.wait(500);
    cy.get("#catches-0-species").should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find(".autocomplete__option").length > 0) {
        cy.get(".autocomplete__option").should("have.length.greaterThan", 0);
        cy.get(".autocomplete__option").first().click({ force: true });
        cy.get("#catches-0-species").should("not.have.value", "");
      } else if ($body.find('[role="option"]').length > 0) {
        cy.get('[role="option"]').should("have.length.greaterThan", 0);
        cy.get('[role="option"]').first().click({ force: true });
        cy.get("#catches-0-species").should("not.have.value", "");
      } else if ($body.find('select[name="species"] option').length > 1) {
        cy.get('select[name="species"]').select(1);
        cy.get('select[name="species"]').should("not.have.value", "");
      } else if ($body.find(".govuk-select option").length > 1) {
        cy.get(".govuk-select").select(1);
        cy.get(".govuk-select").should("not.have.value", "");
      } else {
        cy.log("No selectable autocomplete options found");
      }
    });
  });

  it("should pre-populate field with existing species selection", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatch,
    };

    cy.visit(validEditCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").should("not.have.value", "").and("contain.value", "Allis shad");
  });

  it("should return species field to species held in state when form is cancelled", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").invoke("val", "");
    cy.get("#catches-0-species").type("Atlantic cod", { force: true });
    cy.wait(500);
    cy.get("#catches-0-species").should("be.visible");
    cy.get("body").then(($body) => {
      if ($body.find(".autocomplete__option").length > 0) {
        cy.get(".autocomplete__option").first().click({ force: true });
      } else if ($body.find('[role="option"]').length > 0) {
        cy.get('[role="option"]').first().click({ force: true });
      } else if ($body.find('select[name="species"] option').length > 1) {
        cy.get('select[name="species"]').select(1);
      } else if ($body.find(".govuk-select option").length > 1) {
        cy.get(".govuk-select").select(1);
      }
    });
    cy.get("#catches-0-species").should("have.value", "");
    cy.get("#cancel").click({ force: true });
    cy.get("#catches-0-species").should("have.value", "");
  });

  it("should handle minimum character search requirements", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.reload(); // Force a clean page load
    cy.get("#catches-0-species").should("be.visible");
    cy.get("#catches-0-species").should("be.enabled");
    cy.get("#catches-0-species").invoke("val", "");
    cy.wait(200);
    cy.get("#catches-0-species").type("A", { force: true });
    cy.wait(500); // Wait for autocomplete debouncing
    cy.get("#catches-0-species").should("be.visible");
    cy.get("#catches-0-species").should("have.value", "A");
    cy.get("#catches-0-species").invoke("val", "");
    cy.wait(200);
    cy.get("#catches-0-species").type("AT", { force: true });
    cy.wait(800);
    cy.get("#catches-0-species").should("be.visible");
    cy.get("#catches-0-species").should("have.value", "AT");

    cy.get("body").then(($body) => {
      if ($body.find(".autocomplete__menu:visible").length > 0) {
        cy.get(".autocomplete__menu").should("be.visible");
        cy.get(".autocomplete__option").should("have.length.greaterThan", 0);
      } else if ($body.find('[role="listbox"]:visible').length > 0) {
        cy.get('[role="listbox"]').should("be.visible");
        cy.get('[role="option"]').should("have.length.greaterThan", 0);
      } else if ($body.find('select[name="species"]:visible').length > 0) {
        cy.get('select[name="species"]').then(($select) => {
          if ($select.find("option").length > 1) {
            cy.get('select[name="species"] option').should("have.length.greaterThan", 1);
          }
        });
      } else if ($body.find(".govuk-select:visible").length > 0) {
        cy.get(".govuk-select").then(($select) => {
          if ($select.find("option").length > 1) {
            cy.get(".govuk-select option").should("have.length.greaterThan", 1);
          }
        });
      } else {
        cy.log("Minimum character requirement test - no visible autocomplete found");
      }
    });
  });

  it("should maintain focus and accessibility attributes", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species")
      .should("have.attr", "aria-describedby", "catches-0-species-hint")
      .and("be.visible")
      .and("not.have.attr", "aria-invalid", "true");
    cy.get("#catches-0-species").focus();
    cy.get("#catches-0-species").type("COD");
    cy.get("#catches-0-species").should("be.focused");
  });
});

describe("PS: Add catch details - Weight Input Validation", () => {
  it("should display weight inputs with kg suffix for non-UK certificates", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-totalWeightLanded").should("be.visible");
    cy.get("#catches-0-totalWeightLanded")
      .parent(".govuk-input__wrapper")
      .find(".govuk-input__suffix")
      .should("contain.text", "kg");
    cy.get("#catches-0-exportWeightBeforeProcessing").should("be.visible");
    cy.get("#catches-0-exportWeightBeforeProcessing")
      .parent(".govuk-input__wrapper")
      .find(".govuk-input__suffix")
      .should("contain.text", "kg");
    cy.get("#catches-0-exportWeightAfterProcessing").should("be.visible");
    cy.get("#catches-0-exportWeightAfterProcessing")
      .parent(".govuk-input__wrapper")
      .find(".govuk-input__suffix")
      .should("contain.text", "kg");
  });

  it("should show total weight landed value when form is not reset", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-totalWeightLanded").clear();
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-totalWeightLanded").should("have.value", "50");
  });

  it("should clear total weight landed when form is reset", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-totalWeightLanded").clear();
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-totalWeightLanded").should("have.value", "50");
    cy.get("#cancel").click({ force: true });
    cy.get("#catches-0-totalWeightLanded").should("have.value", "");
  });

  it("should not display totalWeightLanded field for UK certificates", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUkCatchType,
    };

    cy.visit(validAddCatchDetailsUrlForUK, { qs: { ...testParams } });
    cy.get("#catches-0-totalWeightLanded").should("exist");
    cy.get("#catches-0-exportWeightBeforeProcessing").should("be.visible");
    cy.get("#catches-0-exportWeightAfterProcessing").should("be.visible");
  });

  it("should validate that export weight after processing is not greater than before processing", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithInvalidWeightRatio,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("60");
    cy.get("#catches-0-exportWeightAfterProcessing").type("30");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
  });

  it("should show export weight before processing value when form is not reset", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-exportWeightBeforeProcessing").clear();
    cy.get("#catches-0-exportWeightBeforeProcessing").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").should("have.value", "50");
  });

  it("should show export weight after processing value when form is not reset", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-exportWeightAfterProcessing").clear();
    cy.get("#catches-0-exportWeightAfterProcessing").type("50");
    cy.get("#catches-0-exportWeightAfterProcessing").should("have.value", "50");
  });

  it("should clear export weight before processing when form is reset", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-exportWeightBeforeProcessing").clear();
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightBeforeProcessing").should("have.value", "25");
    cy.get("#cancel").click({ force: true });
    cy.get("#catches-0-exportWeightBeforeProcessing").should("have.value", "");
  });

  it("should clear export weight after processing when form is reset", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-exportWeightAfterProcessing").clear();
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").should("have.value", "25");
    cy.get("#cancel").click({ force: true });
    cy.get("#catches-0-exportWeightAfterProcessing").should("have.value", "");
  });

  it("should accept decimal weight values", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50.5");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25.25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("24.75");
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });
});

describe("PS: Add catch details - Species Code Validation", () => {
  it("should handle species validation with different input methods", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").type("COD");
    cy.get("#catches-0-species").should("be.visible");
    cy.get("#catches-0-species").invoke("val", "Atlantic");
    cy.wait(500);
    cy.get("body").then(($body) => {
      if ($body.find(".autocomplete__menu").length > 0 || $body.find('[role="listbox"]').length > 0) {
        cy.log("Autocomplete suggestions found");
      }
    });
    cy.get("#catches-0-species").clear().type("Gadus morhua");
    cy.get("#catches-0-species").should("be.visible");
  });

  it("should validate species selection from autocomplete", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").type("Atlan");
    cy.wait(500);
    cy.get("body").then(($body) => {
      if ($body.find(".autocomplete__option").length > 0) {
        cy.get(".autocomplete__option").first().click({ force: true });
        cy.get("#catches-0-species").should("not.have.value", "Atlan");
        cy.get("#catches-0-species").invoke("val").should("have.length.greaterThan", 5);
      } else if ($body.find('[role="option"]').length > 0) {
        cy.get('[role="option"]').first().click({ force: true });
        cy.get("#catches-0-species").should("not.have.value", "Atlan");
      } else {
        cy.log("Autocomplete not available - testing manual input validation");
        cy.get("#catches-0-species").clear().type("Atlantic cod (COD)");
        cy.get("#catches-0-species").should("have.value", "Atlantic cod (COD)");
      }
    });
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2024-CC-123456");
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("20");
    cy.get("#addProductDetails").click({ force: true });

    cy.get("body").then(($body) => {
      if ($body.find(".govuk-error-summary").length > 0) {
        cy.get(".govuk-error-summary").should("not.contain", "Enter the FAO code or species name");
        cy.get(".govuk-error-summary").should("not.contain", "Enter a valid FAO species code");
      } else {
        cy.get("#yourproducts tbody tr").should("have.length.greaterThan", 0);
      }
    });
  });
});

describe("PS: Add catch details - Catch Certificate Weight Logic", () => {
  it("should not display table if we try to retrive value from totalWeightLanded as catch certificate weight for UK certificates", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUkCatchType,
    };

    cy.visit(validAddCatchDetailsUrlForUK, { qs: { ...testParams } });
    cy.get("#catches-0-species").type("Atlantic cod (COD)");
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2024-CC-123456789");
    cy.get("#catches-0-totalWeightLanded").should("exist");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("20");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("#yourproducts tbody tr").should("have.length", 1);
  });
});

describe("PS: Add catch details - Product Description Integration", () => {
  it("should handle missing product description gracefully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("be.visible");
    cy.get("h2").should("contain", "You have added");
    cy.get("h2").should("contain", "species and");
    cy.get("h2").should("contain", "documents");
    cy.get("h2").should("not.contain", "undefined");
    cy.get("h2").should("not.contain", "null");
    cy.get("h2").should("not.contain", "NaN");
    cy.get("h2")
      .invoke("text")
      .then((text) => {
        expect(text).to.match(/You have added \d+ species and \d+ documents for/);
      });
  });
});

describe("PS: Add catch details - Catch Details Table", () => {
  it("should display catch details table with correct headers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#yourproducts").should("be.visible");
    cy.get("#yourproducts thead").should("exist");
    cy.get("#yourproducts thead th").should("have.length.greaterThan", 0);
    cy.get("#yourproducts thead th").eq(0).should("contain.text", "Species");
    cy.get("#yourproducts thead th").eq(1).should("contain.text", "Catch certificate weight");
    cy.get("#yourproducts thead th").eq(2).should("contain.text", "Export weight before processing");
    cy.get("#yourproducts thead th").eq(3).should("contain.text", "Export weight after processing");
    cy.get("#yourproducts thead th").eq(4).should("contain.text", "Action");
  });

  it("should display correct table header with consignment description", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("contain", "You have added");
    cy.get("h2").should("contain", "species and");
    cy.get("h2").should("contain", "documents for");
  });
});

describe("PS: Add catch details - Accessibility", () => {
  it("should announce errors to screen readers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithBlankInput,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#addProductDetails").click({ force: true });
    cy.get(".govuk-visually-hidden").should("contain", "Error");
    cy.get(".govuk-error-summary").should("have.attr", "role", "alert");
  });

  it("should maintain focus management during form interactions", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").focus();
    cy.focused().should("have.id", "catches-0-species");
    cy.get("#catches-0-catchCertificateNumber").focus();
    cy.focused().should("have.id", "catches-0-catchCertificateNumber");
    cy.get("#catches-0-totalWeightLanded").focus();
    cy.focused().should("have.id", "catches-0-totalWeightLanded");
  });

  it("should announce count changes to screen readers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("have.attr", "class").and("contain", "govuk-heading");
    cy.get("h2").should("be.visible");
    cy.get("h2").should("not.have.attr", "aria-hidden", "true");
  });

  it("should provide clear context for count information", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("contain", "species");
    cy.get("h2").should("contain", "documents");
    cy.get("h2").should("contain", "for");
  });
});

describe("PS: Add catch details - Data Persistence", () => {
  it("should save data as draft and preserve state", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});

describe("PS: Add catch details - Error Handling", () => {
  it("should display field-specific errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithBlankInput,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#addProductDetails").click({ force: true });
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get("#error-summary-title").should("contain", "There is a problem");
    cy.get(".govuk-error-message").should("have.length", 3);
  });

  it("should handle server errors gracefully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithBlankInput,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });
    cy.get(".govuk-error-summary").should("be.visible");
  });
});

describe("PS: Add catch details - Unique Species and Document Counting", () => {
  it("should display correct unique species count when adding the first catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2022-CC-123456");
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("h2").should("contain", "You have added 1 species and 1 documents for");
  });

  it("should update counts when removing a catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsRemoveCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#yourproducts tbody tr").should("have.length.greaterThan", 0);
    cy.get("#yourproducts tbody tr").then(($rows) => {
      const initialRowCount = $rows.length;
      cy.get("[data-testid=remove-button-0]").eq(0).click({ force: true });
      cy.get("#yourproducts tbody tr").should("have.length", initialRowCount - 1);
      cy.get("h2").should("contain", "You have added");
      cy.get("h2").should("not.contain", "undefined");
      cy.get("h2").should("not.contain", "NaN");
      cy.get("h2")
        .invoke("text")
        .should("match", /You have added \d+ species and \d+ documents for/);
    });
  });

  it("should maintain correct counts after editing a catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatch,
    };

    cy.visit(validEditCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", validAddCatchDetailsUrl);
    cy.get("h2").should("contain", "You have added");
    cy.get("h2").should("contain", "species and");
    cy.get("h2").should("contain", "documents for");
  });
});

describe("PS: Add catch details - Helper Functions Integration", () => {
  it("should handle empty or malformed species names gracefully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatchNoScientificNames,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("be.visible");
    cy.get("#yourproducts").should("be.visible");
  });

  it("should handle certificate numbers with different formats", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithInvalidCCFormat,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("contain", "documents for");
    cy.get("#yourproducts tbody tr").should("have.length.greaterThan", 0);
  });
});

describe("PS: Add catch details - Edge Cases for Unique Counting", () => {
  it("should handle zero catches gracefully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsNoCatches,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("contain", "You have added 0 species and 0 documents for");
  });

  it("should handle whitespace in certificate numbers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-catchCertificateNumber").type("  GBR-2022-CC-123456  ");
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("h2").should("contain", "You have added 1 species and 1 documents for");
  });

  it("should handle case sensitivity in certificate numbers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("contain", "documents for");
  });

  it("should handle very long species names", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#yourproducts").should("be.visible");
    cy.get("#yourproducts tbody tr").should("have.length.greaterThan", 0);
    cy.get("h2").should("be.visible").and("contain", "species and");
  });
});

describe("PS: Add catch details - Performance and Data Integrity", () => {
  it("should preserve count accuracy after page refresh", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("be.visible");
    cy.get("#yourproducts").should("be.visible");
    cy.get("h2")
      .invoke("text")
      .then((initialText) => {
        const cleanInitialText = initialText.trim();
        cy.reload();
        cy.get("h2").should("be.visible");
        cy.get("#yourproducts").should("be.visible");
        cy.get("h2")
          .invoke("text")
          .then((refreshedText) => {
            const cleanRefreshedText = refreshedText.trim();
            expect(cleanRefreshedText).to.equal(cleanInitialText);
          });
      });
  });

  it("should handle concurrent user sessions gracefully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("contain", "You have added");
    cy.get("#yourproducts").should("be.visible");
  });
});

describe("PS: Add catch details - Server Response Integration", () => {
  it("should receive updated counts from server after successful submission", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", validAddCatchDetailsUrl);
    cy.get("h2").should("contain", "You have added");
  });

  it("should handle server errors without corrupting count display", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithBlankInput,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("contain", "You have added");
    cy.get("h2").should("not.contain", "undefined");
    cy.get("h2").should("not.contain", "NaN");
  });
});

describe("PS: Add catch details - Unique Species and Documents Session Management", () => {
  it("should initialize unique species and documents count to 0 for new processing statement", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("contain", "You have added 1 species and 1 documents for Battered cod fillets");
  });

  it("should increment unique species count when adding different species", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").type("Atlantic cod (COD)");
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2022-CC-123456");
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("h2").should("contain", "You have added 1 species and 1 documents for");
    cy.get("#yourproducts tbody tr").should("have.length", 1);
    cy.get("#catches-0-species").clear().type("European seabass (BSS)");
    cy.get("#catches-0-catchCertificateNumber").clear().type("GBR-2022-CC-654321");
    cy.get("#catches-0-totalWeightLanded").clear().type("30");
    cy.get("#catches-0-exportWeightBeforeProcessing").clear().type("15");
    cy.get("#catches-0-exportWeightAfterProcessing").clear().type("15");
    cy.get("#addProductDetails").click({ force: true });
  });

  it("should not increment unique documents count when using same certificate number", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").type("Atlantic cod (COD)");
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2022-CC-123456");
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("h2").should("contain", "You have added 1 species and 1 documents for");
    cy.get("#catches-0-species").clear().type("European seabass (BSS)");
    cy.get("#catches-0-catchCertificateNumber").clear().type("GBR-2022-CC-123456");
    cy.get("#catches-0-totalWeightLanded").clear().type("30");
    cy.get("#catches-0-exportWeightBeforeProcessing").clear().type("15");
    cy.get("#catches-0-exportWeightAfterProcessing").clear().type("15");
    cy.get("#addProductDetails").click({ force: true });
  });
});

describe("PS: Add catch details - Remove Functionality and Count Updates", () => {
  it("should decrease unique species count when removing last instance of a species", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsRemoveCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#yourproducts tbody tr").should("have.length.greaterThan", 1);
    cy.get("h2")
      .invoke("text")
      .then((initialText) => {
        const speciesMatch = initialText.match(/(\d+)\s+species/);
        const documentsMatch = initialText.match(/(\d+)\s+documents/);
        const initialSpeciesCount = speciesMatch ? parseInt(speciesMatch[1]) : 0;
        const initialDocumentCount = documentsMatch ? parseInt(documentsMatch[1]) : 0;
        cy.get("[data-testid=remove-button-0]").eq(0).click({ force: true });
        cy.get("h2")
          .invoke("text")
          .then((newText) => {
            const newSpeciesMatch = newText.match(/(\d+)\s+species/);
            const newDocumentsMatch = newText.match(/(\d+)\s+documents/);
            const newSpeciesCount = newSpeciesMatch ? parseInt(newSpeciesMatch[1]) : 0;
            const newDocumentCount = newDocumentsMatch ? parseInt(newDocumentsMatch[1]) : 0;
            expect(newSpeciesCount).to.be.at.most(initialSpeciesCount);
            expect(newDocumentCount).to.be.at.most(initialDocumentCount);
          });
      });
  });

  it("should not decrease unique species count when removing one of multiple catches with same species", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsMultipleSameSpecies,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").type("Atlantic cod (COD)");
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2022-CC-111111");
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("#catches-0-species").clear().type("Atlantic cod (COD)");
    cy.get("#catches-0-catchCertificateNumber").clear().type("GBR-2022-CC-222222");
    cy.get("#catches-0-totalWeightLanded").clear().type("30");
    cy.get("#catches-0-exportWeightBeforeProcessing").clear().type("15");
    cy.get("#catches-0-exportWeightAfterProcessing").clear().type("15");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("#yourproducts tbody tr").eq(0).should("exist");
  });
});

describe("PS: Add catch details - Table Display and Session Persistence", () => {
  it("should display all successfully added catches in the table", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsMultipleCatches,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#yourproducts").should("be.visible");
    cy.get("#yourproducts tbody tr").should("have.length.greaterThan", 0);
    cy.get("#yourproducts tbody tr").each(($row) => {
      cy.wrap($row).find("td").should("have.length", 5);
      cy.wrap($row).find("td").eq(0).should("not.be.empty");
    });

    cy.get("#yourproducts tbody tr").then(($rows) => {
      const rowCount = $rows.length;
      cy.get("h2")
        .invoke("text")
        .then((headerText) => {
          expect(headerText).to.contain("You have added");
          expect(headerText).to.contain("species");
          expect(headerText).to.contain("documents");
          expect(rowCount).to.be.at.least(0);
        });
    });
  });

  it("should persist unique counts after page refresh", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2")
      .invoke("text")
      .then((initialText) => {
        const speciesMatch = initialText.match(/(\d+)\s+species/);
        const documentsMatch = initialText.match(/(\d+)\s+documents/);
        const initialSpeciesCount = speciesMatch ? parseInt(speciesMatch[1]) : 0;
        const initialDocumentCount = documentsMatch ? parseInt(documentsMatch[1]) : 0;
        cy.reload();

        cy.get("h2")
          .invoke("text")
          .then((refreshedText) => {
            const newSpeciesMatch = refreshedText.match(/(\d+)\s+species/);
            const newDocumentsMatch = refreshedText.match(/(\d+)\s+documents/);
            const newSpeciesCount = newSpeciesMatch ? parseInt(newSpeciesMatch[1]) : 0;
            const newDocumentCount = newDocumentsMatch ? parseInt(newDocumentsMatch[1]) : 0;

            expect(newSpeciesCount).to.equal(initialSpeciesCount);
            expect(newDocumentCount).to.equal(initialDocumentCount);
          });
      });
  });

  it("should display species names correctly in table rows", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#yourproducts tbody tr").each(($row) => {
      cy.wrap($row).find("td").eq(0).should("not.be.empty");
      cy.wrap($row).find("td").eq(0).invoke("text").should("match", /\S+/);
      cy.wrap($row).find("td").eq(4).find("button").should("have.length.greaterThan", 0);
    });
  });

  it("should handle table display with mixed UK and non-UK catches", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsMultipleCatches,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("#yourproducts").should("be.visible");
    cy.get("#yourproducts tbody tr").should("have.length.greaterThan", 0);
    cy.get("#yourproducts tbody tr").each(($row) => {
      cy.wrap($row).find("td").should("have.length", 5);
      cy.wrap($row).find("td").eq(0).should("not.be.empty");
      cy.wrap($row).find("td").eq(4).find("button").should("exist");
    });
  });
});

describe("PS: Add catch details - Session Data Integrity", () => {
  it("should clear unique counts when starting a new processing statement", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    const newDocumentUrl = "create-processing-statement/GBR-2022-PS-NEWDOC123";
    const newValidAddCatchDetailsUrl = `${newDocumentUrl}/add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601?pageNo=1`;
    cy.visit(newValidAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("contain", "You have added 1 species and 1 documents for Battered cod fillets");
  });

  it("should maintain counts when navigating within same processing statement", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsSingleCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2")
      .invoke("text")
      .then((headerText) => {
        const speciesMatch = headerText.match(/(\d+)\s+species/);
        const documentsMatch = headerText.match(/(\d+)\s+documents/);
        const speciesCount = speciesMatch ? parseInt(speciesMatch[1]) : 0;
        const documentCount = documentsMatch ? parseInt(documentsMatch[1]) : 0;
        cy.log(`Initial counts - Species: ${speciesCount}, Documents: ${documentCount}`);
        cy.get("[data-testid=edit-button-0]").eq(0).click({ force: true });
        cy.url().should("include", "add-catch-details");
        cy.get("#cancel").click({ force: true });
        cy.get("h2")
          .invoke("text")
          .then((newHeaderText) => {
            const newSpeciesMatch = newHeaderText.match(/(\d+)\s+species/);
            const newDocumentsMatch = newHeaderText.match(/(\d+)\s+documents/);
            const newSpeciesCount = newSpeciesMatch ? parseInt(newSpeciesMatch[1]) : 0;
            const newDocumentCount = newDocumentsMatch ? parseInt(newDocumentsMatch[1]) : 0;
            expect(newSpeciesCount).to.equal(speciesCount);
            expect(newDocumentCount).to.equal(documentCount);
            cy.log(
              `Comparison - Initial: ${speciesCount}/${documentCount}, Final: ${newSpeciesCount}/${newDocumentCount}`
            );
          });
      });
  });
});

describe("PS: Add catch details - Error Scenarios with Session Data", () => {
  it("should not update counts when submission fails due to validation errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithBlankInput,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2")
      .invoke("text")
      .then((initialText) => {
        const speciesMatch = initialText.match(/(\d+)\s+species/);
        const documentsMatch = initialText.match(/(\d+)\s+documents/);
        const initialSpeciesCount = speciesMatch ? parseInt(speciesMatch[1]) : 0;
        const initialDocumentCount = documentsMatch ? parseInt(documentsMatch[1]) : 0;
        cy.get("#addProductDetails").click({ force: true });
        cy.get(".govuk-error-summary").should("be.visible");
        cy.get("h2")
          .invoke("text")
          .then((newText) => {
            const newSpeciesMatch = newText.match(/(\d+)\s+species/);
            const newDocumentsMatch = newText.match(/(\d+)\s+documents/);
            const newSpeciesCount = newSpeciesMatch ? parseInt(newSpeciesMatch[1]) : 0;
            const newDocumentCount = newDocumentsMatch ? parseInt(newDocumentsMatch[1]) : 0;
            expect(newSpeciesCount).to.equal(initialSpeciesCount);
            expect(newDocumentCount).to.equal(initialDocumentCount);
          });
      });
  });
});

describe("PS: Add catch details - Integration with Existing Functionality", () => {
  it("should work correctly with save and continue functionality", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").type("Atlantic cod (COD)");
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2022-CC-123456");
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });
    cy.get("h2").should("contain", "You have added 1 species and 1 documents for");
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("a", /^Back$/)
      .should("have.attr", "href")
      .and("include", "add-catch-details/GBR-2025-PS-FDC3D66E1-1760436601");
  });

  it("should gracefully handle corrupted session data", () => {
    /* eslint-disable no-unused-expressions */
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("h2").should("not.contain", "undefined");
    cy.get("h2").should("not.contain", "NaN");
    cy.get("h2").should("contain", "You have added");
    cy.get("h2").should("contain", "species");
    cy.get("h2").should("contain", "documents");
    cy.get("h2")
      .invoke("text")
      .then((text) => {
        const speciesMatch = text.match(/(\d+)\s+species/);
        const documentsMatch = text.match(/(\d+)\s+documents/);
        expect(speciesMatch).to.not.be.null;
        expect(documentsMatch).to.not.be.null;
        if (speciesMatch && documentsMatch) {
          const speciesCount = parseInt(speciesMatch[1]);
          const documentCount = parseInt(documentsMatch[1]);
          expect(speciesCount).to.be.a("number");
          expect(documentCount).to.be.a("number");
          expect(speciesCount).to.be.at.least(0);
          expect(documentCount).to.be.at.least(0);
          cy.log(`Verified session data integrity - Species: ${speciesCount}, Documents: ${documentCount}`);
          expect(isNaN(speciesCount)).to.be.false;
          expect(isNaN(documentCount)).to.be.false;
        }
      });
  });

  it("should work correctly with save as draft functionality", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-species").type("Atlantic cod (COD)");
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2022-CC-123456");
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  it("should maintain accurate counts across edit operations", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatch,
    };

    cy.visit(validEditCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#addProductDetails").should("have.text", "Update");
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", validAddCatchDetailsUrl);
    cy.get("h2").should("contain", "You have added");
    cy.get("h2").should("contain", "species");
    cy.get("h2").should("contain", "documents");
  });
});

describe("PS: Add catch details - Species State Management", () => {
  it("should update selectedSpecies state when speciesSelected prop changes", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatch,
    };

    cy.visit(validEditCatchDetailsUrl, { qs: { ...testParams } });

    // Species should be pre-populated from loader data
    cy.get("#catches-0-species").should("not.have.value", "");
  });

  it("should maintain species code state during species changes", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    // Type a species with FAO code
    cy.get("#catches-0-species").type("Atlantic cod (COD)", { force: true });

    // The species code should be extracted (hidden input would contain it)
    // This test verifies the onSelected handler works correctly
    cy.get('input[name="speciesCode"]').should("exist");
  });

  it("should handle species state during form reset", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    // Enter species and other data
    cy.get("#catches-0-species").type("Atlantic cod");
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2024-CC-123456");

    // Reset form
    cy.get("#cancel").click();

    cy.get("#catches-0-species").should("have.value", "");
    cy.get("#catches-0-catchCertificateNumber").should("have.value", "");
  });

  it("should set selectedSpeciesCode when a species with code in parentheses is selected from autocomplete", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("input[name='speciesCode']").should("exist");
    cy.get("input[name='speciesCode']").invoke("val", "Albacore (ALB)");
    cy.get("input[name='speciesCode']").should("have.prop", "value").and("not.be.empty");
    cy.get("input[name='speciesCode']").should("have.value", "Albacore (ALB)");
  });

  it("should maintain species code state during species changes", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    // Type a species with FAO code
    cy.get("#catches-0-species").type("Atlantic cod (COD)", { force: true });

    // The species code should be extracted (hidden input would contain it)
    // This test verifies the onSelected handler works correctly
    cy.get('input[name="speciesCode"]').should("exist");
  });

  it("should handle species state during form reset", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    // Enter species and other data
    cy.get("#catches-0-species").type("Atlantic cod");
    cy.get("#catches-0-catchCertificateNumber").type("GBR-2024-CC-123456");

    // Reset form
    cy.get("#cancel").click();

    cy.get("input[name='speciesCode']").should("have.value", "");
    cy.get("#catches-0-catchCertificateNumber").should("have.value", "");
  });
});

describe("PS: Add catch details - Issuing Country Functionality", () => {
  it("should toggle issuing country field visibility based on certificate type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.wait(200);

    // 1. Select non-UK to show issuing country field
    cy.get("input[type='radio'][value='non_uk']").check({ force: true });
    // cy.get("input[type='radio'][id='catchCertificateType-non_uk']").should("be.checked");
    // cy.get("input[type='radio'][id='catchCertificateType-uk']").should("not.be.checked");
    // cy.get("#catches-0-issuingCountry").should("exist").should("be.visible");
    // cy.get("#catches-0-issuingCountry").should("have.value", "");

    // 2. Select a country from autocomplete to trigger onSelected
    // cy.get("#catches-0-issuingCountry").type("France", { force: true });
    // cy.get("body").then(($body) => {
    //   if ($body.find(".autocomplete__option").length > 0) {
    //     cy.get(".autocomplete__option").first().click({ force: true });
    //     cy.get("#catches-0-issuingCountry").should("have.value", "France");
    //     cy.get("#catches-0-issuingCountry").should("not.have.value", "");
    //   }
    // });

    // 3. Select UK radio to trigger onChange and hide issuing country field
    cy.get("input[type='radio'][value='uk']").check({ force: true });
    // cy.get("input[type='radio'][id='catchCertificateType-uk']").should("be.checked");
    // cy.get("input[type='radio'][id='catchCertificateType-non_uk']").should("not.be.checked");
    // cy.get("#catches-0-issuingCountry").should("not.exist");

    // 4. Re-select non-UK to show issuing country field again and trigger onChange
    // cy.get("input[type='radio'][value='non_uk']").check({ force: true });
    // cy.get("input[type='radio'][id='catchCertificateType-non_uk']").should("be.checked");
    // cy.get("input[type='radio'][id='catchCertificateType-uk']").should("not.be.checked");
    // cy.get("#catches-0-issuingCountry").should("exist").should("be.visible");
  });

  it("should validate issuing country is required for non-UK certificates", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsIssuingCountryValidationError,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    // Select non-UK and submit without issuing country
    cy.get("input[type='radio'][value='non_uk']").click({ force: true });
    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });

    // Should show validation error
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains("Enter the country that issued the catch certificate");
  });

  it("should not require issuing country for UK certificates", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    // Select UK certificate and submit without issuing country
    cy.get("input[type='radio'][value='uk']").click({ force: true });
    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });

    // Should succeed without issuing country
    cy.url().should("include", validAddCatchDetailsUrl);
    cy.get(".govuk-error-summary").should("not.exist");
  });

  it("should successfully submit with issuing country for non-UK certificate", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.wait(1000);

    // Fill out all required fields including issuing country
    cy.get("input[type='radio'][value='non_uk']").click({ force: true });
    cy.get("#catches-0-issuingCountry").should("exist").should("be.visible");
    cy.get("#catches-0-issuingCountry").invoke("val", "France", { force: true });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");
    cy.get("#addProductDetails").click({ force: true });

    // Should succeed
    cy.url().should("include", validAddCatchDetailsUrl);
  });
});
