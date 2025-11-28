import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-storage-document/${documentNumber}`;
const planePageUrl = `${certificateUrl}/add-arrival-transportation-details-plane`;
const storageFacilityUrl = `${certificateUrl}/add-storage-facility-details`;

describe("Add Transportation Details Plane: Allowed", () => {
  it("should render plane transport details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportAllowed,
    };

    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`);
    cy.get(".govuk-heading-xl").contains("Plane arriving in the UK");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(7);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObjects = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const textinputs = textObjects.get();
      const hints = hintObjects.get();

      expect(textinputs).to.have.length(7);
      expect(labels).to.have.length(10);
      expect(labels).to.deep.eq([
        "Air waybill number",
        "Flight number",
        "Container identification number",
        "Freight bill number (optional)",
        "Country of departure",
        "Where the consignment departs from",
        "Place of unloading",
        "Day",
        "Month",
        "Year",
      ]);
      expect(hints).to.deep.eq([
        "For example, 123-45678901",
        "For example, AF296Q. This field is required now to help prepare for new EU regulations coming into force on 10 January 2026",
        "For example, ABCD1234567",
        "For example, BD51SMR",
        "This is the country the plane left before it came to the UK",
        "For example, Calais port, Calais-Dunkerque airport or the place the plane started its journey",
        "This is where the consignment was unloaded from the plane when arriving in the UK",
        "For example, 25 07 2025",
      ]);
    });
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
  });

  it("should navigate to sd dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAsDraft,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
  });

  it("should navigate to storage facility page on click of save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", storageFacilityUrl);
  });

  it("should navigate to storage facility page on click of save and continue button with empty values", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSave,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", storageFacilityUrl);
  });

  it("should redirect user to forbidden page when saveTransportDetails fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SavePlaneTransportDetailsFailsWith403,
    };

    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should display error when air waybill number exceeds 50 chars", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveMaxCharsAirwayBillNumber,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type(
      "This air waybill number is way too long and exceeds the maximum character limit",
      { force: true }
    );
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Air waybill number must not exceed 50 characters$/).should("be.visible");
  });

  it("should display error when flight number is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSavePlaneFlightNumberEmpty,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").should("have.value", "");
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the flight number$/).should("be.visible");
  });

  it("should display error when flight number exceeds 15 chars", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsPlaneFlightNumber,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("This flight number is way too long and exceeds the maximum character limit", {
      force: true,
    });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Flight number must not exceed 15 characters$/).should("be.visible");
  });

  it("should display error when flight number has invalid characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveAlphanumericPlaneFlightNumber,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q@#$", { force: true });
    cy.get("#freightBillNumber").type("Freight bill number", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Flight number must only contain letters and numbers$/).should("be.visible");
  });

  it("should display error when freight bill number exceeds 60 chars", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveMaxCharsFreightBillNumber,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type(
      "Freight bill number which is way way way way way way way way way more than 60 characters",
      {
        force: true,
      }
    );
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Freight bill number must not exceed 60 characters$/).should("be.visible");
  });

  it("should display error when freight bill number has alphanumeric text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportSaveAlphanumericsFreightBillNumber,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight...", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Freight bill number must only contain letters, numbers, hyphens, full stops and forward slashes$/
    ).should("be.visible");
  });

  it("should display error when place of unloading is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsPlanePlaceOfUnloadingEmpty,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("#placeOfUnloading").should("have.value", "");
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the place where the consignment was unloaded$/).should("be.visible");
  });

  it("should display error when place of unloading is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportSaveMaxCharsPlanePlaceOfUnloadingExceedString,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
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

  it("should display error when container identification number is not populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ArrivalPlaneTransportContainerNumberEmpty,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get('[id="containerNumbers.0"]').should("have.value", "");
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("#placeOfUnloading").type("Heathrow", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the container identification number or numbers$/).should("be.visible");
  });

  it("should display error when country of departure is not populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ArrivalPlaneTransportDepartureCountryEmpty,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get('[id="containerNumbers.0"]').type("ABCD1234567", { force: true });
    cy.get("#departureCountry").should("have.value", "");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("#placeOfUnloading").type("Heathrow", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the country of departure$/).should("be.visible");
  });

  it("should display error when where the consignment departs from is not populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ArrivalPlaneTransportDeparturePortEmpty,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get('[id="containerNumbers.0"]').type("ABCD1234567", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").should("have.value", "");
    cy.get("#placeOfUnloading").type("Heathrow", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter where the consignment departs from$/).should("be.visible");
  });

  it("should display error when departure date is not populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ArrivalPlaneTransportDepartureDateEmpty,
    };
    cy.visit(planePageUrl, { qs: { ...testParams } });
    // Fill in all form fields except departure date
    cy.get("#airwayBillNumber").type("123-45678901", { force: true });
    cy.get("#flightNumber").type("AF296Q", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get('[id="containerNumbers.0"]').type("ABCD1234567", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("#placeOfUnloading").type("Heathrow", { force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.get("form").submit();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the departure date$/).should("be.visible");
  });

  describe("Multiple Containers", () => {
    it("should handle adding and removing containers", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PlaneTransportAllowed,
      };
      cy.visit(planePageUrl, { qs: { ...testParams } });
      cy.wait(500);

      cy.get('input[name="containerNumbers.0"]').should("be.visible");
      cy.get("#add-container-button").should("be.visible");
      cy.get("#add-container-button").should("be.visible").should("contain.text", "Add another container");
      cy.get("#remove-container-button-0").should("not.exist");

      cy.get("#add-container-button").click({ force: true });
      cy.get('input[name="containerNumbers.1"]').should("be.visible");
      cy.get("#remove-container-button-0").should("be.visible");
      cy.get("#remove-container-button-0").should("be.visible").should("contain.text", "Remove");

      cy.get('[id="containerNumbers.0"]').type("CONT123", { force: true });
      cy.get('[id="containerNumbers.1"]').type("CONT456", { force: true });
      cy.get('[id="containerNumbers.0"]').should("exist");
      cy.get('[id="containerNumbers.1"]').should("exist");

      cy.get("#remove-container-button-0").click({ force: true });
      cy.get('input[name="containerNumbers.1"]').should("not.exist");
      cy.get("#remove-container-button-0").should("not.exist");

      cy.get('input[name="containerNumbers.0"]').should("exist");
    });
  });
});

describe("Add Transportation Details Plane: not allowed", () => {
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
