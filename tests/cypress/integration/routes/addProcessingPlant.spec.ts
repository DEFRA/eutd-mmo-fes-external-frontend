import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-0D12ABA0A";
const pageUrl = `/create-processing-statement/${documentNumber}/add-processing-plant`;

const visitPage = (testCaseId: TestCaseId, disableScripts = false) => {
  const testParams: ITestParams = { testCaseId, disableScripts };
  cy.visit(pageUrl, { qs: { ...testParams } });
};

describe("PS: add processing plant - rendering", () => {
  beforeEach(() => visitPage(TestCaseId.PSAddProcessingPlantContinue));

  it("shows one plant-name error when no plant is selected in the non-JavaScript journey", () => {
    visitPage(TestCaseId.PSAddProcessingPlantWithSavedSelectionManualAddress, true);

    cy.get("select#processingPlant").should("have.value", "Test Fish Plant (UK/1234/EC) - HU1 2AB");
    cy.get("select#processingPlant option[value='']").should("have.text", "Select your processing plant");
    cy.get("select#processingPlant").select("");
    cy.get("select#processingPlant").should("have.value", "");
    cy.get("[data-testid='save-and-continue']").click();

    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary__list li").should("have.length", 1);
    cy.get(".govuk-error-summary__list a")
      .should("have.attr", "href", "#processingPlant")
      .and("contain.text", "Enter the processing plant name");
    cy.get(".govuk-error-summary").should("not.contain.text", "Enter the plant approval number");
    cy.get(".govuk-error-summary__list a").click();
    cy.get("select#processingPlant").should("have.focus");
    cy.get("select#processingPlant").should("have.value", "");
    cy.url().should("include", "/add-processing-plant");
  });

  it("localizes the no-JavaScript plant placeholder to Welsh", () => {
    cy.visit(pageUrl, {
      qs: {
        testCaseId: TestCaseId.PSAddProcessingPlantContinue,
        disableScripts: true,
        lng: "cy",
      },
    });

    cy.get("select#processingPlant option[value='']").should("have.text", "Dewiswch eich safle prosesu");
  });

  it("should render the page title in Welsh when Welsh is selected", () => {
    cy.visit(pageUrl, {
      qs: { testCaseId: TestCaseId.PSAddProcessingPlantContinue, lng: "cy" },
    });

    cy.title().should("eq", "Pa safle prosesu hoffech chi ei ddefnyddio? - Creu datganiad prosesu yn y DU - GOV.UK");
  });

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

describe("PS: add processing plant - autocomplete accessibility and country mapping", () => {
  it("keeps ARIA references valid while the results list is closed and open", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSAddProcessingPlantSaveAsDraft } });

    cy.get("#processingPlant").should(($input) => {
      expect($input).to.have.attr("aria-expanded", "false");
      ["aria-controls", "aria-owns", "aria-activedescendant"].forEach((attribute) => {
        expect($input).not.to.have.attr(attribute);
      });
    });

    cy.get("#processingPlant").type("Coastal");
    cy.get("#processingPlant__listbox [role='option']").should("have.length.at.least", 1);
    cy.get("#processingPlant").should("have.attr", "aria-expanded", "true");
    cy.get("#processingPlant").should("have.attr", "aria-controls", "processingPlant__listbox");
    cy.get("#processingPlant").should("have.attr", "aria-owns", "processingPlant__listbox");
    cy.get("#processingPlant")
      .invoke("attr", "aria-activedescendant")
      .then((activeDescendant) => {
        expect(activeDescendant).to.be.a("string");
        expect(activeDescendant).to.have.length.greaterThan(0);
        cy.get(`[id="${activeDescendant}"]`).should("have.attr", "role", "option");
      });
  });

  it("stores the selected plant country name rather than an object", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSAddProcessingPlantSaveAsDraft } });

    cy.get("#processingPlant").type("Coastal");
    cy.get("#processingPlant__listbox [role='option']").contains("Coastal Fish Exports Ltd").click();
    cy.get('input[name="plantCountry"]').should("have.value", "United Kingdom");
  });
});

describe("PS: add processing plant - save and continue button", () => {
  it("shows the current plant in the search input after clicking Change", () => {
    cy.visit(pageUrl, {
      qs: { testCaseId: TestCaseId.PSAddProcessingPlantWithSavedSelectionManualAddress },
    });

    cy.get("[data-testid='change-processing-plant']").click();
    cy.get("#processingPlant").should("have.value", "Test Fish Plant (UK/1234/EC) - HU1 2AB");
  });

  it("submits the selected plant when saving immediately after Change", () => {
    cy.visit(pageUrl, {
      qs: { testCaseId: TestCaseId.PSAddProcessingPlantWithSavedSelectionManualAddress },
    });

    cy.get("[data-testid='change-processing-plant']").click();
    cy.get("#processingPlant").should("have.value", "Test Fish Plant (UK/1234/EC) - HU1 2AB");
    cy.get("[data-testid='save-and-continue']").click();

    cy.url().should("include", `/create-processing-statement/${documentNumber}/add-processing-plant-details`);
  });

  it("should progress to add-processing-plant-details when a plant is selected and continue is clicked", () => {
    visitPage(TestCaseId.PSAddProcessingPlantWithSavedSelectionManualAddress);

    cy.get("[data-testid='save-and-continue']").click();

    cy.url().should("include", `/create-processing-statement/${documentNumber}/add-processing-plant-details`);
  });

  it("should show a blocking error and stay on the page when clicked with nothing selected", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.PSAddProcessingPlantEmptyContinue } });
    cy.get("input#processingPlant").should("be.visible");
    cy.get('input[name="isNonJs"]').should("have.value", "false");
    cy.get("[data-testid='save-and-continue']").click();

    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary").contains("You must select a processing plant or enter the plant details manually");
    cy.url().should("include", "/add-processing-plant");
  });
});
