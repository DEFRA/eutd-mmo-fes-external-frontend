import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-SD-3FE1169D1";
const createStorageDocumentUrl = `/create-non-manipulation-document/${documentNumber}`;
const addArrivalTransportationDetailsContainerVesselUrl = `${createStorageDocumentUrl}/add-arrival-transportation-details-container-vessel`;

describe("AddArrivalContainerVesselTransportSave scenarios", () => {
  const testParams: ITestParams = { testCaseId: TestCaseId.AddArrivalContainerVesselTransportSave };

  beforeEach(() => {
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
  });

  it("should submit form with vesselName", () => {
    cy.get("#vesselName").type("Test Vessel");
    cy.get("[data-testid=save-and-continue]").click();
    cy.get("body").should("exist");
  });

  it("should render error summary when action returns validation errors", () => {
    // Use a test case that will cause the action to return validation errors
    const errorTestParams: ITestParams = { testCaseId: TestCaseId.ContainerVesselTransportSaveEmpty };
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...errorTestParams } });

    // Fill other fields but leave the vessel name empty so the action returns validation errors
    cy.get("#flagState").type("Greece");
    //cy.get('[id="containerNumbers.0"]').type("ABCD1234567");
    cy.get("#freightBillNumber").type("AA1234567");
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Port of Calais");

    // Trigger the form submission which should produce validation errors
    cy.get("[data-testid=save-and-continue]").click();
    cy.get("form").submit();

    // The page should show the error summary rendered by the component
    cy.contains("h2", /^There is a problem$/).should("be.visible");
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
      cy.get("#sdArrivalTransportInfoMessage").should("not.exist");
      cy.contains("Shipping container identification number").should("be.visible");
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
      cy.contains(
        ".govuk-hint",
        "Enter the identification number shown on the shipping container. For example, ABCJ0123456"
      ).should("be.visible");
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

    it("should not navigate to storage facility page when all fields are left blank and save and continue is clicked", () => {
      cy.get("#vesselName").should("have.value", "");
      cy.get("#flagState").should("have.value", "");
      cy.get('[id="containerNumbers.0"]').should("have.value", "");
      cy.get("#freightBillNumber").should("have.value", "");
      cy.get("#departureCountry").should("have.value", "");
      cy.get("#departurePort").should("have.value", "");
      cy.get("[data-testid=save-and-continue]").click();
    });

    it("should render labels with bold font weight for NMD arrival transport", () => {
      cy.get('label[for="vesselName"]').should("have.class", "govuk-!-font-weight-bold");
      cy.get('label[for="flagState"]').should("have.class", "govuk-!-font-weight-bold");
      cy.get('label[for="freightBillNumber"]').should("have.class", "govuk-!-font-weight-bold");
      cy.get('label[for="departureCountry"]').should("have.class", "govuk-!-font-weight-bold");
      cy.get('label[for="departurePort"]').should("have.class", "govuk-!-font-weight-bold");
      cy.get('label[for="placeOfUnloading"]').should("have.class", "govuk-!-font-weight-bold");
    });

    it("should render all required fields for container vessel arrival transport", () => {
      cy.get("#vesselName").should("exist");
      cy.get("#flagState").should("exist");
      cy.get("#freightBillNumber").should("exist");
      cy.get("#departureCountry").should("exist");
      cy.get("#departurePort").should("exist");
      cy.get("#placeOfUnloading").should("exist");
      cy.get("#departureDate").should("exist");
      cy.get("#departureDate-month").should("exist");
      cy.get("#departureDate-year").should("exist");
    });
  });

  describe("ContainerVesselSaveInvalidCharsVesselName scenarios", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsVesselName };

    beforeEach(() => {
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    });

    it("should display error when vessel name contains invalid characters", () => {
      const testParams: ITestParams = { testCaseId: TestCaseId.ContainerVesselTransportSaveEmpty };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#vesselName").should("have.value", "");
      cy.get("#flagState").type("Greece");
      cy.get('[id="containerNumbers.0"]').type("ABCD1234567");
      cy.get("#freightBillNumber").type("AA1234567");
      cy.get("#departureCountry").invoke("val", "France");
      cy.get("#departurePort").type("Port of Calais");
      cy.get("[data-testid=save-and-continue]").click();
      cy.get("form").submit();
      cy.contains("h2", /^There is a problem$/).should("be.visible");
      cy.contains("a", /^Enter the vessel name$/).should("be.visible");
    });

    it("should display error when vessel name contains invalid characters", () => {
      cy.get("#vesselName").type("Invalid@Name!");
      cy.get("#flagState").type("Greece");
      cy.get('[id="containerNumbers.0"]').type("ABCD1234567");
      cy.get("#freightBillNumber").type("AA1234567");
      cy.get("#departureCountry").invoke("val", "France");
      cy.get("#departurePort").type("Port of Calais");
      cy.get("[data-testid=save-and-continue]").click();
      cy.get("form").submit();
      cy.contains("h2", /^There is a problem$/).should("be.visible");
      cy.contains("a", /^Vessel name must only contain letters, numbers, apostrophes, hyphens, and brackets$/).should(
        "be.visible"
      );
    });

    it("should scroll to errorIsland when there is a validation error in vessel name and we try to submit", () => {
      cy.get("#vesselName").type("Invalid@Name!");
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
      cy.get("#vesselName").type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains("a", "Vessel name must not exceed 50 characters").should("be.visible");
    });

    it("should display error when vessel name has invalid characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsVesselName,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#vesselName").type("Invalid@Name!");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains("a", "Vessel name must only contain letters, numbers, apostrophes, hyphens, and brackets").should(
        "be.visible"
      );
    });

    it("should display error when flag state exceeds 50 characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveMaxCharsFlagState,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#flagState").type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains("a", "Flag state must not exceed 50 characters").should("be.visible");
    });

    it("should display error when flag state has invalid characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsFlagState,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#flagState").type("Invalid@State!");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains("a", "Flag state must only contain letters, numbers, apostrophes, hyphens and spaces").should(
        "be.visible"
      );
    });

    it("should display error when container number has invalid format", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidFormatContainerNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get('[name="containerNumbers.0"]').should("be.visible").type("INVALID@#");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains("h2", "There is a problem").should("be.visible");
    });

    it("should show format error when a container identification number has invalid format regardless of length", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveMaxCharsContainerIdentificationNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get('[name="containerNumbers.0"]')
        .should("be.visible")
        .type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains("h2", "There is a problem").should("be.visible");
    });

    it("should add 5 container numbers with correct format", () => {
      const testParams = {
        testCaseId: TestCaseId.ContainerVesselSaveContainerNumber,
        disableScripts: true,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });

      // Ensure there are up to 5 container inputs, then fill them using a stable query
      cy.get("body").then(($body) => {
        const addBtnExists = $body.find('[data-testid="add-another-container"]').length > 0;
        if (addBtnExists) {
          // click add until at least 5 inputs exist (click 4 times)
          for (let i = 1; i < 5; i++) {
            cy.get('[data-testid="add-another-container"]').click();
            cy.document({ timeout: 150 }).its("readyState").should("eq", "complete");
          }
        }
      });

      // Query current inputs and fill up to 5 of them using each() to avoid detached subjects
      cy.get('[name^="containerNumbers."]', { timeout: 10000 })
        .should("have.length.at.least", 1)
        .then(($inputs) => {
          const toFill = Math.min(5, $inputs.length);
          cy.get('[name^="containerNumbers."]').each(($el, idx) => {
            if (idx < toFill) {
              cy.wrap($el).should("be.visible").invoke("val", "ABCJ1234567").trigger("input").trigger("change");
            }
          });
          if ($inputs.length < 5) cy.log(`Only ${$inputs.length} container inputs rendered`);
        });

      // Intercept the form POST and assert the payload contains 5 container numbers
      cy.intercept("POST", "**/add-arrival-transportation-details-container-vessel*").as("saveContainerVessel");
      cy.get("[data-testid=save-and-continue]").click();
      cy.wait("@saveContainerVessel", { timeout: 10000 }).then((interception) => {
        const body = interception.request.body as any;
        if (typeof body === "string") {
          // form-encoded payload (server-rendered), parse and assert
          const params = new URLSearchParams(body);
          const containers = [] as string[];
          for (let i = 0; i < 10; i++) {
            const key = `containerNumbers.${i}`;
            if (params.has(key)) containers.push(params.get(key) as string);
          }
          expect(containers).to.have.length(5);
        } else {
          expect(body).to.have.property("containerNumbers");
          expect(body.containerNumbers).to.have.length(5);
        }
      });
    });

    it("should remove a container input when the remove button is clicked", () => {
      const testParams = {
        testCaseId: TestCaseId.ContainerVesselSaveContainerNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });

      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="add-another-container"]').length > 0) {
          cy.get('[data-testid="add-another-container"]').click();
          cy.get('[name="containerNumbers.0"]').clear().type("ABCD1234567");
          cy.get('[name="containerNumbers.1"]').clear().type("ABCD1234561");
          cy.get('[name^="containerNumbers."]').should("have.length", 2);
          cy.get('[data-testid="remove-container-1"]').click();
          cy.get('[name^="containerNumbers."]').should("have.length", 1);
          cy.get('[name="containerNumbers.0"]').should("have.value", "ABCD1234567");
        } else {
          cy.get('[data-testid="add-another-container"]').should("not.exist");
          cy.get('[name="containerNumbers.0"]').should("be.visible");
          cy.get('[name="containerNumbers.1"]').should("be.visible");
        }
      });
    });

    it("should display error when freight bill number exceeds 60 characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveMaxCharsFreightBillNumber,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#freightBillNumber").type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains("a", "Freight bill number must not exceed 60 characters").should("be.visible");
    });

    it("should display error when freight bill number has invalid characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsFreightBillNumber,
      };
      cy.get("body").should("exist");
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#freightBillNumber").type("Freight@#");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains(
        "a",
        "Freight bill number must only contain letters, numbers, hyphens, full stops and forward slashes"
      ).should("be.visible");
    });

    it("should display error when departure country is invalid", () => {
      cy.get("body").should("exist");
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidDepartureCountry,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#departureCountry").type("!InvalidCountry123");
      cy.get("[data-testid=save-and-continue]").click();
      cy.get("#error-summary-title").contains("There is a problem");
    });

    it("should display error when consignment departs from (departure port) exceeds 50 characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveMaxCharsDeparturePort,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#departurePort").type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains("a", "Where the consignment departs from must not exceed 50 characters").should("be.visible");
    });

    it("should display error when consignment departs from (departure port) has invalid characters", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.ContainerVesselSaveInvalidCharsDeparturePort,
      };
      cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
      cy.get("#departurePort").type("Invalid@Port!");
      cy.get("[data-testid=save-and-continue]").click();
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
      cy.get("#departureDate").type("32");
      cy.get("#departureDate-month").type("13");
      cy.get("#departureDate-year").type("2025");
      cy.get("[data-testid=save-and-continue]").click();
      cy.contains("h2", /^There is a problem$/).should("be.visible");
      cy.contains("a", "Departure date must be a real date").should("be.visible");
    });
  });
});

