import { type ITestParams, TestCaseId } from "~/types";

const certificateUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
const progressUrl = `${certificateUrl}/progress`;

describe("ProgressPage - Cache-Control header", () => {
  it("should return Cache-Control: no-store to prevent stale progress state on back navigation (FI0-11073)", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSIncompleteProgress,
    };
    cy.intercept("GET", progressUrl + "*").as("progressPage");
    cy.visit(progressUrl, { qs: { ...testParams } });
    cy.wait("@progressPage").its("response.headers").should("have.property", "cache-control", "no-store");
  });
});

describe("ProgressPage - Incomplete Application", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSIncompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display a processing statement header", () => {
    cy.contains("a", /^Create a UK processing statement$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-processing-statement/processing-statements");
  });

  it("should display back button and back button should have correct href pointing to processing statement dashboard", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-processing-statement/processing-statements");
  });

  it("should use backUri query parameter when present", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSIncompleteProgress,
    };

    cy.visit(`${progressUrl}?backUri=/create-processing-statement/GBR-2021-PS-8EEB7E123/what-export-destination`, {
      qs: { ...testParams },
    });

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-processing-statement/GBR-2021-PS-8EEB7E123/what-export-destination");
  });

  it("should display the correct headings", () => {
    cy.contains("[data-testid='ps-progress-titling']", "Your Progress");
    cy.contains("[data-testid='ps-progress-heading']", "Processing Statement application: GBR-2021-PS-8EEB7E123");
  });

  it("should display Application incomplete when NOT all required sections have been completed", () => {
    cy.contains("[data-testid='Progress-completed-heading']", "Application incomplete");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 0 of 6 required sections.");
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('OPTIONAL')").should("have.length", 1);
    cy.get("li strong:contains('INCOMPLETE')").should("have.length", 6);
  });

  it("should not render duplicate id attributes in the progress list", () => {
    cy.get(".app-task-list [id]").then(($elements) => {
      const ids = [...$elements].map((element) => element.id).filter(Boolean);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

      cy.wrap(duplicateIds, { log: false }).should("deep.equal", []);
    });
  });

  it("should redirect to the exporter processing statement dashboard", () => {
    cy.get("[data-testid=return-to-dashboard-button]").click();
    cy.url().should("include", "/processing-statements");
  });

  it("should display errors", () => {
    cy.get("[data-testid=continue-button]").click();
    cy.url().should("include", "/progress");
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^You must complete the exporter details section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the product details section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the processing plant ID section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the processing plant address section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the export health certificate section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the export destination section before being able to continue$/).should(
      "be.visible"
    );
  });
});

describe("ProgressPage - Completed Application", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display Application completed when all required sections have been completed", () => {
    cy.contains("[data-testid='Progress-completed-heading']", "Application completed");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 6 of 6 required sections.");
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('COMPLETE')").should("have.length", 6);
  });

  it("should redirect to check-your-information page when click on Check your answers button", () => {
    cy.get('[data-testid="continue-button"]').click();
  });
});

describe("ProgressPage - Completed Application Unauthorised", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCompleteProgressUnauthorised,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should redirect to forbidden page when click on Check your answers button", () => {
    cy.get('[data-testid="continue-button"]').click();
    cy.url().should("contain", "/forbidden");
  });
});

describe("should display the notificationBanner", () => {
  it("first visit copy page then click on green button to navigate progress page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyAllData,
    };
    cy.visit("create-processing-statement/GBR-2022-PS-F71D98A30/copy-this-processing-statement", {
      qs: { ...testParams },
    });
    cy.waitForUiUpdate(500);
    cy.get("#voidOriginal").click();
    cy.get("#copyDocumentAcknowledged").check();
    cy.get('[data-testid="continue"]').click();
    cy.get(".govuk-notification-banner__heading").contains(
      "This draft was created by copying document GBR-2022-PS-F71D98A30. You are reminded that you must not use a processing statememt or data for catches that have already been exported as this is a serious offence and may result in enforcement action being taken."
    );
  });
});

describe("ProgressPage - Back link from copied processing statement", () => {
  it("should point Back to copy screen when no backUri is provided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyAllData,
      disableScripts: true,
    };

    cy.visit("create-processing-statement/GBR-2022-PS-F71D98A30/copy-this-processing-statement", {
      qs: { ...testParams },
    });
    cy.get("#voidOriginal").click();
    cy.get("#copyDocumentAcknowledged").check();
    cy.get('[data-testid="continue"]').click();

    cy.url().then((currentUrl) => {
      const match = currentUrl.match(/\/create-processing-statement\/([^/]+)\/progress/);
      if (!match) {
        throw new Error("new processing statement document number should be present in URL");
      }

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should(
          "have.attr",
          "href",
          "/create-processing-statement/GBR-2022-PS-F71D98A30/copy-this-processing-statement"
        );
    });
  });
});

