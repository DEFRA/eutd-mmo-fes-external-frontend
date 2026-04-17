import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-0D12ABA0A";
const pageUrl = `/create-processing-statement/${documentNumber}/add-processing-plant-address`;

describe("Processing statement: add processing plant address - rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressWithExistingAddress,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should render the add processing plant address page", () => {
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
  });
});

describe("Processing statement: add processing plant address - forbidden", () => {
  it("should redirect to forbidden page when unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressForbidden,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Processing statement: add processing plant address - save and continue with errors", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantDetailsError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should show validation errors when save and continue is clicked with invalid data", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").should("be.visible");
    cy.url().should("include", "/add-processing-plant-address");
  });
});

describe("Processing statement: add processing plant address - save and continue success", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should redirect to add health certificate after successful save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/add-health-certificate");
  });
});

describe("Processing statement: add processing plant address - save as draft", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should redirect to the processing statements dashboard after save as draft", () => {
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});

describe("Processing statement: add processing plant address - save as draft with validation errors (FI0-10577)", () => {
  it("should redirect to the dashboard when Save as Draft is clicked with validation errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressSaveAsDraftWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});
