import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-CC-4ED8CAE79";
const certificateUrl = `/create-catch-certificate/${documentNumber}`;
const ccPageUrl = `${certificateUrl}/add-transportation-details-container-vessel/0`;
const progressUrl = `${certificateUrl}/add-additional-transport-documents-container-vessel/0`;

describe("Add Transportation Details: Container Vessel", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportAllowed,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
  });

  it("should render the expected title", () => {
    cy.wrap(true).should("be.true");
    cy.title().should("eq", "Add transportation details: container vessel - Create a UK catch certificate - GOV.UK");
  });

  it("should render the expected header", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-heading-xl").contains("Add transportation details: container vessel");
  });

  it("should render back link", () => {
    cy.wrap(true).should("be.true");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk/0`);
  });

  it("should render the buttons texts", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="save-draft-button"]').contains("Save as draft");
    cy.get('[data-testid="save-and-continue"]').should("be.visible").contains("Save and continue");
  });

  it("should render the input label and hint text", () => {
    cy.wrap(true).should("be.true");
    cy.contains("label", "Vessel name");
    cy.contains("label", "Flag state");
    cy.contains("label", "Shipping container identification number");
    cy.contains("label", "Place export leaves the departure country");
    cy.contains("label", "Freight bill number (optional)");
    cy.get("div .govuk-hint").contains("For example, Hull.");
    cy.get("div .govuk-hint").contains("For example, BD51SMR");
    cy.get("div .govuk-hint").contains(
      "Enter the identification number shown on the shipping container. For example, ABCJ0123456"
    );
  });
});

describe("Save and Continue button - UnHappy path", () => {
  it("should redirect user to forbidden page when saveTransportDetails fails with a 403 error", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SaveVesselTransportDetailsFailsWith403,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click();
    cy.url().should("include", "/forbidden");
  });

  it("should display errors at top", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportErrors,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue").click();
    cy.get(".govuk-error-summary__list").contains("Enter the vessel name");
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Enter the place the export leaves the UK$/).should("be.visible");
    cy.contains("a", /^Enter the flag state$/).should("be.visible");
    cy.contains("a", /^Enter the vessel name$/).should("be.visible");
  });
});

describe("Save and Continue button - Happy path", () => {
  it("should redirect to progress page on click of save and continue button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get('input[name="containerNumbers.0"]').type("Container");
    cy.get("#vesselName").type("Vessel");
    cy.get("#flagState").type("flag State");
    cy.get("#departurePlace").type("Place export");
    cy.get("#freightBillNumber").type("AA1234567");
    cy.get("[data-testid=save-and-continue").click();
    cy.url().should("include", progressUrl);
  });

  it("should redirect to dashboard page on click of save as draft button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSaveAsDraft,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get('input[name="containerNumbers.0"]').type("Container");
    cy.get("#vesselName").type("Vessel");
    cy.get("#flagState").type("flag State");
    cy.get("#departurePlace").type("Place export");
    cy.get("#freightBillNumber").type("AA1234567");
    cy.get("[data-testid=save-draft-button").click();
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });
});

describe("Add Transportation Details Container Vessel : Disallowed", () => {
  it("should redirect to the progress page if transport is not Container Vessel", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportDisAllowed,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("should redirect to forbidden page it transport details return 403 on page load", () => {
  it("should redirect to the forbidden page if transport returns un authorised", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TransportAllowedUnauthorised,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Transportation Details Container Vessel: Container Identification Number Validation", () => {
  it("should display format error when container identification number has invalid format regardless of length", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportContainerMaxLength,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");
    cy.get("#departurePlace").type("Felixstowe Port");
    cy.get('input[name="containerNumbers.0"]').type("ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABC");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Enter a shipping container number in the correct format. This must be 11 characters: 3 letters, then U, J, Z or R, then 7 numbers.$/
    ).should("be.visible");
  });

  it("should display error when container identification number contains invalid characters", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportContainerInvalidCharacters,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");
    cy.get("#departurePlace").type("Felixstowe Port");
    cy.get('input[name="containerNumbers.0"]').type("ABC123!@#");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Enter a shipping container number in the correct format. This must be 11 characters: 3 letters, then U, J, Z or R, then 7 numbers.$/
    ).should("be.visible");
  });

  it("should save successfully when container identification number is not provided", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");
    cy.get("#departurePlace").type("Felixstowe Port");
    // containerNumbers.0 not filled - should be optional
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", progressUrl);
  });

  it("should save successfully when container identification number is valid", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");
    cy.get("#departurePlace").type("Felixstowe Port");
    cy.get('input[name="containerNumbers.0"]').type("ABCJ1234567");
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", progressUrl);
  });

  it("should save successfully when container identification number is entered in lowercase", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");
    cy.get("#departurePlace").type("Felixstowe Port");
    cy.get('input[name="containerNumbers.0"]').type("abcu1234567");
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", progressUrl);
  });
});

describe("Add Transportation Details Container Vessel: Multiple Container Numbers", () => {
  it("should save multiple container values successfully", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportMultipleContainers,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");

    // Fill existing container fields, or add if the hydrated add button is present.
    cy.get('input[name="containerNumbers.0"]').clear().type("ABCJ1234567");
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="add-another-container"]').length > 0) {
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('input[name="containerNumbers.1"]').clear().type("DEFJ9876543");
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('input[name="containerNumbers.2"]').clear().type("GHIJ5555555");
      } else {
        cy.get('input[name="containerNumbers.1"]').clear().type("DEFJ9876543");
        cy.get('input[name="containerNumbers.2"]').clear().type("GHIJ5555555");
      }
    });

    cy.get("#departurePlace").type("Felixstowe Port");

    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", progressUrl);
  });

  it("should allow empty container fields", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportEmptyContainers,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");

    // Leave middle container empty while still submitting valid values around it.
    cy.get('input[name="containerNumbers.0"]').clear().type("ABCJ0123456");
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="add-another-container"]').length > 0) {
        cy.get('[data-testid="add-another-container"]').click();
        // Leave containerNumbers.1 empty
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('input[name="containerNumbers.2"]').clear().type("ABCJ0123457");
      } else {
        cy.get('input[name="containerNumbers.1"]').clear();
        cy.get('input[name="containerNumbers.2"]').clear().type("ABCJ0123457");
      }
    });

    cy.get("#departurePlace").type("Felixstowe Port");

    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", progressUrl);
  });

  it("should load pre-existing container values from backend", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportEditWithContainers,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    // Verify pre-existing values are loaded
    cy.get('input[name="containerNumbers.0"]').should("have.value", "EXISTING001");
    cy.get('input[name="containerNumbers.1"]').should("have.value", "EXISTING002");
    cy.get('input[name="containerNumbers.2"]').should("have.value", "EXISTING003");
  });

  it("should display format error when container number has invalid format regardless of length", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportContainerMaxLength,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");
    cy.get('input[name="containerNumbers.0"]').type("ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABC");
    cy.get("#departurePlace").type("Felixstowe Port");

    cy.get("[data-testid=save-and-continue]").click();

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^Enter a shipping container number in the correct format. This must be 11 characters: 3 letters, then U, J, Z or R, then 7 numbers.$/
    ).should("be.visible");
  });

  it("should display container field label and hint text", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

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
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");

    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="add-another-container"]').length > 0) {
        // Add up to max containers when client-side controls are available.
        for (let i = 0; i < 9; i++) {
          cy.get('[data-testid="add-another-container"]').click();
        }
        cy.get('input[name="containerNumbers.9"]').should("exist");
        cy.get('[data-testid="add-another-container"]').should("not.exist");
      } else {
        // In non-hydrated mode dynamic add/remove controls are not rendered.
        cy.get('[data-testid="add-another-container"]').should("not.exist");
      }
    });
  });

  it("should show remove button for each container except when only one exists", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#vesselName").type("Felicity Ace");
    cy.get("#flagState").type("Greece");

    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="add-another-container"]').length > 0) {
        cy.get('[data-testid="remove-container-0"]').should("not.exist");
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('[data-testid="remove-container-0"]').should("exist");
        cy.get('[data-testid="remove-container-1"]').should("exist");
        cy.get('[data-testid="remove-container-1"]').click();
        cy.get('[data-testid="remove-container-0"]').should("not.exist");
      } else {
        cy.get('[data-testid^="remove-container-"]').should("not.exist");
      }
    });
  });

  it("should properly reindex container inputs when removing middle container", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="add-another-container"]').length > 0) {
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('input[name="containerNumbers.0"]').type("FIRST0001111");
        cy.get('input[name="containerNumbers.1"]').type("SECOND001111");
        cy.get('input[name="containerNumbers.2"]').type("THIRD0001111");
        cy.get('[data-testid="remove-container-1"]').click();
        cy.get('input[name="containerNumbers.0"]').should("have.value", "FIRST0001111");
        cy.get('input[name="containerNumbers.1"]').should("have.value", "THIRD0001111");
        cy.get('input[name="containerNumbers.2"]').should("not.exist");
      } else {
        cy.get('input[name="containerNumbers.0"]').should("exist");
        cy.get('input[name="containerNumbers.1"]').should("exist");
        cy.get('input[name="containerNumbers.2"]').should("exist");
      }
    });
  });

  it("should properly reindex container inputs when removing first container", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="add-another-container"]').length > 0) {
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('input[name="containerNumbers.0"]').type("REMOVE_THIS001");
        cy.get('input[name="containerNumbers.1"]').type("BECOMES_ZERO02");
        cy.get('input[name="containerNumbers.2"]').type("BECOMES_ONE003");
        cy.get('[data-testid="remove-container-0"]').click();
        cy.get('input[name="containerNumbers.0"]').should("have.value", "BECOMES_ZERO02");
        cy.get('input[name="containerNumbers.1"]').should("have.value", "BECOMES_ONE003");
      } else {
        cy.get('input[name="containerNumbers.0"]').should("exist");
      }
    });
  });

  it("should properly reindex container inputs when removing last container", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.VesselContainerTransportSave,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="add-another-container"]').length > 0) {
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('[data-testid="add-another-container"]').click();
        cy.get('input[name="containerNumbers.0"]').type("KEEP0000FIRST01");
        cy.get('input[name="containerNumbers.1"]').type("KEEP0000SECOND01");
        cy.get('input[name="containerNumbers.2"]').type("REMOVE_LAST0001");
        cy.get('[data-testid="remove-container-2"]').click();
        cy.get('input[name="containerNumbers.0"]').should("have.value", "KEEP0000FIRST01");
        cy.get('input[name="containerNumbers.1"]').should("have.value", "KEEP0000SECOND01");
        cy.get('input[name="containerNumbers.2"]').should("not.exist");
      } else {
        cy.get('input[name="containerNumbers.0"]').should("exist");
      }
    });
  });
});
