import { type ITestParams, TestCaseId } from "~/types";

const addStorageFacilityUrl = "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/add-storage-facility";
const addStorageApprovalUrl = "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/add-storage-facility-details";
const progressUrl = "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/progress";
const storageFacilityUrl =
  "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/how-does-the-consignment-leave-the-uk";
const checkYourInformationUrl = "/create-non-manipulation-document/GBR-2022-SD-3FE1169D1/check-your-information";

describe("Add Storage Facility Approval", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApproval,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
  });

  it("should render Storage Facility Approval page", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", addStorageFacilityUrl);
    cy.get(".govuk-heading-xl").contains("Add storage facility details");

    cy.contains("label", "Storage facility name").should("be.visible");
    cy.get('[data-testid="facility-summary-column"]').should("have.class", "govuk-grid-column-two-thirds");
    cy.get('[data-testid="facility-summary"] strong').should("have.text", "Storage facility address");
    cy.get("#storageFacilities-facilityName").should("have.value", "name");
    cy.get('[data-testid="facility-summary"]').contains("MMO, LANCASTER HOUSE, HAMPSHIRE COURT").should("be.visible");
    cy.get('[data-testid="facility-summary"] p')
      .eq(1)
      .should("have.text", "name")
      .and("have.class", "govuk-!-font-weight-bold");
    cy.get(".govuk-details__summary")
      .should("contain.text", "What is the arrival date?")
      .then(($arrivalDateInfo) => {
        cy.get("#storageFacilities-facilityName").then(($facilityName) => {
          expect(
            $arrivalDateInfo[0].compareDocumentPosition($facilityName[0]) & Node.DOCUMENT_POSITION_FOLLOWING
          ).to.not.equal(0);
        });
      });
    cy.contains("p", "Approval number: UK/ABC/001").should("be.visible");
    cy.contains("p", "MMO, LANCASTER HOUSE, HAMPSHIRE COURT").should("be.visible");

    // Arrival date label must be bold.
    cy.contains("legend", "Arrival date").find("label").should("have.class", "govuk-!-font-weight-bold");

    cy.get(".govuk-label").contains("Approval number (if applicable)");
    cy.get(".govuk-hint").contains(
      "If the storage facility has an approval number enter it here. For example, UK/ABC/001, 1 UK 22028 or TSF001."
    );

    cy.get(".govuk-radios").should("be.visible");
    cy.get('input[name="facilityStorage"][type="radio"]').should("have.length", 3);
    cy.get('input[name="facilityStorage"][type="checkbox"]').should("not.exist");
    cy.get('label[for="storageFacilities-facilityStorage"]').click();
    cy.get("#storageFacilities-facilityStorage").should("be.checked");
    cy.get(".govuk-radios").contains("Chilled");
    cy.get(".govuk-radios").contains("Frozen");
    cy.get(".govuk-radios").contains("Other");
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");

    cy.get("#backToProgress").should("be.visible").should("have.attr", "href", progressUrl);
  });

  it("should show MDM address lines without the country for a matched storage facility", () => {
    cy.visit(addStorageApprovalUrl, { qs: { testCaseId: TestCaseId.SDAddStorageApprovalFullMdmAddress } });

    cy.get('[data-testid="facility-summary"]').should(
      "contain.text",
      "Storage facility addressDFDS Logistics Scotland AberdeenApproval number: AA 220Unit 8 Peterseat Drive, Altens, AberdeenAberdeenAB12 3HT"
    );
    cy.get('[data-testid="facility-summary"]').should("not.contain.text", "United Kingdom");
  });

  it("saves the registry locality for DFDS instead of reporting a missing town", () => {
    cy.visit(addStorageApprovalUrl, {
      qs: { testCaseId: TestCaseId.SDAddStorageApprovalFullMdmAddress, disableScripts: true },
    });
    cy.get('input[name="facilityArrivalDateDay"]').type("09");
    cy.get('input[name="facilityArrivalDateMonth"]').type("01");
    cy.get('input[name="facilityArrivalDateYear"]').type("2024");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();
    cy.location("pathname").should("eq", storageFacilityUrl);
  });

  it("should redirect to progress page", () => {
    cy.get("#backToProgress").click();
    cy.url().should("include", "/progress");
  });

  it("should show an error when the storage facility name is blank", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalNameError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });

    cy.get('[data-testid="facility-summary"]').contains("MMO, LANCASTER HOUSE, HAMPSHIRE COURT").should("be.visible");
    cy.get("#storageFacilities-facilityName").should("have.value", "");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();

    cy.contains(".govuk-error-summary a", "Enter the facility name")
      .should("be.visible")
      .and("have.attr", "href", "#storageFacilities-facilityName");
    cy.get("#storageFacilities-facilityName-error").should("be.visible");
    cy.get("#storageFacilities-facilityName").should("have.class", "govuk-input--error");
  });

  it("should show the updated town or city error without adding a town input", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalTownError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });

    cy.get('[data-testid="facility-summary"]').should("be.visible");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();

    cy.focused().should("have.id", "errorIsland");
    cy.contains(".govuk-error-summary a", "This address is missing a town or city. Select a different address.")
      .should("be.visible")
      .and("have.attr", "href", "#storageFacilities-facilityTownCity");
    cy.get("#storageFacilities-facilityTownCity-error").should("not.exist");
    cy.get("#storageFacilities-facilityTownCity").should("contain.text", "Storage facility address");
    cy.get("input[name='facilityTownCity']").should("not.exist");
  });

  it("should show the updated town or city error in Welsh", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalTownError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams, lng: "cy" } });

    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();

    cy.contains(".govuk-error-summary a", "Mae tref neu ddinas ar goll o'r cyfeiriad hwn. Dewiswch gyfeiriad gwahanol.")
      .should("be.visible")
      .and("have.attr", "href", "#storageFacilities-facilityTownCity");
  });
});

