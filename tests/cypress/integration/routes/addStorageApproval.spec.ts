import { type ITestParams, TestCaseId } from "~/types";

const addStorageFacilityUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/add-storage-facility-details";
const addStorageApprovalUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/add-storage-facility-approval";
const progressUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/progress";
const storageFacilityUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/how-does-the-export-leave-the-uk";
const checkYourInformationUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/check-your-information";

describe("Add Storage Facility Approval", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApproval,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
  });

  it("should render Storage Facility Approval page", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", addStorageFacilityUrl);
    cy.get(".govuk-heading-xl").contains("Add storage facility details");
    cy.get(".govuk-label").contains("Approval number (if applicable)");
    cy.get(".govuk-hint").contains(
      "If the storage facility has an approval number enter it here. For example, UK/ABC/001, 1 UK 22028 or TSF001."
    );

    cy.get(".govuk-radios").should("be.visible");
    cy.get(".govuk-radios").contains("Chilled");
    cy.get(".govuk-radios").contains("Frozen");
    cy.get(".govuk-radios").contains("Other");
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");

    cy.get("#backToProgress").should("be.visible").should("have.attr", "href", progressUrl);
  });

  it("should redirect to progress page", () => {
    cy.get("#backToProgress").click({ force: true });
    cy.url().should("include", "/progress");
  });
});

describe("Add Storage Facility Approval - Complete", () => {
  it("should save and redirect to storage facility hub page on clicking save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalComplete,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });

    cy.get("#storageFacilities-facilityApproval").type("UK/ABC/001");
    cy.get("#chilled").check();
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", storageFacilityUrl);
  });

  it("should save and redirect to check your information page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalComplete,
    };
    cy.visit(addStorageApprovalUrl + `?nextUri=${checkYourInformationUrl}`, { qs: { ...testParams } });
    cy.get(`[data-testid="save-and-continue"]`).click({ force: true });
    cy.url().should("include", "/check-your-information");
  });
});

describe("Add Storage Facility Approval - Error", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
  });

  it("should not show validation errors when clicking on draft", () => {
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "create-storage-document/storage-document");
  });

  it("should show facility name validation error", () => {
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", "There is a problem");
    cy.contains("a", /Facility approval number must not exceed 50 characters$/)
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-facilityApproval");
    cy.get(".govuk-error-summary").should("be.visible");
  });
});

describe("Add Storage Facility Approval - How product is stored error", () => {
  it("should show an error message when the product stored radio button is not selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageProductStorageError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", "There is a problem");
    cy.contains("a", /Select how the product was stored$/)
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-facilityStorage");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get("#storageFacilities-facilityStorage-error")
      .should("be.visible")
      .contains("Select how the product was stored");
  });
});

describe("Add Storage Facility Approval - Forbidden", () => {
  it("should redirect to forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalForbidden,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
