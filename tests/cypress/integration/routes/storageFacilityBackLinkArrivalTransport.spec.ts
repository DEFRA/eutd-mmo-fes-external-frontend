import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-non-manipulation-document/${documentNumber}`;
const storageFacilityUrl = `${certificateUrl}/add-storage-facility-details`;
const trainArrivalPageUrl = `${certificateUrl}/add-arrival-transportation-details-train`;

describe("Storage facility back link after arrival transport save", () => {
  it("should redirect to storage facility with arrivalVehicle param and back link to arrival transport page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportSave,
    };

    cy.visit(trainArrivalPageUrl, { qs: { ...testParams } });

    // Fill mandatory fields
    cy.get("#railwayBillNumber").type("AB12345C");
    cy.get("#departureCountry").invoke("val", "France");
    cy.get("#departurePort").type("Calais port");
    cy.get("#placeOfUnloading").type("Dover");
    cy.get("#departureDate").type("25");
    cy.get("#departureDate-month").type("07");
    cy.get("#departureDate-year").type("2025");

    // Submit
    cy.get("[data-testid=save-and-continue]").click();

    // Confirm URL includes storage facility and arrivalVehicle query param
    cy.url().should("include", storageFacilityUrl);
    cy.url().should("include", "arrivalVehicle=train");

    // Back link should point to the arrival transport details page we just saved
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-arrival-transportation-details-train`);
  });
});
