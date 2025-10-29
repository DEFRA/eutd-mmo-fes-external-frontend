import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-storage-document/${documentNumber}`;
const planePageUrl = `create-storage-document/${documentNumber}/add-transportation-details-plane`;

describe("Add Transportation Details Plane: Allowed", () => {
  it("should render plane transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportAllowed,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "Plane departing the UK - Create a UK storage document - GOV.UK");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk`);
    cy.get(".govuk-heading-xl").contains("Plane departing the UK");
    cy.get("#exportDate").should("be.visible");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(6);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(6);
      expect(labels).to.have.length(9);
      expect(labels).to.deep.eq([
        "Consignment destination",
        "Where the plane departs from the UK",
        "Day",
        "Month",
        "Year",
        "Air waybill number (optional)",
        "Flight number",
        "Container identification number",
        "Freight bill number (optional)",
      ]);
      expect(hints).to.deep.eq([
        "This is the main destination country for the export, not the countries it is passing through. This information will not appear on the final document.",
        "For example, London Heathrow Airport, East Midlands Airport, or the place the plane departs from the UK",
        "For example, 25 07 2025",
        "For example, 123-45678901",
        "For example, AF296Q",
        "For example, ABCD1234567",
        "For example, BD51SMR",
      ]);
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
    cy.contains("a", "Back to your progress").should("be.visible");
  });

  it("should redirect user to forbidden page when saveTransportDetails fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SavePlaneTransportDetailsFailsWith403,
    };

    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("button#continue").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should display error when flight number exceeds 15 chars", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsPlaneFlightNumber,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type(
      "flightNumberflightNumberflightNumberflightNumberflightNumberflightNumberflightNumberflightNumberflightNumberflightNumber",
      { force: true }
    );
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Flight number must not exceed 15 characters$/).should("be.visible");
  });

  it("should display error when flight number alphanumeric text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveAlphanumericPlaneFlightNumber,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("TestNumber..$@@", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Flight number must only contain letters and numbers$/).should("be.visible");
  });

  it("should display errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportErrors,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the flight number$/).should("be.visible");
    // cy.contains("a", /^Enter the container identification number or numbers$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
  });
  it("should navigate to sd dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAsDraft,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("Plane", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("Container", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
  });
  it("should navigate to departure summary page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("Plane", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("Container", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/departure-product-summary");
  });
});

describe("Add Transportation Details Plane: Not Allowed", () => {
  it("should redirect to the progress page if transport is not plane", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportNotAllowed,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Transportation Details Plane: 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
