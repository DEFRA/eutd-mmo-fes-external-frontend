import { type ITestParams, TestCaseId } from "~/types";

const ccNumber = "GBR-2022-PS-F2D5CD656";
const documentUrl = "create-processing-statement/GBR-2022-PS-0D12ABA0A";
const validAddCatchDetailsUrl = `${documentUrl}/add-catch-details/ASD?catchType=non_uk&pageNo=1`;
const validAddCatchDetailsUrlForUK = `${documentUrl}/add-catch-details/ASD?catchType=uk&pageNo=1`;
const validEditCatchDetailsUrl = `${documentUrl}/add-catch-details/ASD/0?catchType=non_uk&pageNo=1`;
const validEditCatchDetailsNextUrl = `${documentUrl}/add-catch-details/COD/0?catchType=non_uk&pageNo=2&nextUri=abc`;
const validEditCatchDetailsUrlForUK = `${documentUrl}/add-catch-details/ASD/0?catchType=uk&pageNo=1`;

describe("PS: Add catch details", () => {
  it("should check whethere it is nonuk or uk", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get(".govuk-heading-xl ").contains("Add catch details for non-UK catch to the consignment");
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

  it("should add first catch successfully and stay on the same page with page number provided as 2", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatch,
    };

    cy.visit(`${documentUrl}/add-catch-details/ASD?catchType=non_uk&pageNo=2`, { qs: { ...testParams } });

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

    cy.visit(`${documentUrl}/add-catch-details/ASD?catchType=non_uk&pageNo=NaN`, { qs: { ...testParams } });

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

    cy.visit(`${documentUrl}/add-catch-details/ASD?catchType=non_uk`, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });

  it("should add first catch successfully and stay on the same page with second page number provided with no scientific names", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsFirstCatchNoScientificNames,
    };

    cy.visit(`${documentUrl}/add-catch-details/ASD?catchType=non_uk`, { qs: { ...testParams } });

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

    cy.visit(`${documentUrl}/add-catch-details/ASD?catchType=non_uk`, { qs: { ...testParams } });

    cy.get("#catches-0-catchCertificateNumber").type(ccNumber);
    cy.get("#catches-0-totalWeightLanded").type("50");
    cy.get("#catches-0-exportWeightBeforeProcessing").type("25");
    cy.get("#catches-0-exportWeightAfterProcessing").type("25");

    cy.get("#addProductDetails").click({ force: true });

    cy.url().should("include", `${validAddCatchDetailsUrl}`);
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

    cy.get(".govuk-heading-l").contains("You have added 1 catch certificate for Allis shad (ASD)");

    cy.get("#yourproducts").find("tbody > tr").should("have.length", 1);
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
    cy.url().should("include", "/forbidden");
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

  it("should display an error if the catch certificate number contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsWithIncorrectFormatCCFormat,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("#catches-0-catchCertificateNumber").type("@£$@", { force: true });

    cy.get("#addProductDetails").click({ force: true });

    cy.get(".govuk-error-summary__list")
      .find("li > a")
      .contains(
        "Catch certificate number must only contain letters, numbers, forward slashes, backslashes, spaces, hyphens, and full stops"
      );
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

  it("should display an additional hint if the catch references a UK catch certificate", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUkCatchType,
    };

    cy.visit(validAddCatchDetailsUrlForUK, { qs: { ...testParams } });
    cy.contains(
      ".govuk-hint",
      "Only enter one catch certificate document number including any hyphens/dashes or other characters. For example, GBR-2024-CC-BEFCD6036"
    );
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
    cy.get("#addProductDetails").should("have.text", "Update Catch Certificate");
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", `${validAddCatchDetailsUrl}`);
  });

  it("should be able to update the catchcertificate and return nextUri", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatch,
    };

    cy.visit(validEditCatchDetailsNextUrl, { qs: { ...testParams } });
    cy.get("#addProductDetails").should("have.text", "Update Catch Certificate");
    cy.get("#addProductDetails").click({ force: true });
    cy.url().should("include", `abc`);
  });

  it("should display an error if one occurs whilst updating a catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsUpdateCatchError,
    };
    cy.visit(validEditCatchDetailsUrlForUK, { qs: { ...testParams } });
    cy.get("#addProductDetails").should("have.text", "Update Catch Certificate");
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

  it("should add catch successfully and display in the table", () => {
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

    cy.get("#catches-0-catchCertificateNumber").should("have.value", "");
    cy.get("#catches-0-totalWeightLanded").should("have.value", "");
    cy.get("#catches-0-exportWeightBeforeProcessing").should("have.value", "");
    cy.get("#catches-0-exportWeightAfterProcessing").should("have.value", "");
  });

  it("should be able to remove the catchcertificate", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsRemoveCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("#yourproducts").find("tbody > tr").should("have.length", 2);
    cy.get("[data-testid=remove-button-0]").eq(0).click({ force: true });
    cy.url().should("include", `${validAddCatchDetailsUrl}`);
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

    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.contains("a", /^Back$/)
      .should("have.attr", "href")
      .and("include", "add-catch-details/ASD?catchType=non_uk");
  });

  it("should error on save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsContinueCatchError,
    };

    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("Enter at least one Catch Certificate");
  });

  it("should be able to remove a catch and still display the species", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsRemoveCatch,
    };
    cy.visit(validAddCatchDetailsUrl, { qs: { ...testParams } });

    cy.get("#yourproducts").find("tbody > tr").should("have.length", 2);
    cy.get("[data-testid=remove-button-0]").click({ force: true });
    cy.get("#yourproducts").find("tbody > tr").should("have.length", 1);
    cy.url().should("include", `${validAddCatchDetailsUrl}`);

    cy.get("#event-name-hint").should("have.text", "Allis shad (ASD)");
    cy.get("h2").should("include.text", "Allis shad");
  });

  it("should render a pagination for navigation", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsMultipleCatches,
    };

    cy.visit(`${documentUrl}/add-catch-details/AGH?catchType=uk&pageNo=1`, { qs: { ...testParams } });
    cy.get("[data-testid=next-link]").eq(0).click({ force: true });
    cy.url().should("include", "&pageNo=2");
  });

  it("should render a pagination for navigation for a page 2", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddCatchDetailsMultipleCatches,
    };

    cy.visit(`${documentUrl}/add-catch-details/AGH?catchType=uk&pageNo=2`, { qs: { ...testParams } });
    cy.get("[data-testid=previous-link]").eq(0).click({ force: true });
    cy.url().should("include", "&pageNo=1");
  });
});
