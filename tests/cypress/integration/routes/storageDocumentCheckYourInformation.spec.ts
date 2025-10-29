import { type ITestParams, TestCaseId } from "~/types";

const sdPageUrl = "create-storage-document/GBR-2022-SD-F71D98A30/check-your-information";

describe("SD: check-your-information page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformation,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should contain the required heading", () => {
    cy.contains("dt", "Document number");
    cy.contains("dt", "Company name");
    cy.contains("dt", "Company address");
    cy.contains("div", "Consignment item");
    cy.contains("dt", "Species");
    cy.contains("dt", "Commodity code");
    cy.contains("dt", "Entry document issued in the UK");
    cy.contains("dt", "Entry document reference");
    cy.contains("dt", "UK entry: Date");
    cy.contains("dt", "UK entry: Place");
    cy.contains("dt", "UK entry: Transport details");
    cy.contains("dt", "UK entry: Weight on document");
    cy.contains("dt", "Storage facility name");
    cy.contains("dt", "Storage facility address");
    cy.contains("dt", "Transport type");
    cy.contains("dt", "Consignment destination");
  });

  it("should contain the required data", () => {
    cy.contains("dd", "GBR-2022-SD-F71D98A30");
    cy.contains("dd", "tesrt");
    cy.contains("dd", "MO, LANCASTER HOUSE, HAMPSHIRE COURT");
    cy.contains("dd", "03011100");
    cy.contains("dd", "3 May 2023");
    cy.contains("dd", "dover");
    cy.contains("dd", "43");
    cy.contains("dd", "10");
  });

  it("should contain change links with href", () => {
    cy.get("a")
      .contains("Change")
      .each(($el) => {
        cy.wrap($el).should("have.attr", "href").and("not.be.empty");
      });
  });

  it("should have a change link for each summary row", () => {
    cy.get("a")
      .contains("Change")
      .then(($links) => {
        expect($links.length).to.be.greaterThan(0);
      });
  });
});

describe("SD: check-your-information page mandetory", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationMandatory,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should contain the required heading", () => {
    cy.contains("dt", "Document number");
    cy.contains("dt", "Company name");
    cy.contains("dt", "Company address");
    cy.contains("div", "Consignment item");
    cy.contains("dt", "Species");
    cy.contains("dt", "Commodity code");
    cy.contains("dt", "Export weight");
    cy.contains("dt", "Entry document issued in the UK");
    cy.contains("dt", "Entry document reference");
    cy.contains("dt", "UK entry: Date");
    cy.contains("dt", "UK entry: Place");
    cy.contains("dt", "UK entry: Transport details");
    cy.contains("dt", "UK entry: Weight on document");
    cy.contains("dt", "Storage facility name");
    cy.contains("dt", "Storage facility address");
    cy.contains("dt", "Transport type");
    cy.contains("dt", "Consignment destination");
  });

  it("should contain the required data", () => {
    cy.contains("dd", "GBR-2022-SD-F71D98A30");
    cy.contains("dd", "tesrt");
    cy.contains("dd", "MO, LANCASTER HOUSE, HAMPSHIRE COURT");
    cy.contains("dd", "03011100");
    cy.contains("dd", "10");
    cy.contains("dd", "20");
    cy.contains("dd", "3 May 2023");
    cy.contains("dd", "dover");
    cy.contains("dd", "43");
    cy.contains("dd", "10");
  });
});

describe("SD: check-your-information page transport", () => {
  it("should render the page with train", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationTrain,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should render the page with plain", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationPlane,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });
  it("should render the page with Truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationTruckCmr,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.contains("dd", "Dakota Hill");
  });
});

describe("Check Your Information (Summary) page: document submission", () => {
  it("should redirect user to storage document created page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationValidationSuccess,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=create-sd-button]").click({ force: true });
    cy.url().should("include", "/storage-document-created");
  });
});

describe("Check Your Information (Summary) page: document submission validation error", () => {
  it("should redirect user to storage document created page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationValidationFailure,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=create-sd-button]").click({ force: true });
    cy.url().should("include", "/check-your-information");
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get("a[href='#validationError'").contains("The document entered is no longer valid");
    cy.get(".govuk-error-message").contains("The document entered is no longer valid");
  });
});