describe("Add Storage Facility Approval - Complete", () => {
  it("should save and redirect to storage facility hub page on clicking save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalComplete,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });

    cy.get("#storageFacilities-facilityName").clear();
    cy.get("#storageFacilities-facilityName").type("Updated storage facility");
    cy.get("#storageFacilities-facilityApproval").type("UK/ABC/001");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", storageFacilityUrl);
  });

  it("should save and redirect to check your information page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalComplete,
    };
    cy.visit(addStorageApprovalUrl + `?nextUri=${checkYourInformationUrl}`, { qs: { ...testParams } });
    cy.get(`[data-testid="save-and-continue"]`).click();
    cy.url().should("include", "/check-your-information");
  });
});

describe("Add Storage Facility Approval - Error (Max Length)", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
  });

  it("should show approval number max length validation error on save and continue", () => {
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", "Error:There is a problem");
    cy.contains("a", /Approval number must not exceed 50 characters$/)
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-facilityApproval");
    cy.get(".govuk-error-summary").should("be.visible");
  });
});

describe("Add Storage Facility Approval - Max Length Save as Draft", () => {
  it("should save successfully when approval number exceeds 50 characters on save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalMaxLengthSaveAsDraft,
    };
    const longApprovalNumber = "A".repeat(60);
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.get("#storageFacilities-facilityApproval").clear();
    cy.get("#storageFacilities-facilityApproval").type(longApprovalNumber);
    cy.get("#storageFacilities-facilityStorage").check();

    // Save as draft should not show validation error despite exceeding max length
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "create-non-manipulation-document/non-manipulation-documents");

    // Verify no error summary was shown
    cy.get(".govuk-error-summary").should("not.exist");
  });
});

describe("Add Storage Facility Approval - Invalid Characters", () => {
  it("should show invalid characters validation error on save and continue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalInvalidCharactersError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.get("#storageFacilities-facilityApproval").type("UK/ABC/001@#$");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", "Error:There is a problem");
    cy.contains(
      "a",
      /Approval number must only contain letters, numbers, hyphens, full stops, forward slashes and spaces$/
    )
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-facilityApproval");
    cy.get(".govuk-error-summary").should("be.visible");
  });
});

describe("Add Storage Facility Approval - Invalid Characters Save as Draft", () => {
  it("should save successfully when approval number contains invalid characters on save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalInvalidCharactersSaveAsDraft,
    };
    const invalidApprovalNumber = "UK/ABC/001@#$";
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.get("#storageFacilities-facilityApproval").clear();
    cy.get("#storageFacilities-facilityApproval").type(invalidApprovalNumber);
    cy.get("#frozen").check();

    // Save as draft should not show validation error despite invalid characters
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "create-non-manipulation-document/non-manipulation-documents");

    // Verify no error summary was shown
    cy.get(".govuk-error-summary").should("not.exist");
  });
});

describe("Add Storage Facility Approval - How product is stored error", () => {
  it("should show an error message when the product stored radio button is not selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageProductStorageError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", "Error:There is a problem");
    cy.contains("a", /Select how the product was stored$/)
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-facilityStorage");
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get("#storageFacilities-facilityStorage-error")
      .should("be.visible")
      .contains("Select how the product was stored");
  });
});

