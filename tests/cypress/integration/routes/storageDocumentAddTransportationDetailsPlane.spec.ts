import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-non-manipulation-document/${documentNumber}`;
const planePageUrl = `create-non-manipulation-document/${documentNumber}/add-transportation-details-plane`;

describe("Add Transportation Details Plane: Allowed", () => {
  it("should render plane transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportAllowed,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "Plane departing the UK - Create a UK non-manipulation document - GOV.UK");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-leave-the-uk`);
    cy.get(".govuk-heading-xl").contains("Plane departing the UK");
    cy.get("#exportDate").should("be.visible");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(7);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(7);
      expect(labels).to.have.length(11);
      expect(labels).to.deep.eq([
        "Consignment destination",
        "Point of destination",
        "Where the plane departs from the UK",
        "Date the plane departs the UK",
        "Day",
        "Month",
        "Year",
        "Air waybill number (optional)",
        "Flight number",
        "Container identification number",
        "Freight bill number (optional)",
      ]);
      expect(hints).to.have.length(8);
      expect(hints).to.include(
        "This is the main destination country for the export, not the countries it is passing through. This information will not appear on the final document."
      );
      expect(hints).to.include(
        "For example, Calais port, Calais-Dunkerque airport or the destination point of the consignment."
      );
      expect(hints).to.include(
        "For example, London Heathrow Airport, East Midlands Airport, or the place the plane departs from the UK"
      );
      expect(hints).to.include("For example, 25 07 2025");
      expect(hints).to.include("For example, 123-45678901");
      expect(hints).to.include("For example, AF296Q");
      expect(hints).to.include("For example, ABCD1234567");
      expect(hints).to.include("For example, BD51SMR");
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
    cy.contains("a", "Back to your progress").should("be.visible");
  });

  it("should render labels with bold font weight for NMD departure transport", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportAllowed,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    // Verify that labels have bold font weight class for NMD departure transport
    cy.get('label[id="exportedTo-label"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="pointOfDestination"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="departurePlace"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="flightNumber"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="airwayBillNumber"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="freightBillNumber"]').should("have.class", "govuk-!-font-weight-bold");

    // Verify all labels have the base govuk-label class
    cy.get('label[id="exportedTo-label"]').should("have.class", "govuk-label");
    cy.get('label[for="pointOfDestination"]').should("have.class", "govuk-label");
    cy.get('label[for="departurePlace"]').should("have.class", "govuk-label");
    cy.get('label[for="flightNumber"]').should("have.class", "govuk-label");
    cy.get('label[for="airwayBillNumber"]').should("have.class", "govuk-label");
    cy.get('label[for="freightBillNumber"]').should("have.class", "govuk-label");
  });

  it("should render all required fields for plane departure transport", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportAllowed,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    // Verify all fields are present
    cy.get("#exportedTo").should("exist");
    cy.get("#pointOfDestination").should("exist");
    cy.get("#departurePlace").should("exist");
    cy.get("#flightNumber").should("exist");
    cy.get("#airwayBillNumber").should("exist");
    cy.get("#freightBillNumber").should("exist");
    cy.get("#exportDate-day").should("exist");
    cy.get("#exportDate-month").should("exist");
    cy.get("#exportDate-year").should("exist");
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

  it("should display error messages in the same order as the fields on the page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportErrors,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");

    // departurePlace field appears before flightNumber field on the page,
    // so its error should appear first in the error summary
    cy.get(".govuk-error-summary__list li").then(($items) => {
      const texts = $items.map((_, el) => Cypress.$(el).text().trim()).get();
      const departurePlaceIndex = texts.findIndex((t) => t.includes("place the export leaves the UK"));
      const flightNumberIndex = texts.findIndex((t) => t.includes("flight number"));
      expect(departurePlaceIndex).to.be.greaterThan(-1, "departurePlace error should be present");
      expect(flightNumberIndex).to.be.greaterThan(-1, "flightNumber error should be present");
      expect(departurePlaceIndex).to.be.lessThan(
        flightNumberIndex,
        "departurePlace error should appear before flightNumber error"
      );
    });
  });

  it("should navigate to sd dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAsDraft,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("Plane", { force: true });
    cy.get('input[name="containerNumber.0"]').type("Container", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should retain all field values including export date when saving as draft with complete data", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAsDraft,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    // Fill all fields including export date and container
    cy.get("#flightNumber").type("EK215", { force: true });
    cy.get("#departurePlace").type("Gatwick Airport", { force: true });
    cy.get("#exportDate-day").type("18", { force: true });
    cy.get("#exportDate-month").type("04", { force: true });
    cy.get("#exportDate-year").type("2026", { force: true });
    cy.get('input[name="containerNumber.0"]').type("KLMN4567890", { force: true });

    // Save as draft
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");

    // Return to the page using CHECK testCaseId (hardcoded saved fixture — immune to double-GET and retry state issues)
    const checkParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAsDraftRetainAllValuesCheck,
    };
    cy.visit(planePageUrl, { qs: { ...checkParams } });

    // Verify all values retained
    cy.get("#flightNumber").should("have.value", "EK215");
    cy.get("#departurePlace").should("have.value", "Gatwick Airport");
    cy.get("#exportDate-day").should("have.value", "18");
    cy.get("#exportDate-month").should("have.value", "04");
    cy.get("#exportDate-year").should("have.value", "2026");
    cy.get('input[name="containerNumber.0"]').should("have.value", "KLMN4567890");
  });

  it("should retain export date and accept invalid container format when saving as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAsDraft,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    // Fill with invalid container numbers (would fail validation on save & continue)
    cy.get("#flightNumber").type("QR123", { force: true });
    cy.get("#departurePlace").type("Manchester Airport", { force: true });
    cy.get("#exportDate-day").type("01", { force: true });
    cy.get("#exportDate-month").type("06", { force: true });
    cy.get("#exportDate-year").type("2026", { force: true });
    cy.get('input[name="containerNumber.0"]').type("TOOSHORT", { force: true }); // Invalid format

    // Save as draft should accept invalid containers
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");

    // Return and verify values retained including invalid containers using CHECK testCaseId
    const checkParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAsDraftRetainDateCheck,
    };
    cy.visit(planePageUrl, { qs: { ...checkParams } });
    cy.get("#exportDate-day").should("have.value", "01");
    cy.get("#exportDate-month").should("have.value", "06");
    cy.get("#exportDate-year").should("have.value", "2026");
    cy.get('input[name="containerNumber.0"]').should("have.value", "TOOSHORT");
    cy.get('input[name="containerNumber.1"]').should("have.value", "12");
    cy.get('input[name="containerNumber.2"]').should("have.value", "NO-GOOD");
  });
  it("should navigate to check-your-information page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("Plane", { force: true });
    cy.get('input[name="containerNumber.0"]').type("Container", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/check-your-information");
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

describe("Plane Point of Destination - Validation Scenarios", () => {
  it("should display error when point of destination is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportPointOfDestinationRequired,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the point of destination$/).should("be.visible");
  });

  it("should display error when point of destination exceeds 100 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportPointOfDestinationMaxLength,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    const longString = new Array(102).join("a");
    cy.get("#pointOfDestination").type(longString, { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Point of destination must not exceed 100 characters$/).should("be.visible");
  });

  it("should display error when point of destination contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportPointOfDestinationInvalidCharacters,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#pointOfDestination").type("Invalid@#$%", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Point of destination must only contain letters, numbers, hyphens, apostrophes, spaces and forward slashes$/
    ).should("be.visible");
  });
});
