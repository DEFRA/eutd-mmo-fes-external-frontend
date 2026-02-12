// FI0-10238: Direct Landing Error Message Updates
import { type ITestParams, TestCaseId } from "~/types";

const directLandingUrl = "/create-catch-certificate/GBR-2023-CC-TEST123/direct-landing";

describe("Direct Landing Error Messages - English", () => {
  it("should display 'Enter the date landed' when date landed is unpopulated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingDateLandedUnpopulated,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Enter the date landed");
    cy.get(".govuk-error-message").should("contain.text", "Enter the date landed");
  });

  it("should display 'Enter a valid date landed' when date landed is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingDateLandedInvalid,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Enter a valid date landed");
    cy.get(".govuk-error-message").should("contain.text", "Enter a valid date landed");
  });

  it("should display 'Date landed must be today or within the next 7 days' when date is > 7 days future", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingDateLandedFuture,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should(
      "contain.text",
      "Date landed must be today or within the next 7 days"
    );
    cy.get(".govuk-error-message").should("contain.text", "Date landed must be today or within the next 7 days");
  });

  it("should display 'Select or enter a vessel name or port letter and number' when vessel is unpopulated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingVesselUnpopulated,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should(
      "contain.text",
      "Select or enter a vessel name or port letter and number"
    );
    cy.get(".govuk-error-message").should("contain.text", "Select or enter a vessel name or port letter and number");
  });

  it("should display 'Select a vessel from the list' when vessel selection is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingVesselInvalid,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Select a vessel from the list");
    cy.get(".govuk-error-message").should("contain.text", "Select a vessel from the list");
  });

  it("should display 'Enter the export weight in kilograms' when export weight is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingExportWeightInvalid,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Enter the export weight in kilograms");
    cy.get(".govuk-error-message").should("contain.text", "Enter the export weight in kilograms");
  });
});

describe("Direct Landing Error Messages - Welsh", () => {
  it("should display 'Rhowch y dyddiad glanio' when date landed is unpopulated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingDateLandedUnpopulated,
      lng: "cy",
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("Mae yna broblem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Rhowch y dyddiad glanio");
    cy.get(".govuk-error-message").should("contain.text", "Rhowch y dyddiad glanio");
  });

  it("should display 'Rhowch ddyddiad glanio dilys' when date landed is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingDateLandedInvalid,
      lng: "cy",
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("Mae yna broblem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Rhowch ddyddiad glanio dilys");
    cy.get(".govuk-error-message").should("contain.text", "Rhowch ddyddiad glanio dilys");
  });

  it("should display 'Rhaid i'r dyddiad glanio fod heddiw neu o fewn y 7 diwrnod nesaf' when date is > 7 days future", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingDateLandedFuture,
      lng: "cy",
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("Mae yna broblem");
    cy.get(".govuk-error-summary__list a").should(
      "contain.text",
      "Rhaid i'r dyddiad glanio fod heddiw neu o fewn y 7 diwrnod nesaf"
    );
    cy.get(".govuk-error-message").should(
      "contain.text",
      "Rhaid i'r dyddiad glanio fod heddiw neu o fewn y 7 diwrnod nesaf"
    );
  });

  it("should display 'Dewiswch neu rhowch enw llong neu lythyren a rhif porthladd' when vessel is unpopulated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingVesselUnpopulated,
      lng: "cy",
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("Mae yna broblem");
    cy.get(".govuk-error-summary__list a").should(
      "contain.text",
      "Dewiswch neu rhowch enw llong neu lythyren a rhif porthladd"
    );
    cy.get(".govuk-error-message").should(
      "contain.text",
      "Dewiswch neu rhowch enw llong neu lythyren a rhif porthladd"
    );
  });

  it("should display 'Dewiswch gwch neu long o'r rhestr' when vessel selection is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingVesselInvalid,
      lng: "cy",
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("Mae yna broblem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Dewiswch gwch neu long o'r rhestr");
    cy.get(".govuk-error-message").should("contain.text", "Dewiswch gwch neu long o'r rhestr");
  });

  it("should display 'Rhowch y pwysau allforio mewn cilogramau' when export weight is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingExportWeightInvalid,
      lng: "cy",
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("Mae yna broblem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Rhowch y pwysau allforio mewn cilogramau");
    cy.get(".govuk-error-message").should("contain.text", "Rhowch y pwysau allforio mewn cilogramau");
  });
});
