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

    // Check for the specific processing statement information text (covers line 62 return statement)
    cy.get(".govuk-warning-text__text")
      .should("contain", "This information will appear on the processing statement.")
      .invoke("text")
      .then((text) => {
        // Multiple assertions to ensure full execution path coverage
        expect(text).to.include("This information will appear on the processing statement.");
        expect(text).not.to.include("catch certificate");
        expect(text).not.to.include("non-manipulation");
        expect(text).not.to.include("Add the name and address");
      });
  });

  it("should display 'Company name' label in bold", () => {
    cy.contains("label", "Company name").should("have.class", "govuk-!-font-weight-bold");
  });

  it("should display 'Company address' label instead of 'Address'", () => {
    cy.contains("label", "Company address").should("exist").and("have.class", "govuk-!-font-weight-bold");
  });

  it("should NOT display exporterFullName field for processing statement journey", () => {
    // Verify this field is only shown for catch certificate journey
    cy.get("#exporterFullName").should("not.exist");
  });

  it("should display only the processing statement warning text without generic fallback", () => {
    // Verify the specific processing statement branch (line 60-62) is executed
    cy.get(".govuk-warning-text__text")
      .invoke("text")
      .then((text) => {
        // Should contain the specific PS text
        expect(text).to.include("This information will appear on the processing statement.");
        // Should NOT contain the generic fallback text
        expect(text).to.not.include("Add the name and address of the company");
        // Should NOT contain catch certificate text
        expect(text).to.not.include("final catch certificate");
        // Should NOT contain storage notes text
        expect(text).to.not.include("non-manipulation document");
      });
  });

  it("should execute processingStatement branch in getWarningContent function", () => {
    // Explicitly verify the processing statement-specific warning content is rendered
    // This covers the if (journey === "processingStatement") branch and return statement at line 62
    cy.get(".govuk-warning-text__text")
      .should("be.visible")
      .and("contain", "This information will appear on the processing statement.")
      .then(($el) => {
        const text = $el.text().trim();
        // Verify it's exactly the PS-specific text (no generic fallback)
        expect(text).to.match(/This information will appear on the processing statement\./);
        // Verify NO other journey text appears
        expect(text).not.to.match(/catch certificate|non-manipulation|Add the name and address/i);
      });

    // Force component interaction to ensure full coverage
    cy.get("body").focus();
    cy.get(".govuk-warning-text__text").should("contain", "This information will appear on the processing statement.");
  });
});

describe("getWarningContent function branch coverage - comparing journey types", () => {
  it("should return PS-specific warning text (line 62) distinct from other journeys", () => {
    // Test Processing Statement journey first - this MUST execute line 62
    cy.visit("/create-processing-statement/GBR-2021-PS-8EEB7E123/add-exporter-details", {
      qs: { testCaseId: TestCaseId.PSAddExporterDetailsEmpty },
    });

    // Wait for page to fully render and component to mount
    cy.get(".govuk-warning-text__text").should("be.visible");

    // Multiple assertion styles to trigger coverage
    cy.get(".govuk-warning-text__text").then(($el) => {
      const fullText = $el.text().trim();
      // Assert the exact PS text exists
      expect(fullText).to.contain("This information will appear on the processing statement.");
      // Assert it doesn't contain other journey texts
      expect(fullText).not.to.contain("catch certificate");
      expect(fullText).not.to.contain("non-manipulation");
      // Assert it's not the generic fallback
      expect(fullText).not.to.contain("Add the name and address");
    });

    // Additional check with .should() chain
    cy.get(".govuk-warning-text__text")
      .should("contain", "This information will appear on the processing statement.")
      .and("not.contain", "catch certificate")
      .and("not.contain", "non-manipulation document");

    // Test Catch Certificate journey (different branch)
    cy.visit("/create-catch-certificate/GBR-2021-CC-8EEB7E123/add-exporter-details", {
      qs: { testCaseId: TestCaseId.CCAddExporterDetails },
    });
    cy.get(".govuk-warning-text__text")
      .should("contain", "This information will appear on the final catch certificate.")
      .and("not.contain", "processing statement");

    // Test Storage Document journey (different branch)
    cy.visit("/create-non-manipulation-document/GBR-2021-SD-8EEB7E123/add-exporter-details", {
      qs: { testCaseId: TestCaseId.SDAddExporterDetails },
    });
    cy.get(".govuk-warning-text__text")
      .should("contain", "This information will appear on the non-manipulation document.")
      .and("not.contain", "processing statement")
      .and("not.contain", "catch certificate");
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

  it("should NOT display standalone 'Address' label in Welsh", () => {
    // Ensure the old translation key is not used (should be "Cyfeiriad y cwmni", not just "Cyfeiriad")
    cy.get("label.govuk-label.govuk-\\!-font-weight-bold")
      .invoke("text")
      .should("not.equal", "Cyfeiriad")
      .and("include", "Cyfeiriad y cwmni");
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

describe("PS: add exporter details - save as draft retains valid fields", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;

  it("should redirect to dashboard without error when save as draft is clicked with invalid fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsSaveAsDraftWithErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});

describe("PS: add exporter details - save as draft sets section to INCOMPLETE when invalid fields submitted", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-exporter-details`;
  const progressUrl = `${documentUrl}/progress`;

  it("should show exporter section as INCOMPLETE on progress page after saving draft with invalid company name", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsSaveAsDraftScenario3,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
    cy.visit(progressUrl, { qs: { ...testParams } });
    cy.get("[data-testid='progress-exporter-tag']").should("contain.text", "INCOMPLETE");
  });
});
