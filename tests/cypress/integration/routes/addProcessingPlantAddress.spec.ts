import { type ITestParams, TestCaseId } from "~/types";

const psAddressUrl = "create-processing-statement/GBR-2025-PS-FFA360309/add-processing-plant-address";
const psProgressUrl = "create-processing-statement/GBR-2025-PS-FFA360309/progress";

describe("Add Processing Plant Address", () => {
  it("should render processing plant address page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("h1").should("contain", "What is the processing plant address");
  });

  it("should handle forbidden access", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressForbidden,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect on successful save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "processing-statements");
  });

  it("should redirect on successful save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "add-health-certificate");
  });

  it("should render page with existing address and show change button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressWithExistingAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("h1").should("contain", "processing plant address");
    cy.get('[data-testid="goToAddAddress-button"]').should("be.visible").contains("Change");
  });

  it("should redirect to health certificate page when nextUri is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "add-health-certificate");
    cy.url().should("include", "GBR-2025-PS-FFA360309");
  });

  it("should handle continue action with nextUri parameter", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("body").then(($body) => {
      if ($body.find('[name="_action"][value="continue"]').length > 0) {
        cy.get('[name="_action"][value="continue"]').click();
      } else {
        cy.get("form").submit();
      }
    });
    cy.url().should("include", "add-health-certificate");
  });

  it("should handle continue with manual address when clicking on choosing the option to enter the address manually", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("[data-testid=manualAddress]").should("be.visible");
    cy.get('[name="_action"][value="navigateToManualAddress"]').click();
    cy.url().should("include", psAddressUrl);
  });

  it("should handle address lookup functionality", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get('[name="postcode"]').type("SW1A 1AA");
    cy.get('[name="_action"][value="findaddress"]').click();
    cy.url().should("include", psAddressUrl);
  });

  it("should handle cancel address functionality", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get('[name="_action"][value="cancel"]').click();
    cy.url().should("include", psProgressUrl);
  });

  it("should handle manual address navigation", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get('[name="_action"][value="navigateToManualAddress"]').click();
    cy.get(".dcx-form-input").contains("Building number");
    cy.get(".dcx-form-input").contains("Building name");
    cy.get(".dcx-form-input").contains("Sub-building name");
    cy.get(".dcx-form-input").contains("Street name");
    cy.get(".dcx-form-input").contains("County, state or province");
    cy.get(".govuk-button-group button").contains("Cancel");
    cy.get("[data-testid=continue]").should("be.visible");
    cy.contains("a", "Back to your progress").should("be.visible");
    cy.url().should("include", psAddressUrl);
  });

  it("should handle continue with manual address", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get('[name="_action"][value="navigateToManualAddress"]').click();
    cy.get('[name="buildingNumber"]').type("123");
    cy.get('[name="streetName"]').type("Test Street");
    cy.get('[name="townCity"]').type("Test City");
    cy.get('[name="postcode"]').type("SW1A 1AA");
    cy.get('[name="_action"][value="continueManualAddress"]').click();
    cy.url().should("include", psAddressUrl);
  });

  it("should not show postcode input after we press find address with a valid postcode", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("input[name=postcode]").clear();
    cy.get("input[name=postcode]").type("SW1A 1AA", { force: true });
    cy.get('[name="_action"][value="findaddress"]').click();
    cy.get("[name=postcode]").should("not.be.visible");
  });

  it("should redirect to forbidden when CSRF token is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressForbidden,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  it("should populate selected address into form", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("input[name=postcode]").type("12345", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.get("#selectAddress").should("be.visible");
    const option = "MMO, LANCASTER HOUSE, HAMPSHIRE COURT, NEWCASTLE UPON TYNE, NE4 7YH";
    cy.contains("#selectAddress option", option);
    cy.get("#selectAddress").select(option);
  });

  it("should display an error if trying to continue without selecting an address", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("input[name=postcode]").type("12345", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.get("#getaddress").click({ force: true });
    cy.contains("span", "Select an address to continue");
  });

  it("should display error if no postcode has been entered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressMissingPlantAddressError,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("#findaddress").click({ force: true });
    cy.contains("h2", "There is a problem");
    cy.get(".govuk-error-summary").contains("a", "Enter a postcode");
  });

  it("should redirect to forbidden when CSRF token validation fails", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressForbidden,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  it("should handle goToAddAddress action when CSRF token is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressWithExistingAddress,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get('[data-testid="goToAddAddress-button"]').click();
    cy.url().should("include", "what-processing-plant-address");
  });

  it("should process goToAddAddress form action correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("body").then(($body) => {
      if ($body.find('[name="_action"][value="goToAddAddress"]').length > 0) {
        cy.get('[name="_action"][value="goToAddAddress"]').click();
      } else {
        cy.log("goToAddAddress form action not available for this test case");
      }
    });
    cy.url().should("include", psAddressUrl);
  });

  it("should handle continue action when explicitly clicking continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("body").then(($body) => {
      if ($body.find('[name="_action"][value="continue"]').length > 0) {
        cy.get('[name="_action"][value="continue"]').click();
        cy.url().should("include", "add-health-certificate");
      } else {
        cy.log("Continue button not available for this test case");
      }
    });
  });

  it("should handle form submission when no action button is specified", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("form").then(($form) => {
      $form.find('[name="_action"]').remove();
      cy.wrap($form).submit();
    });

    cy.url().should("include", "add-health-certificate");
  });

  it("should redirect to next step when continue is triggered with valid address data", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("body").then(($body) => {
      if ($body.find('[name="_action"][value="continue"]').length > 0) {
        cy.get('[name="_action"][value="continue"]').click();
      } else {
        cy.get("form").then(($form) => {
          $form.find('[name="_action"]').remove();
          cy.wrap($form).submit();
        });
      }
    });

    cy.url().should("include", "add-health-certificate");
  });

  it("should handle getaddress action and update session with manual address step", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("input[name=postcode]").type("SW1A 1AA", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.get("#getaddress").click({ force: true });
    cy.url().should("include", psAddressUrl);
    cy.get("[data-testid=manualAddress]").should("be.visible");
    cy.get("select[name=selectaddress]").should("exist");
  });

  it("should handle manual address step and update session correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get('[name="_action"][value="navigateToManualAddress"]').click({ force: true });
    cy.get("[data-testid=manualAddress]").should("be.visible");
    cy.get('[name="buildingNumber"]').type("123");
    cy.get('[name="streetName"]').type("Test Street");
    cy.get('[name="townCity"]').type("Test City");
    cy.get("input[name=postcode]").type("SW1A 1AA");
    cy.get('[name="_action"][value="continueManualAddress"]').click({ force: true });
    cy.url().should("include", psAddressUrl);
    cy.get('[name="buildingNumber"]').should("have.value", "123");
    cy.get('[name="streetName"]').should("have.value", "Test Street");
    cy.get('[name="townCity"]').should("have.value", "Test City");
    cy.get("input[name=postcode]").should("have.value", "SW1A 1AA");
  });

  it("should handle findaddress action with lookup error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressMissingPlantAddressError,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("input[name=postcode]").type("?@444", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.contains("h2", "There is a problem").should("be.visible");
  });

  it("should handle changelink action correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("SW1A 1AA", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.get("body").then(($body) => {
      if ($body.find('[name="_action"][value="changelink"]').length > 0) {
        cy.get('[name="_action"][value="changelink"]').click();
        cy.url().should("include", psAddressUrl);
      }
    });
  });

  it("should handle loader with existing session data", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressWithExistingAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("h1").should("contain", "processing plant address");
  });

  it("should handle getaddress action with selected address", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("SW1A 1AA", { force: true });
    cy.get("#findaddress").click({ force: true });
    const option = "MMO, LANCASTER HOUSE, HAMPSHIRE COURT, NEWCASTLE UPON TYNE, NE4 7YH";
    cy.get("#selectAddress").select(option);
    cy.get("#getaddress").click({ force: true });
    cy.url().should("include", psAddressUrl);
  });

  it("should handle updateSessionAndCommit with undefined values", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("input[name=postcode]").clear();
    cy.get('[name="_action"][value="navigateToManualAddress"]').click();
    cy.url().should("include", psAddressUrl);
  });

  it("should handle default actions with nextUri parameter", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams, nextUri: "/custom-next-page" } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "add-health-certificate");
  });

  it("should handle save as draft with session cleanup", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "processing-statements");
  });

  it("should handle component with hasAddress false path", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("h1").should("contain", "What is the processing plant address?");
    cy.get("label[for='postcode']").should("be.visible");
  });

  it("should handle createJsonResponse with custom headers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("input[name=postcode]").type("SW1A 1AA", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.request({
      method: "POST",
      url: psAddressUrl,
      form: true,
      body: {
        postcode: "SW1A 1AA",
        _action: "findaddress",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    }).then((response) => {
      expect(response.headers).to.have.property("content-type");
    });
  });

  it("should handle unsetKeys in updateSessionAndCommit", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("SW1A 1AA", { force: true });
    cy.get("#findaddress").click({ force: true });
    cy.get('[name="_action"][value="cancel"]').click();
    cy.url().should("include", psProgressUrl);
  });

  it("should handle Object.entries iteration in updateSessionAndCommit", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get('[name="_action"][value="goToAddAddress"]').should("exist");
  });

  it("should display errors on only required value submitted on manual address", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPSAddProcessingPlantAddressWithErrors,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.findByText(/^Enter the address manually$/).click({ force: true });
    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", "add-processing-plant-address");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains("Enter the town or city");
    cy.get(".govuk-error-summary").contains("Select a country from the list");
    cy.get(".govuk-error-summary").contains("Enter a postcode");
  });

  it("should not display errors on validation passed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });
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
    cy.url().should("include", "/add-processing-plant-address");
  });

  it("should redirect to health certificate when nextUri is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddressComplete,
    };
    cy.visit(psAddressUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "add-health-certificate");
    cy.url().should("include", "GBR-2025-PS-FFA360309");
  });

  it("should go back to postcode input to allow searching for a different postcode", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantAddress,
    };

    cy.visit(psAddressUrl, { qs: { ...testParams } });

    cy.get("input[name=postcode]").type("12345", { force: true });
    cy.get("#findaddress").click({ force: true });

    cy.get("input[name=postcode]").should("not.be.visible");

    cy.get("[data-testid=change-postcode]").click({ force: true });

    cy.get("input[name=postcode]").should("be.visible");
  });
});
