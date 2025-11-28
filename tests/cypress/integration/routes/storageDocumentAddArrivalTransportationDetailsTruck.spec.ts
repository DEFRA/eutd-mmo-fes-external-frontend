import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-storage-document/${documentNumber}`;
const storageFacilityUrl = `${certificateUrl}/add-storage-facility-details`;
const truckPageUrl = `${certificateUrl}/add-arrival-transportation-details-truck`;

describe("Add Transportation Details Truck: Allowed", () => {
  it("should render truck transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };

    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`);
    cy.get(".govuk-heading-xl").contains("Truck arriving in the UK");
    cy.wait(250);
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
        "Truck nationality",
        "Registration number",
        "Freight bill number (optional)",
        "Country of departure",
        "Where the consignment departs from",
        "Place of unloading",
        "Day",
        "Month",
        "Year",
      ]);
      expect(hints).to.deep.eq([
        "Type at least two characters to load the list. For example, United Kingdom",
        "For example, A123 4567 or BD51SMR. This field is required now to help prepare for new EU regulations coming into force on 10 January 2026",
        "For example, AA1234567",
        "This is the country the truck left before it came to the UK",
        "For example, Calais port, Calais-Dunkerque airport or the place the truck started its journey",
        "This is where the consignment was unloaded from the truck when arriving in the UK",
        "For example, 25 07 2025",
      ]);
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
  });

  it("should redirect user to forbidden page when saveTransportDetails fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SaveTruckTransportDetailsFailsWith403,
    };

    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should display error when registration number exceeds 50 chars", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsTruckRegNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registration number which is way way way way way way way more than 50 words", {
      force: true,
    });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("#placeOfUnloading").type("Place of unloading", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Registration number must not exceed 50 characters$/).should("be.visible");
  });

  it("should display error when registration number has alphanumeric text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveAlphanumericTruckRegNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registartion..", { force: true });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Registration number must only contain letters, numbers, hyphens, and spaces$/).should(
      "be.visible"
    );
  });

  it("should display error when registration number is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsTruckRegNumberEmpty,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").should("have.value", "");
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("#placeOfUnloading").type("Place of unloading", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.wait(250);
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the registration number$/).should("be.visible");
  });

  it("should display error when place of unloading is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsTruckPlaceOfUnloadingEmpty,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registration number", {
      force: true,
    });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("#placeOfUnloading").should("have.value", "");
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.wait(250);
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the place where the consignment was unloaded$/).should("be.visible");
  });

  it("should display error when place of unloading is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsTruckPlaceOfUnloadingExceedString,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registration number", {
      force: true,
    });
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

  it("should display error when freight bill number exceeds 60 chars", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveMaxCharsFreightBillNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registration number", { force: true });
    cy.get("#freightBillNumber").type(
      "Freight bill number which is way way way way way way way way way more than 60 words",
      {
        force: true,
      }
    );
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Freight bill number must not exceed 60 characters$/).should("be.visible");
  });

  it("should display error when freight bill number has alphanumeric text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveAlphanumericsFreightBillNumber,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registartion number", { force: true });
    cy.get("#freightBillNumber").type("Freight...", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Freight bill number must only contain letters, numbers, hyphens, full stops and forward slashes$/
    ).should("be.visible");
  });

  it("should display error when truck nationality is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveEmptyNationality,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").should("have.value", "");
    cy.get("#registrationNumber").type("Registration number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("#placeOfUnloading").type("Place of unloading", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.wait(250);
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a valid truck nationality$/).should("be.visible");
  });

  it("should display error when country of departure is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveEmptyDepartureCountry,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registration number", { force: true });
    cy.get("#departureCountry").should("have.value", "");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("#placeOfUnloading").type("Place of unloading", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.wait(250);
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the country of departure$/).should("be.visible");
  });

  it("should display error when consignment origin is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveEmptyConsignmentOrigin,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registration number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").should("have.value", "");
    cy.get("#placeOfUnloading").type("Place of unloading", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.wait(250);
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter where the consignment departs from$/).should("be.visible");
  });

  it("should display error when departure date is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveEmptyDepartureDate,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registration number", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("#placeOfUnloading").type("Place of unloading", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.wait(250);
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the departure date$/).should("be.visible");
  });

  it("should navigate to sd dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSaveAsDraft,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").invoke("val", "Ireland");
    cy.get("#registrationNumber").type("Registration number", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
  });

  it("should navigate to storage facility page on click of save and continue button when all mandatory fields are populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportSave,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.get("#nationalityOfVehicle").type("Truck nationality", { force: true });
    cy.get("#registrationNumber").type("Registration number", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get("#departureCountry").invoke("val", "Ireland");
    cy.get("#departurePort").type("Where the consignment departs from", { force: true });
    cy.get("#departureDate-day").type("15", { force: true });
    cy.get("#departureDate-month").type("11", { force: true });
    cy.get("#departureDate-year").type("2025", { force: true });
    cy.get("#placeOfUnloading").type("Place of unloading", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", storageFacilityUrl);
  });
});

describe("Add Transportation Details Truck: Disallowed", () => {
  it("should redirect to the forbidden page if transport is not truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportDisAllowed,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Transportation Details Truck: 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(truckPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
