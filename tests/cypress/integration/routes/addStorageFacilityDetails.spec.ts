import { type ITestParams, TestCaseId } from "~/types";

const addStorageFacilityUrl = "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/add-storage-facility-details";
const progressUrl = "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/progress";
const storageFacilityUrl = "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/add-storage-facility-approval";
const checkYourInformationUrl = "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/check-your-information";

describe("Add Storage Facility Address", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddress,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
  });

  it("should render Storage Facility Address page", () => {
    cy.wrap(true).should("be.true");
    cy.contains("a", /^Create a UK non-manipulation document$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-non-manipulation-document/non-manipulation-documents");

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/add-arrival-transportation-details-plane"
      );

    cy.get(".govuk-heading-xl").contains("Add storage facility details");

    cy.contains("strong", "A storage facility address must be added here.");

    // Arrival date label should not show the optional suffix and should show the new hint/info text
    cy.get("#storageFacilities-facilityArrivalDate-container").should("contain", "Arrival date");
    cy.contains("This should be the date the product arrives at the storage facility. For example, 25/07/2025.").should(
      "be.visible"
    );

    // Expandable guidance should be present with title and content
    cy.get("details.govuk-details")
      .should("exist")
      .within(() => {
        cy.get("summary").contains("What is the arrival date?");
        cy.contains(
          "This is the date the product arrives at the storage facility and is unloaded. If unloading happens later, enter the date the product was physically removed from the transport and received into storage."
        ).should("be.visible");
      });

    cy.contains("[data-testid=goToAddAddress-button]", /^Add the storage facility address$/).should("be.visible");

    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");

    cy.get("#backToProgress").should("be.visible").should("have.attr", "href", progressUrl);

    cy.get("[data-testid=goToAddAddress-button]").click();
    cy.url().should("include", addStorageFacilityUrl);
  });

  it("should redirect to progress page", () => {
    cy.wrap(true).should("be.true");
    cy.get("#backToProgress").click();
    cy.url().should("include", "/progress");
  });

  it("should save and redirect to what storage facility address page on clicking save and continue", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid=goToAddAddress-button]").click();
    cy.contains("Arrival date must be a real date").should("be.visible");
    cy.url().should("include", "/add-storage-facility-details");
  });
});

describe("Add Storage Facility Address - Complete", () => {
  it("should render change button with descriptive hidden text when address exists", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalComplete,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
    cy.get('[data-testid="goToAddAddress-button"]').should("be.visible").contains("Change");
    cy.get('[data-testid="goToAddAddress-button"] .govuk-visually-hidden').should(
      "contain",
      "storage facility address"
    );
  });

  it("should save and redirect to storage facility approval page on clicking save and continue", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalComplete,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", storageFacilityUrl);
  });

  it("should save and redirect to check your information page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalComplete,
    };
    cy.visit(addStorageFacilityUrl + `?nextUri=${checkYourInformationUrl}`, { qs: { ...testParams } });
    cy.get(`[data-testid="save-and-continue"]`).click();
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
    cy.wrap(true).should("be.true");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", "There is a problem");
    cy.contains("a", /^Enter the facility name$/)
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-facilityName");
    cy.get(".govuk-error-summary").should("be.visible");
  });

  it("should show address validation error", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", "There is a problem");
    cy.contains("a", /^Enter the address$/)
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-facilityAddressOne");
  });
  it("redirects to address page on valid input", () => {
    cy.wrap(true).should("be.true");
    cy.get('input[name="facilityName"]').clear();
    cy.get('input[name="facilityName"]').type("Test Facility");
    cy.get('input[name="facilityArrivalDateDay"]').clear();
    cy.get('input[name="facilityArrivalDateDay"]').type("17");
    cy.get('input[name="facilityArrivalDateMonth"]').clear();
    cy.get('input[name="facilityArrivalDateMonth"]').type("09");
    cy.get('input[name="facilityArrivalDateYear"]').clear();
    cy.get('input[name="facilityArrivalDateYear"]').type("2025");
    cy.get("[data-testid=goToAddAddress-button]").click();
    cy.url().should("include", "/what-storage-facility-address");
  });
});

