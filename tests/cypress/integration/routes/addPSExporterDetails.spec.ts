import { type ITestParams, TestCaseId } from "~/types";

describe("PS: add exporter details page", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsEmpty,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should render successfully & change address button works", () => {
    cy.contains("a", /^Back$/).should("have.attr", "href", `${documentUrl}/add-your-reference`);
    cy.contains("h1", "Add exporter details");
    cy.get("[data-testid='change-button']").click({ force: true });
    cy.url().should("include", "/what-exporters-address");
  });

  it("should display EU2026 information text with exclamation icon", () => {
    // Check for warning text container
    cy.get(".govuk-warning-text").should("be.visible");

    // Check for exclamation icon
    cy.get(".govuk-warning-text__icon").should("contain", "!");

    // Check for the specific processing statement information text
    cy.get(".govuk-warning-text__text").should("contain", "This information will appear on the processing statement.");
  });

  it("should display 'Company name' label in bold", () => {
    cy.contains("label", "Company name").should("have.class", "govuk-!-font-weight-bold");
  });

  it("should display 'Company address' label instead of 'Address'", () => {
    cy.contains("label", "Company address").should("exist").and("have.class", "govuk-!-font-weight-bold");
  });
});

describe("PS: add exporter details page - Welsh translations", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsEmpty,
    };
    // Visit with Welsh language
    cy.visit(pageUrl, { qs: { ...testParams, lng: "cy" } });
  });

  it("should display Welsh translation for information text", () => {
    cy.get(".govuk-warning-text__text").should("contain", "Bydd yr wybodaeth yma yn ymddangos ar y datganiad prosesu.");
  });

  it("should display Welsh translation for 'Company address' label", () => {
    cy.contains("label", "Cyfeiriad y cwmni").should("exist").and("have.class", "govuk-!-font-weight-bold");
  });
});

describe("PS: add exporter details - happy path", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsFull,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should navigate to add consignment details", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/add-consignment-details");
  });
});

describe("PS: add exporter details - save as draft", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsSaveAsDraft,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should save as draft", () => {
    cy.get("[data-testid='save-draft-button'").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});

describe("PS: add exporter details - forbidden", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsFailsWith403,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should navigate to forbidden page", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/forbidden");
  });
});

describe("PS: add exporter details - errors", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsFailsWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should show errors", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").should("be.visible");
  });
});

describe("PS: add exporter details - forbidden", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  it("should navigate to forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetails403,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});
