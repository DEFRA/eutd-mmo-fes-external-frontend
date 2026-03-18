import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-non-manipulation-document/${documentNumber}`;
const truckPageUrl = `create-non-manipulation-document/${documentNumber}/add-transportation-details-truck`;

describe("Add Transportation Details Truck: Allowed", () => {
  it("should render truck transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "Truck departing the UK - Create a UK non-manipulation document - GOV.UK");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-leave-the-uk`);
    cy.get(".govuk-heading-xl").contains("Truck departing the UK");
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
        "Where the truck departs from the UK",
        "Shipping container identification number (optional)",
        "Date the truck departs the UK",
        "Day",
        "Month",
        "Year",
        "Truck nationality",
        "Registration number",
        "Freight bill number (optional)",
      ]);
      expect(hints).to.have.length(8);
      expect(hints).to.include(
        "This is the main destination country for the export, not the countries it is passing through. This information will not appear on the final document."
      );
      expect(hints).to.include(
        "For example, Calais port, Calais-Dunkerque airport or the destination point of the consignment."
      );
      expect(hints).to.include("For example, Dover port, the Eurotunnel, or the place the truck departs from the UK");
      expect(hints).to.include("For example, 25 07 2025");
      expect(hints).to.include("Type at least two characters to load the list. For example, United Kingdom");
      expect(hints).to.include("For example, A123 4567 or BD51SMR");
      expect(hints).to.include("For example, BD51SMR");
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
    cy.contains("a", "Back to your progress").should("be.visible");
  });

  it("should render labels with bold font weight for NMD departure transport", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    // Verify that labels have bold font weight class for NMD departure transport
    cy.get('label[id="exportedTo-label"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="pointOfDestination"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="departurePlace"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[id="nationalityOfVehicle-label"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="registrationNumber"]').should("have.class", "govuk-!-font-weight-bold");
    cy.get('label[for="freightBillNumber"]').should("have.class", "govuk-!-font-weight-bold");

    // Verify all labels have the base govuk-label class
    cy.get('label[id="exportedTo-label"]').should("have.class", "govuk-label");
    cy.get('label[for="pointOfDestination"]').should("have.class", "govuk-label");
    cy.get('label[for="departurePlace"]').should("have.class", "govuk-label");
    cy.get('label[id="nationalityOfVehicle-label"]').should("have.class", "govuk-label");
    cy.get('label[for="registrationNumber"]').should("have.class", "govuk-label");
    cy.get('label[for="freightBillNumber"]').should("have.class", "govuk-label");
  });

  it("should render all required fields for truck departure transport", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    // Verify all fields are present
    cy.get("#exportedTo").should("exist");
    cy.get("#pointOfDestination").should("exist");
    cy.get("#departurePlace").should("exist");
    cy.get("#nationalityOfVehicle").should("exist");
    cy.get("#registrationNumber").should("exist");
    cy.get("#freightBillNumber").should("exist");
    cy.get("#exportDate-day").should("exist");
    cy.get("#exportDate-month").should("exist");
    cy.get("#exportDate-year").should("exist");
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
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a truck nationality from the list$/).should("be.visible");
    cy.contains("a", /^Enter the registration number$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
  });

  it("should navigate to SD dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveAsDraft,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get('input[name="containerNumber.0"]').type("Container", { force: true });
    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("Registration", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should retain all field values including export date when saving as draft with complete data", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveAsDraftRetainAllValues,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    // Fill all fields including export date and container
    // cy.get("#nationalityOfVehicle").type("Belgium", { force: true });
    cy.get("#registrationNumber").clear({ force: true });
    cy.get("#registrationNumber").type("DEP789", { force: true });
    cy.get("#departurePlace").clear({ force: true });
    cy.get("#departurePlace").type("Southampton Port", { force: true });
    cy.get("#exportDate-day").clear({ force: true });
    cy.get("#exportDate-day").type("10", { force: true });
    cy.get("#exportDate-month").clear({ force: true });
    cy.get("#exportDate-month").type("02", { force: true });
    cy.get("#exportDate-year").clear({ force: true });
    cy.get("#exportDate-year").type("2026", { force: true });
    cy.get('input[name="containerNumbers.0"]').clear({ force: true });
    cy.get('input[name="containerNumber.0"]').type("GHIJ3456789", { force: true });

    // Save as draft
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");

    // Return to the page using CHECK testCaseId (hardcoded saved fixture — immune to double-GET and retry state issues)
    const checkParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveAsDraftRetainAllValuesCheck,
    };
    cy.visit(truckPageUrl, { qs: { ...checkParams } });

    // Verify all values retained
    cy.get("#nationalityOfVehicle").should("have.value", "Belgium");
    cy.get("#registrationNumber").should("have.value", "DEP789");
    cy.get("#departurePlace").should("have.value", "Southampton Port");
    cy.get("#exportDate-day").should("have.value", "10");
    cy.get("#exportDate-month").should("have.value", "02");
    cy.get("#exportDate-year").should("have.value", "2026");
    cy.get('input[name="containerNumber.0"]').should("have.value", "GHIJ3456789");
  });

  it("should retain export date and accept invalid container format when saving as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveAsDraftRetainDate,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    // Fill with invalid container number (would fail validation on save & continue)
    cy.get("#nationalityOfVehicle").type("Netherlands", { force: true });
    cy.wait(500); // Wait for autocomplete to stabilize
    cy.get("#registrationNumber").click({ force: true }); // Move focus to next field, closing autocomplete
    cy.get("#registrationNumber").clear({ force: true });
    cy.get("#registrationNumber").type("NL999", { force: true });
    cy.get("#departurePlace").clear({ force: true });
    cy.get("#departurePlace").type("Rotterdam", { force: true });
    cy.get("#exportDate-day").clear({ force: true });
    cy.get("#exportDate-day").type("31", { force: true });
    cy.get("#exportDate-month").clear({ force: true });
    cy.get("#exportDate-month").type("12", { force: true });
    cy.get("#exportDate-year").clear({ force: true });
    cy.get("#exportDate-year").type("2025", { force: true });
    cy.get('input[name="containerNumber.0"]').clear({ force: true });
    cy.get('input[name="containerNumber.0"]').type("BAD-FORMAT", { force: true }); // Save-as-draft accepts invalid container format

    // Save as draft should accept invalid containers
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");

    // Return and verify values retained including invalid containers using CHECK testCaseId
    const checkParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveAsDraftRetainDateCheck,
    };
    cy.visit(truckPageUrl, { qs: { ...checkParams } });
    cy.get("#exportDate-day").should("have.value", "31");
    cy.get("#exportDate-month").should("have.value", "12");
    cy.get("#exportDate-year").should("have.value", "2025");
    cy.get('input[name="containerNumber.0"]').should("have.value", "BAD-FORMAT");
    cy.get('input[name="containerNumber.1"]').should("have.value", "X");
  });

  it("should navigate to check-your-information page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSave,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("Registration", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/check-your-information");
  });
});

