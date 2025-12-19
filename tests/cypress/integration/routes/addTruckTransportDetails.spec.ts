import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-CC-3FE1169D1";
const certificateUrl = `/create-catch-certificate/${documentNumber}`;
const truckPageUrl = `create-catch-certificate/${documentNumber}/add-transportation-details-truck/0`;

describe("Add Transportation Details Truck: Allowed", () => {
  it("should render truck transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.title().should("eq", "Add transportation details: truck - Create a UK catch certificate - GOV.UK");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk/0`);
    cy.get(".govuk-heading-xl").contains("Add transportation details: truck");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(5);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(5);
      expect(labels).to.have.length(5);
      expect(labels).to.deep.eq([
        "Truck nationality",
        "Registration number",
        "Container identification number (optional)",
        "Place export leaves the departure country",
        "Freight bill number (optional)",
      ]);
      expect(hints).to.deep.eq([
        "For example, United Kingdom",
        "For example, A123 4567 or BD51SMR",
        "Enter container or trailer identification number. For example, ABCD1234567.",
        "For example, Hull.",
        "For example, BD51SMR",
      ]);
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
  });

  it("should display truck nationality field with bold label, hint text, and type-ahead functionality", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.get("label[for='nationalityOfVehicle']").should("contain.text", "Truck nationality");

    cy.get("#nationalityOfVehicle-hint").should("be.visible").should("contain.text", "For example, United Kingdom");

    cy.get("#nationalityOfVehicle").type("United", { force: true });
    cy.get(".autocomplete__menu").should("exist");
  });

  it("should display registration number field with bold label and hint text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.get("label[for='registrationNumber']").should("contain.text", "Registration number");

    cy.get("#hint-registrationNumber").should("be.visible").should("contain.text", "For example, A123 4567 or BD51SMR");
  });

  it("should display departure country field with bold label and hint text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.get("label[for='departurePlace']").should("contain.text", "Place export leaves the departure country");

    cy.get("#hint-departurePlace").should("be.visible").should("contain.text", "For example, Hull.");
  });

  it("should display freight bill number field with bold label and hint text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.get("label[for='freightBillNumber']").should("contain.text", "Freight bill number");

    cy.get("#hint-freightBillNumber").should("be.visible").should("contain.text", "For example, BD51SMR");
  });

  it("should display container identification number field with bold label and hint text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.get("label[for='containerIdentificationNumber']").should("contain.text", "Container identification number");

    cy.get("#hint-containerIdentificationNumber")
      .should("be.visible")
      .should("contain.text", "Enter container or trailer identification number. For example, ABCD1234567.");
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
    cy.contains("a", /^Enter the nationality of vehicle$/).should("be.visible");
    cy.contains("a", /^Enter the registration number$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
  });

  it("should navigate to cc dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSave,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("Registration", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should navigate to progress page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSave,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("Registration", { force: true });
    cy.get("#departurePlace").type("Hull", { force: true });
    cy.get("#freightBillNumber").type("AA1234567", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-truck/0");
  });
});

describe("Add Transportation Details Truck: Not Allowed", () => {
  it("should redirect to the progress page if transport is not truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportDisAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Transportation Details Truck: Container Identification Number Validation", () => {
  it("should display error when container identification number exceeds 150 characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportContainerIdentificationNumberMaxLength,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("ABC123", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
    cy.get("#containerIdentificationNumber").type(
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      { force: true }
    );
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Container identification number must not exceed 150 characters$/).should("be.visible");
  });

  it("should display error when container identification number contains invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportContainerIdentificationNumberInvalidCharacters,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("ABC123", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
    cy.get("#containerIdentificationNumber").type("ABC123!@#", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Container identification number must only contain letters, numbers and spaces$/).should(
      "be.visible"
    );
  });

  it("should save successfully when container identification number is not provided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSave,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("ABC123", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
    // containerIdentificationNumber is not filled - should be optional
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-truck/0");
  });

  it("should save successfully when container identification number is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSave,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("ABC123", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
    cy.get("#containerIdentificationNumber").type("ABCD1234567", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-additional-transport-documents-truck/0");
  });
});

describe("should redirect to forbidden page it transport details return 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Transportation Details Truck: Nationality Field Error State", () => {
  it("should display nationality field with error styling when validation fails", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportErrors,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("form").submit();

    cy.get("#nationalityOfVehicle").parents(".govuk-form-group").should("have.class", "govuk-form-group--error");
    cy.get("#nationalityOfVehicle").should("have.class", "govuk-input--error");
    cy.contains("a", /^Enter the nationality of vehicle$/).should("be.visible");
  });

  it("should maintain autocomplete functionality with error state", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportErrors,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("form").submit();

    cy.get("#nationalityOfVehicle").type("United", { force: true });
    cy.get(".autocomplete__menu").should("exist");
  });

  it("should have aria-describedby attribute pointing to hint", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.get("#nationalityOfVehicle").should("have.attr", "aria-describedby", "nationalityOfVehicle-hint");
  });
});

describe("Add Transportation Details Truck: Invalid Nationality Validation", () => {
  it("should display error when invalid truck nationality is entered on save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportInvalidNationality,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.get("#nationalityOfVehicle").type("InvalidCountry123", { force: true });
    cy.get("#registrationNumber").type("ABC123", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Backend validation should return error
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a truck nationality from the list$/).should("be.visible");

    cy.get("#nationalityOfVehicle").parents(".govuk-form-group").should("have.class", "govuk-form-group--error");
    cy.get("#nationalityOfVehicle").should("have.class", "govuk-input--error");

    // Should still be on the same page (not navigated)
    cy.url().should("include", "/add-transportation-details-truck/0");
  });

  it("should save as draft successfully with invalid nationality", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSave,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    // Type invalid nationality - save as draft should still work
    cy.get("#nationalityOfVehicle").type("InvalidCountry123", { force: true });
    cy.get("#registrationNumber").type("ABC123", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });

    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should not display error when valid truck nationality is entered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSave,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.get("#nationalityOfVehicle").type("France", { force: true });
    cy.get("#registrationNumber").type("ABC123", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    cy.url().should("include", "/add-additional-transport-documents-truck/0");
  });

  it("should clear invalid nationality error after entering valid value", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportInvalidNationality,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    // First, trigger the error
    cy.get("#nationalityOfVehicle").type("InvalidCountry", { force: true });
    cy.get("#registrationNumber").type("ABC123", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify error is shown
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.get("#nationalityOfVehicle").parents(".govuk-form-group").should("have.class", "govuk-form-group--error");

    // Now correct the value
    cy.get("#nationalityOfVehicle").clear({ force: true });
    cy.get("#nationalityOfVehicle").type("France", { force: true });

    // Verify the field value is updated
    cy.get("#nationalityOfVehicle").should("have.value", "France");
  });

  it("should display field-level error message for invalid nationality", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportInvalidNationality,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });

    cy.get("#nationalityOfVehicle").type("XYZ Invalid", { force: true });
    cy.get("#registrationNumber").type("ABC123", { force: true });
    cy.get("#departurePlace").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Check for error summary
    cy.contains("h2", /^There is a problem$/).should("be.visible");

    // Check for field-level error message
    cy.contains("Select a truck nationality from the list").should("be.visible");

    // Verify error styling is applied to the field
    cy.get("#nationalityOfVehicle").parents(".govuk-form-group").should("have.class", "govuk-form-group--error");
    cy.get("#nationalityOfVehicle").should("have.class", "govuk-input--error");
  });
});
