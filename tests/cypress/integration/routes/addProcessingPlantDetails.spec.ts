import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-0D12ABA0A";
const pageUrl = `/create-processing-statement/${documentNumber}/add-processing-plant-details`;
const expectedOption = "Test Fish Plant (UK/1234/EC)";

const visitPage = (testCaseId: TestCaseId) => {
  const testParams: ITestParams = { testCaseId };
  cy.visit(pageUrl, { qs: { ...testParams } });
};

// Waits for hydration: the SSR fallback inputs are swapped for the autocomplete once React hydrates.
const visitJsPage = (testCaseId: TestCaseId) => {
  visitPage(testCaseId);
  cy.get("#processingPlant").should("be.visible");
};

const visitNonJsPage = (testCaseId: TestCaseId) => {
  const testParams: ITestParams = { testCaseId, disableScripts: true };
  cy.visit(pageUrl, { qs: { ...testParams } });
  cy.get("#plantName").should("be.visible");
};

const selectEstablishment = () => {
  cy.get("#processingPlant").clear();
  cy.get("#processingPlant").type(expectedOption);
};

const fillNonJsPlantDetails = (plantName: string, plantApprovalNumber: string) => {
  cy.get("#plantName").clear();
  cy.get("#plantName").type(plantName);
  cy.get("#plantApprovalNumber").clear();
  cy.get("#plantApprovalNumber").type(plantApprovalNumber);
};

const fillPersonResponsible = (name: string) => {
  cy.get("#personResponsibleForConsignment").clear();
  cy.get("#personResponsibleForConsignment").type(name);
};

describe("PS: add processing plant details - rendering", () => {
  it("should render the establishment autocomplete, hint and buttons for the JS journey", () => {
    visitJsPage(TestCaseId.PSAddProcessingPlantDetails);

    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("label[for='processingPlant']").should("contain", "Processing plant name and approval number");
    cy.contains("Search for an approved processing plant by name or approval number").should("be.visible");
    cy.get("#personResponsibleForConsignment").should("be.visible");
    cy.get("[data-testid='save-and-continue']").should("be.visible");
    cy.get("[data-testid='save-draft-button']").should("be.visible");
  });

  it("should render plain plant name and approval number inputs for the non-JS journey", () => {
    visitNonJsPage(TestCaseId.PSAddProcessingPlantDetailsMatchByApproval);

    cy.get("#plantApprovalNumber").should("be.visible");
    cy.contains("label", "Processing plant name").should("be.visible");
    cy.contains("label", "Plant approval number").should("be.visible");
    cy.contains("label", "Processing plant name and approval number").should("not.exist");
  });
});

describe("PS: add processing plant details - autocomplete filtering", () => {
  it("should filter establishments by plant name and by approval number", () => {
    visitJsPage(TestCaseId.PSAddProcessingPlantDetails);

    cy.get("#processingPlant").clear();
    cy.get("#processingPlant").type("Test Fish");
    cy.contains(".autocomplete__option", expectedOption).should("be.visible");

    cy.get("#processingPlant").clear();
    cy.get("#processingPlant").type("1234");
    cy.contains(".autocomplete__option", expectedOption).should("be.visible");
  });
});

describe("PS: add processing plant details - forbidden", () => {
  it("should redirect to the forbidden page when unauthorised", () => {
    visitPage(TestCaseId.PSAddProcessingPlantDetailsUnauthorised);
    cy.url().should("include", "/forbidden");
  });
});

describe("PS: add processing plant details - save and continue success", () => {
  it("should redirect to add-health-certificate when a matching establishment is selected in JS", () => {
    visitJsPage(TestCaseId.PSAddProcessingPlantDetailsMatchByApproval);

    selectEstablishment();
    fillPersonResponsible("Jane Doe");
    cy.get("[data-testid='save-and-continue']").click();

    cy.url().should("include", `/create-processing-statement/${documentNumber}/add-health-certificate`);
  });

  it("should redirect to add-processing-plant-address when values match in non-JS", () => {
    visitNonJsPage(TestCaseId.PSAddProcessingPlantDetailsMatchByApproval);

    fillNonJsPlantDetails("Test Fish Plant", "UK/1234/EC");
    fillPersonResponsible("Jane Doe");
    cy.get("[data-testid='save-and-continue']").click();

    cy.url().should("include", `/create-processing-statement/${documentNumber}/add-processing-plant-address`);
  });
});

describe("PS: add processing plant details - save and continue validation", () => {
  it("should show both plant errors in the summary when no establishment matches in JS", () => {
    visitJsPage(TestCaseId.PSAddProcessingPlantDetailsNoMatch);

    cy.get("#processingPlant").clear();
    cy.get("#processingPlant").type("Unknown Plant (UK/9999/EC)");
    fillPersonResponsible("Jane Doe");
    cy.get("[data-testid='save-and-continue']").click();

    cy.get("#error-summary-title").should("be.visible");
    cy.contains("Enter a valid processing plant name").should("be.visible");
    cy.contains("Enter a valid plant approval number").should("be.visible");
    cy.url().should("include", "/add-processing-plant-details");
  });

  it("should show inline errors for both plant fields when no establishment matches in non-JS", () => {
    visitNonJsPage(TestCaseId.PSAddProcessingPlantDetailsNoMatch);

    fillNonJsPlantDetails("Unknown Plant", "UK/9999/EC");
    fillPersonResponsible("Jane Doe");
    cy.get("[data-testid='save-and-continue']").click();

    cy.get("#plantName-error").should("contain", "Enter a valid processing plant name");
    cy.get("#plantApprovalNumber-error").should("contain", "Enter a valid plant approval number");
  });

  it("should require the person responsible in JS", () => {
    visitJsPage(TestCaseId.PSAddProcessingPlantDetailsError);

    selectEstablishment();
    cy.get("#personResponsibleForConsignment").clear();
    cy.get("[data-testid='save-and-continue']").click();

    cy.contains("Enter the name of the person responsible for this consignment").should("be.visible");
  });

  it("should require the person responsible in non-JS", () => {
    visitNonJsPage(TestCaseId.PSAddProcessingPlantDetailsError);

    fillNonJsPlantDetails("Test Fish Plant", "UK/1234/EC");
    cy.get("#personResponsibleForConsignment").clear();
    cy.get("[data-testid='save-and-continue']").click();

    cy.contains("Enter the name of the person responsible for this consignment").should("be.visible");
  });
});

describe("PS: add processing plant details - save as draft", () => {
  it("should redirect to the processing statements dashboard", () => {
    visitJsPage(TestCaseId.PSAddProcessingPlantDetailsSaveAsDraftNoErrors);

    selectEstablishment();
    fillPersonResponsible("Jane Doe");
    cy.get("[data-testid='save-draft-button']").click();

    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  // FI0-10577: saving a draft must succeed even when the document fails validation.
  it("should redirect to the dashboard when the document has validation errors", () => {
    visitJsPage(TestCaseId.PSAddProcessingPlantDetailsSaveAsDraftWithErrors);

    selectEstablishment();
    fillPersonResponsible("Jane Doe");
    cy.get("[data-testid='save-draft-button']").click();

    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});
