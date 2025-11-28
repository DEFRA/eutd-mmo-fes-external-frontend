import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-storage-document/${documentNumber}`;
const trainPageUrl = `${certificateUrl}/add-transportation-details-train`;

describe("Add Transportation Details Train: Allowed", () => {
  it("should render train transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };

    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "Train departing the UK - Create a UK storage document - GOV.UK");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk`);
    cy.get(".govuk-heading-xl").contains("Train departing the UK");
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
        "Where the train departs from the UK",
        "Container identification number (optional)",
        "Day",
        "Month",
        "Year",
        "Railway bill number",
        "Freight bill number (optional)",
      ]);
      expect(hints).to.deep.eq([
        "This is the main destination country for the export, not the countries it is passing through. This information will not appear on the final document.",
        "For example, Felixstowe Port, Dover Port, or the place the train departs from the UK",
        "Enter container or trailer identification number. For example, ABCD1234567.",
        "For example, 25 07 2025",
        "For example, AB12345C",
        "For example, BD51SMR",
      ]);
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
    cy.contains("a", "Back to your progress").should("be.visible");
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
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Railway bill number must not exceed 15 characters$/).should("be.visible");
  });

  it("should display error when railwat bill has alphanumeric text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveAlphanumericsRailwayBillNumber,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railway..", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
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
    cy.get('input[name="containerNumbers.0"]').type("Container", { force: true });
    cy.get("#railwayBillNumber").type("Railbill", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
  });

  it("should navigate to departure summary page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railbill", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/departure-product-summary");
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

describe("Add Transportation Details Train: 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Train Container Identification Number - Validation Scenarios", () => {
  it("should display error when container number has invalid format", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainSaveInvalidFormatContainerNumber,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get('[name="containerNumbers.0"]').should("be.visible").type("INVALID@#", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", "There is a problem").should("be.visible");
  });

  it("should show error when a container identification number exceeds 50 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainSaveMaxCharsContainerIdentificationNumber,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get('[name="containerNumbers.0"]')
      .should("be.visible")
      .type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", {
        force: true,
      });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", "There is a problem").should("be.visible");
  });

  it("should add 5 container numbers with correct format", () => {
    const testParams = {
      testCaseId: TestCaseId.TrainSaveContainerNumber,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    for (let i = 0; i < 5; i++) {
      cy.wait(500);
      cy.get(`[name="containerNumbers.${i}"]`).should("be.visible").type("ABCD1234567", { force: true });
      if (i < 4) {
        cy.get('[data-testid="add-another-container"]').click({ force: true });
      }
    }

    cy.get("[data-testid=save-and-continue]").click({ force: true });
  });

  it("should remove a container input when the remove button is clicked", () => {
    const testParams = {
      testCaseId: TestCaseId.TrainSaveContainerNumber,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    cy.wait(500);
    cy.get('[data-testid="add-another-container"]').click({ force: true });

    cy.get('[name="containerNumbers.0"]').type("ABCD1234567", { force: true });
    cy.get('[name="containerNumbers.1"]').type("ABCD1234561", { force: true });

    cy.get('[name^="containerNumbers."]').should("have.length", 2);

    cy.get('[data-testid="remove-container-1"]').click({ force: true });

    cy.get('[name^="containerNumbers."]').should("have.length", 1);
    cy.get('[name="containerNumbers.0"]').should("have.value", "ABCD1234567");
  });
});