describe("Add Storage Facility Approval - Welsh Translations", () => {
  it("should display Welsh translations when language is set to Welsh", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams, lng: "cy" } });

    cy.get(".govuk-heading-xl").should("exist");
    cy.get(".govuk-label").contains("Rhif cymeradwyo");

    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", "Gwall:Mae yna broblem");
    cy.contains("a", /Ni chaiff rhif y gymeradwyaeth fod yn fwy na 50 o gymeriadau$/)
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-facilityApproval");
  });

  it("should display Welsh invalid characters error message", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalInvalidCharactersError,
      lng: "cy",
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.get("#storageFacilities-facilityApproval").type("UK/ABC/001@#$");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains("h2", "Gwall:Mae yna broblem");
    cy.contains(
      "a",
      /Rhaid i rif y gymeradwyaeth gynnwys llythrennau, rhifau, cysylltnodau, atalnodau llawn, blaenslaesau a bylchau yn unig$/
    )
      .should("be.visible")
      .should("have.attr", "href", "#storageFacilities-facilityApproval");
  });
});

describe("Add Storage Facility Approval - Non JavaScript", () => {
  it("should work correctly without JavaScript enabled", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalNoJs,
      disableScripts: true,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });

    cy.get(".govuk-heading-xl").contains("Add storage facility details");
    cy.get('input[name="facilityArrivalDateDay"]').type("17");
    cy.get('input[name="facilityArrivalDateMonth"]').type("09");
    cy.get('input[name="facilityArrivalDateYear"]').type("2025");
    cy.get("#storageFacilities-facilityApproval").type("UK/ABC/001");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/how-does-the-consignment-leave-the-uk");
  });
});

describe("Add Storage Facility Approval - Forbidden", () => {
  it("should redirect to forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApprovalForbidden,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Storage Facility Approval - Arrival date validation", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageApproval,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
  });

  it("should show the arrival date error first, ahead of the storage type error, and focus the Day field", () => {
    cy.get("[data-testid=save-and-continue]").click();

    cy.get(".govuk-error-summary li")
      .first()
      .should("contain", "Arrival date must be a real date")
      .find("a")
      .should("have.attr", "href", "#storageFacilities-facilityArrivalDate");
    cy.contains(".govuk-error-summary a", "Select how the product was stored").should("be.visible");

    cy.contains(".govuk-error-summary a", "Arrival date must be a real date").click();
    // scrollToId focuses the target after a short setTimeout - cy.focused()+should retries
    // automatically until that happens, instead of waiting a fixed amount of time.
    cy.focused().should("have.id", "storageFacilities-facilityArrivalDate");
  });

  it("should show an error when year 0000 is entered", () => {
    cy.get('input[name="facilityArrivalDateDay"]').type("01");
    cy.get('input[name="facilityArrivalDateMonth"]').type("01");
    cy.get('input[name="facilityArrivalDateYear"]').type("0000");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();

    cy.contains("Arrival date must be a real date").should("be.visible");
    cy.get(".govuk-error-summary").should("be.visible");
  });

  it("rejects an arrival earlier than the arrival transport departure date", () => {
    cy.get('input[name="facilityArrivalDateDay"]').type("01");
    cy.get('input[name="facilityArrivalDateMonth"]').type("11");
    cy.get('input[name="facilityArrivalDateYear"]').type("1111");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();
    cy.get(".govuk-error-summary a[href='#storageFacilities-facilityArrivalDate']").should("be.visible");
    cy.location("pathname").should("eq", addStorageApprovalUrl);
  });

  it("allows an arrival on the arrival transport departure date", () => {
    cy.visit(addStorageApprovalUrl, {
      qs: { testCaseId: TestCaseId.SDAddStorageApproval, disableScripts: true },
    });
    cy.get('input[name="facilityArrivalDateDay"]').type("09");
    cy.get('input[name="facilityArrivalDateMonth"]').type("01");
    cy.get('input[name="facilityArrivalDateYear"]').type("2024");
    cy.get("#storageFacilities-facilityStorage").check();
    cy.get("[data-testid=save-and-continue]").click();
    cy.location("pathname").should("eq", storageFacilityUrl);
  });
});

describe("Add Storage Facility Approval: save as draft retains valid fields", () => {
  it("should redirect to dashboard without error when save as draft is clicked with invalid fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityDetailsSaveAsDraftWithErrors,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should redirect to dashboard and null out arrival date when only arrival date is invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityDetailsSaveAsDraftWithArrivalDateError,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should redirect to dashboard when no validation errors on save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddStorageFacilityDetailsSaveAsDraftNoErrors,
    };
    cy.visit(addStorageApprovalUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });
});
