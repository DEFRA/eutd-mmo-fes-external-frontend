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
    cy.wrap(true).should("be.true");
    cy.get(".govuk-heading-xl").should("be.visible").and("contain.text", "What is the exporter’s address");
  });

  it("should render the buttons texts", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-button-group button").contains("Cancel");
    cy.get('[data-testid="findaddress"]').should("be.visible").contains("Find address");
  });

  it("should render the input label and hint text", () => {
    cy.wrap(true).should("be.true");
    cy.get("div .govuk-hint")
      .contains(
        "If you cannot find the address or you need to add a non-UK address, click the link 'Enter the address manually'"
      )
      .should("be.visible");
  });
});

describe("CC: Entering the address manually", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };
    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();
  });

  it("should render header", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-heading-xl").should("be.visible").and("contain.text", "What is the exporter’s address");
  });

  it("should render all input fields", () => {
    cy.wrap(true).should("be.true");
    cy.contains("label", "Sub-building name").should("be.visible");
    cy.contains("label", "Building number").should("be.visible");
    cy.contains("label", "Building name").should("be.visible");
    cy.contains("label", "Street name").should("be.visible");
    cy.contains("label", "Town or city").should("be.visible");
    cy.contains("label", "County/state/province (optional)").should("be.visible");
    cy.contains("label", "Postcode").should("be.visible");
    cy.contains("label", "Country").should("be.visible");
  });

  it("should render form button", () => {
    cy.wrap(true).should("be.true");
    cy.contains("[data-testid='continue']", "Continue").should("be.visible");
    cy.contains("[data-testid='cancel']", "Cancel").should("be.visible");
  });
});

describe("CC: Entering the address manually with errors", () => {
  it("should display errors on empty form submitted", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithErrorsArray,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
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

    cy.visit(ccPageUrl, { qs: { ...testParams } });
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

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    cy.get("[data-testid=continue]").click();

    cy.url().should("include", "what-exporters-address");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains("Enter the town or city");
    cy.get(".govuk-error-summary").contains("Select a country from the list");
    cy.get(".govuk-error-summary").contains("Enter a postcode");

    // FI0-11206: verify summary messages follow visual field order.
    cy.get(".govuk-error-summary__list li").eq(0).should("contain.text", "Enter the town or city");
    cy.get(".govuk-error-summary__list li").eq(1).should("contain.text", "Enter a postcode");
    cy.get(".govuk-error-summary__list li").eq(2).should("contain.text", "Select a country from the list");
  });

  it("should display error when all address fields are blank", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithAddressFirstPartError,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    // Leave all address fields blank but fill in required fields
    cy.get("#townCity").type("Test City");
    cy.get("#postcode").type("12345");
    cy.get("#country").type("Albania");
    cy.get("[id^='country-option']").contains("Albania").click();
    cy.get("#country").should("have.value", "Albania");

    cy.get("[data-testid=continue]").click();

    // Should display the address first part error
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains("Enter Building number");
    cy.get(".govuk-error-summary").contains("Enter Building name");
    cy.get(".govuk-error-summary").contains("Enter Sub-building name");
    cy.get(".govuk-error-summary").contains("Enter Street name");
  });

  it("should not display error when sub-building name is populated", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    // Only populate sub-building name (other address fields blank)
    cy.get("#subBuildingName").type("Flat 1");
    cy.get("#townCity").type("Test City");
    cy.get("#postcode").type("12345");
    cy.get("#country").type("Albania");

    cy.get("[data-testid=continue]").click();

    // Should not display address first part error
    cy.get(".govuk-error-summary").should("not.exist");
    cy.url().should("include", "/add-exporter-details");
  });

  it("should not display error when building number is populated", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    // Only populate building number (other address fields blank)
    cy.get("#buildingNumber").type("123");
    cy.get("#townCity").type("Test City");
    cy.get("#postcode").type("12345");
    cy.get("#country").type("Albania");

    cy.get("[data-testid=continue]").click();

    // Should not display address first part error
    cy.get(".govuk-error-summary").should("not.exist");
    cy.url().should("include", "/add-exporter-details");
  });

  it("should not display error when building name is populated", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    // Only populate building name (other address fields blank)
    cy.get("#buildingName").type("Test Villa");
    cy.get("#townCity").type("Test City");
    cy.get("#postcode").type("12345");
    cy.get("#country").type("Albania");

    cy.get("[data-testid=continue]").click();

    // Should not display address first part error
    cy.get(".govuk-error-summary").should("not.exist");
    cy.url().should("include", "/add-exporter-details");
  });

  it("should not display error when street name is populated", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    // Only populate street name (other address fields blank)
    cy.get("#streetName").type("Main Street");
    cy.get("#townCity").type("Test City");
    cy.get("#postcode").type("12345");
    cy.get("#country").type("Albania");

    cy.get("[data-testid=continue]").click();

    // Should not display address first part error
    cy.get(".govuk-error-summary").should("not.exist");
    cy.url().should("include", "/add-exporter-details");
  });

  it("should not display errors on validation passed", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressValid,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
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

    cy.visit(ccPageUrl, { qs: { ...testParams } });
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

  // Defect 445: All validation errors should appear simultaneously with field-level error styling
  // FI0-11275: Empty form submission should show ALL errors including addressFirstPart
  it("should display ALL validation errors simultaneously on empty form submission with field-level error indicators", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithAllErrorsArray,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    // Submit the form without filling any fields
    cy.get("[data-testid=continue]").click();

    // Should stay on the same page
    cy.url().should("include", "what-exporters-address");

    // Error summary should be visible at the top
    cy.get(".govuk-error-summary").should("be.visible");

    // All required field errors should appear in the error summary simultaneously
    cy.get(".govuk-error-summary").should("contain.text", "Enter the town or city");
    cy.get(".govuk-error-summary").should("contain.text", "Enter a postcode");
    cy.get(".govuk-error-summary").should("contain.text", "Select a country from the list");
    cy.get(".govuk-error-summary").should(
      "contain.text",
      "Enter a sub-building name, building number, a building name or street name"
    );

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

  // FI0-11275: Entering an invalid character in country field should show a country error
  it("should display country error when an invalid character is entered in the country field", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterManualAddressWithInvalidCountry,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click();

    cy.get("#buildingNumber").type("12");
    cy.get("#townCity").type("Newcastle");
    cy.get("#postcode").type("NE4 7YH");
    cy.get("#country").type("@");

    cy.get("[data-testid=continue]").click();

    // Should stay on the same page
    cy.url().should("include", "what-exporters-address");

    // Error summary should be visible at the top
    cy.get(".govuk-error-summary").should("be.visible");

    // Country error should appear in the error summary
    cy.get(".govuk-error-summary").should("contain.text", "Select a country from the list");

    // Country field should have inline error
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
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

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

    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345");
    cy.get("#findaddress").click();
    cy.get("#getaddress").click();

    cy.contains("span", "Select an address to continue").should("be.visible");
  });

  it("should go back to postcode input to allow searching for a different postcode", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

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

    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#findaddress").click();

    cy.findByRole("link", { name: "Enter a postcode" }).should("be.visible");
  });

  it("should display error if the entered postcode is invalid", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddressPostcodeInvalidError,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("#findaddress").click();

    cy.findByRole("link", {
      name: "Postcode must be between 5 and 8 characters, and contain only letters, numbers, spaces, hyphens and commas",
    }).should("be.visible");
  });

  it("should go back to add-exporter-details if cancelling postcode search", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCExporterSelectAddress,
    };

    cy.visit(ccPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=cancel]").click();

    cy.url().should("include", "/add-exporter-details");
  });
});
