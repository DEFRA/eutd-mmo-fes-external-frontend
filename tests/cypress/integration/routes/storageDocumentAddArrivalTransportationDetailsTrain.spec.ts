import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-storage-document/${documentNumber}`;
const storageFacilityUrl = `${certificateUrl}/add-storage-facility-details`;
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
    cy.wait(250);
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(5);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(5);
      expect(labels).to.have.length(9);
      expect(labels).to.deep.eq([
        "Railway bill number",
        "Freight bill number (optional)",
        "Country of departure",
        "Where the consignment departs from",
        "Place of unloading",
        "Departure date",
        "Day",
        "Month",
        "Year",
      ]);
      expect(hints).to.deep.eq([
        "For example, AB12345C. This field is required now to help prepare for new EU regulations coming into force on 10 January 2026",
        "For example, AA1234567",
        "This is the country the train left before it came to the UK",
        "For example, Calais port, Calais-Dunkerque airport or the place the train started its journey",
        "This is where the consignment was unloaded from the train when arriving in the UK",
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
      testCaseId: TestCaseId.TransportSaveRailwayBillNumberEmpty,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").should("have.value", "");
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the railway bill number$/).should("be.visible");
  });

  it("should display error when place of unloading is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsTrainPlaceOfUnloadingEmpty,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railway bill number", { force: true });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("#placeOfUnloading").should("have.value", "");
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the place where the consignment was unloaded$/).should("be.visible");
  });

  it("should display error when place of unloading is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsTrainPlaceOfUnloadingExceedString,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });
    cy.get("#railwayBillNumber").type("Railway bill number", { force: true });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("#placeOfUnloading").type(
      "Place of unloading which is way way way way way way way way way way way way way more than 50 words",
      { force: true }
    );
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.wait(250);
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Place of unloading must not exceed 50 characters$/).should("be.visible");
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

  // FI0-10289: Scenario 1 - Verify info message is removed and labels don't contain '(optional)'
  it("should not display optional info message and fields should not have optional labels", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Verify info message is NOT present
    cy.get("#sdArrivalTransportInfoMessage").should("not.exist");

    // Verify field labels do not contain '(optional)'
    cy.get("form").should(($form) => {
      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();

      // Verify 'Country of departure' does not contain '(optional)'
      expect(labels).to.include("Country of departure");
      expect(labels).not.to.include("Country of departure (optional)");

      // Verify 'Where the consignment departs from' does not contain '(optional)'
      expect(labels).to.include("Where the consignment departs from");
      expect(labels).not.to.include("Where the consignment departs from (optional)");

      // Verify 'Departure date' fields do not contain '(optional)'
      expect(labels).to.include("Day");
      expect(labels).to.include("Month");
      expect(labels).to.include("Year");
      expect(labels).not.to.include("Day (optional)");
      expect(labels).not.to.include("Month (optional)");
      expect(labels).not.to.include("Year (optional)");
    });
  });

  // FI0-10289: Scenario 2 - Error when Country of departure not populated
  it("should display error when country of departure is not populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Fill other required fields but leave departureCountry blank
    cy.get("#railwayBillNumber").type("AB12345C", { force: true });
    cy.get("#departurePort").type("Calais port", { force: true });
    cy.get("#placeOfUnloading").type("Dover", { force: true });
    cy.get("#departureDate-day").type("25", { force: true });
    cy.get("#departureDate-month").type("07", { force: true });
    cy.get("#departureDate-year").type("2025", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify error is displayed
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the country of departure$/).should("be.visible");
  });

  // FI0-10289: Scenario 3 - Error when Where the consignment departs from not populated
  it("should display error when where the consignment departs from is not populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Fill other required fields but leave departurePort blank
    cy.get("#railwayBillNumber").type("AB12345C", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#placeOfUnloading").type("Dover", { force: true });
    cy.get("#departureDate-day").type("25", { force: true });
    cy.get("#departureDate-month").type("07", { force: true });
    cy.get("#departureDate-year").type("2025", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify error is displayed
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter where the consignment departs from$/).should("be.visible");
  });

  // FI0-10289: Scenario 4 - Error when Departure date not populated
  it("should display error when departure date is not populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Fill other required fields but leave departureDate blank
    cy.get("#railwayBillNumber").type("AB12345C", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Calais port", { force: true });
    cy.get("#placeOfUnloading").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify error is displayed
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the departure date$/).should("be.visible");
  });

  // FI0-10289: Scenario 5 - All mandatory fields populated
  it("should navigate to storage facility page when all mandatory fields are populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams } });

    // Fill all mandatory fields
    cy.get("#railwayBillNumber").type("AB12345C", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Calais port", { force: true });
    cy.get("#placeOfUnloading").type("Dover", { force: true });
    cy.get("#departureDate-day").type("25", { force: true });
    cy.get("#departureDate-month").type("07", { force: true });
    cy.get("#departureDate-year").type("2025", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify navigation to storage facility page
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

// FI0-10289: Scenario 6 - Welsh Translations
describe("Add Transportation Details Train: Welsh Translations", () => {
  it("should display error messages in Welsh when Welsh language is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams, lng: "cy" } });

    // Fill only railway bill number and place of unloading, leave other required fields blank
    cy.get("#railwayBillNumber").type("AB12345C", { force: true });
    cy.get("#placeOfUnloading").type("Dover", { force: true });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify error summary header in Welsh
    cy.contains("h2", /^Mae yna broblem$/).should("be.visible");

    // Verify Welsh error messages as per acceptance criteria
    // "Enter the country of departure" -> "Rhowch y wlad ymadael"
    cy.contains("a", /^Rhowch y wlad ymadael$/).should("be.visible");

    // "Enter where the consignment departs from" -> "Rhowch o ble mae'r llwyth yn ymadael"
    cy.contains("a", /^Rhowch o ble mae'r llwyth yn ymadael$/).should("be.visible");

    // "Enter the departure date" -> "Rhowch y dyddiad ymadael"
    cy.contains("a", /^Rhowch y dyddiad ymadael$/).should("be.visible");
  });

  it("should display field labels in Welsh", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };
    cy.visit(trainPageUrl, { qs: { ...testParams, lng: "cy" } });

    // Verify Welsh field labels
    cy.get("form").should(($form) => {
      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();

      // Verify Welsh labels for the fields
      expect(labels).to.include("Gwlad ymadael"); // Country of departure
      expect(labels).to.include("O ble mae'r llwyth yn ymadael"); // Where the consignment departs from

      // Ensure no '(optional)' suffix in Welsh labels
      expect(labels).not.to.include("Gwlad ymadael (dewisol)");
      expect(labels).not.to.include("O ble mae'r llwyth yn ymadael (dewisol)");
    });
  });
});
