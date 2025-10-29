import { type ITestParams, TestCaseId } from "~/types";

const psDetailsUrl = `create-processing-statement/GBR-2022-PS-3FE1169D1/add-processing-plant-details`;
const certificateUrl = `/create-processing-statement/GBR-2022-PS-3FE1169D1`;

describe("Add Processing Plant Details", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantDetails,
    };
    cy.visit(psDetailsUrl, { qs: { ...testParams } });
  });

  it("should render processing Plant Details page", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/catch-added`);
    cy.get(".govuk-heading-xl").contains("Add processing plant details");
    cy.contains("button", "Add address").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
  });

  it("will have a progress link to the progress page", () => {
    cy.contains("a", "Back to your progress").should("be.visible");
    cy.contains("a", "Back to your progress")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/progress`);
  });
  it("will have an alert text at the top of the page", () => {
    cy.get("[data-testid=warning-message]")
      .should("be.visible")
      .contains("An address must be added for this processing plant.");
  });

  it("will display label names for all inputs", () => {
    cy.get("label[for='plantName']").should("be.visible").contains("Processing plant name");
    cy.get("label[for='plantApprovalNumber']").should("be.visible").contains("Plant approval number");
    cy.get("label[for='personResponsibleForConsignment']")
      .should("be.visible")
      .contains("Person responsible for this consignment");
  });

  it("will display all the hint texts for the inputs", () => {
    cy.get("#hint-plantApprovalNumber")
      .should("be.visible")
      .contains("This is sometimes called a site code. For example, UK/1234/EC");
    cy.get("#hint-personResponsibleForConsignment")
      .should("be.visible")
      .contains("Enter the name of the person in charge at the processing plant. For example, John Smith");
  });

  it("will display current value for personResponsibleForConsignment input", () => {
    cy.get("#personResponsibleForConsignment").should("be.visible").should("have.value", "Test data");
  });

  it("will display current value for plantApprovalNumber input", () => {
    cy.get("#plantApprovalNumber").should("be.visible").should("have.value", "Approval Number");
  });
  it("will display current value for processingPlantName input", () => {
    cy.get("#plantName").should("be.visible").should("have.value", "Test Plantname");
  });
});

describe("Add Processing Plant Details return error response if the back end returns an error", () => {
  it("will return error response if the back end returns an error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantDetailsError,
    };

    cy.visit(psDetailsUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue").click({ force: true });
  });
});

describe("Get Processing Plant Details: unauthorised access", () => {
  it("will have a back link to the add exporters details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsUnauthorised,
    };
    cy.visit(psDetailsUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
    cy.get("h1").contains("Forbidden");
  });
});

describe("Add Processing Plant Details: save processing plant details", () => {
  it("will save the Processing Plant Details as draft and take the exporter the PS dashboard", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddProcessingPlantDetails,
    };

    cy.visit(psDetailsUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  it("will save the consignment details and take the exporter the next page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddProcessingPlantDetails,
    };

    cy.visit(psDetailsUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/create-processing-statement/GBR-2022-PS-3FE1169D1/add-processing-plant-address");
  });
});
