import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-CC-3FE1169D1";
const certificateUrl = `/create-catch-certificate/${documentNumber}`;
const planePageUrl = `create-catch-certificate/${documentNumber}/add-transportation-details-plane/0`;

describe("Add Transportation Details Plane: Allowed", () => {
  it("should render plane transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportAllowed,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "Add transportation details: plane - Create a UK catch certificate - GOV.UK");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk/0`);
    cy.get(".govuk-heading-xl").contains("Add transportation details: plane");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(4);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(4);
      expect(labels).to.have.length(4);
      expect(labels).to.deep.eq([
        "Flight number",
        "Container identification number or numbers",
        "Place export leaves the UK",
        "Freight bill number (optional)",
      ]);
      expect(hints).to.deep.eq(["For example, Hull.", "For example, BD51SMR"]);
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
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
    cy.contains("a", /^Enter the container identification number or numbers$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
  });

  it("should navigate to cc dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAsDraft,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("Plane", { force: true });
    cy.get("#containerNumber").type("Container", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should navigate to progress page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("Plane", { force: true });
    cy.get("#containerNumber").type("Container", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-plane/0");
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

describe("should redirect to forbidden page it transport details return 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
