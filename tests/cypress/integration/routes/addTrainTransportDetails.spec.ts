import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-CC-3FE1169D1";
const certificateUrl = `/create-catch-certificate/${documentNumber}`;
const progressUrl = `${certificateUrl}/add-additional-transport-documents-train/0`;
const trainPageUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-train/0`;

describe("Add Transportation Details Train: Allowed", () => {
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

  it("should display railway bill number label and hint text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Check railway bill number label is displayed and bold
    cy.get('label[for="railwayBillNumber"]').should("be.visible").and("contain", "Railway bill number");

    // Check hint text is displayed
    cy.get("#hint-railwayBillNumber").should("be.visible").and("contain", "For example, AB12345C");
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

describe("Add Transportation Details Train: Container Identification Number Validation", () => {
  it("should display container identification number label with optional suffix and hint text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Check label is displayed with (optional) suffix
    cy.get('label[for="containerNumbers.0"]')
      .should("be.visible")
      .and("contain", "Shipping container identification number (optional)");

    // Check hint text is displayed
    cy.get("div .govuk-hint")
      .should("be.visible")
      .and("contain", "Enter the identification number shown on the shipping container. For example, ABCJ0123456");
  });

  it("should display format error when container identification number has invalid format regardless of length", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportContainerIdentificationNumberMaxLength,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("RB123456", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("A".repeat(51), { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Enter a shipping container number in the correct format. This must be 11 characters: 3 letters, then U, J, Z or R, then 7 numbers.$/
    ).should("be.visible");
  });

  it("should display error when container identification number contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportContainerIdentificationNumberInvalidCharacters,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("RB123456", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
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
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("RB123456", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
    // containerNumbers.0 is not filled - should be optional
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", progressUrl);
  });

  it("should save successfully when container identification number is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("RB123456", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", progressUrl);
  });

  it("should save successfully when container identification number is entered in lowercase", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("RB123456", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("abcu1234567", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", progressUrl);
  });
});

describe("Add Transportation Details Train: Multiple Container Numbers", () => {
  it("should save multiple container values successfully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportMultipleContainers,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    cy.get("#railwayBillNumber").type("RB123456", { force: true });

    // Add and fill container fields
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get('[data-testid="add-another-container"]').click({ force: true });
    cy.get('input[name="containerNumbers.1"]').type("DEFJ9876543", { force: true });
    cy.get('[data-testid="add-another-container"]').click({ force: true });
    cy.get('input[name="containerNumbers.2"]').type("GHIR5555555", { force: true });

    cy.get("#departurePlace").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", progressUrl);
  });

  it("should allow empty container fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportEmptyContainers,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    cy.get("#railwayBillNumber").type("RB123456", { force: true });

    // Add multiple fields but leave some empty
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get('[data-testid="add-another-container"]').click({ force: true });
    // Leave containerNumbers.1 empty
    cy.get('[data-testid="add-another-container"]').click({ force: true });
    cy.get('input[name="containerNumbers.2"]').type("GHIR5555555", { force: true });

    cy.get("#departurePlace").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", progressUrl);
  });

  it("should persist container values when validation fails", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportContainerPersistence,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Leave railwayBillNumber empty to trigger validation error

    // Add container values
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get('[data-testid="add-another-container"]').click({ force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABCU1234567", { force: true });
    cy.get('input[name="containerNumbers.1"]').type("DEFJ9876543", { force: true });

    cy.get("#departurePlace").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Check error is displayed
    cy.contains("h2", /^There is a problem$/).should("be.visible");

    // Verify container values are still present
    cy.get('input[name="containerNumbers.0"]').should("have.value", "ABCU1234567");
    cy.get('input[name="containerNumbers.1"]').should("have.value", "DEFJ9876543");
  });

  it("should load pre-existing container values from backend", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportEditWithContainers,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Verify pre-existing values are loaded
    cy.get('input[name="containerNumbers.0"]').should("have.value", "EXISTING001");
    cy.get('input[name="containerNumbers.1"]').should("have.value", "EXISTING002");
    cy.get('input[name="containerNumbers.2"]').should("have.value", "EXISTING003");
  });

  it("should display error when container number has invalid format", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportContainerValidationErrors,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    cy.get("#railwayBillNumber").type("RB123456", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("INVALID!", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Check error is displayed
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Container identification number must only contain letters and numbers$/).should("be.visible");
  });

  it("should display format error when container number has invalid format regardless of length", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportContainerMaxLength,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    cy.get("#railwayBillNumber").type("RB123456", { force: true });
    cy.get('input[name="containerNumbers.0"]').type("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890123456789012", {
      force: true,
    });
    cy.get("#departurePlace").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Container identification number must only contain letters and numbers$/).should("be.visible");
  });
});
