import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate";
const documentNumber = "GBR-2022-CC-6BC952BA3";
const directLandingUrl = `${documentUrl}/${documentNumber}/direct-landing`;
const invalidVesselValue = "Invalid123";

describe("Direct Landing Error Messages - English", () => {
  it("should display the correct error messages when inputs are unpopulated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingDateLandedUnpopulated,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem"); // Passes in dev localhost:3000
    cy.get(".govuk-error-summary__list a").should("contain.text", "Enter the date landed"); // Passes in dev localhost:3000
    cy.get(".govuk-error-summary__list a").should(
      "contain.text",
      "Select or enter a vessel name or port letter and number"
    );
    cy.get(".govuk-error-summary__list a").should("contain.text", "Enter the export weight in kilograms"); // Passes in dev localhost:3000
    cy.get(".govuk-error-message").should("contain.text", "Enter the date landed"); // Passes in dev localhost:3000
    cy.get(".govuk-error-message").should("contain.text", "Select or enter a vessel name or port letter and number"); // Passes in dev localhost:3000
    cy.get(".govuk-error-message").should("contain.text", "Enter the export weight in kilograms"); // Passes in dev localhost:3000
  });

  it("should display 'Enter a valid date landed' when date is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingDateLandedInvalid,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    // Enter invalid date: Day 23 Month 14 Year 2026
    cy.get("#dateLanded-day").clear();
    cy.get("#dateLanded-day").type("23");
    cy.get("#dateLanded-month").clear();
    cy.get("#dateLanded-month").type("14");
    cy.get("#dateLanded-year").clear();
    cy.get("#dateLanded-year").type("2026");
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Enter a valid date landed");
    cy.get(".govuk-error-message").should("contain.text", "Enter a valid date landed");
  });

  it("should display 'Date landed must be today or within the next 7 days' when date is > 7 days future", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingDateLandedFuture,
    };
    // Passes in dev localhost:3000
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("#dateLanded-day").clear();
    cy.get("#dateLanded-day").type("1");
    cy.get("#dateLanded-month").clear();
    cy.get("#dateLanded-month").type("1");
    cy.get("#dateLanded-year").clear();
    cy.get("#dateLanded-year").type("2029");
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should(
      "contain.text",
      "Date landed must be today or within the next 7 days"
    );
    cy.get(".govuk-error-message").should("contain.text", "Date landed must be today or within the next 7 days");
  });

  it("should display 'Select a vessel from the list' when vessel selection is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingVesselInvalid,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("#vessel\\.vesselName").invoke("val", "").type(invalidVesselValue);
    cy.wait(500);
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Select a vessel from the list");
    cy.get(".govuk-error-message").should("contain.text", "Select a vessel from the list");
  });

  it("should display 'Select a vessel from the list' when vessel.isListed error is returned", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingVesselIsListed,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Select a vessel from the list");
    cy.get(".govuk-error-message").should("contain.text", "Select a vessel from the list");
    cy.get("#vessel\\.vesselName").closest(".govuk-form-group").should("have.class", "govuk-form-group--error");
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
    cy.get("#vessel\\.vesselName").invoke("val", "").type(invalidVesselValue);
    cy.wait(500);
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("Mae yna broblem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Dewiswch gwch neu long o'r rhestr");
    cy.get(".govuk-error-message").should("contain.text", "Dewiswch gwch neu long o'r rhestr");
  });

  it("should display 'Dewiswch gwch neu long o'r rhestr' when vessel.isListed error is returned", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingVesselIsListed,
      lng: "cy",
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("Mae yna broblem");
    cy.get(".govuk-error-summary__list a").should("contain.text", "Dewiswch gwch neu long o'r rhestr");
    cy.get(".govuk-error-message").should("contain.text", "Dewiswch gwch neu long o'r rhestr");
    cy.get("#vessel\\.vesselName").closest(".govuk-form-group").should("have.class", "govuk-form-group--error");
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