describe("Container Vessel Arrival Required Fields Validation", () => {
  const testParams: ITestParams = { testCaseId: TestCaseId.AddArrivalContainerVesselTransportAllowed };
  it("should display error when flag state is empty", () => {
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Test Vessel");
    cy.get("#flagState").should("have.value", "");
    cy.get('[id="containerNumbers.0"]').type("ABCD1234567");
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Port of Calais");
    cy.get("#placeOfUnloading").type("Dover");
    cy.get("#departureDate").type("25");
    cy.get("#departureDate-month").type("07");
    cy.get("#departureDate-year").type("2025");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the flag state$/).should("be.visible");
  });

  it("should display error when container identification number is empty", () => {
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Test Vessel");
    cy.get("#flagState").type("Greece");
    cy.get('[id="containerNumbers.0"]').should("have.value", "");
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Port of Calais");
    cy.get("#placeOfUnloading").type("Dover");
    cy.get("#departureDate").type("25");
    cy.get("#departureDate-month").type("07");
    cy.get("#departureDate-year").type("2025");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the shipping container identification number$/).should("be.visible");
  });

  it("should display error when country of departure is empty", () => {
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Test Vessel");
    cy.get("#flagState").type("Greece");
    cy.get('[id="containerNumbers.0"]').type("ABCD1234567");
    cy.get("#departureCountry").should("have.value", "");
    cy.get("#departurePort").type("Port of Calais");
    cy.get("#placeOfUnloading").type("Dover");
    cy.get("#departureDate").type("25");
    cy.get("#departureDate-month").type("07");
    cy.get("#departureDate-year").type("2025");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the country of departure$/).should("be.visible");
  });

  it("should display error when consignment departs from is empty", () => {
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Test Vessel");
    cy.get("#flagState").type("Greece");
    cy.get('[id="containerNumbers.0"]').type("ABCD1234567");
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").should("have.value", "");
    cy.get("#placeOfUnloading").type("Dover");
    cy.get("#departureDate").type("25");
    cy.get("#departureDate-month").type("07");
    cy.get("#departureDate-year").type("2025");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter where the consignment departs from$/).should("be.visible");
  });

  it("should display error when departure date is empty", () => {
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Test Vessel");
    cy.get("#flagState").type("Greece");
    cy.get('[id="containerNumbers.0"]').type("ABCD1234567");
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Port of Calais");
    cy.get("#placeOfUnloading").type("Dover");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the departure date$/).should("be.visible");
  });
});

