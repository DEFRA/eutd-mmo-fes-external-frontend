import { type ITestParams, TestCaseId } from "~/types";

const addStorageFacilityUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/add-storage-facility-details";
const whatStorageFacilityUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/what-storage-facility-address";
const progressUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/progress";
const storageFacilityUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/add-storage-facility-approval";
const checkYourInformationUrl = "/create-storage-document/GBR-2022-SD-3FE1169D1/check-your-information";

describe("Add Storage Facility Address", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddress,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
  });

  it("should render Storage Facility Address page", () => {
    cy.contains("a", /^Create a UK storage document$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-storage-document/storage-documents");

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        "/create-storage-document/GBR-2022-SD-3FE1169D1/how-does-the-consignment-arrive-to-the-uk"
      );

    cy.get(".govuk-heading-xl").contains("Add storage facility details");

    cy.contains("strong", "An address must be added for this storage facility.");

    cy.contains("[data-testid=goToAddAddress-button]", /^Add address$/).should("be.visible");

    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");

    cy.get("#backToProgress").should("be.visible").should("have.attr", "href", progressUrl);

    cy.get("[data-testid=goToAddAddress-button]").click({ force: true });
    cy.url().should("include", whatStorageFacilityUrl);
  });

  it("should redirect to progress page", () => {
    cy.get("#backToProgress").click({ force: true });
    cy.url().should("include", "/progress");
  });

  it("should save and redirect to what storage facility address page on clicking save and continue", () => {
    cy.get("[data-testid=goToAddAddress-button]").click({ force: true });
    cy.url().should("include", "/what-storage-facility-address/0");
  });
});

describe("Add Storage Facility Address - Complete", () => {
  it("should save and redirect to storage facility approval page on clicking save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalComplete,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", storageFacilityUrl);
  });

  it("should save and redirect to check your information page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalComplete,
    };
    cy.visit(addStorageFacilityUrl + `?nextUri=${checkYourInformationUrl}`, { qs: { ...testParams } });
    cy.get(`[data-testid="save-and-continue"]`).click({ force: true });
    cy.url().should("include", "/check-your-information");
  });
});

describe("Add Storage Facility Address - Error", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressError,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
  });

  it("should show facility name validation error", () => {
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", "There is a problem");
    cy.contains("a", /^Enter the facility name$/)
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-0-facilityName");
    cy.get(".govuk-error-summary").should("be.visible");
  });

  it("should show address validation error", () => {
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains("h2", "There is a problem");
    cy.contains("a", /^Enter the address$/)
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-0-facilityAddressOne");
  });
});

describe("Add Storage Facility Address - Forbidden", () => {
  it("should redirect to forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressForbidden,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Storage Facility page when javascript is disabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApproval,
      disableScripts: true,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
  });

  it("should render add date button in add storage facility  when JavaScript is disabled", () => {
    cy.contains("[data-testid='add-facilityArrivalDate']", "Add Date");
  });

  it("should redirect to #facilityArrivalDate on valid date input", () => {
    cy.get('input[name="facilityArrivalDateDay"]').type("17");
    cy.get('input[name="facilityArrivalDateMonth"]').type("09");
    cy.get('input[name="facilityArrivalDateYear"]').type("2025");

    cy.get("form").within(() => {
      cy.get('button[name="_action"][value="add-facilityArrivalDate"]').click();
    });

    cy.url().should("include", "#facilityArrivalDate");
  });

  it("should show validation error on invalid date input", () => {
    cy.get('input[name="facilityArrivalDateDay"]').type("32");
    cy.get('input[name="facilityArrivalDateMonth"]').type("13");
    cy.get('input[name="facilityArrivalDateYear"]').type("101010");

    cy.get("form").within(() => {
      cy.get('button[name="_action"][value="add-facilityArrivalDate"]').click();
    });

    cy.contains("Arrival date must be a real date").should("be.visible");
  });

  describe("Add Storage Facility page save as draft", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDAddStorageSaveAsDraft,
      };
      cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
    });

    it("should not show validation errors when clicking on draft", () => {
      cy.wait(5000);
      cy.get("[data-testid=save-draft-button]").click({ force: true });
      cy.url().should("include", "create-storage-document/storage-document");
    });
  });
});