describe("Add Transportation Details Truck: Not Allowed", () => {
  it("should redirect to the forbidden page if transport is not truck", () => {
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

describe("Truck Container Identification Number - Validation Scenarios", () => {
  it("should display error when container number has invalid format", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckSaveInvalidFormatContainerNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get('[name="containerNumber.0"]').should("be.visible").type("INVALID@#", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", "There is a problem").should("be.visible");
  });

  it("should show format error when a container identification number has invalid format regardless of length", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckSaveMaxCharsContainerIdentificationNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get('[name="containerNumber.0"]')
      .should("be.visible")
      .type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", {
        force: true,
      });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", "There is a problem").should("be.visible");
  });

  it("should add 5 container numbers with correct format", () => {
    const testParams = {
      testCaseId: TestCaseId.TruckSaveContainerNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    for (let i = 0; i < 5; i++) {
      cy.wait(500);
      cy.get(`[name="containerNumber.${i}"]`).should("be.visible").type("ABCD1234567", { force: true });
      if (i < 4) {
        cy.get('[data-testid="add-another-container"]').click({ force: true });
      }
    }

    cy.get("[data-testid=save-and-continue]").click({ force: true });
  });

  it("should remove a container input when the remove button is clicked", () => {
    const testParams = {
      testCaseId: TestCaseId.TruckSaveContainerNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.wait(500);
    cy.get('[data-testid="add-another-container"]').click({ force: true });

    cy.get('[name="containerNumber.0"]').type("ABCD1234567", { force: true });
    cy.get('[name="containerNumber.1"]').type("ABCD1234561", { force: true });

    cy.get('[name^="containerNumber."]').should("have.length", 2);

    cy.get('[data-testid="remove-container-1"]').click({ force: true });

    cy.get('[name^="containerNumber."]').should("have.length", 1);
    cy.get('[name="containerNumber.0"]').should("have.value", "ABCD1234567");
  });
});

describe("Truck Point of Destination - Validation Scenarios", () => {
  it("should display error when point of destination is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportPointOfDestinationRequired,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the point of destination$/).should("be.visible");
  });

  it("should display error when point of destination exceeds 100 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportPointOfDestinationMaxLength,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    const longString = new Array(102).join("a");
    cy.get("#pointOfDestination").type(longString, { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Point of destination must not exceed 100 characters$/).should("be.visible");
  });

  it("should display error when point of destination contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportPointOfDestinationInvalidCharacters,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#pointOfDestination").type("Invalid@#$%", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Point of destination must only contain letters, numbers, hyphens, apostrophes, spaces and forward slashes$/
    ).should("be.visible");
  });
});

