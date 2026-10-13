import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-0D12ABA0A";
const pageUrl = `/create-processing-statement/${documentNumber}/add-processing-plant`;

const visitPage = (testCaseId: TestCaseId, disableScripts = false) => {
  const testParams: ITestParams = { testCaseId, disableScripts };
  cy.visit(pageUrl, { qs: { ...testParams } });
};

describe("PS: add processing plant - rendering", () => {
  beforeEach(() => visitPage(TestCaseId.PSAddProcessingPlantContinue));

  it("should render the page heading and hint", () => {
    cy.get(".govuk-heading-xl").should("be.visible").and("contain.text", "Which processing plant do you want to use?");
    cy.contains("Start typing a company name or approval number to search for a facility.").should("be.visible");
  });

  it("should render the search input with its label", () => {
    cy.get("label[for='processingPlant']").should("contain.text", "Enter your processing plant");
    cy.get("#processingPlant").should("be.visible");
  });

  it("should render the continue and manual entry buttons", () => {
    cy.get("[data-testid='save-and-continue']").should("be.visible").and("contain.text", "Save and continue");
    cy.get("[data-testid='manual-entry-button']")
      .should("be.visible")
      .and("contain.text", "Enter plant details manually");
  });

  it("should render a back link to the catch added page", () => {
    cy.get(".govuk-back-link").should(
      "have.attr",
      "href",
      `/create-processing-statement/${documentNumber}/catch-added`
    );
  });

  it("should not show a saved plant summary when no plant has been chosen yet", () => {
    cy.get(".app-selected-address").should("not.exist");
    cy.get("[data-testid='change-processing-plant']").should("not.exist");
  });
});

describe("PS: add processing plant - shared establishment search", () => {
  it("deduplicates MDM ids and formats the result label", () => {
    visitPage(TestCaseId.PSAddProcessingPlantContinue);

    cy.request("/get-processing-plants?search=MDM%20Duplicate").then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.map((establishment: { label: string }) => establishment.label)).to.deep.equal([
        "MDM Duplicate Processing A (UK/5555/EC) - DN1 2AB",
      ]);
    });
  });
});

describe("PS: add processing plant - save and continue button", () => {
  it("should progress to add-processing-plant-details when a plant is selected and continue is clicked", () => {
    visitPage(TestCaseId.PSAddProcessingPlantContinue);

    cy.get("[data-testid='save-and-continue']").click();

    cy.url().should("include", `/create-processing-statement/${documentNumber}/add-processing-plant-details`);
  });

  it("should show a blocking error and stay on the page when clicked with nothing selected", () => {
    visitPage(TestCaseId.PSAddProcessingPlantEmptyContinue);

    cy.get("[data-testid='save-and-continue']").click();

    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains("You must select a processing plant or enter the plant details manually");
    cy.url().should("include", "/add-processing-plant");
  });
});
