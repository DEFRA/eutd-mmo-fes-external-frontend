import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-processing-statement/GBR-2023-PS-DE53D6E7C";
const checkYourInformationUrl = `${documentUrl}/check-your-information`;
const whatExportDestinationUrl = `${documentUrl}/what-export-destination`;

describe("Check Your Information (Summary) page: UI", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformation,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct back link", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", whatExportDestinationUrl);
  });

  it("should contain the required heading", () => {
    cy.contains("dt", "Document number");
    cy.contains("dt", "Company name");
    cy.contains("dt", "Company address");
    cy.contains("dt", "Commodity code");
    cy.contains("dt", "Product description");
    cy.contains("dt", "Health certificate number");
    cy.contains("dt", "Health certificate date");
    cy.contains("dt", "Species");
    cy.contains("dt", "Catch certificate number");
    cy.contains("dt", "Total weight landed in kg");
    cy.contains("dt", "Export weight in kg (before processing)");
    cy.contains("dt", "Export weight in kg (after processing)");
    cy.contains("dt", "Person responsible for this consignment");
    cy.contains("dt", "Plant approval number");
    cy.contains("dt", "Plant name");
    cy.contains("dt", "Address");
    cy.contains("dt", "What is the export destination?");
  });

  it("should contain the required data", () => {
    cy.contains("dd", "GBR-2023-PS-DE53D6E7C");
    cy.contains("dd", "tesrt");
    cy.contains("dd", "MMO, LANCASTER HOUSE, HAMPSHIRE COURT");
    cy.contains("dd", "03011100");
    cy.contains("dd", "Herring fillets and Atlantic cod fishcakes");
    cy.contains("dd", "20/2/123456");
    cy.contains("dd", "30/06/2022");
    cy.contains("dd", "Monopenchelys acuta (MMA)");
    cy.contains("dd", "8");
    cy.contains("dd", "9kg");
    cy.contains("dd", "Test data");
    cy.contains("dd", "Approval Number");
    cy.contains("dd", "Test Plantname");
    cy.contains("dd", "Test Address One");
    cy.contains("dd", "Nicaragua");
  });

  it("should contain all the required change tags and urls", () => {
    cy.get("#exporterCompanyNameChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-exporter-details");

    cy.get("#exporterDetailsChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-exporter-details");

    cy.get("#productCommodityCodeChangeLink-0")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-consignment-detail");

    cy.get("#productDescriptionChangeLink-0")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-consignment-detail");

    cy.get("#healthCertificateNumberChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-health-certificate");

    cy.get("#healthCertificateDateChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-health-certificate");

    cy.get("#species0ChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-catch-type/63979a023fc11363b1071358");

    cy.get("#catchCertificateNumber0ChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and(
        "include",
        "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-catch-details/AGH/0?catchType=uk&pageNo=1"
      );

    cy.get("#totalWeightLanded0ChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and(
        "include",
        "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-catch-details/AGH/0?catchType=uk&pageNo=1"
      );

    cy.get("#exportWeightBeforeProcessing0ChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and(
        "include",
        "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-catch-details/AGH/0?catchType=uk&pageNo=1"
      );

    cy.get("#exportWeightAfterProcessing0ChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and(
        "include",
        "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-catch-details/AGH/0?catchType=uk&pageNo=1"
      );

    cy.get("#personResponsibleForConsignmentChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-processing-plant-details");

    cy.get("#plantApprovalNumberChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-processing-plant-details");

    cy.get("#plantNameChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-processing-plant-address");

    cy.get("#plantAddressChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-processing-plant-address");

    cy.get("#exportToChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/what-export-destination");
  });
});

describe("Check Your Information page: updated exporter", () => {
  it("should load the page with updated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationUpdatedExporter,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });
});

describe("Check Your Information (Summary) page: Validation", () => {
  it("should error and show a validation error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationValidationError,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

    cy.get("[data-testid=create-ps-button]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^The catch certificate entered does not exist, ensure you have entered a valid catch certificate number$/
    ).should("be.visible");
  });

  it("should error and show a health validation error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationHealthCertificateValidationError,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

    cy.get("[data-testid=create-ps-button]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^You cannot submit this Processing Statement, the Health Certificate date selected must be today or in the past.$/
    ).should("be.visible");
  });

  it("should redirect user to processing statement created page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationValidationSuccess,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

    cy.get("[data-testid=create-ps-button]").click({ force: true });
    cy.url().should("include", "/processing-statement-created");
  });

  it("should navigate to forbidden page plant address page:unauthorised access", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationUnauthorised,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Check Your Information (Summary) page when Was the catch certificate issued in the UK: UI", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationCCUK,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct back link", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", whatExportDestinationUrl);
  });

  it("should contain the required heading", () => {
    cy.contains("dt", "Document number");
    cy.contains("dt", "Company name");
    cy.contains("dt", "Company address");
    cy.contains("dt", "Description and commodity code");
    cy.contains("dt", "Health certificate number");
    cy.contains("dt", "Health certificate date");
    cy.contains("dt", "Species");
    cy.contains("dt", "Was the catch certificate issued in the UK");
    cy.contains("dt", "Catch certificate number");
    cy.contains("dt", "Total weight landed in kg");
    cy.contains("dt", "Export weight in kg (before processing)");
    cy.contains("dt", "Export weight in kg (after processing)");
    cy.contains("dt", "Person responsible for this consignment");
    cy.contains("dt", "Plant approval number");
    cy.contains("dt", "Plant name");
    cy.contains("dt", "Address");
    cy.contains("dt", "What is the export destination?");
  });

  it("should contain the required data", () => {
    cy.contains("dd", "GBR-2023-PS-DE53D6E7C");
    cy.contains("dd", "tesrt");
    cy.contains("dd", "MMO, LANCASTER HOUSE, HAMPSHIRE COURT");
    cy.contains("dd", "Herring fillets (16041210) and Atlantic cod fishcakes (16041992)");
    cy.contains("dd", "20/2/123456");
    cy.contains("dd", "30/06/2022");
    cy.contains("dd", "Monopenchelys acuta (MMA)");
    cy.contains("dd", "8");
    cy.contains("dd", "9kg");
    cy.contains("dd", "Test data");
    cy.contains("dd", "Approval Number");
    cy.contains("dd", "Test Plantname");
    cy.contains("dd", "Test Address One");
    cy.contains("dd", "Nicaragua");
  });
});

describe("Check Your Information (Summary) page: page guard", () => {
  it("should redirect to the progress page for incomplete processing statement details", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationPageGuardCase,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.url().should("include", "/progress");
  });

  it("should redirect to the progress page for incomplete exporter details", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationPageGuardCaseNoExporter,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.url().should("include", "/progress");
  });
});

describe("Check Your Information (Summary) page: with product descriptions", () => {
  it("should render check your formation page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationProductDescriptions,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

    cy.contains("dt", "Description and commodity code");
    cy.contains("dd", "Herring fillets (16041210) and Atlantic cod fishcakes (16041992)");
    cy.get("#consignmentDescriptionChangeLink")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/create-processing-statement/GBR-2023-PS-DE53D6E7C/add-consignment-detail");

    cy.url().should("include", "/check-your-information");
  });

  it("should render progress page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationPageGuardProductDescriptions,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.url().should("include", "/progress");
  });
});
