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
      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(5);
      expect(labels).to.have.length(5);
      expect(labels).to.deep.eq([
        "Flight number",
        "Place export leaves the departure country",
        "Shipping container identification number",
        "Air waybill number (optional)",
        "Freight bill number (optional)",
      ]);
      expect(hints).to.deep.eq([
        "For example, Hull.",
        "Enter the identification number shown on the shipping container. For example, ABCJ0123456",
        "For example, 123-45678901",
        "For example, BD51SMR",
      ]);
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
    // cy.contains("a", /^Enter the container identification number or numbers$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
  });

  it("should navigate to cc dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAsDraft,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("Plane", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("Container", { force: true });
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
    cy.get('input[name="containerNumbers.0"]').type("Container", { force: true });
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

describe("Add Transportation Details Plane: Air Waybill Number Validation", () => {
  it("should display error when air waybill number exceeds 50 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportAirwaybillMaxLength,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("BA123", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get("#departurePlace").type("Heathrow Airport", { force: true });
    cy.get("#airwayBillNumber").type("A".repeat(51), { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Air waybill number must not exceed 50 characters$/).should("be.visible");
  });

  it("should display error when air waybill number contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportAirwaybillInvalidCharacters,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("BA123", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get("#departurePlace").type("Heathrow Airport", { force: true });
    cy.get("#airwayBillNumber").type("AWB!@#$%", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Air waybill number must only contain letters, numbers, hyphens, full stops and forward slashes$/
    ).should("be.visible");
  });

  it("should save successfully when air waybill number is not provided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("BA123", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get("#departurePlace").type("Heathrow Airport", { force: true });
    // airwayBillNumber not provided - should be optional
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-plane/0");
  });

  it("should save successfully when air waybill number is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("BA123", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get("#departurePlace").type("Heathrow Airport", { force: true });
    cy.get("#airwayBillNumber").type("AWB12345678", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-plane/0");
  });
});

describe("Add Transportation Details Plane: Container Identification Number Validation", () => {
  it("should display error when container identification number exceeds 50 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportContainerMaxLength,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("BA123", { force: true });
    cy.get("#departurePlace").type("Heathrow Airport", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("A".repeat(51), { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Container identification number must not exceed 50 characters$/).should("be.visible");
  });

  it("should display error when container identification number contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportContainerInvalidCharacters,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("BA123", { force: true });
    cy.get("#departurePlace").type("Heathrow Airport", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABC123!@#", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Enter a shipping container number in the correct format. This must be 11 characters: 3 letters, then U, J, Z or R, then 7 numbers.$/
    ).should("be.visible");
  });

  it("should save successfully when container identification number is not provided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("BA123", { force: true });
    cy.get("#departurePlace").type("Heathrow Airport", { force: true });
    // containerNumbers.0 not filled - should be optional
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-plane/0");
  });

  it("should save successfully when container identification number is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#flightNumber").type("BA123", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get("#departurePlace").type("Heathrow Airport", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-plane/0");
  });
});

describe("Add Transportation Details Plane: Multiple Container Numbers", () => {
  it("should save multiple container values successfully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportMultipleContainers,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    cy.get("#flightNumber").type("BA123", { force: true });

    // Add and fill container fields
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get('[data-testid="add-another-container"]').click({ force: true });
    cy.get('input[name="containerNumbers.1"]').type("DEFJ9876543", { force: true });
    cy.get('[data-testid="add-another-container"]').click({ force: true });
    cy.get('input[name="containerNumbers.2"]').type("GHIR5555555", { force: true });

    cy.get("#departurePlace").type("Heathrow Airport", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-plane/0");
  });

  it("should allow empty container fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportEmptyContainers,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    cy.get("#flightNumber").type("BA123", { force: true });

    // Add multiple fields but leave some empty
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get('[data-testid="add-another-container"]').click({ force: true });
    // Leave containerNumbers.1 empty
    cy.get('[data-testid="add-another-container"]').click({ force: true });
    cy.get('input[name="containerNumbers.2"]').type("GHIR5555555", { force: true });

    cy.get("#departurePlace").type("Heathrow Airport", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-plane/0");
  });

  it("should load pre-existing container values from backend", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportEditWithContainers,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    // Verify pre-existing values are loaded
    cy.get('input[name="containerNumbers.0"]').should("have.value", "EXISTING001");
    cy.get('input[name="containerNumbers.1"]').should("have.value", "EXISTING002");
    cy.get('input[name="containerNumbers.2"]').should("have.value", "EXISTING003");
  });

  it("should display error when container number exceeds max length", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportContainerMaxLength,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    cy.get("#flightNumber").type("BA123", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890123456789012", {
      force: true,
    });
    cy.get("#departurePlace").type("Heathrow Airport", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Check error is displayed
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Container identification number must not exceed 50 characters$/).should("be.visible");
  });

  it("should display container field label and hint text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    // Check container identification number label is displayed
    cy.get('label[for="containerNumbers.0"]')
      .should("be.visible")
      .and("contain", "Shipping container identification number");

    // Check hint text is displayed
    cy.get("#hint-containerIdentificationNumber")
      .should("be.visible")
      .and("contain", "Enter the identification number shown on the shipping container. For example, ABCJ0123456");
  });

  it("should limit to maximum 10 containers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    cy.get("#flightNumber").type("BA123", { force: true });

    // Add 9 more containers (already have 1)
    for (let i = 0; i < 9; i++) {
      cy.get('[data-testid="add-another-container"]').click({ force: true });
    }

    // Verify we have 10 containers
    cy.get('input[name="containerNumbers.9"]').should("exist");

    // Add another container button should not be visible
    cy.get('[data-testid="add-another-container"]').should("not.exist");
  });

  it("should show remove button for each container except when only one exists", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });

    cy.get("#flightNumber").type("BA123", { force: true });

    // Initially only one container, remove button should not be visible
    cy.get('[data-testid="remove-container-0"]').should("not.exist");

    // Add another container
    cy.get('[data-testid="add-another-container"]').click({ force: true });

    // Now both should have remove buttons
    cy.get('[data-testid="remove-container-0"]').should("exist");
    cy.get('[data-testid="remove-container-1"]').should("exist");

    // Remove one container
    cy.get('[data-testid="remove-container-1"]').click({ force: true });

    // Only one container left, remove button should not be visible
    cy.get('[data-testid="remove-container-0"]').should("not.exist");
  });
});
