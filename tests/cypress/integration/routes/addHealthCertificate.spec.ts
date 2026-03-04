import { type ITestParams, TestCaseId } from "~/types";

const psDetailsUrl = `create-processing-statement/GBR-2022-PS-3FE1169D1/add-health-certificate`;
const certificateUrl = `/create-processing-statement/GBR-2022-PS-3FE1169D1`;

describe("Add Health Certificate Details", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificate,
    };
    cy.visit(psDetailsUrl, { qs: { ...testParams } });
  });

  it("should render processing add health certificate page", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-processing-plant-address`);
    cy.get(".govuk-heading-xl").contains("Add health certificate details");
    cy.contains("button", "Save and continue").should("be.visible");
    cy.contains("button", "Save as draft").should("be.visible");
  });

  it("will have a progress link to the progress page", () => {
    cy.contains("a", "Back to your progress").should("be.visible");
    cy.contains("a", "Back to your progress")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/progress`);
  });
});

describe("Add Health Certificate Details: nextUri", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificateHappyPath,
    };
    cy.visit(psDetailsUrl + `?nextUri=abc`, { qs: { ...testParams } });
  });
  it("should have a nextUri", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "abc");
  });
});

describe("Add Health Certificate Details: No certificate date", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificateNoCertificateDate,
    };
    cy.visit(psDetailsUrl, { qs: { ...testParams } });
  });
  it("should pass certificatedate as null", () => {
    cy.get("#healthCertificateDate").should("be.visible");
  });
});

describe("Add Health Certificate, Happy Path - Valid Date", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-health-certificate`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificateHappyPath,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should navigate to what-export-destination", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/what-export-destination");
  });
});

describe("Add Health Certificate - save as draft", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-health-certificate`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificateHappyPath,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should save as draft and redirect to processing-statement", () => {
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  it("should navigate to forbidden add health certificate page:unauthorised access", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificateHappyPathForbidden,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add Health Certificate, bad data show errors", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-health-certificate`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificateError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should be able to see relevant errors", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").should("be.visible");
  });
});

describe("Add Health Certificate - invalid year in date picker", () => {
  const pageUrl = `create-processing-statement/GBR-2022-PS-3FE1169D1/add-health-certificate`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificate,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should show an error when year 0000 is entered in the date picker", () => {
    cy.get('input[name="healthCertificateDateDay"]').clear();
    cy.get('input[name="healthCertificateDateDay"]').type("01");
    cy.get('input[name="healthCertificateDateMonth"]').clear();
    cy.get('input[name="healthCertificateDateMonth"]').type("01");
    cy.get('input[name="healthCertificateDateYear"]').clear();
    cy.get('input[name="healthCertificateDateYear"]').type("0000");
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "/add-health-certificate");
    cy.contains("Enter a real date in the dd/mm/yyyy format").should("be.visible");
  });
});

describe("Add Health Certificate: save as draft retains valid fields", () => {
  it("should redirect to dashboard without error when save as draft is clicked with invalid fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificateSaveAsDraftWithErrors,
    };
    cy.visit(psDetailsUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  it("should redirect to dashboard when no validation errors on save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddHealthCertificateSaveAsDraftNoErrors,
    };
    cy.visit(psDetailsUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});
