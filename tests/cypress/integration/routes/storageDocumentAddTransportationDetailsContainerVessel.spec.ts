import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-4ED8CAE79";
const certificateUrl = `/create-storage-document/${documentNumber}`;
const pageUrl = `${certificateUrl}/add-transportation-details-container-vessel`;

describe("Add Transportation Details: Container Vessel", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportAllowed,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should render the expected header", () => {
    cy.get(".govuk-heading-xl").contains("Container vessel departing the UK");
    cy.title().should("eq", "Container vessel departing the UK - Create a UK storage document - GOV.UK");
  });

  it("should render back link", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk`);
  });

  it("should render the buttons texts", () => {
    cy.get('[data-testid="save-draft-button"]').contains("Save as draft");
    cy.get('[data-testid="save-and-continue"]').should("be.visible").contains("Save and continue");
  });

  it("should render the input label and hint text", () => {
    cy.contains("label", "Vessel name");
    cy.contains("label", "Flag state");
    cy.contains("label", "Container identification number");
    cy.contains("label", "Where the container vessel departs from the UK");
    cy.get("div .govuk-hint").contains(
      "For example, Felixstowe Port, London Gateway, or the place the container vessel departs from the UK"
    );
  });
});

describe("Save and Continue button - UnHappy path", () => {
  it("should redirect user to forbidden page when saveTransportDetails fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SaveVesselTransportDetailsFailsWith403,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should display errors at top", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get(".govuk-error-summary__list").contains("Enter the vessel name");
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    // cy.contains("a", /^Enter the container identification number or numbers$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
    cy.contains("a", /^Enter the flag state$/).should("be.visible");
    cy.contains("a", /^Enter the vessel name$/).should("be.visible");
  });
});

describe("Save and Continue button - Happy path", () => {
  it("should redirect to departure summary page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="containerNumbers.0"]').type("Container", { force: true });
    cy.get("#vesselName").type("Vessel", { force: true });
    cy.get("#flagState").type("flag State", { force: true });
    cy.get("#departurePlace").type("Place export", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/departure-product-summary");
  });

  it("should redirect to dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSaveAsDraft,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="containerNumbers.0"]').type("Container", { force: true });
    cy.get("#vesselName").type("Vessel", { force: true });
    cy.get("#flagState").type("flag State", { force: true });
    cy.get("#departurePlace").type("Place export", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
  });
});

describe("Add Transportation Details Container Vessel:  403 on page load", () => {
  it("should redirect to the forbidden page if transport is not Container Vessel", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Container Vessel Point of Destination - Validation Scenarios", () => {
  it("should display error when point of destination is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportPointOfDestinationRequired,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the point of destination$/).should("be.visible");
  });

  it("should display error when point of destination exceeds 100 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportPointOfDestinationMaxLength,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    const longString = new Array(102).join("a");
    cy.get("#pointOfDestination").type(longString, { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Point of destination must not exceed 100 characters$/).should("be.visible");
  });

  it("should display error when point of destination contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportPointOfDestinationInvalidCharacters,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#pointOfDestination").type("Invalid@#$%", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Point of destination must only contain letters, numbers, hyphens, apostrophes, spaces and forward slashes$/
    ).should("be.visible");
  });
});
