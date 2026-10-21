import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-0D12ABA0A";
const pageUrl = `/create-processing-statement/${documentNumber}/add-processing-plant-details`;

const visitPage = (testCaseId: TestCaseId, disableScripts = false) => {
  const testParams: ITestParams = { testCaseId, disableScripts };
  cy.visit(pageUrl, { qs: { ...testParams } });
};

const fillForm = (approvalNumber: string, personResponsible: string) => {
  cy.get("#plantApprovalNumber").clear();
  cy.get("#plantApprovalNumber").type(approvalNumber);
  cy.get("#personResponsibleForConsignment").clear();
  cy.get("#personResponsibleForConsignment").type(personResponsible);
};

describe("PS: add processing plant details - rendering", () => {
  it("should render approval number and person responsible fields without warning or establishment inputs", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetails);

    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid='warning-message']").should("not.exist");
    cy.get("#processingPlant").should("not.exist");
    cy.get("#plantName").should("not.exist");
    cy.contains("label", "Approval number (if applicable)").should("be.visible");
    cy.contains(
      "This is the establishment's approval number, for example 2093. If the establishment has more than one site, it may have a suffix, for example 4308-0014."
    ).should("be.visible");
    cy.get("#plantApprovalNumber").should("have.value", "Approval Number");
    cy.get("#personResponsibleForConsignment").should("be.visible");
    cy.get("[data-testid='save-and-continue']").should("be.visible");
    cy.get("[data-testid='save-draft-button']").should("be.visible");
  });

  it("should render the same simplified fields in the non-JS journey", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetails, true);

    cy.get("#plantApprovalNumber").should("be.visible");
    cy.get("#processingPlant").should("not.exist");
    cy.get("#plantName").should("not.exist");
  });
});

describe("PS: add processing plant details - forbidden", () => {
  it("should redirect to the forbidden page when unauthorised", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetailsUnauthorised);
    cy.url().should("include", "/forbidden");
  });
});

describe("PS: add processing plant details - save and continue success", () => {
  it("should progress to the next step when approval number and person responsible are provided", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetailsMatchByApproval);

    fillForm("UK/1234/EC", "Jane Doe");
    cy.get("[data-testid='save-and-continue']").click();

    cy.url().should(
      "match",
      new RegExp(
        `/create-processing-statement/${documentNumber}/(add-health-certificate|add-processing-plant-address)$`
      )
    );
  });
});

describe("PS: add processing plant details - save and continue validation", () => {
  it("should require the person responsible", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetailsError);

    cy.get("#plantApprovalNumber").clear();
    cy.get("#plantApprovalNumber").type("UK/1234/EC");
    cy.get("#personResponsibleForConsignment").clear();
    cy.get("[data-testid='save-and-continue']").click();

    cy.contains("Enter the name of the person responsible for this consignment").should("be.visible");
    cy.url().should("include", "/add-processing-plant-details");
  });
});

describe("PS: add processing plant details - save as draft", () => {
  it("should redirect to the processing statements dashboard", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetailsSaveAsDraftNoErrors);

    fillForm("UK/1234/EC", "Jane Doe");
    cy.get("[data-testid='save-draft-button']").click();

    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  // FI0-10577: saving a draft must succeed even when the document fails validation.
  it("should redirect to the dashboard when the document has validation errors", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetailsSaveAsDraftWithErrors);

    fillForm("UK/1234/EC", "Jane Doe");
    cy.get("[data-testid='save-draft-button']").click();

    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});

describe("PS: add processing plant details - no saved plantName", () => {
  it("should render the plant name field as the first field on the page when plantName is not already set", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetailsNoPlantName);

    cy.get("#plantName").should("be.visible");
    cy.get("input.govuk-input").first().should("have.attr", "id", "plantName");
    cy.contains("label", "Processing plant name").should("be.visible");
  });

  it("should show a validation error when plant name is left blank", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetailsNoPlantName);

    cy.get("#plantName").clear();
    cy.get("#plantApprovalNumber").clear();
    cy.get("#plantApprovalNumber").type("UK/1234/EC");
    cy.get("#personResponsibleForConsignment").clear();
    cy.get("#personResponsibleForConsignment").type("Jane Doe");
    cy.get("[data-testid='save-and-continue']").click();

    cy.contains("Enter the processing plant name").should("be.visible");
    cy.url().should("include", "/add-processing-plant-details");
  });

  it("should save the entered plant name and progress to the next step", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetailsNoPlantName);

    cy.get("#plantName").clear();
    cy.get("#plantName").type("New Fish Plant");
    fillForm("UK/1234/EC", "Jane Doe");
    cy.get("[data-testid='save-and-continue']").click();

    cy.url().should(
      "match",
      new RegExp(
        `/create-processing-statement/${documentNumber}/(add-health-certificate|add-processing-plant-address)$`
      )
    );
  });
});