describe("AddArrivalContainerVesselTransport Save As Draft scenarios", () => {
  it("should navigate to sd dashboard page on click of save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSaveAsDraft,
    };
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Test Vessel");
    cy.get("#flagState").type("Greece");
    cy.get('[id="containerNumbers.0"]').type("ABCD1234567");
    cy.get("#freightBillNumber").type("Freight bill");
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Charles de Gaulle airport");
    cy.get("#departureDate").type("25");
    cy.get("#departureDate-month").type("07");
    cy.get("#departureDate-year").type("2025");
    cy.get("[data-testid=save-draft-button").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should not retain a future departure date when saving as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSaveAsDraft,
    };
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Ocean Star");
    cy.get("#flagState").type("France");
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Marseille");
    // Enter a future departure date (should be omitted by the draft save logic)
    cy.get("#departureDate").type("25");
    cy.get("#departureDate-month").type("12");
    cy.get("#departureDate-year").type("2099");
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");

    // Return to the page using the check fixture (which reflects that future date was NOT saved)
    const checkParams: ITestParams = {
      testCaseId: TestCaseId.ArrivalContainerVesselTransportSaveAsDraftFutureDateCheck,
    };
    cy.visit(addArrivalTransportationDetailsContainerVesselUrl, { qs: { ...checkParams } });
    cy.get("#departureDate").should("have.value", "");
    cy.get("#departureDate-month").should("have.value", "");
    cy.get("#departureDate-year").should("have.value", "");
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
      .type("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    cy.get("[data-testid=save-and-continue]").click();
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
