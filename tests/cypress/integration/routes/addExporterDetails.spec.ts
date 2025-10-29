import { type ITestParams, TestCaseId } from "~/types";

describe("Add exporter details page", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("addexporter details back link check", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${documentUrl}/add-your-reference`);
  });

  it("should display correct headings", () => {
    cy.contains("h1", "Add exporter details");
  });

  it("should check for input fields for cc journey", () => {
    cy.get("form").should(($form) => {
      expect($form.find("input[type='text']")).to.have.lengthOf(2);
    });
  });

  it("should click on change button and navigate to what exporter address page", () => {
    cy.get("[data-testid='change-button']").click({ force: true });
    cy.url().should("include", "/what-exporters-address");
  });
});

describe("Add exporter details: Idm", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFromIdm,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("will populate exporter full name from user details", () => {
    cy.get("#exporterFullName").should("have.value", "Automation Tester");
  });

  it("will populate exporter company name from user details", () => {
    cy.get("#exporterCompanyName").should("have.value", "Automation Testing Ltd");
  });
});

describe("Add exporter details on save with idm", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  it("should trigger submit and navigate to what are you exporting page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFromIdm,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/what-are-you-exporting");
  });
});

describe("Add exporter details on save for manual entry", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsSaveManualEntry,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should trigger submit and navigate to what are you exporting page", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/what-are-you-exporting");
  });
});

describe("Add exporter details on save for upload entry", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsSaveUploadEntry,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should trigger submit and navigate to upload file page", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/upload-file");
  });
});

describe("Add exporter details on save for direct landing", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsSaveDirectLanding,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should trigger submit and naviagate to what are you exporting page.", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/what-are-you-exporting");
  });
});

describe("Add exporter details on save as draft clicking", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsSaveAsDraft,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should click on save as draft and should navigate to catch certificates page", () => {
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-catch-certificate/catch-certificate");
  });
});

describe("Add exporter details: page guard", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWith403,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should trigger submit and navigate to forbidden page", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add exporter details: unauthorised access", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  it("should redirect to the forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails403,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });
});
