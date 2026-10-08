import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-0D12ABA0A";
const pageUrl = `/create-processing-statement/${documentNumber}/add-processing-plant`;
const detailsUrl = `/create-processing-statement/${documentNumber}/add-processing-plant-details`;
const manualAddressUrl = `/create-processing-statement/${documentNumber}/add-processing-plant-address`;
const dashboardUrl = "/create-processing-statement/processing-statements";
const unknownPlantLabel = "Unknown Plant (UK/9999/EC)";

const visitPage = (testCaseId: TestCaseId, disableScripts = false) => {
  const testParams: ITestParams = {
    testCaseId,
    ...(disableScripts ? { disableScripts: true } : {}),
  };

  cy.visit(pageUrl, { qs: { ...testParams } });
};

const getProcessingPlantSearchInput = () => {
  cy.get("label[for='processingPlant']", { timeout: 20000 }).should("exist");
  return cy.get("#processingPlant", { timeout: 20000 }).should("be.visible");
};

const selectAutocompleteOptionContaining = (text: string) => {
  cy.contains(".autocomplete__option", text, { timeout: 20000 }).click();
};

const setProcessingPlantText = (value: string) => {
  getProcessingPlantSearchInput().then(($input) => {
    $input.val(value);
    $input.trigger("input");
    $input.trigger("change");
  });
};

type ProcessingPlantSearchResult = {
  label: string;
  tradingName: string;
  approvalNumber: string;
  addressLine: string;
  cityName: string;
  postcode: string;
};

