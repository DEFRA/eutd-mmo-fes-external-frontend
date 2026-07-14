import { type ITestParams, TestCaseId } from "~/types";

const sdPageUrl = "create-non-manipulation-document/GBR-2022-SD-F71D98A30/what-exporters-address";

describe("SD: Exporter address page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddExporterDetails,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should render the expected header", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-heading-xl").contains("What is the exporter’s address");

    cy.get("body").should("exist");
  });

  it("should render the buttons texts", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-button-group button").contains("Cancel");
    cy.get('[data-testid="findaddress"]').should("be.visible").contains("Find address");
  });

  it("should render the input label and hint text", () => {
    cy.wrap(true).should("be.true");
    cy.get("div .govuk-hint").contains(
      "If you cannot find the address or you need to add a non-UK address, click the link 'Enter the address manually'"
    );

    cy.get("body").should("exist");
  });
});

describe("SD: Entering the address manually", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddExporterDetails,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();
  });

  it("should render header", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-heading-xl").contains("What is the exporter’s address");

    cy.get("body").should("exist");
  });

  it("should render all input fields", () => {
    cy.wrap(true).should("be.true");
    cy.contains("label", "Sub-building name");
    cy.contains("label", "Building number");
    cy.contains("label", "Building name");
    cy.contains("label", "Street name");
    cy.contains("label", "Town or city");
    cy.contains("label", "County/state/province (optional)");
    cy.contains("label", "Postcode");
    cy.contains("label", "Country");

    cy.get("body").should("exist");
  });

  it("should render form button", () => {
    cy.wrap(true).should("be.true");
    cy.contains("[data-testid='continue']", "Continue");
    cy.contains("[data-testid='cancel']", "Cancel");

    cy.get("body").should("exist");
  });
});

describe("SD: Entering the address manually with errors", () => {
  it("should display errors on empty form submitted", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithErrors,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    cy.get("[data-testid=continue]").click();

    cy.url().should("include", "what-exporters-address");
    cy.get(".govuk-error-summary").should("be.visible");
  });

  it("should display errors on submission invalid value", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithSubBuildingError,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    cy.get("#subBuildingName").type("#$!!&&");
    cy.get("[data-testid=continue]").click();

    cy.url().should("include", "what-exporters-address");
    cy.get(".govuk-error-message").should("be.visible");
    cy.get(".govuk-error-summary").contains(
      "SubBuilding name must only contain letters, numbers, apostrophes, hyphens, periods, commas, spaces, ampersands, exclamation marks and forward slashes"
    );
  });

  it("should display errors on only required value submitted", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithErrors,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    cy.get("[data-testid=continue]").click();

    cy.url().should("include", "what-exporters-address");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains("Enter the town or city");
    cy.get(".govuk-error-summary").contains("Select a country from the list");
    cy.get(".govuk-error-summary").contains("Enter a postcode");
  });

  it("should not display errors on validation passed", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    cy.get("#subBuildingName").type("Test Bldg");
    cy.get("#buildingNumber").type("123");
    cy.get("#buildingName").type("Test Villa");
    cy.get("#streetName").type("Street 1");
    cy.get("#townCity").type("Test");
    cy.get("#county").type("Test");
    cy.get("#postcode").type("12345");
    cy.get("#country").type("Albania");

    cy.get("[data-testid=continue]").click();
    cy.url().should("include", "/add-exporter-details");
  });

  it("should redirect to the forbidden page if the user is unauthorised", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWith403,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    cy.get("#subBuildingName").type("Test Bldg");
    cy.get("#buildingNumber").type("123");
    cy.get("#buildingName").type("Test Villa");
    cy.get("#streetName").type("Street 1");
    cy.get("#townCity").type("Test");
    cy.get("#county").type("Test");
    cy.get("#postcode").type("12345");
    cy.get("#country").type("Albania");

    cy.get("[data-testid=continue]").click();
    cy.url().should("include", "/forbidden");
  });
});

describe("SD: On Selected Address", () => {
  it("should populate selected address into form", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345");
    cy.get("#findaddress").click();
    cy.get("#selectAddress").should("be.visible");

    const option = "MMO, LANCASTER HOUSE, HAMPSHIRE COURT, NEWCASTLE UPON TYNE, NE4 7YH";
    cy.contains("#selectAddress option", option);
    cy.get("#selectAddress").select(option);
    cy.get("#getaddress").click();

    cy.get("#subBuildingName").should("have.value", "MMO");
    cy.get("#buildingName").should("have.value", "LANCASTER HOUSE");
    cy.get("#streetName").should("have.value", "HAMPSHIRE COURT");
    cy.get("#townCity").should("have.value", "NEWCASTLE UPON TYNE");
    cy.get("#county").should("have.value", "TYNESIDE");
    cy.get("#postcode").should("have.value", "NE4 7YH");
    cy.get("#country").should("have.value", "ENGLAND");
  });

  it("should display an error if trying to continue without selecting an address", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345");
    cy.get("#findaddress").click();
    cy.get("#getaddress").click();

    cy.contains("span", "Select an address to continue");

    cy.get("body").should("exist");
  });

  it("should go back to postcode input to allow searching for a different postcode", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345");
    cy.get("#findaddress").click();

    cy.get("input[name=postcode]").should("not.be.visible");

    cy.get("[data-testid=change-postcode]").click();

    cy.get("input[name=postcode]").should("be.visible");
  });

  it("should display error if no postcode has been entered", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddressPostcodeEmptyError,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("#findaddress").click();

    cy.findByRole("link", { name: "Enter a postcode" });

    cy.get("body").should("exist");
  });

  it("should display error if the entered postcode is invalid", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddressPostcodeInvalidError,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("#findaddress").click();

    cy.findByRole("link", {
      name: "Postcode must be between 5 and 8 characters, and contain only letters, numbers, spaces, hyphens and commas",
    });

    cy.get("body").should("exist");
  });

  it("should go back to add-exporter-details if cancelling postcode search", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=cancel]").click();

    cy.url().should("include", "/add-exporter-details");
  });
});
