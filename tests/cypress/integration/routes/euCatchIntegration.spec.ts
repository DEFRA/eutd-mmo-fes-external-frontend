import { type ITestParams, TestCaseId } from "~/types";

const catchCertificateUrl = "/create-catch-certificate/catch-certificates";

describe("EU CATCH Integration - Completed Documents Table", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyDashboard,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });

  it("should render EU CATCH integration column header", () => {
    cy.wrap(true).should("be.true");
    cy.get("table[data-testid='catchCertificate-completed-table']")
      .find("thead th")
      .contains("EU CATCH integration")
      .should("be.visible");
  });

  it("should render EU CATCH integration column in correct position (after Date Created, before Action)", () => {
    cy.wrap(true).should("be.true");
    cy.get("table[data-testid='catchCertificate-completed-table'] thead tr th").then(($headers) => {
      const headerTexts = $headers.toArray().map((el) => el.textContent?.trim());
      const dateCreatedIndex = headerTexts.map((text) => text?.includes("Date Created")).indexOf(true);
      const euCatchIndex = headerTexts.indexOf("EU CATCH integration");
      const actionIndex = headerTexts.indexOf("Action");

      expect(dateCreatedIndex).to.be.greaterThan(-1);
      expect(euCatchIndex).to.be.greaterThan(dateCreatedIndex);
      expect(actionIndex).to.be.greaterThan(euCatchIndex);
    });
  });

  it("should render 'Check status' link for each completed document", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="catchCertificate-check-eu-catch-status"]').each(($link) => {
      cy.wrap($link).should("contain.text", "Check status");
    });
  });

  it("should render 'Check status' link with correct href attribute", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="catchCertificate-check-eu-catch-status"]')
      .first()
      .should("have.attr", "href")
      .and("match", /\/create-catch-certificate\/[A-Z0-9-]+\/eu-data-integration-check-status/);
  });

  it("should have accessible hidden text for screen readers on check status link", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="catchCertificate-check-eu-catch-status"]')
      .first()
      .find(".govuk-visually-hidden")
      .should("exist")
      .and("contain.text", "for document");
  });

  it("should render guidance text below completed documents table", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-inset-text")
      .should("be.visible")
      .find("p.govuk-body")
      .should(
        "contain.text",
        "Refresh the page to check for updates to your catch certificates. Open failed submissions to find out how to fix the problem."
      );
  });

  it("should work without JavaScript (standard anchor tags)", () => {
    cy.wrap(true).should("be.true");
    // Check that the link is a standard anchor tag, not a React Router Link
    cy.get('[data-testid="catchCertificate-check-eu-catch-status"]')
      .first()
      .should("have.prop", "tagName", "A")
      .and("not.have.attr", "data-discover");
  });
});

describe("EU CATCH Integration - Missing catchSubmission", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardNoCatchSubmission,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });

  it("should display '-' when catchSubmission is missing", () => {
    cy.wrap(true).should("be.true");
    cy.get("table[data-testid='catchCertificate-completed-table'] tbody tr")
      .first()
      .within(() => {
        // Find the EU CATCH integration column cell (4th cell after Document Number, Reference, Date)
        cy.get("td").eq(3).should("contain.text", "-").and("not.contain", "Check status");
      });
  });
});

describe("EU CATCH Integration - Welsh Translation", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyDashboard,
    };
    cy.visit(`${catchCertificateUrl}?lng=cy`, { qs: { ...testParams } });
  });

  it("should render Welsh translation for EU CATCH integration header", () => {
    cy.wrap(true).should("be.true");
    cy.get("table[data-testid='catchCertificate-completed-table']")
      .find("thead th")
      .contains("Integreiddio â system CATCH yr UE")
      .should("be.visible");
  });

  it("should render Welsh translation for Check status link", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="catchCertificate-check-eu-catch-status"]').first().should("contain.text", "Gwirio statws");
  });

  it("should render Welsh translation for guidance text", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-inset-text")
      .should("be.visible")
      .find("p.govuk-body")
      .should(
        "contain.text",
        "Adnewyddwch y tudalen i chwilio am ddiweddariadau i'ch tystysgrifau dalfa. Agorwch gyflwyniadau sydd wedi methu er mwyn gweld sut i ddatrys y broblem."
      );
  });
});

