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
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk`);
    cy.get(".govuk-heading-xl").contains("Truck departing the UK");
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
        "Where the truck departs from the UK",
        "Container identification number (optional)",
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
        "Enter container or trailer identification number. For example, ABCD1234567.",
        "For example, 25 07 2025",
        "Type at least two characters to load the list. For example, United Kingdom",
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
    cy.get('input[name="containerNumbers.0"]').type("Container", { force: true });
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
    cy.get('[name="containerNumbers.0"]').should("be.visible").type("INVALID@#", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", "There is a problem").should("be.visible");
  });

  it("should show error when a container identification number exceeds 50 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckSaveMaxCharsContainerIdentificationNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
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
      testCaseId: TestCaseId.TruckSaveContainerNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

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
      testCaseId: TestCaseId.TruckSaveContainerNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

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
        cy.get("#nationalityOfVehicle").focus({ force: true }).type("U", { force: true });
        cy.wait(500);
        cy.get(".autocomplete__menu").should("not.exist");
      });

      it("should show dropdown when typing 2 or more characters in nationality field", () => {
        cy.get("#nationalityOfVehicle")
          .parent()
          .find('input[type="text"]')
          .focus({ force: true })
          .type("Un", { force: true });
        cy.wait(1000);
        cy.get('[class*="autocomplete"]').should("be.visible");
        cy.get('[role="listbox"]').should("be.visible");
      });
    });
  });
});
