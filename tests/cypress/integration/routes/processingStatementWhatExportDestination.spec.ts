import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-processing-statement/GBR-2023-PS-DE53D6E7C";
const whatExportDestinationUrl = `${documentUrl}/what-export-destination`;

describe("What Export Destination page: UI", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSWhatExportDestination,
    };
    cy.visit(whatExportDestinationUrl, { qs: { ...testParams } });
  });

  it("should render the correct back link", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/add-health-certificate");
  });

  it("should contain the page title", () => {
    cy.contains("h1", /^What is the export destination\?$/).should("be.visible");
  });

  it("should contain destination country field", () => {
    cy.get("label")
      .contains(/^Select the destination country$/)
      .should("be.visible");
    cy.get("#exportDestination").should("exist");
  });

  it("should contain point of destination field", () => {
    cy.get("label")
      .contains(/^Point of destination$/)
      .should("be.visible");
    cy.get("#pointOfDestination").should("exist");
    cy.get("#pointOfDestination-hint")
      .should("be.visible")
      .and(
        "contain",
        "For example, Calais port, Calais-Dunkerque airport or the destination point of the consignment."
      );
  });

  it("should contain Save and continue button", () => {
    cy.contains("button", /^Save and continue$/).should("be.visible");
  });

  it("should contain Save as draft button", () => {
    cy.contains("button", /^Save as draft$/).should("be.visible");
  });

  it("should not save invalid point of destination when save as draft is clicked", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSWhatExportDestinationDraftInvalid,
    };
    cy.visit(whatExportDestinationUrl, { qs: { ...testParams } });

    cy.get("#exportDestination").invoke("val", "France");
    cy.get("#pointOfDestination").type(new Array(102).join("A"));
    cy.get('[data-testid="save-draft-button"]').click({ force: true });

    // Should redirect to dashboard without showing errors and without saving invalid data
    cy.url().should("include", "/processing-statements");
  });
});