describe("EU CATCH Integration - Welsh Translation for Status Pages", () => {
  it("should render Welsh translation on pending status page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardWithPendingEUStatus,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status?lng=cy");
    cy.contains("h1", "Anfon eich data i'w integreiddio â system yr UE").should("be.visible");
    cy.contains("h2", "Beth gallwch chi ei wneud nawr").should("be.visible");
    cy.contains("Mae eich tystysgrif dalfa yn dal yn ddilys ac yn barod i'w defnyddio").should("be.visible");
  });

  it("should render Welsh translation on failed status page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardWithFailedEUStatus,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status?lng=cy");
    cy.contains("h1", "Mae yna broblem wrth integreiddio â data'r UE").should("be.visible");
  });
});

describe("EU CATCH Integration - Status Pages", () => {
  it("should navigate to successful status page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboard,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status");
    cy.url().should("include", "/eu-data-integration-check-status");
    cy.contains("p", "Your catch certificate data has been sent to the EU CATCH system.").should("be.visible");
    cy.title().should("eq", "Your data has been transferred to EU CATCH - Create a UK catch certificate - GOV.UK");
  });

  it("should navigate to pending status page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardWithPendingEUStatus,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status");
    cy.url().should("include", "/eu-data-integration-check-status");
    cy.contains("h1", "Sending your data for EU integration").should("be.visible");
    cy.title().should("eq", "Sending your data for EU integration - Create a UK catch certificate - GOV.UK");
  });

  it("should navigate to failed status page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardWithFailedEUStatus,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status");
    cy.url().should("include", "/eu-data-integration-check-status");
    cy.contains("h1", "There is a problem with EU data integration").should("be.visible");
    cy.title().should("eq", "There is a problem with EU data integration - Create a UK catch certificate - GOV.UK");
  });

  it("should have back link on successful status page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboard,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status");
    cy.get(".govuk-back-link")
      .should("be.visible")
      .and("have.attr", "href", "/create-catch-certificate/catch-certificates");
  });

  it("should have back link on pending status page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardWithPendingEUStatus,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status");
    cy.get(".govuk-back-link")
      .should("be.visible")
      .and("have.attr", "href", "/create-catch-certificate/catch-certificates");
  });

  it("should have back link on failed status page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardWithFailedEUStatus,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status");
    cy.get(".govuk-back-link")
      .should("be.visible")
      .and("have.attr", "href", "/create-catch-certificate/catch-certificates");
  });

  it("should display pending page content correctly", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardWithPendingEUStatus,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status");
    cy.contains("h1", "Sending your data for EU integration").should("be.visible");
    cy.contains("Your catch certificate data is being sent to the EU CATCH system").should("be.visible");
    cy.contains("This can take a few minutes").should("be.visible");
    cy.contains("h2", "What you can do now").should("be.visible");
    cy.contains("Your catch certificate is still valid and ready to use").should("be.visible");
  });

  it("should display failed page content correctly", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardWithFailedEUStatus,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.visit("/create-catch-certificate/GBR-2022-CC-45A276B54/eu-data-integration-check-status");
    cy.contains("h1", "There is a problem with EU data integration").should("be.visible");
    cy.contains("h2", "What this means").should("be.visible");
    cy.contains("h2", "If you need to speak to someone").should("be.visible");
  });
});

describe("EU CATCH Integration - Accessibility", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyDashboard,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });

  it("should have proper table structure with scope attributes", () => {
    cy.wrap(true).should("be.true");
    cy.get("table[data-testid='catchCertificate-completed-table'] thead th").each(($th) => {
      cy.wrap($th).should("have.attr", "scope", "col");
    });
  });

  it("should have proper link structure with visible text and hidden context", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="catchCertificate-check-eu-catch-status"]')
      .first()
      .within(() => {
        // Check visible text exists
        cy.contains("Check status").should("be.visible");
        // Check hidden context exists for screen readers
        cy.get(".govuk-visually-hidden").should("exist");
      });
  });

  it("should not render guidance text when no completed documents exist", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardNoCompleted,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.get(".govuk-inset-text").should("not.exist");
  });
});
