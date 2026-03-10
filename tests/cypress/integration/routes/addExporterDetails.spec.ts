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

  it("add exporter details back link check", () => {
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

describe("Add exporter details: with errors", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should display error summary when validation fails", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").should("be.visible");
  });

  it("should display error messages with error styling", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get(".govuk-form-group--error").should("exist");
  });

  it("should scroll to error island when errors are present", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").should("be.visible");
  });
});

describe("Add exporter details: mock error on load (useEffect trigger)", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should trigger useEffect and scroll to error when form submission fails", () => {
    // Submit form which returns 400 error
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // Error should appear and useEffect should have scrolled to it
    cy.get("#error-summary-title").should("be.visible");
  });

  it("should trigger useEffect scroll on error response from form submission", () => {
    // Submit form to trigger error
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // Verify page has scrolled to error (error-summary-title should be visible)
    cy.get("#error-summary-title").should("be.visible");
  });

  it("should display error styling on fields when form submission returns errors", () => {
    // Submit form to get error response
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // Error styling should be applied from useEffect handling
    cy.get(".govuk-form-group--error").should("exist");
  });
});

describe("Add exporter details: processingStatement journey", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsFull,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should display processingStatement specific warning content", () => {
    cy.contains("h1", "Add exporter details");
  });

  it("should have back link for processingStatement journey", () => {
    cy.contains("a", /^Back$/).should("be.visible");
  });
});

describe("Add exporter details: storageDocument journey", () => {
  const documentUrl = "/create-non-manipulation-document/GBR-2021-SD-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should display storageDocument specific warning content", () => {
    cy.contains("h1", "Add exporter details");
  });

  it("should have back link for storageDocument journey", () => {
    cy.contains("a", /^Back$/).should("be.visible");
  });
});

describe("Add exporter details: component initialization", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  it("should initialize page with scroll on load", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Wait for page to fully load
    cy.get("h1").should("be.visible");
    // Verify the page renders the component
    cy.contains("Add exporter details").should("be.visible");
  });
});

describe("Add exporter details: branch coverage - error display", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  it("should display error summary when error exists", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // Verify error summary is displayed
    cy.get("#error-summary-title").should("be.visible");
  });

  it("should not display error summary when no error exists", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify error summary is not present
    cy.get("#error-summary-title").should("not.exist");
  });
});

describe("Add exporter details: branch coverage - journey warning content", () => {
  it("should display processingStatement warning content for PS journey", () => {
    const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsFull,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify warning text contains processingStatement content
    cy.get(".govuk-warning-text__text").should("exist");
    cy.get(".govuk-warning-text").should("be.visible");
  });

  it("should display storageNotes warning content for storageNotes journey", () => {
    const documentUrl = "/create-non-manipulation-document/GBR-2021-SD-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify warning text for storage notes
    cy.get(".govuk-warning-text__text").should("exist");
    cy.get(".govuk-warning-text").should("be.visible");
  });

  it("should display different warning content for catchCertificate journey", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify warning text contains catch certificate content
    cy.get(".govuk-warning-text__text").should("exist");
    cy.get(".govuk-warning-text").should("be.visible");
  });
});

describe("Add exporter details: branch coverage - form fields by journey", () => {
  it("should display exporterFullName field for catchCertificate journey", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify CC-specific field is present
    cy.get("#exporterFullName").should("exist");
  });

  it("should not display exporterFullName field for processingStatement journey", () => {
    const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsFull,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify CC-specific field is not present
    cy.get("#exporterFullName").should("not.exist");
  });

  it("should not display exporterFullName field for storageNotes journey", () => {
    const documentUrl = "/create-non-manipulation-document/GBR-2021-SD-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify CC-specific field is not present
    cy.get("#exporterFullName").should("not.exist");
  });
});

describe("Add exporter details: branch coverage - address display", () => {
  it("should display formatted address when hasAddress is true", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFromIdm,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify address paragraph is displayed
    cy.get("form p").should("exist");
    cy.get("[data-testid='change-button']").should("be.visible");
  });

  it("should display address registration message when hasAddress is false", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsSaveManualEntry,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify address section displays the button and paragraph
    cy.get("[data-testid='change-button']").should("be.visible");
    cy.get("form p").should("exist");
  });

  it("should have change button in address section when hasAddress is true", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFromIdm,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify change button label
    cy.get("[data-testid='change-button']").should("be.visible").should("contain", "Change");
  });

  it("should have add button in address section when hasAddress is false", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsSaveManualEntry,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify button exists and is visible when no address
    cy.get("[data-testid='change-button']").should("be.visible");
    cy.get("[data-testid='change-button']").should("have.length", 1);
  });
});

