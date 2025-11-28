import { type ITestParams, TestCaseId } from "~/types";

const sdPageUrl = "create-storage-document/GBR-2022-SD-F71D98A30/what-storage-facility-address";

describe("SD: What storage facility address page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should render the expected header", () => {
    cy.contains("a", /^Create a UK storage document$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-storage-document/storage-documents");

    cy.get(".govuk-heading-xl").contains("What is the storage facility address?");
  });

  it("should render the buttons texts", () => {
    cy.get(".govuk-button-group button").contains("Cancel");
    cy.get('[data-testid="findaddress"]').should("be.visible").contains("Find address");
  });

  it("should render the input label and hint text", () => {
    cy.get("div .govuk-hint").contains(
      "If you cannot find the address or you need to add a non-UK address, click the link 'Enter the address manually'"
    );
  });
});

describe("SD: Entering the address manually", () => {
  beforeEach(() => {
    cy.visit(sdPageUrl);
    cy.findByText(/^Enter the address manually$/).click({ force: true });
  });

  it("should render header", () => {
    cy.get(".govuk-heading-xl").contains("What is the storage facility address?");
  });

  it("should render all input fields", () => {
    cy.contains("label", "Sub-building name");
    cy.contains("label", "Building number");
    cy.contains("label", "Building name");
    cy.contains("label", "Street name");
    cy.contains("label", "Town or city");
    cy.contains("label", "County, state or province");
    cy.contains("label", "Postcode");
    cy.contains("label", "Country");
  });

  it("should render form button", () => {
    cy.contains("[data-testid='continue']", "Continue");
    cy.contains("[data-testid='cancel']", "Cancel");
  });
});

describe("SD: Entering the address manually with errors", () => {
  it("should display errors on empty form submitted", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddressPostcodeEmptyError,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    cy.get("[data-testid=continue]").click({ force: true });

    cy.url().should("include", "what-storage-facility-address");
    cy.get(".govuk-error-summary").should("be.visible");
  });

  it("should display errors on submission invalid value", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddressWithSubBuildingError,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    cy.get("#subBuildingName").type("#$!!&&", { force: true });
    cy.get("[data-testid=continue]").click({ force: true });

    cy.url().should("include", "what-storage-facility-address");
    cy.get(".govuk-error-message").should("be.visible");
    cy.get(".govuk-error-summary").contains(
      "SubBuilding name must only contain letters, numbers, apostrophes, hyphens, periods, commas, spaces, ampersands, exclamation marks and forward slashes"
    );
  });

  it("should display errors on only required value submitted", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddressPostcodeEmptyError,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    cy.get("[data-testid=continue]").click({ force: true });

    cy.url().should("include", "what-storage-facility-address");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains("Enter the town or city");
    cy.get(".govuk-error-summary").contains("Select a country from the list");
    cy.get(".govuk-error-summary").contains("Enter a postcode");
  });

  it("should not display errors on validation passed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    cy.get("#subBuildingName").type("Test Bldg", { force: true });
    cy.get("#buildingNumber").type("123", { force: true });
    cy.get("#buildingName").type("Test Villa", { force: true });
    cy.get("#streetName").type("Street 1", { force: true });
    cy.get("#townCity").type("Test", { force: true });
    cy.get("#county").type("Test", { force: true });
    cy.get("#postcode").type("12345", { force: true });
    cy.get("#country").type("Albania", { force: true });

    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", "/add-storage-facility-details");
  });

  it("should redirect to the forbidden page if the user is unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddressWith403,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    cy.get("#subBuildingName").type("Test Bldg", { force: true });
    cy.get("#buildingNumber").type("123", { force: true });
    cy.get("#buildingName").type("Test Villa", { force: true });
    cy.get("#streetName").type("Street 1", { force: true });
    cy.get("#townCity").type("Test", { force: true });
    cy.get("#county").type("Test", { force: true });
    cy.get("#postcode").type("12345", { force: true });
    cy.get("#country").type("Albania", { force: true });

    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", "/forbidden");
  });
});

describe("SD: On Selected Address", () => {
  it("should populate selected address into form", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.get("#selectAddress").should("be.visible");

    const option = "MMO, LANCASTER HOUSE, HAMPSHIRE COURT, NEWCASTLE UPON TYNE, NE4 7YH";
    cy.contains("#selectAddress option", option);
    cy.get("#selectAddress").select(option);
    cy.get("#getaddress").click({ force: true });

    cy.get("#subBuildingName").should("have.value", "MMO");
    cy.get("#buildingName").should("have.value", "LANCASTER HOUSE");
    cy.get("#streetName").should("have.value", "HAMPSHIRE COURT");
    cy.get("#townCity").should("have.value", "NEWCASTLE UPON TYNE");
    cy.get("#county").should("have.value", "TYNESIDE");
    cy.get("#postcode").should("have.value", "NE4 7YH");
    cy.get("#country").should("have.value", "ENGLAND");
  });

  it("should display an error if trying to continue without selecting an address", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.get("#getaddress").click({ force: true });

    cy.contains("span", "Select an address to continue");
  });

  it("should go back to postcode input to allow searching for a different postcode", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345", { force: true });
    cy.get("#findaddress").click({ force: true });

    cy.get("input[name=postcode]").should("not.be.visible");

    cy.get("[data-testid=change-postcode]").click({ force: true });

    cy.get("input[name=postcode]").should("be.visible");
  });

  it("should display error if no postcode has been entered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddressPostcodeEmptyError,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("#findaddress").click({ force: true });

    cy.findByRole("link", { name: "Enter a postcode" });
  });

  it("should display error if the entered postcode is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddressPostcodeInvalidError,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("#findaddress").click({ force: true });

    cy.findByRole("link", {
      name: "Postcode must be between 5 and 8 characters, and contain only letters, numbers, spaces, hyphens and commas",
    });
  });

  it("should go back to add-storage-document-details if cancelling postcode search", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=cancel]").click({ force: true });

    cy.url().should("include", "/add-storage-facility-details");
  });

  it("should go with existing postcode search with session", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDStorageFacilityAddress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    // Mock session data
    cy.window().then((win) => {
      win.sessionStorage.setItem("postcode", "sw11aa");
      win.sessionStorage.setItem("addressOne", "56, 3, Arc House, test");
      win.sessionStorage.setItem("currentStep", "selectedAddress");
    });
    cy.get("input[name=postcode]").should("be.visible");
  });
});
