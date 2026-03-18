import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-4ED8CAE79";
const certificateUrl = `/create-non-manipulation-document/${documentNumber}`;
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
    cy.title().should("eq", "Container vessel departing the UK - Create a UK non-manipulation document - GOV.UK");
  });

  it("should render back link", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-leave-the-uk`);
  });

  it("should render the buttons texts", () => {
    cy.get('[data-testid="save-draft-button"]').contains("Save as draft");
    cy.get('[data-testid="save-and-continue"]').should("be.visible").contains("Save and continue");
  });

  it("should render the input label and hint text", () => {
    cy.contains("label", "Vessel name");
    cy.contains("label", "Flag state");
    cy.contains("label", "Shipping container identification number");
    cy.contains("label", "Where the container vessel departs from the UK");
    cy.get("div .govuk-hint").contains(
      "For example, Felixstowe Port, London Gateway, or the place the container vessel departs from the UK"
    );
  });

  it("should render labels with bold font weight for NMD departure transport", () => {
    cy.get('label[id="exportedTo-label"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="pointOfDestination"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="vesselName"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="flagState"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="departurePlace"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="freightBillNumber"]').should("have.class", "govuk-!-font-weight-bold");

    // Verify all labels have the base govuk-label class
    cy.get('label[id="exportedTo-label"]').should("have.class", "govuk-label");
    cy.get('label[for="pointOfDestination"]').should("have.class", "govuk-label");
    cy.get('label[for="vesselName"]').should("have.class", "govuk-label");
    cy.get('label[for="flagState"]').should("have.class", "govuk-label");
    cy.get('label[for="departurePlace"]').should("have.class", "govuk-label");
    cy.get('label[for="freightBillNumber"]').should("have.class", "govuk-label");
  });

  it("should render all required fields for container vessel departure transport", () => {
    cy.get("#exportedTo").should("exist");
    cy.get("#pointOfDestination").should("exist");
    cy.get("#vesselName").should("exist");
    cy.get("#flagState").should("exist");
    cy.get("#departurePlace").should("exist");
    cy.get("#freightBillNumber").should("exist");
    cy.get("#exportDate-day").should("exist");
    cy.get("#exportDate-month").should("exist");
    cy.get("#exportDate-year").should("exist");
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
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
    cy.contains("a", /^Enter the flag state$/).should("be.visible");
    cy.contains("a", /^Enter the vessel name$/).should("be.visible");
  });
});

describe("Save and Continue button - Happy path", () => {
  it("should redirect to check-your-information page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get('input[name="containerNumber.0"]').type("Container", { force: true });
    cy.get("#vesselName").type("Vessel", { force: true });
    cy.get("#flagState").type("flag State", { force: true });
    cy.get("#departurePlace").type("Place export", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/check-your-information");
  });

  it("should redirect to dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSaveAsDraft,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Fill in all required fields
    cy.get('input[id="exportedTo"]').type("France");
    cy.get(".autocomplete__option").first().click();
    cy.get("#pointOfDestination").type("Valid Point of Destination", { force: true });
    cy.get('input[name="containerNumber.0"]').type("Container", { force: true });
    cy.get("#vesselName").type("Vessel", { force: true });
    cy.get("#flagState").type("flag State", { force: true });
    cy.get("#departurePlace").type("Place export", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
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

  it("should save valid fields and redirect to dashboard when saving as draft with invalid pointOfDestination", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportPointOfDestinationMaxLength,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Fill in all valid fields
    cy.get('input[id="exportedTo"]').type("France");
    cy.get(".autocomplete__option").first().click();
    cy.get('input[name="containerNumber.0"]').type("ABCD1234567", { force: true });
    cy.get("#vesselName").type("Valid Vessel Name", { force: true });
    cy.get("#flagState").type("Valid Flag State", { force: true });
    cy.get("#departurePlace").type("Valid Departure Place", { force: true });

    // Fill in invalid pointOfDestination (>101 chars)
    const longString =
      "q7N2vX9wL4kP1mR8zB3tY5jS0hG6fD9cA2xB7nV1mQ8wL4kP0zR5tY2jS9hG3fD6cA1xB8nV4mQ0wL7kP2zR5tY8jS3hG1fD4cA9dfsdfsdfsdf7644456";
    cy.get("#pointOfDestination").type(longString, { force: true });

    // Click save as draft
    cy.get("[data-testid=save-draft-button]").click({ force: true });

    // Should redirect to NMD dashboard without errors
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
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

describe("Container Vessel Save as Draft - Retain valid field values", () => {
  it("should retain all valid vessel fields when saving as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportSaveAsDraftRetainAllValues,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Fill all valid fields
    cy.get("#vesselName").clear({ force: true }).type("Atlantic Star", { force: true });
    cy.get("#flagState").clear({ force: true }).type("Greece", { force: true });
    cy.get("#departurePlace").clear({ force: true }).type("Felixstowe Port", { force: true });
    cy.get('input[name="containerNumber.0"]').clear({ force: true }).type("ABCJ0123456", { force: true });

    // Save as draft
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");

    // Return to page using CHECK handler (hardcoded saved fixture)
    const checkParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportSaveAsDraftRetainAllValuesCheck,
    };
    cy.visit(pageUrl, { qs: { ...checkParams } });

    // Verify all valid values are retained
    cy.get("#vesselName").should("have.value", "Atlantic Star");
    cy.get("#flagState").should("have.value", "Greece");
    cy.get("#departurePlace").should("have.value", "Felixstowe Port");
    cy.get('input[name="containerNumber.0"]').should("have.value", "ABCJ0123456");
  });

  it("should clear invalid vesselName but retain valid flagState when saving as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportSaveAsDraftInvalidVesselName,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Enter invalid chars in vesselName (::::), valid value in flagState (Greece) and departurePlace
    cy.get("#vesselName").clear({ force: true }).type("::::", { force: true });
    cy.get("#flagState").clear({ force: true }).type("Greece", { force: true });
    cy.get("#departurePlace").clear({ force: true }).type("Felixstowe Port", { force: true });

    // Save as draft
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");

    // Return to page using CHECK handler (hardcoded saved fixture)
    const checkParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportSaveAsDraftInvalidVesselNameCheck,
    };
    cy.visit(pageUrl, { qs: { ...checkParams } });

    // vesselName should be blank (invalid chars cleared), flagState and departurePlace retained
    cy.get("#vesselName").should("have.value", "");
    cy.get("#flagState").should("have.value", "Greece");
    cy.get("#departurePlace").should("have.value", "Felixstowe Port");
  });
});