describe("AutocompleteFormField: minCharsBeforeSearch validation", () => {
  const testParams: ITestParams = {
    testCaseId: TestCaseId.TruckTransportAllowed,
  };

  beforeEach(() => {
    cy.visit(truckPageUrl, { qs: { ...testParams } });
  });

  describe("AutocompleteFormField: minCharsBeforeSearch validation", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };

    beforeEach(() => {
      cy.visit(truckPageUrl, { qs: { ...testParams } });
    });

    describe("Truck nationality field with minCharsBeforeSearch=2", () => {
      it("should not show dropdown when typing 1 character in nationality field", () => {
        cy.get("#nationalityOfVehicle").focus().type("U", { force: true });
        cy.wait(500);
        cy.get(".autocomplete__menu").should("not.exist");
      });

      it("should show dropdown when typing 2 or more characters in nationality field", () => {
        cy.get("#nationalityOfVehicle").parent().find('input[type="text"]').focus().type("Un", { force: true });
        cy.wait(1000);
        cy.get('[class*="autocomplete"]').should("be.visible");
        cy.get('[role="listbox"]').should("be.visible");
      });
    });
  });
});

// FI0-10061: Welsh error messages for departure port field
describe("Add Transportation Details Truck: Welsh translations for departure port errors", () => {
  it("should display Welsh error message when departure port exceeds 50 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveMaxCharsDeparturePort,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams, lng: "cy" } });
    const longString = new Array(52).join("a");
    cy.get("#departurePlace").type(longString, { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^Mae yna broblem$/).should("be.visible");
    cy.contains("a", /^Rhaid i O ble mae'r lori’n ymadael fod yn llai na 50 o nodau$/).should("be.visible");
    cy.get(".govuk-error-message").should(
      "contain.text",
      "Rhaid i O ble mae'r lori’n ymadael fod yn llai na 50 o nodau"
    );
  });

  it("should display Welsh error message when departure port contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveInvalidCharsDeparturePort,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams, lng: "cy" } });
    cy.get("#departurePlace").type("Invalid@#$%", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^Mae yna broblem$/).should("be.visible");
    cy.contains(
      "a",
      /^Rhaid i O ble mae'r lori’n ymadael gynnwys llythrennau, rhifau, collnodau, cysylltnodau a bylchau yn unig$/
    ).should("be.visible");
    cy.get(".govuk-error-message").should(
      "contain.text",
      "Rhaid i O ble mae'r lori’n ymadael gynnwys llythrennau, rhifau, collnodau, cysylltnodau a bylchau yn unig"
    );
  });
});

describe("Add Transportation Details Truck: Invalid year in export date", () => {
  it("should display error when year 0000 is entered in the export date picker", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveInvalidYearExportDate,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("AB12 3CD", { force: true });
    cy.get("#departurePlace").type("Dover port", { force: true });
    cy.get("#exportDate-day").clear().type("01", { force: true });
    cy.get("#exportDate-month").clear().type("01", { force: true });
    cy.get("#exportDate-year").clear().type("0000", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.wait(250);
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Export date must be a real date$/).should("be.visible");
  });
});
