import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-storage-document/GBR-2021-SD-8EEB7E123";
const pageUrl = `${documentUrl}/you-have-added-a-storage-facility`;

describe("SD: You added storage facilities", () => {
  it("navigating from the Progress page should redirect to add storage facilities if there are none", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityWithNoFacilities,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/add-storage-facility-details");
  });

  it("should render correctly if there are no storage facilities", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityWithNoResponse,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.contains("You have added 0 storage facility");
    cy.get("a[id^=edit-facility]").should("have.length", 0);
    cy.get(".govuk-summary-list").should("have.length", 0);
    cy.title().should("eq", "You have added 0 storage facilities - Create a UK storage document - GOV.UK");
  });

  it("should contain edit only button if there is only one facility", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityWithNoResponse,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.contains("You have added 0 storage facility");
    cy.get("a[id^=edit-facility]").should("have.length", 0);
    cy.get(".govuk-summary-list").should("have.length", 0);
    cy.title().should("eq", "You have added 0 storage facilities - Create a UK storage document - GOV.UK");
  });

  it("should contain edit only button if there is only one facility", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.title().should("eq", "You have added 1 storage facility - Create a UK storage document - GOV.UK");

    cy.get("button[id^=edit-facility]").should("have.length", 1);
    cy.get("button[id^=remove-facility]").should("have.length", 0);

    cy.contains("a", /^Back$/).click({ force: true });
    cy.url().should("include", "/add-storage-facility-approval/0");
  });

  it("should not show error island on initial page loage", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#errorIsland").should("not.exist");

    cy.contains("a", /^Back$/).click({ force: true });
    cy.url().should("include", "/add-storage-facility-approval/0");
  });

  it("should contain both edit and remove buttons if there is two facility", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankTwoFacilities,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.title().should("eq", "You have added 2 storage facilities - Create a UK storage document - GOV.UK");

    cy.get("button[id^=edit-facility]").should("have.length", 2);
    cy.get("button[id^=remove-facility]").should("have.length", 2);
  });

  it("should trigger delete action for correct facility when delete button is clicked", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankThreeFacilities,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.title().should("eq", "You have added 3 storage facilities - Create a UK storage document - GOV.UK");

    cy.intercept("POST", `${pageUrl}?testCaseId=${TestCaseId.SDFacilityAddedBlankThreeFacilities}`).as("formPost");

    cy.get("button[id^=remove-facility]").eq(1).click({ force: true });
    cy.wait("@formPost").its("request.body").should("include", "facilityId=1").and("include", "_action=remove");

    cy.contains("button", "Save and continue").click({ force: true });

    cy.url().should("include", "/how-does-the-export-leave-the-uk");
  });

  it("should contain navigate to add storage facility pages of index 1", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankTwoFacilities,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.title().should("eq", "You have added 2 storage facilities - Create a UK storage document - GOV.UK");

    cy.get("button[id^=edit-facility]").should("have.length", 2);
    cy.get("button[id^=remove-facility]").should("have.length", 2);
    cy.get("button[id^=edit-facility]").eq(1).click({ force: true });
    cy.url().should("include", "/add-storage-facility-approval/1");
  });

  it("should allow continuing if trying to add a new facility entry", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityAddedBlankOneFacility,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    // eslint-disable-next-line
    cy.wait(200);
    cy.get('[type="radio"]').first().check();
    cy.contains("button", "Save and continue").click({ force: true });

    cy.url().should("include", "/add-storage-facility-detail");
  });

  it("click on remove button and then click Save and continue button to get error response", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityTwoFacilities,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#remove-facility-0").click({ force: true });
    cy.contains("button", "Save and continue").click({ force: true });
  });

  it("click on remove button and then click Save and continue to get no error response", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityTwoFacilitiesDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#remove-facility-0").click({ force: true });
    cy.contains("button", "Save and continue").click({ force: true });
  });

  it("should navigate to the correct entry if editing a facility after temporarily marking another facility for removal", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityTwoFacilitiesDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    const expectedIndex = 0; // expected index after removing the second entry

    cy.get("button[id^=remove-facility]").eq(1).click({ force: true });
    cy.get("button[id^=edit-facility]").eq(expectedIndex).click({ force: true });
    cy.url().should("include", `/add-storage-facility-approval/0`);
  });

  it("should click on  save as draft button and navigate to dashboard screen ", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityTwoFacilitiesSaveAsDraft,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", `/create-storage-document/storage-documents`);
  });

  it("should click on  save as draft button and navigate to dashboard screen when user has no facilites", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityNoFacilitiesSaveAsDraft,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", `/create-storage-document/storage-documents`);
  });

  it("should allow you to add another facility", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityTwoFacilitiesDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#addAnotherFacilityYes").click({ force: true });

    cy.contains("button", "Save and continue").click({ force: true });
  });

  it("should display errors and error island", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDFacilityNoFacilitiesSaveAsDraftGetErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.contains("button", "Save and continue").click({ force: true });

    cy.get(".govuk-error-summary").should("have.length", 1);
  });
});
