import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-0D12ABA0A";
const pageUrl = `/create-processing-statement/${documentNumber}/add-processing-plant-details`;

describe("Processing statement: add processing plant details - rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should render the add processing plant details page", () => {
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("#plantName").should("be.visible");
    cy.get("#plantApprovalNumber").should("be.visible");
    cy.get("#personResponsibleForConsignment").should("be.visible");
    cy.get("[data-testid='save-and-continue']").should("be.visible");
    cy.get("[data-testid='save-draft-button']").should("be.visible");
  });
});

describe("Processing statement: add processing plant details - forbidden", () => {
  it("should redirect to forbidden page when unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantDetailsUnauthorised,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Processing statement: add processing plant details - save and continue with errors", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressMissingPlantNameError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should show validation errors when save and continue is clicked with invalid data", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").should("be.visible");
    cy.url().should("include", "/add-processing-plant-details");
  });
});

describe("Processing statement: add processing plant details - save and continue success", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddProcessingPlantDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should redirect to add processing plant address after successful save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/add-processing-plant-address");
  });
});

describe("Processing statement: add processing plant details - save as draft", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddProcessingPlantDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should redirect to the processing statements dashboard after save as draft", () => {
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});

describe("Processing statement: add processing plant details - save as draft with validation errors (FI0-10577)", () => {
  it("should redirect to the dashboard when Save as Draft is clicked with validation errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantDetailsSaveAsDraftWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});
