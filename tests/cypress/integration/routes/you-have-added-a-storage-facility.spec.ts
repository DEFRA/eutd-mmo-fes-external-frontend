import { type ITestParams, TestCaseId } from "~/types";

const sdPageUrl = "create-non-manipulation-document/GBR-2022-SD-F71D98A30/you-have-added-a-storage-facility";

describe("SD: you-have-added-a-storage-facility page", () => {
  it("should render the page with single facility", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-heading-xl").should("contain", "You have added 1 storage facility");
  });

  it("should render the page with two facilities", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankTwoFacilities,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-heading-xl").should("contain", "You have added 2 storage facilities");
  });

  it("should display storage facility details", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-summary-list__key").should("exist");
    cy.contains("Test Storage Facility").should("exist");
  });

  it("should NOT have Remove button when only one facility exists", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get('[data-testid="remove-button"]').should("not.exist");
  });

  it("should display radio buttons for adding another facility", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get("#addAnotherFacilityYes").should("exist");
    cy.get("#addAnotherFacilityNo").should("exist");
  });

  it("should display the confirmation question", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-fieldset__heading").should("contain", "Do you need to add another storage facility?");
  });

  it("should allow continuing when form is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.contains("button", "Save and continue").click({ force: true });
  });

  it("should have a back to progress link", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get('a[href*="/progress"]').should("exist");
  });

  it("should have Save as draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.contains("button", "Save as draft").should("exist");
  });

  it("should have Save and continue button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.contains("button", "Save and continue").should("exist");
  });

  it("should display two facilities properly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankTwoFacilities,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-heading-xl").should("contain", "You have added 2 storage facilities");
    cy.contains("First Storage Facility").should("exist");
    cy.contains("Second Storage Facility").should("exist");
    cy.get('[data-testid="edit-button"]').should("exist");
  });

  it("should display three facilities properly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankThreeFacilities,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.get(".govuk-heading-xl").should("contain", "You have added 3 storage facilities");
    cy.contains("First Storage Facility").should("exist");
    cy.contains("Second Storage Facility").should("exist");
    cy.contains("Third Storage Facility").should("exist");
    cy.get('[data-testid="edit-button"]').should("exist");
  });
});