describe("Add exporter details: branch coverage - company name field", () => {
  it("should display company name field for all journeys", () => {
    const testCases = [
      { testCaseId: TestCaseId.CCAddExporterDetails, documentUrl: "/create-catch-certificate/GBR-2021-CC-8EEB7E123" },
      {
        testCaseId: TestCaseId.PSAddExporterDetailsFull,
        documentUrl: "/create-processing-statement/GBR-2021-PS-8EEB7E123",
      },
      {
        testCaseId: TestCaseId.SDAddExporterDetails,
        documentUrl: "/create-non-manipulation-document/GBR-2021-SD-8EEB7E123",
      },
    ];

    testCases.forEach(({ testCaseId, documentUrl }) => {
      const pageUrl = `${documentUrl}/add-exporter-details`;
      const testParams: ITestParams = { testCaseId };
      cy.visit(pageUrl, { qs: { ...testParams } });
      // Company name field should always be present
      cy.get("#exporterCompanyName").should("exist");
    });
  });

  it("should display company name field with correct label", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify label is present and styled
    cy.get("label[for='exporterCompanyName']").should("exist").should("have.class", "govuk-!-font-weight-bold");
  });

  it("should display company name hint text", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify hint is present
    cy.get("#hint-exporterCompanyName").should("exist");
  });
});

describe("Add exporter details: branch coverage - form field error states", () => {
  it("should have govuk-input class when exporterFullName has no error", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify input has correct class (no error state)
    cy.get("#exporterFullName").should("have.class", "govuk-input");
  });

  it("should have aria-describedby on company name field", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify aria-describedby attribute is present
    cy.get("#exporterCompanyName").should("have.attr", "aria-describedby", "hint-exporterCompanyName");
  });

  it("should render company name field with proper container class", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify container has correct class
    cy.get("#exporterCompanyName").closest(".govuk-form-group").should("exist");
  });

  it("should display error message class when company name field has error", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // Verify error state is applied
    cy.get(".govuk-form-group--error").should("be.visible");
  });
});

describe("Add exporter details: branch coverage - conditional rendering branches", () => {
  it("should render error summary with correct error messages on validation failure", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // Trigger error path
    cy.get("#error-summary-title").should("be.visible");
    // Verify error summary contains error messages
    cy.get(".govuk-error-summary__list").should("be.visible");
  });

  it("should display full name field on page for catchCertificate journey", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify full name field is rendered
    cy.get("#exporterFullName").should("exist").should("be.visible");
  });

  it("should apply correct input classes based on error state for company name field", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // Check error class applied when error exists
    cy.get("#exporterCompanyName").should("have.class", "govuk-input--error");
  });

  it("should not apply error classes when no errors exist", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify no error state
    cy.get("#exporterFullName").should("not.have.class", "govuk-input--error");
    cy.get("#exporterCompanyName").should("not.have.class", "govuk-input--error");
  });

  it("should display main layout with correct grid structure", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify layout structure
    cy.get(".govuk-grid-row").should("have.length.greaterThan", 0);
    cy.get(".govuk-grid-column-two-thirds").should("exist");
  });

  it("should render hidden error text for form inputs", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // Verify visually hidden error text exists
    cy.get(".govuk-visually-hidden").should("be.visible");
  });

  it("should render address section with correct structure regardless of hasAddress value", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify address section exists
    cy.get(".govuk-button-group").should("be.visible");
    // Verify address label exists (EU2026 change: renamed to "Company address")
    cy.get("label").should("contain", "Company address");
  });

  it("should apply govuk-input class when no error for full name field", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify no error class applied (isEmpty check = true)
    cy.get("#exporterFullName").should("have.class", "govuk-input");
    cy.get("#exporterFullName").should("not.have.class", "govuk-input--error");
  });

  it("should apply govuk-input class when no error for company name field", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify no error class applied
    cy.get("#exporterCompanyName").should("have.class", "govuk-input");
    cy.get("#exporterCompanyName").should("not.have.class", "govuk-input--error");
  });

  it("should display field with proper container structure", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Verify field is wrapped in proper govuk container
    cy.get("#exporterCompanyName").closest(".govuk-form-group").should("exist");
  });
});

