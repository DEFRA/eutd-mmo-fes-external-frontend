import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-non-manipulation-document/${documentNumber}`;
const trainPageUrl = `${certificateUrl}/add-transportation-details-train`;

describe("Add Transportation Details Train: Allowed", () => {
  it("should render train transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };

    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "Train departing the UK - Create a UK non-manipulation document - GOV.UK");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-leave-the-uk`);
    cy.get(".govuk-heading-xl").contains("Train departing the UK");
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
      expect(labels).to.have.length(10);
      expect(labels).to.deep.eq([
        "Consignment destination",
        "Point of destination",
        "Where the train departs from the UK",
        "Shipping container identification number (optional)",
        "Date the train departs the UK",
        "Day",
        "Month",
        "Year",
        "Railway bill number",
        "Freight bill number (optional)",
      ]);
      expect(hints).to.have.length(7);
      expect(hints).to.include(
        "This is the main destination country for the export, not the countries it is passing through. This information will not appear on the final document."
      );
      expect(hints).to.include(
        "For example, Calais port, Calais-Dunkerque airport or the destination point of the consignment."
      );
      expect(hints).to.include("For example, Felixstowe Port, Dover Port, or the place the train departs from the UK");
      expect(hints).to.include("For example, 25 07 2025");
      expect(hints).to.include("For example, AB12345C");
      expect(hints).to.include("For example, BD51SMR");
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
    cy.contains("a", "Back to your progress").should("be.visible");
  });

  it("should render labels with bold font weight for NMD departure transport", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Verify that labels have bold font weight class for NMD departure transport
    cy.get('label[id="exportedTo-label"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="pointOfDestination"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="departurePlace"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="railwayBillNumber"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="freightBillNumber"]').should("have.class", "govuk-!-font-weight-bold");

    // Verify all labels have the base govuk-label class
    cy.get('label[id="exportedTo-label"]').should("have.class", "govuk-label");
    cy.get('label[for="pointOfDestination"]').should("have.class", "govuk-label");
    cy.get('label[for="departurePlace"]').should("have.class", "govuk-label");
    cy.get('label[for="railwayBillNumber"]').should("have.class", "govuk-label");
    cy.get('label[for="freightBillNumber"]').should("have.class", "govuk-label");
  });

  it("should render all required fields for train departure transport", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Verify all fields are present
    cy.get("#exportedTo").should("exist");
    cy.get("#pointOfDestination").should("exist");
    cy.get("#departurePlace").should("exist");
    cy.get("#railwayBillNumber").should("exist");
    cy.get("#freightBillNumber").should("exist");
    cy.get("#exportDate-day").should("exist");
    cy.get("#exportDate-month").should("exist");
    cy.get("#exportDate-year").should("exist");
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
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should retain all field values including export date when saving as draft with complete data", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSaveAsDraft,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Fill all fields including export date and container
    cy.get("#railwayBillNumber").type("RAIL9876", { force: true });
    cy.get("#departurePlace").type("Channel Tunnel UK Terminal", { force: true });
    cy.get("#exportDate-day").type("28", { force: true });
    cy.get("#exportDate-month").type("07", { force: true });
    cy.get("#exportDate-year").type("2026", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("OPQR5678901", { force: true });

    // Save as draft
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");

    // Return to the page using CHECK testCaseId (hardcoded saved fixture — immune to double-GET and retry state issues)
    const checkParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSaveAsDraftRetainAllValuesCheck,
    };
    cy.visit(trainPageUrl, { qs: { ...checkParams } });

    // Verify all values retained
    cy.get("#railwayBillNumber").should("have.value", "RAIL9876");
    cy.get("#departurePlace").should("have.value", "Channel Tunnel UK Terminal");
    cy.get("#exportDate-day").should("have.value", "28");
    cy.get("#exportDate-month").should("have.value", "07");
    cy.get("#exportDate-year").should("have.value", "2026");
    cy.get('input[name="containerNumbers.0"]').should("have.value", "OPQR5678901");
  });

  it("should retain export date and accept invalid container format when saving as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSaveAsDraft,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Fill with invalid container numbers (would fail validation on save & continue)
    cy.get("#railwayBillNumber").type("EURO123", { force: true });
    cy.get("#departurePlace").type("St Pancras International", { force: true });
    cy.get("#exportDate-day").type("14", { force: true });
    cy.get("#exportDate-month").type("09", { force: true });
    cy.get("#exportDate-year").type("2026", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("WRONG", { force: true }); // Invalid format

    // Save as draft should accept invalid containers
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");

    // Return and verify values retained including invalid containers using CHECK testCaseId
    const checkParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSaveAsDraftRetainDateCheck,
    };
    cy.visit(trainPageUrl, { qs: { ...checkParams } });
    cy.get("#exportDate-day").should("have.value", "14");
    cy.get("#exportDate-month").should("have.value", "09");
    cy.get("#exportDate-year").should("have.value", "2026");
    cy.get('input[name="containerNumbers.0"]').should("have.value", "WRONG");
    cy.get('input[name="containerNumbers.1"]').should("have.value", "A");
  });

  it("should navigate to check-your-information page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railbill", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/check-your-information");
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

  it("should show format error when a container identification number has invalid format regardless of length", () => {
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

describe("Train Point of Destination - Validation Scenarios", () => {
  it("should display error when point of destination is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportPointOfDestinationRequired,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the point of destination$/).should("be.visible");
  });

  it("should display error when point of destination exceeds 100 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportPointOfDestinationMaxLength,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    const longString = new Array(102).join("a");
    cy.get("#pointOfDestination").type(longString, { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Point of destination must not exceed 100 characters$/).should("be.visible");
  });

  it("should display error when point of destination contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportPointOfDestinationInvalidCharacters,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#pointOfDestination").type("Invalid@#$%", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Point of destination must only contain letters, numbers, hyphens, apostrophes, spaces and forward slashes$/
    ).should("be.visible");
  });
});
