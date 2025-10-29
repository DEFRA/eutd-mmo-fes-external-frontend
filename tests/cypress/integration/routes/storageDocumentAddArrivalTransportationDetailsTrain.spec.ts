import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-storage-document/${documentNumber}`;
const storageFacilityUrl = `${certificateUrl}/you-have-added-a-storage-facility`;
const trainPageUrl = `${certificateUrl}/add-arrival-transportation-details-train`;

describe("Add Transportation Details Train: Allowed", () => {
  it("should render train transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };

    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`);
    cy.get(".govuk-heading-xl").contains("Train arriving in the UK");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(4);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(4);
      expect(labels).to.have.length(7);
      expect(labels).to.deep.eq([
        "Railway bill number (optional)",
        "Freight bill number (optional)",
        "Country of departure (optional)",
        "Where the consignment departs from (optional)",
        "Day",
        "Month",
        "Year",
      ]);
      expect(hints).to.deep.eq([
        "For example, AB12345C",
        "For example, AA1234567",
        "This is the country the train left before it came to the UK",
        "For example, Calais port, Calais-Dunkerque airport or the place the train started its journey",
        "For example, 25 07 2025",
      ]);
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
  });

  it("should redirect user to forbidden page when saveTransportDetails fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SaveTransportDetailsFailsWith403,
    };

    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should display error when railway bill number exceeds 15 chars", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsRailwayBillNumber,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railway bill number", { force: true });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Railway bill number must not exceed 15 characters$/).should("be.visible");
  });

  it("should display error when railway bill has alphanumeric text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveAlphanumericsRailwayBillNumber,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railway..", { force: true });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Railway bill number must only contain letters and numbers$/).should("be.visible");
  });

  it("should display errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportErrors,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
    cy.contains("a", /^Enter the railway bill number$/).should("be.visible");
  });

  it("should navigate to sd dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSaveAsDraft,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railway Bill", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
  });

  it("should navigate to storage facility page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railway Bill", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", storageFacilityUrl);
  });

  it("should navigate to storage facility page on click of save and continue button with empty values", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", storageFacilityUrl);
  });
});

describe("Add Transportation Details Train: Disallowed", () => {
  it("should redirect to the forbidden page if transport is not truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDisAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Transportation Details Train: 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
