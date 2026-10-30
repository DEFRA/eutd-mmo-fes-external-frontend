import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-SD-3FE1169D1";
const pageUrl = `/create-non-manipulation-document/${documentNumber}/add-storage-facility`;
const approvalUrl = `/create-non-manipulation-document/${documentNumber}/add-storage-facility-details`;
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
  it("maps the explicit registry locality when cityName is empty", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);
    getStorageFacilitySearchInput().type("AA 220");
    selectAutocompleteOptionContaining("DFDS Logistics Scotland Aberdeen");
    cy.get('input[name="facilityTownCity"]').should("have.value", "Aberdeen");
    cy.get('[data-testid="selected-facility"]').should("contain.text", "Aberdeen");
  });
  it("selects the exact clicked facility when its name contains an ampersand", () => {
    const facility = {
      label: "Alex Spink & Sons Ltd (AB 015) - DD11 1BJ",
      tradingName: "Alex Spink & Sons Ltd",
      approvalNumber: "AB 015",
      addressLine: "1 Harbour Road",
      cityName: "Arbroath",
      postcode: "DD11 1BJ",
    };
    cy.intercept("GET", "**/get-storage-facilities?*", [facility]).as("facilitySearch");
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);
    getStorageFacilitySearchInput().type("Alex");
    cy.wait("@facilitySearch");
    selectAutocompleteOptionContaining(facility.tradingName);
    cy.get('[data-testid="selected-facility"]').should("contain.text", facility.tradingName);
    cy.get('input[name="facilityApprovalNumber"]').should("have.value", facility.approvalNumber);
  });

  it("ignores earlier search responses that arrive after the latest query", () => {
    cy.intercept("GET", "**/get-storage-facilities?*", (request) => {
      const query = new URL(request.url).searchParams.get("search") ?? "";
      request.alias = query === "1003" ? "latestFacilitySearch" : "olderFacilitySearch";
      request.reply({
        delay: query === "1003" ? 0 : 800,
        body: [
          {
            label: `Facility ${query} (UK/${query}/CS) - HU1 2AB`,
            tradingName: `Facility ${query}`,
            approvalNumber: `UK/${query}/CS`,
            addressLine: "1 Dock Road",
            cityName: "Hull",
            postcode: "HU1 2AB",
          },
        ],
      });
    });
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);
    getStorageFacilitySearchInput().type("10");
    cy.wait("@olderFacilitySearch");
    getStorageFacilitySearchInput().type("03");
    cy.wait("@latestFacilitySearch");
    cy.wait("@olderFacilitySearch");
    cy.get(".autocomplete__option").should("have.length", 1).and("contain.text", "Facility 1003");
  });

  it("deduplicates MDM ids and formats the result label", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);

    cy.request("/get-storage-facilities?search=MDM%20Duplicate").then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.map((establishment: { label: string }) => establishment.label)).to.deep.equal([
        "MDM Duplicate Storage A (UK/7777/CS) - HU2 3CD",
      ]);
    });
  });

  it("should render heading, hint and both action buttons", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);

    cy.get("h1").should("contain", "Which storage facility do you want to use?");
    getStorageFacilitySearchInput();
    cy.get("label[for='storageFacility']").should("contain", "Enter your storage facility");
    cy.contains("Start typing a company name or approval number to search for a facility.").should("be.visible");
    cy.get('[data-testid="save-and-continue"]').should("be.visible");
    cy.get('[data-testid="manual-entry-button"]').should("be.visible");
  });

  it("should show the hydrated autocomplete without the fallback select flash", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);

    cy.get("html").should("have.attr", "data-js", "enabled");
    getStorageFacilitySearchInput();
    cy.get(".app-storage-facility-nonjs-only").should("not.exist");
    cy.get(".app-storage-facility-placeholder").should("not.exist");
  });

  it("should show selected storage facility summary immediately for a registry match", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityWithSavedSelection);

    cy.get("input.autocomplete__input").should("not.exist");
    cy.contains("p", "Test Cold Store").should("be.visible");
    cy.contains("p", "Approval number: UK/5555/CS").should("be.visible");
    cy.contains("p", "1 Dock Road, Altens, Aberdeen").should("be.visible");
    cy.contains("p", "Hull").should("be.visible");
    cy.contains("p", "HU1 2AB").should("be.visible");
    cy.get('[data-testid="selected-facility"]').should("not.contain.text", "United Kingdom");
    cy.get('[data-testid="change-storage-facility"]').should("be.visible").and("have.css", "color", "rgb(0, 48, 120)");
  });

  it("should allow changing from summary back to search for a saved selection", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityWithSavedSelection);

    cy.get('[data-testid="change-storage-facility"]').click();
    getStorageFacilitySearchInput().should("have.value", "");
    cy.get('input[name="facilityName"]').should("not.exist");
    cy.contains("p", "Approval number: UK/5555/CS").should("not.exist");
  });

  it("should replace the saved value and select a different facility after clicking Change", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityWithSavedSelection);

    cy.get('[data-testid="change-storage-facility"]').click();
    getStorageFacilitySearchInput().type("Gourdie Farm Associates");
    cy.get('input[name="facilityName"]').should("not.exist");
    selectAutocompleteOptionContaining("Gourdie Farm Associates");

    cy.get('[data-testid="selected-facility"]').should("contain.text", "Gourdie Farm Associates");
    cy.get("[data-testid='selected-facility']").should("contain.text", "DB 022");
    cy.get('input[name="facilityName"]').should("have.value", "Gourdie Farm Associates");
    cy.get('input[name="facilityAddressOne"]').should("have.value", "Gourdie Farm");
    cy.get('input[name="facilityTownCity"]').should("have.value", "Dundee");
    cy.get('input[name="facilityPostcode"]').should("have.value", "DD2 1XD");

    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", approvalUrl);
  });

  it("should fall back to the address as the bold heading for a manual entry saved before a name was captured", () => {
    visitPage(TestCaseId.SDWhichStorageFacilitySavedManualEntry);

    cy.contains("p", "12 Manual Street").should("be.visible");
    cy.contains("p", "Manualville").should("be.visible");
    cy.contains("p", "MN1 1AA").should("be.visible");
    cy.get('[data-testid="selected-facility"]').should("not.contain.text", "United Kingdom");
  });

  it("rejects a cleared selection after Change instead of keeping the saved address", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityWithSavedSelection);
    cy.get('[data-testid="change-storage-facility"]').click();
    getStorageFacilitySearchInput().clear();
    cy.get('input[name="facilityName"]').should("not.exist");
    cy.get('[data-testid="save-and-continue"]').click();
    cy.get(".govuk-error-summary").should(
      "contain.text",
      "You must select a storage facility or enter the facility details manually"
    );
    getStorageFacilitySearchInput().should("have.value", "");
    cy.location("pathname").should("eq", pageUrl);
  });

  it("allows saving a newly selected facility after Change", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityWithSavedSelection);
    cy.get('[data-testid="change-storage-facility"]').click();
    getStorageFacilitySearchInput().should("have.value", "").type("Test Cold Store");
    selectAutocompleteOptionContaining("Test Cold Store");
    cy.get('input[name="facilityName"]').should("have.value", "Test Cold Store");
    cy.get('[data-testid="save-and-continue"]').click();
    cy.location("pathname").should("eq", approvalUrl);
  });

  it("should show and hide the no-results message as the search term changes", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);

    getStorageFacilitySearchInput().clear();
    getStorageFacilitySearchInput().type("Unknown Storage Facility");

    cy.get('[data-testid="no-storage-facility-results"]').should("be.visible");
    cy.get('[data-testid="no-storage-facility-results"] strong').should("have.text", "No results found");
    cy.get('[data-testid="no-storage-facility-results"]').should(
      "contain.text",
      "Check the company name or registration number and try again."
    );

    getStorageFacilitySearchInput().clear();
    getStorageFacilitySearchInput().type("U");
    cy.get('[data-testid="no-storage-facility-results"]').should("not.exist");
  });

  it("should live search and continue to add-storage-facility-details when a match is selected", () => {
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

  it("should continue to details when a selected address has no town or city", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue);

    getStorageFacilitySearchInput().type("Storage Without Town");
    selectAutocompleteOptionContaining("Storage Without Town");
    cy.get('[data-testid="save-and-continue"]').click();

    cy.url().should("include", approvalUrl);
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

    cy.get(".app-storage-facility-nonjs-only label[for='storageFacility']")
      .should("be.visible")
      .and("contain.text", "Enter your storage facility");
    cy.get(".app-storage-facility-nonjs-only .govuk-hint")
      .should("be.visible")
      .and("contain.text", "Start typing a company name or approval number to search for a facility.");
    cy.get("select.app-storage-facility-non-js-select").should("be.visible");
    cy.get("select.app-storage-facility-non-js-select").select("Test Cold Store (UK/5555/CS) - HU1 2AB");
    cy.get('[data-testid="save-and-continue"]').click();

    cy.url().should("include", approvalUrl);
  });

  it("should show the empty placeholder and selection error in the no-JavaScript journey", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityEmptyContinue, true);

    const facilitySelect = "select.app-storage-facility-non-js-select";
    cy.get(facilitySelect).should("have.value", "");
    cy.get(`${facilitySelect} option[value='']`).should("have.text", "Select your storage facility");
    cy.get('[data-testid="save-and-continue"]').click();

    cy.get(".govuk-error-summary")
      .should("be.visible")
      .and("contain.text", "You must select a storage facility or enter the facility details manually");
    cy.get(facilitySelect).should("have.value", "");
  });

  it("should preload the saved facility in the full no-JavaScript option list", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityWithSavedSelection, true);

    cy.get('[data-testid="saved-facility-no-js"]').should("not.exist");
    cy.get("select.app-storage-facility-non-js-select").should("have.value", "Test Cold Store (UK/5555/CS) - HU1 2AB");
    cy.get("select.app-storage-facility-non-js-select option").should(
      "contain.text",
      "Gourdie Farm Associates (DB 022) - DD2 1XD"
    );
  });

  it("should keep an emptied saved facility selection blank after a no-JavaScript validation error", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityWithSavedSelection, true);

    const facilitySelect = "select.app-storage-facility-non-js-select";
    cy.get(facilitySelect).should("have.value", "Test Cold Store (UK/5555/CS) - HU1 2AB");
    cy.get(facilitySelect).select("");
    cy.get('[data-testid="save-and-continue"]').click();

    cy.get(".govuk-error-summary").should(
      "contain",
      "You must select a storage facility or enter the facility details manually"
    );
    cy.get(facilitySelect).should("have.value", "");
  });

  it("should continue without JavaScript when the selected address has no town or city", () => {
    visitPage(TestCaseId.SDWhichStorageFacilityContinue, true);

    cy.get("select.app-storage-facility-non-js-select").select("Storage Without Town (UK/9999/CS) - HU3 4AB");
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