// FI0-10647: Prevent description-only products in Processing Statements
describe("ProgressPage - FI0-10647 - Description-only Products Validation", () => {
  const certificateUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const progressUrl = `${certificateUrl}/progress`;

  describe("Scenario 1: Block submission with description-only products", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PSProgressWithDescriptionOnlyProduct,
      };
      cy.visit(progressUrl, { qs: { ...testParams } });
    });

    it("should display application completed status", () => {
      cy.contains("[data-testid='Progress-completed-heading']", "Application completed").should("be.visible");
    });

    it("should display error when attempting to continue with description-only products", () => {
      cy.get('[data-testid="continue-button"]').click();
      cy.url().should("include", "/progress");

      // Check for error summary at the top
      cy.contains("h2", /^There is a problem$/).should("be.visible");

      // Check for specific product validation error in error summary
      cy.contains("a", /product details section/).should("be.visible");

      // Check for inline error above product details section
      cy.get('[data-testid="progress-processedProductDetails-wrapper"]')
        .should("have.class", "govuk-form-group--error")
        .within(() => {
          cy.get(".govuk-error-message").should("be.visible");
          cy.contains(".govuk-error-message", /product details section/).should("be.visible");
        });
    });

    it("should remain on progress page after validation error", () => {
      cy.get('[data-testid="continue-button"]').click();
      cy.url().should("include", "/progress");
      cy.url().should("not.include", "/check-your-information");
    });
  });

  describe("Scenario 2: Block submission with mixed products (one valid, one description-only)", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PSProgressWithMixedProducts,
      };
      cy.visit(progressUrl, { qs: { ...testParams } });
    });

    it("should display application completed status", () => {
      cy.contains("[data-testid='Progress-completed-heading']", "Application completed").should("be.visible");
    });

    it("should display error when attempting to continue with mixed products", () => {
      cy.get('[data-testid="continue-button"]').click();
      cy.url().should("include", "/progress");

      // Check for error summary at the top
      cy.contains("h2", /^There is a problem$/).should("be.visible");

      // Check for specific product validation error in error summary
      cy.contains("a", /product details section/).should("be.visible");

      // Check for inline error above product details section
      cy.get('[data-testid="progress-processedProductDetails-wrapper"]')
        .should("have.class", "govuk-form-group--error")
        .within(() => {
          cy.get(".govuk-error-message").should("be.visible");
          cy.contains(".govuk-error-message", /product details section/).should("be.visible");
        });
    });

    it("should remain on progress page after validation error", () => {
      cy.get('[data-testid="continue-button"]').click();
      cy.url().should("include", "/progress");
      cy.url().should("not.include", "/check-your-information");
    });
  });

  describe("Scenario 3: Allow submission with all valid products (have catches)", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PSProgressWithValidProducts,
      };
      cy.visit(progressUrl, { qs: { ...testParams } });
    });

    it("should display application completed status", () => {
      cy.contains("[data-testid='Progress-completed-heading']", "Application completed").should("be.visible");
    });

    it("should allow progression to check-your-information when all products have catches", () => {
      cy.get('[data-testid="continue-button"]').click();
      // Should redirect successfully (no error)
      cy.url().should("not.include", "/progress");
    });

    it("should not display validation errors", () => {
      cy.get('[data-testid="continue-button"]').click();
      cy.contains("h2", /^There is a problem$/).should("not.exist");
    });
  });

  describe("Display multiple inline errors when sections incomplete AND products lack catches", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.PSIncompleteProgress,
      };
      cy.visit(progressUrl, { qs: { ...testParams } });
    });

    it("should display multiple inline errors for incomplete sections", () => {
      cy.get('[data-testid="continue-button"]').click();
      cy.url().should("include", "/progress");

      // Check for error summary at the top
      cy.contains("h2", /^There is a problem$/).should("be.visible");

      // Check for exporter error - both in summary and inline
      cy.contains("a", /exporter details section/).should("be.visible");
      cy.get('[data-testid="progress-exporter-wrapper"]')
        .should("have.class", "govuk-form-group--error")
        .within(() => {
          cy.get(".govuk-error-message").should("be.visible");
        });

      // Check for other incomplete section errors also display inline
      cy.get('[data-testid="progress-processingPlant-wrapper"]')
        .should("have.class", "govuk-form-group--error")
        .within(() => {
          cy.get(".govuk-error-message").should("be.visible");
        });
    });

    it("should ensure all errors are accessible and visible", () => {
      cy.get('[data-testid="continue-button"]').click();

      // Verify error summary links are functional
      cy.get(".govuk-error-summary__list a").first().click();

      // Should focus on the first error field
      cy.url().should("include", "/progress");
    });
  });
});
