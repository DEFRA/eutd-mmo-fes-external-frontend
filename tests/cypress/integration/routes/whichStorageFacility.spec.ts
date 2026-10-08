import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-SD-3FE1169D1";
const pageUrl = `/create-non-manipulation-document/${documentNumber}/which-storage-facility`;
const approvalUrl = `/create-non-manipulation-document/${documentNumber}/add-storage-facility-approval`;
const manualAddressUrl = `/create-non-manipulation-document/${documentNumber}/what-storage-facility-address`;

const visitPage = (testCaseId: TestCaseId, disableScripts = false) => {
  const testParams: ITestParams = {
    testCaseId,
    ...(disableScripts ? { disableScripts: true } : {}),
  };

  cy.visit(pageUrl, { qs: { ...testParams } });
};

const getStorageFacilitySearchInput = () => {
  cy.get("label[for='storageFacility']", { timeout: 20000 }).should("exist");
  // Pre-hydration this id belongs to a native <select> (progressive enhancement) which gets
  // swapped out for the real text input once React hydrates - scope to "input" so Cypress keeps
  // retrying until the swap has happened, rather than grabbing the soon-to-be-detached select.
  return cy.get("input#storageFacility", { timeout: 20000 }).should("be.visible");
};

const selectAutocompleteOptionContaining = (text: string) => {
  cy.contains(".autocomplete__option", text, { timeout: 20000 }).click();
};

type StorageFacilitySearchResult = {
  label: string;
  tradingName: string;
  approvalNumber: string;
  addressLine: string;
  cityName: string;
  postcode: string;
};

describe("SD: which storage facility", () => {
  it("should render heading, hint and both action buttons", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);

    cy.get("h1").should("contain", "Which storage facility do you want to use?");
    getStorageFacilitySearchInput();
    cy.get("label[for='storageFacility']").should("contain", "Enter your storage facility");
    cy.contains("Start typing a company name or approval number to search for a facility.").should("be.visible");
    cy.get('[data-testid="save-and-continue"]').should("be.visible");
    cy.get('[data-testid="manual-entry-button"]').should("be.visible");
  });

  it("should show selected storage facility summary immediately for a registry match", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityWithSavedSelection);

    cy.get("input.autocomplete__input").should("not.exist");
    cy.contains("p", "Test Cold Store").should("be.visible");
    cy.contains("p", "Approval number: UK/5555/CS").should("be.visible");
    cy.contains("p", "Hull, HU1 2AB").should("be.visible");
    cy.get('[data-testid="change-storage-facility"]').should("be.visible");
  });

  it("should allow changing from summary back to search for a saved selection", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityWithSavedSelection);

    cy.get('[data-testid="change-storage-facility"]').click();
    getStorageFacilitySearchInput();
    cy.contains("p", "Approval number: UK/5555/CS").should("not.exist");
  });

  it("should fall back to the address as the bold heading for a manual entry saved before a name was captured", () => {
    visitPage(TestCaseId.SDWhichStorageFacilitySavedManualEntry);

    cy.contains("p", "12 Manual Street").should("be.visible");
    cy.contains("p", "Manualville, MN1 1AA").should("be.visible");
  });

  it("should live search and continue to add-storage-facility-approval when a match is selected", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);

    getStorageFacilitySearchInput().clear();
    getStorageFacilitySearchInput().type("test");

    cy.request("/get-storage-facilities?search=test").then((response) => {
      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.equal(true);
      expect(response.body.length).to.be.greaterThan(0);

      const selectedOption = response.body[0] as StorageFacilitySearchResult;

      selectAutocompleteOptionContaining(selectedOption.tradingName);
      cy.get('[data-testid="save-and-continue"]').click();

      cy.url().should("include", approvalUrl);
    });
  });

  it("should show a blocking error when no value is entered and continue is clicked", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityEmptyContinue);

    cy.get('[data-testid="save-and-continue"]').click();

    cy.get(".govuk-error-summary").should(
      "contain",
      "You must select a storage facility or enter the facility details manually"
    );
    cy.url().should("include", pageUrl);
    cy.url().should("not.include", approvalUrl);
  });

  it("should redirect to the manual address page when the manual entry button is clicked", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityManualEntry);

    cy.get('[data-testid="manual-entry-button"]').click();

    cy.url().should("include", manualAddressUrl);
  });

  it("should work without JavaScript using the preloaded select list", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue, true);

    cy.get("select#storageFacility").should("be.visible");
    cy.get("select#storageFacility").select("Test Cold Store (UK/5555/CS) - Hull, HU1 2AB");
    cy.get('[data-testid="save-and-continue"]').click();

    cy.url().should("include", approvalUrl);
  });
});

describe("SD: which storage facility - back link based on arrival transport mode", () => {
  it("should show back link to truck arrival page when truck transport is used", () => {
    visitPage(TestCaseId.SDAddStorageFacilityAddressWithTruckTransport);

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/add-arrival-transportation-details-truck`
      );
  });

  it("should show back link to train arrival page when train transport is used", () => {
    visitPage(TestCaseId.SDAddStorageFacilityAddressWithTrainTransport);

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/add-arrival-transportation-details-train`
      );
  });

  it("should show back link to plane arrival page when plane transport is used", () => {
    visitPage(TestCaseId.SDAddStorageFacilityAddressWithPlaneTransport);

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/add-arrival-transportation-details-plane`
      );
  });

  it("should show back link to container vessel arrival page when container vessel transport is used", () => {
    visitPage(TestCaseId.SDAddStorageFacilityAddressWithContainerVesselTransport);

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/add-arrival-transportation-details-container-vessel`
      );
  });

  it("should show back link to how-does-the-consignment-arrive-to-the-uk when no arrival transport is set", () => {
    visitPage(TestCaseId.SDAddStorageFacilityAddressNoArrival);

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/how-does-the-consignment-arrive-to-the-uk`
      );
  });
});

describe("SD: which storage facility - forbidden", () => {
  it("should redirect to forbidden page", () => {
    visitPage(TestCaseId.SDAddStorageFacilityAddressForbidden);
    cy.url().should("include", "/forbidden");
  });
});
