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
