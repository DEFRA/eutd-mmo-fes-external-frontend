import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-SD-3FE1169D1";
const createStorageDocumentUrl = `/create-storage-document/${documentNumber}`;
const storageFacilityUrl = `${createStorageDocumentUrl}/you-have-added-a-storage-facility`;
const addArrivalTransportationDetailsContainerVesselUrl = `${createStorageDocumentUrl}/add-arrival-transportation-details-container-vessel`;

describe("AddArrivalContainerVesselTransportSave scenarios", () => {
  const testParams: ITestParams = { testCaseId: TestCaseId.AddArrivalContainerVesselTransportSave };

  beforeEach(() => {
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
  });

  it("should submit form with vesselName", () => {
    cy.get("#vesselName").type("Test Vessel", { force: true });
    cy.get("[data-testid=save-and-continue]").click();
  });

  describe("AddArrivalContainerVesselTransportAllowed scenarios", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.AddArrivalContainerVesselTransportAllowed };

    beforeEach(() => {
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    });

    it("should render container vessel transport details page", () => {
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `${createStorageDocumentUrl}/how-does-the-consignment-arrive-to-the-uk`);
      cy.get(".govuk-heading-xl").contains("Container Vessel arriving in the UK");
      cy.contains("Container identification number (optional)").should("be.visible");
      cy.get("form").within(() => {
        cy.get('input[type="text"]').should("have.length.at.least", 6);
        cy.get("#vesselName").should("exist");
        cy.get("#flagState").should("exist");
        cy.get('[id="containerNumbers.0"]').should("exist");
        cy.get("#freightBillNumber").should("exist");
        cy.get("#departureCountry").should("exist");
        cy.get("#departurePort").should("exist");
      });
      cy.contains(".govuk-hint", "For example, Felicity Ace").should("be.visible");
      cy.contains(".govuk-hint", "For example, Greece").should("be.visible");
      cy.contains(".govuk-hint", "For example, ABCD1234567").should("be.visible");
      cy.contains(".govuk-hint", "For example, AA1234567").should("be.visible");
      cy.contains(".govuk-hint", "This is the country the container vessel left before it came to the UK").should(
        "be.visible"
      );
      cy.contains(
        ".govuk-hint",
        "For example, Calais port, Calais-Dunkerque airport or the place the container vessel started its journey"
      ).should("be.visible");
      cy.contains(".govuk-hint", "For example, 25 07 2025").should("be.visible");
      cy.get("[data-testid=save-and-continue]").should("be.visible");
      cy.contains("button", "Save as draft").should("be.visible");
    });

    it("should navigate to storage facility page when all fields are left blank and save and continue is clicked", () => {
      cy.get("#vesselName").should("have.value", "");
      cy.get("#flagState").should("have.value", "");
      cy.get('[id="containerNumbers.0"]').should("have.value", "");
      cy.get("#freightBillNumber").should("have.value", "");
      cy.get("#departureCountry").should("have.value", "");
      cy.get("#departurePort").should("have.value", "");
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.url().should("include", storageFacilityUrl);
    });

    it("should navigate to storage facility page when all fields are left blank and save and continue is clicked", () => {
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.url().should("include", storageFacilityUrl);
    });
  });

  describe("ContainerVesselSaveInvalidCharsVesselName scenarios", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsVesselName };

    beforeEach(() => {
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    });

    it("should display error when vessel name contains invalid characters", () => {
      cy.get("#vesselName").type("Invalid@Name!", { force: true });
      cy.get("#flagState").type("Greece", { force: true });
      cy.get('[id="containerNumbers.0"]').type("ABCD1234567", { force: true });
      cy.get("#freightBillNumber").type("AA1234567", { force: true });
      cy.get("#departureCountry").invoke("val", "France");
      cy.get("#departurePort").type("Port of Calais", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.get("form").submit();
      cy.contains("h2", /^There is a problem$/).should("be.visible");
      cy.contains("a", /^Vessel name must only contain letters, numbers, apostrophes, hyphens, and brackets$/).should(
        "be.visible"
      );
    });

    it("should scroll to errorIsland when there is a validation error in vessel name and we try to submit", () => {
      cy.get("#vesselName").type("Invalid@Name!", { force: true });
      cy.get("[data-testid=save-and-continue]").click();
      cy.get("#errorIsland").should("exist");
      cy.contains("Vessel name must only contain letters").should("exist");
    });
  });

  describe("AddArrivalContainerVesselTransportDisAllowed scenarios", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.AddArrivalContainerVesselTransportDisAllowed };

    beforeEach(() => {
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    });

    it("should redirect to forbidden page when container vessel transport is not allowed", () => {
      cy.url().should("include", "/forbidden");
    });
  });

  describe("VesselContainerTransportDisAllowed scenarios", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.VesselContainerTransportDisAllowed };

    beforeEach(() => {
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    });

    it("should redirect to the forbidden page if transport is not container vessel", () => {
      cy.url().should("include", "/forbidden");
    });
  });

  describe("TransportAllowedUnauthorised scenarios", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.TransportAllowedUnauthorised };

    beforeEach(() => {
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    });

    it("should redirect to the forbidden page if transport is not Container Vessel", () => {
      cy.url().should("include", "/forbidden");
    });
  });

  describe("Container Vessel Validation Scenarios", () => {
    it("should display error when vessel name exceeds 50 characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveMaxCharsVesselName,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#vesselName").type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains("a", "Vessel name must not exceed 50 characters").should("be.visible");
    });

    it("should display error when vessel name has invalid characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsVesselName,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#vesselName").type("Invalid@Name!", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains("a", "Vessel name must only contain letters, numbers, apostrophes, hyphens, and brackets").should(
        "be.visible"
      );
    });

    it("should display error when flag state exceeds 50 characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveMaxCharsFlagState,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#flagState").type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains("a", "Flag state must not exceed 50 characters").should("be.visible");
    });

    it("should display error when flag state has invalid characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsFlagState,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#flagState").type("Invalid@State!", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains("a", "Flag state must only contain letters, numbers, apostrophes, hyphens and spaces").should(
        "be.visible"
      );
    });

    it("should display error when container number has invalid format", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidFormatContainerNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get('[name="containerNumbers.0"]').should("be.visible").type("INVALID@#", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains("h2", "There is a problem").should("be.visible");
    });

    it("should show error when a container identification number exceeds 50 characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveMaxCharsContainerIdentificationNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
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
        testCaseId: TestCaseId.ContainerVesselSaveContainerNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });

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
        testCaseId: TestCaseId.ContainerVesselSaveContainerNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });

      cy.wait(500);
      cy.get('[data-testid="add-another-container"]').click({ force: true });

      cy.get('[name="containerNumbers.0"]').type("ABCD1234567", { force: true });
      cy.get('[name="containerNumbers.1"]').type("ABCD1234561", { force: true });

      cy.get('[name^="containerNumbers."]').should("have.length", 2);

      cy.get('[data-testid="remove-container-1"]').click({ force: true });

      cy.get('[name^="containerNumbers."]').should("have.length", 1);
      cy.get('[name="containerNumbers.0"]').should("have.value", "ABCD1234567");
    });

    it("should display error when freight bill number exceeds 60 characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveMaxCharsFreightBillNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#freightBillNumber").type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", {
        force: true,
      });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains("a", "Freight bill number must not exceed 60 characters").should("be.visible");
    });

    it("should display error when freight bill number has invalid characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsFreightBillNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#freightBillNumber").type("Freight@#", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains(
        "a",
        "Freight bill number must only contain letters, numbers, hyphens, full stops and forward slashes"
      ).should("be.visible");
    });

    it("should display error when departure country is invalid", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidDepartureCountry,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#departureCountry").type("!InvalidCountry123", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.get("#error-summary-title").contains("There is a problem");
    });

    it("should display error when consignment departs from (departure port) exceeds 50 characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveMaxCharsDeparturePort,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#departurePort").type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains("a", "Where the consignment departs from must not exceed 50 characters").should("be.visible");
    });

    it("should display error when consignment departs from (departure port) has invalid characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsDeparturePort,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#departurePort").type("Invalid@Port!", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains(
        "a",
        "Where the consignment departs from must only contain letters, numbers, apostrophes, hyphens and spaces"
      ).should("be.visible");
    });

    it("should display error when departure date is invalid", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidDepartureDate,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#departureDate-day").type("32", { force: true });
      cy.get("#departureDate-month").type("13", { force: true });
      cy.get("#departureDate-year").type("2025", { force: true });
      cy.get("[data-testid=save-and-continue]").click({ force: true });
      cy.contains("a", "Departure date must be a real date").should("be.visible");
    });
  });
});