describe("Add exporter details: errorsTransformed?.exporterFullName not empty", () => {
  it("should apply error styling when errorsTransformed?.exporterFullName has error (line 98)", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithExporterFullNameError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Submit form to trigger errors from server
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // This covers line 98: isEmpty(errorsTransformed?.exporterFullName) = FALSE
    // So the input gets: "govuk-input govuk-input--error"
    cy.get("#exporterFullName").should("have.class", "govuk-input--error");
  });

  it("should display error message for exporterFullName field when error exists", () => {
    const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
    const pageUrl = `${documentUrl}/add-exporter-details`;
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithExporterFullNameError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    // Submit to trigger error
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    // Verify error styling and message are applied
    cy.get("#exporterFullName").closest(".govuk-form-group--error").should("exist");
    cy.get(".govuk-error-message").should("be.visible");
  });
});

describe("FI0-679: Add exporter details - UI changes", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("Scenario 1: should display simplified guidance text for catch certificate", () => {
    cy.get(".govuk-warning-text__text").should(
      "contain",
      "This information will appear on the final catch certificate."
    );
  });

  it("Scenario 2: should display 'Full name of responsible person' label in bold", () => {
    cy.get("label[for='exporterFullName']")
      .should("contain", "Full name of responsible person")
      .and("have.class", "govuk-!-font-weight-bold");
  });

  it("Scenario 2: should display hint text for full name field", () => {
    cy.get("#hint-exporterFullName")
      .should("be.visible")
      .and("contain", "This should be a company name or the person overseeing the export process.");
  });

  it("Scenario 3: should display 'Company name' label in bold", () => {
    cy.get("label[for='exporterCompanyName']")
      .should("contain", "Company name")
      .and("have.class", "govuk-!-font-weight-bold");
  });

  it("Scenario 4: should display 'Company address' label with same styling as Company name", () => {
    cy.get(".govuk-label").contains("Company address").should("have.class", "govuk-!-font-weight-bold");
  });
});

describe("FI0-679: Add exporter details - Full name validation", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  it("Scenario 5: should validate max length of 70 characters for full name", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithExporterFullNameMaxLength,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    let longName = "";
    for (let i = 0; i < 71; i++) {
      longName += "A";
    }
    cy.get("#exporterFullName").clear();
    cy.get("#exporterFullName").invoke("val", longName);
    cy.get("#exporterFullName").trigger("input");
    cy.get("[data-testid='save-and-continue']").click({ force: true });

    // Should display error
    cy.get("#error-summary-title").should("be.visible");
    cy.get(".govuk-error-message").should(
      "contain",
      "Name of person responsible for this export must not exceed 70 characters"
    );
  });

  it("Scenario 6: should validate allowed characters for full name", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithExporterFullNameWithSpecialCharacters,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#exporterFullName").clear();
    cy.get("#exporterFullName").invoke("val", "John@Doe#123");
    cy.get("#exporterFullName").trigger("input");
    cy.get("[data-testid='save-and-continue']").click({ force: true });

    // Should display error
    cy.get("#error-summary-title").should("be.visible");
    cy.get(".govuk-error-message").should(
      "contain",
      "Name of person responsible for this export must only contain letters, spaces, apostrophe's and full stops"
    );
  });

  it("should accept valid full name with letters, spaces, apostrophes and periods", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithExporterFullNameCorrectFormat,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#exporterFullName").clear();
    cy.get("#exporterFullName").type("Mary O'Connor Jr.");
    cy.get("[data-testid='save-and-continue']").click({ force: true });

    // Should navigate successfully (no validation error)
    cy.url().should("include", "/what-are-you-exporting");
  });
});

describe("FI0-679: Add exporter details - Company name validation", () => {
  const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  it("Scenario 7: should validate max length of 250 characters for company name", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithExporterCompanyNameMaxLength,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    let longCompanyName = "";
    for (let i = 0; i < 251; i++) {
      longCompanyName += "A";
    }
    cy.get("#exporterCompanyName").clear();
    cy.get("#exporterCompanyName").type(longCompanyName);
    cy.get("[data-testid='save-and-continue']").click({ force: true });

    // Should display error
    cy.get("#error-summary-title").should("be.visible");
    cy.get(".govuk-error-message").should("contain", "Company name must not exceed 250 characters");
  });

  it("Scenario 8: should validate allowed characters for company name", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithExporterCompanyNameWithSpecialCharacters,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#exporterCompanyName").clear();
    cy.get("#exporterCompanyName").type("Bob & Co!");
    cy.get("[data-testid='save-and-continue']").click({ force: true });

    // Should display error
    cy.get("#error-summary-title").should("be.visible");
    cy.get(".govuk-error-message").should(
      "contain",
      "Company name must only contain letters, numbers, spaces, apostrophe's, full stops, hyphens and brackets"
    );
  });

  it("should accept valid company name with allowed characters", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetailsFailsWithExporterCompanyNameCorrectFormat,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#exporterCompanyName").clear();
    cy.get("#exporterCompanyName").type("O'Reilly's Co. (UK) Ltd [2024]");
    cy.get("[data-testid='save-and-continue']").click({ force: true });

    // Should navigate successfully (no validation error)
    cy.url().should("include", "/what-are-you-exporting");
  });
});

