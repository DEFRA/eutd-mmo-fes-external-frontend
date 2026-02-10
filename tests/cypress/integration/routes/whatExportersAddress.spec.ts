import { type ITestParams, TestCaseId } from "~/types";

const ccPageUrl = "create-catch-certificate/GBR-2022-CC-F71D98A30/what-exporters-address";

describe("CC: Exporter address page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
  });

  it("should render the expected header", () => {
    cy.get(".govuk-heading-xl").contains("What is the exporter’s address");
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

describe("CC: Entering the address manually", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });
  });

  it("should render header", () => {
    cy.get(".govuk-heading-xl").contains("What is the exporter’s address");
  });

  it("should render all input fields", () => {
    cy.contains("label", "Sub-building name");
    cy.contains("label", "Building number");
    cy.contains("label", "Building name");
    cy.contains("label", "Street name");
    cy.contains("label", "Town or city");
    cy.contains("label", "County/state/province (optional)");
    cy.contains("label", "Postcode");
    cy.contains("label", "Country");
  });

  it("should render form button", () => {
    cy.contains("[data-testid='continue']", "Continue");
    cy.contains("[data-testid='cancel']", "Cancel");
  });
});

describe("CC: Entering the address manually with errors", () => {
  it("should display errors on empty form submitted", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithErrorsArray,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", "what-exporters-address");
    cy.get(".govuk-error-summary").should("be.visible");
  });

  it("should display errors on submission invalid value", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithSubBuildingError,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    cy.get("#subBuildingName").type("#$!!&&", { force: true });
    cy.get("[data-testid=continue]").click({ force: true });

    cy.url().should("include", "what-exporters-address");
    cy.get(".govuk-error-message").should("be.visible");
    cy.get(".govuk-error-summary").contains(
      "SubBuilding name must only contain letters, numbers, apostrophes, hyphens, periods, commas, spaces, ampersands, exclamation marks and forward slashes"
    );
  });

  it("should display errors on only required value submitted", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithErrors,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    cy.get("[data-testid=continue]").click({ force: true });

    cy.url().should("include", "what-exporters-address");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains("Enter the town or city");
    cy.get(".govuk-error-summary").contains("Select a country from the list");
    cy.get(".govuk-error-summary").contains("Enter a postcode");
  });

  it("should display error when all address fields are blank", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithAddressFirstPartError,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    // Leave all address fields blank but fill in required fields
    cy.get("#townCity").type("Test City", { force: true });
    cy.get("#postcode").type("12345", { force: true });
    cy.get("#country").type("Albania");
    cy.get("[id^='country-option']").contains("Albania").click();
    cy.get("#country").should("have.value", "Albania");

    cy.get("[data-testid=continue]").click({ force: true });

    // Should display the address first part error
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains(
      "Enter a sub-building name, building number, a building name or street name"
    );
  });

  it("should not display error when sub-building name is populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    // Only populate sub-building name (other address fields blank)
    cy.get("#subBuildingName").type("Flat 1", { force: true });
    cy.get("#townCity").type("Test City", { force: true });
    cy.get("#postcode").type("12345", { force: true });
    cy.get("#country").type("Albania", { force: true });

    cy.get("[data-testid=continue]").click({ force: true });

    // Should not display address first part error
    cy.get(".govuk-error-summary").should("not.exist");
    cy.url().should("include", "/add-exporter-details");
  });

  it("should not display error when building number is populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    // Only populate building number (other address fields blank)
    cy.get("#buildingNumber").type("123", { force: true });
    cy.get("#townCity").type("Test City", { force: true });
    cy.get("#postcode").type("12345", { force: true });
    cy.get("#country").type("Albania", { force: true });

    cy.get("[data-testid=continue]").click({ force: true });

    // Should not display address first part error
    cy.get(".govuk-error-summary").should("not.exist");
    cy.url().should("include", "/add-exporter-details");
  });

  it("should not display error when building name is populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    // Only populate building name (other address fields blank)
    cy.get("#buildingName").type("Test Villa", { force: true });
    cy.get("#townCity").type("Test City", { force: true });
    cy.get("#postcode").type("12345", { force: true });
    cy.get("#country").type("Albania", { force: true });

    cy.get("[data-testid=continue]").click({ force: true });

    // Should not display address first part error
    cy.get(".govuk-error-summary").should("not.exist");
    cy.url().should("include", "/add-exporter-details");
  });

  it("should not display error when street name is populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    // Only populate street name (other address fields blank)
    cy.get("#streetName").type("Main Street", { force: true });
    cy.get("#townCity").type("Test City", { force: true });
    cy.get("#postcode").type("12345", { force: true });
    cy.get("#country").type("Albania", { force: true });

    cy.get("[data-testid=continue]").click({ force: true });

    // Should not display address first part error
    cy.get(".govuk-error-summary").should("not.exist");
    cy.url().should("include", "/add-exporter-details");
  });

  it("should not display errors on validation passed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
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
    cy.url().should("include", "/add-exporter-details");
  });

  it("should redirect to the forbidden page if the user is unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWith403,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
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

  // Defect 445: All validation errors should appear simultaneously with field-level error styling
  it("should display ALL validation errors simultaneously on empty form submission with field-level error indicators", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithErrorsArray,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });

    // Submit the form without filling any fields
    cy.get("[data-testid=continue]").click({ force: true });

    // Should stay on the same page
    cy.url().should("include", "what-exporters-address");

    // Error summary should be visible at the top
    cy.get(".govuk-error-summary").should("be.visible");

    // All required field errors should appear in the error summary simultaneously
    cy.get(".govuk-error-summary").should("contain.text", "Enter the town or city");
    cy.get(".govuk-error-summary").should("contain.text", "Enter a postcode");
    cy.get(".govuk-error-summary").should("contain.text", "Select a country from the list");

    // Required fields should have error styling and inline error messages
    cy.get("#townCity")
      .parent(".govuk-form-group")
      .should("have.class", "govuk-form-group--error")
      .find(".govuk-error-message")
      .should("be.visible")
      .and("contain.text", "Enter the town or city");

    cy.get("#postcode")
      .parent(".govuk-form-group")
      .should("have.class", "govuk-form-group--error")
      .find(".govuk-error-message")
      .should("be.visible")
      .and("contain.text", "Enter a postcode");

    cy.get("#country")
      .parents(".govuk-form-group")
      .should("have.class", "govuk-form-group--error")
      .find(".govuk-error-message")
      .should("be.visible")
      .and("contain.text", "Select a country from the list");
  });
});
//I skipped these tests as they are flaky in CI/CD
describe("CC: On Selected Address", () => {
  it("should populate selected address into form", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

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
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.get("#getaddress").click({ force: true });

    cy.contains("span", "Select an address to continue");
  });

  it("should go back to postcode input to allow searching for a different postcode", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345", { force: true });
    cy.get("#findaddress").click({ force: true });

    cy.get("input[name=postcode]").should("not.be.visible");

    cy.get("[data-testid=change-postcode]").click({ force: true });

    cy.get("input[name=postcode]").should("be.visible");
  });

  it("should display error if no postcode has been entered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddressPostcodeEmptyError,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#findaddress").click({ force: true });

    cy.findByRole("link", { name: "Enter a postcode" });
  });

  it("should display error if the entered postcode is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddressPostcodeInvalidError,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#findaddress").click({ force: true });

    cy.findByRole("link", {
      name: "Postcode must be between 5 and 8 characters, and contain only letters, numbers, spaces, hyphens and commas",
    });
  });

  it("should go back to add-exporter-details if cancelling postcode search", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=cancel]").click({ force: true });

    cy.url().should("include", "/add-exporter-details");
  });
});