describe("Add Storage Facility Address - Forbidden", () => {
  it("should redirect to forbidden page", () => {
    cy.wrap(true).should("be.true");
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
    cy.wrap(true).should("be.true");
    cy.contains("[data-testid='add-storageFacilities-facilityArrivalDate']", "Add Date");
  });

  it("should redirect to #facilityArrivalDate on valid date input", () => {
    cy.wrap(true).should("be.true");
    cy.get('input[name="facilityArrivalDateDay"]').type("17");
    cy.get('input[name="facilityArrivalDateMonth"]').type("09");
    cy.get('input[name="facilityArrivalDateYear"]').type("2025");

    cy.get("form").within(() => {
      cy.get('button[name="_action"][value="add-facilityArrivalDate"]').click();
    });

    cy.url().should("include", "/add-storage-facility-details");
  });

  it("should show validation error on invalid date input", () => {
    cy.wrap(true).should("be.true");
    cy.get('input[name="facilityArrivalDateDay"]').type("32");
    cy.get('input[name="facilityArrivalDateMonth"]').type("13");
    cy.get('input[name="facilityArrivalDateYear"]').type("101010");

    cy.get("form").within(() => {
      cy.get('button[name="_action"][value="add-facilityArrivalDate"]').click();
    });

    // Field-level error text visible
    cy.contains("Arrival date must be a real date").should("be.visible");
    // Error summary should also be visible at the top of the page
    cy.get(".govuk-error-summary").should("be.visible");
  });

  it("should show error when year 0000 is entered in the date picker", () => {
    cy.wrap(true).should("be.true");
    cy.get('input[name="facilityArrivalDateDay"]').clear().type("01");
    cy.get('input[name="facilityArrivalDateMonth"]').clear().type("01");
    cy.get('input[name="facilityArrivalDateYear"]').clear().type("0000");

    cy.get("form").within(() => {
      cy.get('button[name="_action"][value="add-facilityArrivalDate"]').click();
    });

    cy.contains("Arrival date must be a real date").should("be.visible");
    cy.get(".govuk-error-summary").should("be.visible");
  });

  describe("Add Storage Facility page save as draft", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDAddStorageSaveAsDraft,
        disableScripts: true,
      };
      cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
    });

    it("should not show validation errors when clicking on draft", () => {
      cy.wrap(true).should("be.true");
      cy.document({ timeout: 5000 }).its("readyState").should("eq", "complete");
      cy.get("[data-testid=save-draft-button]").click();
      cy.url().should("include", "create-non-manipulation-document/non-manipulation-documents");
    });
  });
});

describe("Add Storage Facility Address - Error Both Name and Date", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityNameAddressError,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
  });

  it("shows both facility name and date errors", () => {
    cy.wrap(true).should("be.true");
    cy.get('input[name="facilityArrivalDateDay"]').clear();
    cy.document({ timeout: 100 }).its("readyState").should("eq", "complete");
    cy.get('input[name="facilityArrivalDateMonth"]').clear();
    cy.document({ timeout: 100 }).its("readyState").should("eq", "complete");
    cy.get('input[name="facilityArrivalDateYear"]').clear();
    cy.document({ timeout: 100 }).its("readyState").should("eq", "complete");
    cy.get('input[name="facilityName"]').clear();
    cy.get("[data-testid=goToAddAddress-button]").click();

    cy.url({ timeout: 10000 }).should("include", "/add-storage-facility-details");
    cy.get(".govuk-error-summary", { timeout: 10000 }).should("be.visible");
    cy.contains("h2", "There is a problem").should("be.visible");
    cy.contains("Enter the facility name").should("be.visible");
    cy.contains("Arrival date must be a real date").should("be.visible");
  });
});

describe("Add Storage Facility Address - Dynamic Back Link Based on Transport Mode", () => {
  const documentNumber = "GBR-2022-SD-3FE1169D1";

  it("should have back link to truck transport details page when truck transport is used", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressWithTruckTransport,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/add-arrival-transportation-details-truck`
      );
  });

  it("should have back link to train transport details page when train transport is used", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressWithTrainTransport,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/add-arrival-transportation-details-train`
      );
  });

  it("should have back link to plane transport details page when plane transport is used", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressWithPlaneTransport,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/add-arrival-transportation-details-plane`
      );
  });

  it("should have back link to container vessel transport details page when container vessel transport is used", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressWithContainerVesselTransport,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/add-arrival-transportation-details-container-vessel`
      );
  });

  it("should have back link to how-does-consignment-arrive when no arrival transport is set", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityAddressNoArrival,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should(
        "have.attr",
        "href",
        `/create-non-manipulation-document/${documentNumber}/how-does-the-consignment-arrive-to-the-uk`
      );
  });
});

describe("Add Storage Facility Details: save as draft retains valid fields", () => {
  it("should redirect to dashboard without error when save as draft is clicked with invalid fields", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityDetailsSaveAsDraftWithErrors,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should redirect to dashboard and null out arrival date when only arrival date is invalid", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityDetailsSaveAsDraftWithArrivalDateError,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should redirect to dashboard when no validation errors on save as draft", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityDetailsSaveAsDraftNoErrors,
    };
    cy.visit(addStorageFacilityUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });
});