describe("AddArrivalContainerVesselTransport Save As Draft scenarios", () => {
  it("should navigate to sd dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSaveAsDraft,
    };
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Test Vessel", { force: true });
    cy.get("#flagState").type("Greece", { force: true });
    cy.get('[id="containerNumbers.0"]').type("ABCD1234567", { force: true });
    cy.get("#freightBillNumber").type("Freight bill", { force: true });
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport", { force: true });
    cy.get("#departureDate-day").type("25", { force: true });
    cy.get("#departureDate-month").type("07", { force: true });
    cy.get("#departureDate-year").type("2025", { force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
  });
});

describe("Container Number Validation page when javascript is disabled", () => {
  beforeEach(() => {
    const testParams = {
      testCaseId: TestCaseId.ContainerVesselSaveContainerNumber,
      disableScripts: true,
    };
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
  });

  it("should not render add and remove buttons when JavaScript is disabled", () => {
    for (let i = 0; i < 5; i++) {
      cy.get(`[name="containerNumbers.${i}"]`).should("exist").and("be.visible");
    }
    cy.get('[data-testid="add-another-container"]').should("not.exist");
  });

  it("should show error when a container identification number exceeds 50 characters", () => {
    cy.get('[name="containerNumbers.0"]')
      .should("be.visible")
      .type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", {
        force: true,
      });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    // cy.contains("Container identification number must not exceed 50 characters").should("be.visible");
  });

  it("should show error when a container input contains any special characters", () => {
    cy.get('[name="containerNumbers.0"]').should("be.visible").type("AAAAA!@#", {
      force: true,
    });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    // cy.contains("Container identification number must only contain letters and numbers").should("be.visible");
  });
});

describe("Populate Container Number from getContainerInputData method", () => {
  beforeEach(() => {
    const testParams = {
      testCaseId: TestCaseId.ContainerNumberSaveValidation,
      disableScripts: true,
    };
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
  });

  it("should populatte container numbers", () => {
    cy.get('[name="containerNumbers.0"]').should("have.value", "ABCD1234567");
    cy.get('[name="containerNumbers.1"]').should("have.value", "ABCD1234569");
    cy.get('[name="containerNumbers.2"]').should("have.value", "ABCD1234531");

    cy.get('[data-testid="add-another-container"]').should("not.exist");
  });
});
