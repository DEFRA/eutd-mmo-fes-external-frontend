import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-storage-document/${documentNumber}`;
const truckPageUrl = `create-storage-document/${documentNumber}/add-transportation-details-truck`;

describe("Add Transportation Details Truck: Allowed", () => {
  it("should render truck transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "Truck departing the UK - Create a UK storage document - GOV.UK");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/do-you-have-a-road-transport-document`);
    cy.get(".govuk-heading-xl").contains("Truck departing the UK");
    cy.get("#exportDate").should("be.visible");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(5);
      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(5);
      expect(labels).to.have.length(8);
      expect(labels).to.deep.eq([
        "Consignment destination",
        "Where the truck departs from the UK",
        "Day",
        "Month",
        "Year",
        "Truck nationality",
        "Registration number",
        "Freight bill number (optional)",
      ]);
      expect(hints).to.deep.eq([
        "This is the main destination country for the export, not the countries it is passing through. This information will not appear on the final document.",
        "For example, Dover port, the Eurotunnel, or the place the truck departs from the UK",
        "For example, 25 07 2025",
        "Type at least two characters to load the list. For example, United Kingdom.",
        "For example, A123 4567 or BD51SMR",
        "For example, BD51SMR",
      ]);
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
    cy.contains("a", "Back to your progress").should("be.visible");
  });

  it("should redirect user to forbidden page when saveTransportDetails fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SaveTruckTransportDetailsFailsWith403,
    };

    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should display error when registration number exceeds 15 chars", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsTruckRegNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#registrationNumber").type(
      "registrationNumberregistrationNumberregistrationNumberregistrationNumberregistrationNumberregistrationNumberregistrationNumber",
      { force: true }
    );
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Registration number must not exceed 50 characters$/).should("be.visible");
  });

  it("should display error when registration number alphanumeric text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveAlphanumericTruckRegNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#registrationNumber").type("registrationNumber..", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Registration number must only contain letters, numbers, hyphens, and spaces$/).should(
      "be.visible"
    );
  });

  it("should display errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportErrors,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a valid truck nationality$/).should("be.visible");
    cy.contains("a", /^Enter the registration number$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
  });

  it("should navigate to SD dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveAsDraft,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("Truck", { force: true });
    cy.get("#registrationNumber").type("Registration", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
  });

  it("should navigate to departure summary page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSave,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("Truck", { force: true });
    cy.get("#registrationNumber").type("Registration", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/departure-product-summary");
  });
});

describe("Add Transportation Details Truck: Not Allowed", () => {
  it("should redirect to the progress page if transport is not truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportDisAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Transportation Details Plane: 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
