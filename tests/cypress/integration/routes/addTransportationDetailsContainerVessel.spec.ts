import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-CC-4ED8CAE79";
const certificateUrl = `/create-catch-certificate/${documentNumber}`;
const ccPageUrl = `${certificateUrl}/add-transportation-details-container-vessel/0`;
const progressUrl = `${certificateUrl}/add-additional-transport-documents-container-vessel/0`;

describe("Add Transportation Details: Container Vessel", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportAllowed,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
  });

  it("should render the expected title", () => {
    cy.title().should("eq", "Add transportation details: container vessel - Create a UK catch certificate - GOV.UK");
  });

  it("should render the expected header", () => {
    cy.get(".govuk-heading-xl").contains("Add transportation details: container vessel");
  });

  it("should render back link", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk/0`);
  });

  it("should render the buttons texts", () => {
    cy.get('[data-testid="save-draft-button"]').contains("Save as draft");
    cy.get('[data-testid="save-and-continue"]').should("be.visible").contains("Save and continue");
  });

  it("should render the input label and hint text", () => {
    cy.contains("label", "Vessel name");
    cy.contains("label", "Flag state");
    cy.contains("label", "Container identification number or numbers");
    cy.contains("label", "Place export leaves the UK");
    cy.contains("label", "Freight bill number (optional)");
    cy.get("div .govuk-hint").contains("For example, Hull.");
    cy.get("div .govuk-hint").contains("For example, BD51SMR");
  });
});

describe("Save and Continue button - UnHappy path", () => {
  it("should redirect user to forbidden page when saveTransportDetails fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SaveVesselTransportDetailsFailsWith403,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should display errors at top", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportErrors,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get(".govuk-error-summary__list").contains("Enter the vessel name");
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the container identification number or numbers$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
    cy.contains("a", /^Enter the flag state$/).should("be.visible");
    cy.contains("a", /^Enter the vessel name$/).should("be.visible");
  });
});

describe("Save and Continue button - Happy path", () => {
  it("should redirect to progress page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#containerNumber").type("Container", { force: true });
    cy.get("#vesselName").type("Vessel", { force: true });
    cy.get("#flagState").type("flag State", { force: true });
    cy.get("#departurePlace").type("Place export", { force: true });
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", progressUrl);
  });

  it("should redirect to dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSaveAsDraft,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#containerNumber").type("Container", { force: true });
    cy.get("#vesselName").type("Vessel", { force: true });
    cy.get("#flagState").type("flag State", { force: true });
    cy.get("#departurePlace").type("Place export", { force: true });
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });
});

describe("Add Transportation Details Container Vessel : Disallowed", () => {
  it("should redirect to the progress page if transport is not Container Vessel", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportDisAllowed,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("should redirect to forbidden page it transport details return 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