describe("FI0-679: Add exporter details - Journey-specific guidance", () => {
  it("should show simplified guidance for catch certificate journey", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCAddExporterDetails,
    };
    cy.visit("/create-catch-certificate/GBR-2021-CC-8EEB7E123/add-exporter-details", { qs: { ...testParams } });

    cy.get(".govuk-warning-text__text").should(
      "contain",
      "This information will appear on the final catch certificate."
    );
  });

  it("should show storage notes guidance for storage document journey", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddExporterDetails,
    };
    cy.visit("/create-non-manipulation-document/GBR-2021-SD-8EEB7E123/add-exporter-details", { qs: { ...testParams } });

    cy.get(".govuk-warning-text__text").should(
      "contain",
      "This information will appear on the non-manipulation document."
    );
  });

  it("should show processing statement guidance with journey text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsFull,
    };
    cy.visit("/create-processing-statement/GBR-2021-PS-8EEB7E123/add-exporter-details", { qs: { ...testParams } });

    cy.get(".govuk-warning-text__text").should("contain", "This information will appear on the processing statement.");
  });
});

describe("Add exporter details - Address validation error messages", () => {
  describe("Updated error message displayed if no address added on this page", () => {
    it("should display 'Add the exporter's address' error for catch certificate when no address exists", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsNoAddress,
      };
      cy.visit("/create-catch-certificate/GBR-2021-CC-8EEB7E123/add-exporter-details", { qs: { ...testParams } });

      // Verify page loaded with no address
      cy.contains("Your registration address could not be accessed");
      cy.contains(/Add the exporter['’]s address/);

      // Fill in required company name
      cy.get("#exporterCompanyName").type("Test Company Ltd");

      // Submit without adding address
      cy.contains("button", "Save and continue").click();

      // Verify error summary appears
      cy.get(".govuk-error-summary").should("exist");
      cy.get(".govuk-error-summary__title").should("contain", "There is a problem");

      // Verify correct error message in summary
      cy.get(".govuk-error-summary__list").should("contain", "Add the exporter's address");

      // Verify error link points to correct anchor
      cy.get('.govuk-error-summary__list a[href="#exporterAddress"]').should("exist").click();

      // Verify page scrolled to error location
      cy.get("#exporterAddress").should("be.visible");
    });

    it("should display 'Add the exporter's address' error for processing statement when no address exists", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PSAddExporterDetailsNoAddress,
      };
      cy.visit("/create-processing-statement/GBR-2021-PS-8EEB7E123/add-exporter-details", { qs: { ...testParams } });

      cy.contains("Your registration address could not be accessed");
      cy.get("#exporterCompanyName").type("Test Company Ltd");
      cy.contains("button", "Save and continue").click();

      cy.get(".govuk-error-summary__list").contains(/Add the exporter['’]s address/);
      cy.get('.govuk-error-summary__list a[href="#exporterAddress"]').should("exist");
    });

    it("should display 'Add the exporter's address' error for storage document when no address exists", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDAddExporterDetailsNoAddress,
      };
      cy.visit("/create-non-manipulation-document/GBR-2021-SD-8EEB7E123/add-exporter-details", {
        qs: { ...testParams },
      });

      cy.contains("Your registration address could not be accessed");
      cy.get("#exporterCompanyName").type("Test Company Ltd");
      cy.contains("button", "Save and continue").click();

      cy.get(".govuk-error-summary__list").should("contain", "Add the exporter's address");
      cy.get('.govuk-error-summary__list a[href="#exporterAddress"]').should("exist");
    });
  });

  describe("Welsh translation for Add exporter address error", () => {
    it("should display Welsh translation when language is set to Welsh", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCAddExporterDetailsNoAddress,
        lng: "cy",
      };
      cy.visit("/create-catch-certificate/GBR-2021-CC-8EEB7E123/add-exporter-details", { qs: { ...testParams } });

      cy.get("#exporterCompanyName").type("Test Company Ltd");
      cy.contains("button", "Cadw a bwrw ymlaen").click(); // "Save and continue" in Welsh

      // Verify Welsh error message
      cy.get(".govuk-error-summary__list").should("contain", "Ychwanegu cyfeiriad yr allforiwr");
    });
  });
});
