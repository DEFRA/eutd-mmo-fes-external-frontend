import { type ITestParams, TestCaseId } from "~/types";

const psAddressUrl = "create-processing-statement/GBR-2022-PS-3FE1169D1/add-processing-plant-address";
const psAddressEnterUrl = "/create-processing-statement/GBR-2022-PS-3FE1169D1/what-processing-plant-address";
const psDetailsUrl = "/create-processing-statement/GBR-2022-PS-3FE1169D1/add-processing-plant-details";
const progressUrl = "/create-processing-statement/GBR-2022-PS-3FE1169D1/progress";
const healthCertUrl = "/create-processing-statement/GBR-2022-PS-3FE1169D1/add-health-certificate";

describe("Add Processing Plant Address", () => {
  it("should render processing Plant Address page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", psDetailsUrl);

    cy.get(".govuk-heading-xl").contains("Add processing plant address");

    cy.contains("p", "An address must be added for this processing plant.");

    cy.contains("[data-testid=goToAddAddress-button]", /^Add processing plant address$/).should("be.visible");

    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");

    cy.get("#backToProgress").should("be.visible").should("have.attr", "href", progressUrl);

    cy.get("[data-testid=goToAddAddress-button]").click({ force: true });
    cy.url().should("include", psAddressEnterUrl);
  });

  it("should show validation error when clicking on draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressMissingPlantNameError,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "create-processing-statement/processing-statement");
  });

  it("should show validation error when clicking on save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressMissingPlantAddressError,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", "There is a problem");
    cy.contains("a", /^Enter the address$/)
      .should("be.visible")
      .should("have.attr", "href", "#consignmentDescription");
  });

  it("should show validation error for plant name when clicking on save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressInvalidPlantNameError,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("#plantName").type("@$TYHg%", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", "There is a problem");
  });

  it("should redirect save to ps progress page on click of save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "create-processing-statement/processing-statement");
  });

  it("should save and redirect to ps dashboard on click of save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", healthCertUrl);
  });

  it("should navigate to forbidden page plant address page:unauthorised access", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressForbidden,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
