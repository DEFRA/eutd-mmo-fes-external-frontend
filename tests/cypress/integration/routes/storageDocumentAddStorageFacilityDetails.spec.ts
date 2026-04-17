import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-SD-3FE1169D1";
const certificateUrl = `/create-non-manipulation-document/${documentNumber}`;
const pagePath = `${certificateUrl}/add-storage-facility-details`;

describe("Add Storage Facility Details: back link", () => {
  it("should show back link to arrival mode page when no arrival transport is set", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressNoArrival,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`);
  });

  it("should show back link to truck arrival page when truck transport is set", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressWithTruckTransport,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-arrival-transportation-details-truck`);
  });

  it("should show back link to train arrival page when train transport is set", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressWithTrainTransport,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-arrival-transportation-details-train`);
  });

  it("should show back link to plane arrival page when plane transport is set", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressWithPlaneTransport,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-arrival-transportation-details-plane`);
  });

  it("should show back link to container vessel arrival page when container vessel transport is set", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressWithContainerVesselTransport,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-arrival-transportation-details-container-vessel`);
  });
});

describe("Add Storage Facility Details: page render", () => {
  it("should render the page with facility name input and date picker", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddress,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.get("#storageFacilities-facilityName").should("exist");
    cy.get("[data-testid=goToAddAddress-button]").should("be.visible");
    cy.get("[data-testid=save-draft-button]").should("be.visible");
    cy.get("[data-testid=save-and-continue]").should("be.visible");
  });

  it("should redirect to forbidden when document access is unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressForbidden,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Storage Facility Details: validation errors", () => {
  it("should display errors when facility name and date are missing on save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressError,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });

  it("should display validation errors when facility name is missing on go to add address", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityNameAddressError,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.get("[data-testid=goToAddAddress-button]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });
});

describe("Add Storage Facility Details: save as draft retains valid fields", () => {
  it("should redirect to dashboard without error when save as draft is clicked with invalid fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityDetailsSaveAsDraftWithErrors,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should redirect to dashboard when no validation errors on save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityDetailsSaveAsDraftNoErrors,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });
});

describe("Add Storage Facility Details: pre-populated arrival date from stored document", () => {
  it("should display the stored facility arrival date in the date inputs on initial page load", () => {
    // storageDocumentNoDepartureDate fixture has facilityArrivalDate: "09/11/2024"
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressNoDepartureDate,
    };

    cy.visit(pagePath, { qs: { ...testParams } });
    cy.get("#storageFacilities-facilityArrivalDate-day").should("have.value", "09");
    cy.get("#storageFacilities-facilityArrivalDate-month").should("have.value", "11");
    cy.get("#storageFacilities-facilityArrivalDate-year").should("have.value", "2024");
  });
});
