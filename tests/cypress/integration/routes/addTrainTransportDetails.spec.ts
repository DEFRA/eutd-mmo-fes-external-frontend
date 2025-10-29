import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-CC-3FE1169D1";
const certificateUrl = `/create-catch-certificate/${documentNumber}`;
const progressUrl = `${certificateUrl}/add-additional-transport-documents-train/0`;
const trainPageUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-train/0`;

describe("Add Transportation Details Train: Allowed", () => {
  it("should render train transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };

    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "Add transportation details: train - Create a UK catch certificate - GOV.UK");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk/0`);
    cy.get(".govuk-heading-xl").contains("Add transportation details: train");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(3);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(3);
      expect(labels).to.have.length(3);
      expect(labels).to.deep.eq([
        "Railway bill number",
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
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Railway bill number must not exceed 15 characters$/).should("be.visible");
  });

  it("should display error when freight bill number exceeds 60 chars", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsFreightBillNumber,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railbill", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("#freightBillNumber").type("Very Very Very Very Very Very Very Lengthy Freight Bill Number", {
      force: true,
    });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Freight bill number must not exceed 60 characters$/).should("be.visible");
  });

  it("should display error when railwat bill has alphanumeric text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveAlphanumericsRailwayBillNumber,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railway..", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
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

  it("should navigate to cc dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railbill", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should navigate to progress page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railbill", { force: true });
    cy.get("#departurePlace").type("Hull");
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", progressUrl);
  });

  it("should clear departurePlace and exportDate when vehicle changes from previous selection", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportVehicleChanged,
    };

    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("RB123456", { force: true });
    cy.get("#departurePlace").type("Liverpool", { force: true });
    cy.get("#freightBillNumber").type("FB789012", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", progressUrl);
    cy.get(".govuk-error-summary").should("not.exist");
    cy.get(".govuk-error-message").should("not.exist");
  });

  it("should preserve existing transport data when vehicle hasn't changed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportVehicleUnchanged,
    };

    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("RB123456", { force: true });
    cy.get("#departurePlace").type("Liverpool", { force: true });
    cy.get("#freightBillNumber").type("FB789012", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", progressUrl);
    cy.get(".govuk-error-summary").should("not.exist");
    cy.get("p.govuk-error-message").should("not.exist");
  });
});

describe("Add Transportation Details Train: Disallowed", () => {
  it("should redirect to the progress page if transport is not truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportDisAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("should redirect to forbidden page it transport details return 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