describe("PS: add processing plant", () => {
  it("should render heading, hint and both action buttons", () => {
    visitPage(TestCaseId.PSAddProcessingPlantContinue);

    cy.get("h1").should("contain", "Which processing plant do you want to use?");
    getProcessingPlantSearchInput();
    cy.get("label[for='processingPlant']").should("contain", "Enter your processing plant");
    cy.contains("Start typing a company name or approval number to search for a facility.").should("be.visible");
    cy.get('[data-testid="save-and-continue"]').should("be.visible");
    cy.get('[data-testid="manual-entry-button"]').should("be.visible");
  });

  it("should show selected processing plant summary immediately for saved selection on page load", () => {
    visitPage(TestCaseId.PSAddProcessingPlantWithSavedSelection);

    cy.get("input.autocomplete__input").should("not.exist");
    cy.contains("p", "Test Fish Plant").should("be.visible");
    cy.contains("p", "Approval number: UK/1234/EC").should("be.visible");
    cy.contains("p", "Hull").should("be.visible");
    cy.contains("p", "HU1 2AB").should("be.visible");
    cy.get('[data-testid="change-processing-plant"]').should("be.visible");
  });

  it("should allow changing from summary back to search for a saved selection", () => {
    visitPage(TestCaseId.PSAddProcessingPlantWithSavedSelection);

    cy.get('[data-testid="change-processing-plant"]').click();
    getProcessingPlantSearchInput();
    cy.contains("p", "Approval number: UK/1234/EC").should("not.exist");
  });

  it("should show the manual address override instead of the matched establishment's reference address", () => {
    visitPage(TestCaseId.PSAddProcessingPlantWithSavedSelectionManualAddress);

    cy.get("input.autocomplete__input").should("not.exist");
    cy.contains("p", "Test Fish Plant").should("be.visible");
    cy.contains("p", "Approval number: UK/1234/EC").should("be.visible");
    cy.contains("p", "Test Address One").should("be.visible");
    cy.contains("p", "My Test City").should("be.visible");
    cy.contains("p", "My Post Code").should("be.visible");
    cy.contains("p", "Hull").should("not.exist");
    cy.contains("p", "HU1 2AB").should("not.exist");
  });

  it("should live search and continue to add-processing-plant-details when a match is selected", () => {
    visitPage(TestCaseId.PSAddProcessingPlantContinue);

    getProcessingPlantSearchInput().clear();
    getProcessingPlantSearchInput().type("te");

    cy.request("/get-processing-plants?search=test").then((response) => {
      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.equal(true);
      expect(response.body.length).to.be.greaterThan(0);
      expect(
        response.body.some((result: ProcessingPlantSearchResult) =>
          result.label.includes("Test Fish Plant (UK/1234/EC)")
        )
      ).to.equal(true);

      const selectedOption = response.body[0] as ProcessingPlantSearchResult;

      getProcessingPlantSearchInput().clear();
      getProcessingPlantSearchInput().type(selectedOption.tradingName);
      selectAutocompleteOptionContaining(selectedOption.tradingName);
      cy.get('[data-testid="save-and-continue"]').click();

      cy.contains("You must select a processing plant or enter the plant details manually").should("not.exist");
      cy.url().should("include", detailsUrl);
      cy.get("input[name='plantApprovalNumber']").should("be.visible").invoke("val").should("not.equal", "");
    });

    cy.request("/get-processing-plants?search=1111").then((response) => {
      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.equal(true);
      expect(
        response.body.some(
          (result: ProcessingPlantSearchResult) => result.label === "Ocean Prime Processing Ltd (UK/1111/EC)"
        )
      ).to.equal(true);
      expect(response.body.some((result: ProcessingPlantSearchResult) => result.label.includes(" - "))).to.equal(false);
    });
  });

  it("should render summary after clicking an autocomplete suggestion and allow changing selection", () => {
    visitPage(TestCaseId.PSAddProcessingPlantContinue);

    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="change-processing-plant"]').length) {
        cy.get('[data-testid="change-processing-plant"]').click();
      }
    });

    getProcessingPlantSearchInput().clear();
    getProcessingPlantSearchInput().type("test");
    cy.request("/get-processing-plants?search=test").then((response) => {
      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.equal(true);
      expect(response.body.length).to.be.greaterThan(0);

      const selectedOption = response.body[0] as ProcessingPlantSearchResult;
      const approvalText = `Approval number: ${selectedOption.approvalNumber}`;

      selectAutocompleteOptionContaining(selectedOption.tradingName);

      cy.get("input.autocomplete__input").should("not.exist");
      cy.contains("p", selectedOption.tradingName).should("be.visible");
      cy.contains("p", approvalText).should("be.visible");

      if (selectedOption.cityName) {
        cy.contains("p", selectedOption.cityName).should("be.visible");
      }

      if (selectedOption.postcode) {
        cy.contains("p", selectedOption.postcode).should("be.visible");
      }

      cy.get('[data-testid="change-processing-plant"]').should("be.visible").click();
    });

    getProcessingPlantSearchInput();
    cy.contains("p", "Approval number: UK/1234/EC").should("not.exist");
  });

  it("should return case-insensitive and approval-number-only processing plant matches", () => {
    visitPage(TestCaseId.PSAddProcessingPlantContinue);

    cy.request("/get-processing-plants?search=uk/1234/ec").then((response) => {
      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.equal(true);
      expect(
        response.body.some((result: ProcessingPlantSearchResult) => result.label.toLowerCase().includes("uk/1234/ec"))
      ).to.equal(true);
    });

    cy.request("/get-processing-plants?search=1234").then((response) => {
      expect(response.status).to.equal(200);
      expect(Array.isArray(response.body)).to.equal(true);
      expect(response.body.some((result: ProcessingPlantSearchResult) => result.label.includes("1234"))).to.equal(true);
    });
  });

  it("should show a blocking error when no value is entered and continue is clicked", () => {
    visitPage(TestCaseId.PSAddProcessingPlantEmptyContinue);

    getProcessingPlantSearchInput();
    cy.get('[data-testid="save-and-continue"]').click();

    cy.get(".govuk-error-summary").should(
      "contain",
      "You must select a processing plant or enter the plant details manually"
    );
    cy.url().should("include", pageUrl);
    cy.url().should("not.include", detailsUrl);
  });

  it("should show a blocking error when an unrecognised processing plant is entered", () => {
    visitPage(TestCaseId.PSAddProcessingPlantNoMatchContinue);

    setProcessingPlantText(unknownPlantLabel);
    cy.get('[data-testid="save-and-continue"]').click();

    cy.get(".govuk-error-summary").should(
      "contain",
      "You must select a processing plant or enter the plant details manually"
    );
    cy.url().should("include", pageUrl);
    cy.url().should("not.include", detailsUrl);
  });

  it("should show and hide the no-results message as the search term changes", () => {
    visitPage(TestCaseId.PSAddProcessingPlantNoMatchContinue);

    getProcessingPlantSearchInput().clear();
    getProcessingPlantSearchInput().type("Unknown Plant");

    cy.get('[data-testid="no-processing-plant-results"]').should("be.visible");
    cy.get('[data-testid="no-processing-plant-results"] strong').should("have.text", "No results found");
    cy.get('[data-testid="no-processing-plant-results"]').should(
      "contain.text",
      "Check the company name or approval number and try again."
    );
    cy.get('[data-testid="no-processing-plant-results"]').should(
      "contain.text",
      "No results foundCheck the company name or approval number and try again.If you can't find the address, select 'Enter the address manually'.You can only enter a UK address."
    );

    getProcessingPlantSearchInput().clear();
    getProcessingPlantSearchInput().type("U");

    cy.get('[data-testid="no-processing-plant-results"]').should("not.exist");
  });

  it("should redirect to manual plant address page when secondary button is clicked", () => {
    visitPage(TestCaseId.PSAddProcessingPlantManualEntry);

    cy.get('[data-testid="manual-entry-button"]').click();

    cy.url().should("include", manualAddressUrl);
  });

  it("should work without JavaScript for primary continue flow", () => {
    visitPage(TestCaseId.PSAddProcessingPlantContinue, true);

    cy.get("h1").should("contain", "Which processing plant do you want to use?");
    cy.get('[data-testid="change-processing-plant"]').should("not.exist");
    cy.get("input[name='plantName']").should("be.visible").type("Test Fish Plant");
    cy.get("input[name='plantApprovalNumber']").should("be.visible").type("UK/1234/EC");
    cy.get('[data-testid="save-and-continue"]').click();

    cy.url().should("include", manualAddressUrl);
  });

  it("should show the processing plant address summary without JavaScript when a saved plant exists", () => {
    visitPage(TestCaseId.PSAddProcessingPlantWithSavedSelection, true);

    cy.get("input[name='plantName']").should("have.value", "Test Fish Plant");
    cy.contains("strong", "Processing plant address").should("be.visible");
    cy.contains("p", "Test Fish Plant").should("be.visible");
    cy.contains("p", "Approval number: UK/1234/EC").should("be.visible");
    cy.contains("p", "Hull").should("be.visible");
    cy.contains("p", "HU1 2AB").should("be.visible");
  });

  it("should not render the processing plant address summary without JavaScript when there is no saved plant", () => {
    visitPage(TestCaseId.PSAddProcessingPlantEmptyContinue, true);

    cy.get("input[name='plantName']").should("be.visible").and("have.value", "");
    cy.contains("strong", "Processing plant address").should("not.exist");
  });

  it("should work without JavaScript and show blocking errors when no processing plant match is found", () => {
    visitPage(TestCaseId.PSAddProcessingPlantNoMatchContinue, true);

    cy.get("input[name='plantName']").should("be.visible").type("Unknown Plant");
    cy.get("input[name='plantApprovalNumber']").should("be.visible").type("UK/9999/EC");
    cy.get('[data-testid="no-processing-plant-results"]').should("not.exist");
    cy.get('[data-testid="save-and-continue"]').click();

    cy.get(".govuk-error-summary").should("contain", "Enter the processing plant name");
    cy.get(".govuk-error-summary").should("contain", "Enter the plant approval number");
    cy.get("#plantName-error").should("contain", "Enter the processing plant name");
    cy.get("#plantApprovalNumber-error").should("contain", "Enter the plant approval number");
    cy.url().should("include", pageUrl);
    cy.url().should("not.include", detailsUrl);
  });

  it("should work without JavaScript and show blocking errors when no processing plant is entered", () => {
    visitPage(TestCaseId.PSAddProcessingPlantEmptyContinue, true);

    cy.get('[data-testid="save-and-continue"]').click();

    cy.get(".govuk-error-summary").should("contain", "Enter the processing plant name");
    cy.get(".govuk-error-summary").should("contain", "Enter the plant approval number");
    cy.get("#plantName-error").should("contain", "Enter the processing plant name");
    cy.get("#plantApprovalNumber-error").should("contain", "Enter the plant approval number");
    cy.url().should("include", pageUrl);
    cy.url().should("not.include", detailsUrl);
  });

  it("should map and persist the matched establishment's address and clear stale manual sub-fields when saved", () => {
    visitPage(TestCaseId.PSAddProcessingPlantMatchedAddressMapped);

    getProcessingPlantSearchInput().clear();
    getProcessingPlantSearchInput().type("Coastal");
    selectAutocompleteOptionContaining("Coastal Fish Exports Ltd");
    cy.get('[data-testid="save-and-continue"]').click();

    // Handler responds 400 if the posted payload is missing the mapped address or still carries stale sub-fields.
    cy.contains("You must select a processing plant or enter the plant details manually").should("not.exist");
    cy.url().should("include", detailsUrl);
  });

  it("should hide secondary manual entry button without JavaScript", () => {
    visitPage(TestCaseId.PSAddProcessingPlantManualEntry, true);

    cy.get("input[name='plantName']").should("be.visible");
    cy.get("input[name='plantApprovalNumber']").should("be.visible");
    cy.get('[data-testid="manual-entry-button"]').should("not.be.visible");
  });

  it("should show save as draft button without JavaScript", () => {
    visitPage(TestCaseId.PSAddProcessingPlantSaveAsDraft, true);

    cy.get('[data-testid="save-draft-button"]').should("be.visible");
  });

  it("should save as draft and redirect to processing statements dashboard without JavaScript", () => {
    visitPage(TestCaseId.PSAddProcessingPlantSaveAsDraft, true);

    cy.get("input[name='plantName']").should("be.visible").type("Test Fish Plant");
    cy.get("input[name='plantApprovalNumber']").should("be.visible").type("UK/1234/EC");
    cy.get('[data-testid="save-draft-button"]').click();

    cy.url().should("include", dashboardUrl);
  });

  it("should still redirect to processing statements dashboard when save as draft initial validation returns errors", () => {
    visitPage(TestCaseId.PSAddProcessingPlantSaveAsDraftWithErrors, true);

    cy.get("input[name='plantName']").should("be.visible").type("Test Fish Plant");
    cy.get('[data-testid="save-draft-button"]').click();

    cy.url().should("include", dashboardUrl);
    cy.url().should("not.include", pageUrl);
  });
});
