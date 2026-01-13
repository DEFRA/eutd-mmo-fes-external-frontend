import { type ITestParams, TestCaseId, type Journey } from "~/types";
const catchCertificateUrl = "/create-catch-certificate/catch-certificates";
const journey: Journey = "catchCertificate";

describe("Catch certificate dashboard sidebar links", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboard,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });

  it("should render links for send feedback for storage document", () => {
    cy.get('[data-testid="dashboard-feedback-url-link"]').contains("Take our survey now");
    cy.contains("a", "Take our survey now")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_1S5DVwag5rcTrAq");
  });

  it("should display Need help? heading", () => {
    cy.contains("h2", "Need help?");
  });

  it("should render link for Guidance on exporting fish (gov.uk)", () => {
    cy.contains("a", "Guidance on exporting fish (gov.uk)")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/guidance/exporting-and-importing-fish-if-theres-no-brexit-deal");
  });

  it("should render link for EU 2026 Changes Guidance (gov.uk)", () => {
    cy.contains("a", "EU 2026 Changes Guidance (gov.uk)")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/guidance/eu-iuu-regulation-2026-changes");
  });

  it("should display feedback headings", () => {
    cy.contains("h3", "Send feedback");
  });
});

describe("Catch certificate completed links", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyDashboard,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });

  it("should render copy links for completed documents", () => {
    cy.get('[data-testid="catchCertificate-copycompleted"]').contains("Copy");
    cy.contains("a", "Copy").should("be.visible");
  });

  it("should render EU CATCH integration column with check status links", () => {
    cy.get("table[data-testid='catchCertificate-completed-table']")
      .find("thead th")
      .contains("EU CATCH integration")
      .should("be.visible");

    cy.get('[data-testid="catchCertificate-check-eu-catch-status"]').should("have.length.at.least", 1);
  });

  it("should render check status links with correct href patterns for different statuses", () => {
    cy.get('[data-testid="catchCertificate-check-eu-catch-status"]').each(($link) => {
      cy.wrap($link)
        .should("have.attr", "href")
        .and("match", /\/create-catch-certificate\/[A-Z0-9-]+\/eu-data-integration-(successful|pending|failed)/);
    });
  });

  it("should render visually hidden context for screen readers on check status links", () => {
    cy.get('[data-testid="catchCertificate-check-eu-catch-status"]')
      .first()
      .find(".govuk-visually-hidden")
      .should("exist")
      .and("include.text", "for document");
  });

  it("should verify column order: Document Number, Reference, Date, EU CATCH Integration, Action", () => {
    cy.get("table[data-testid='catchCertificate-completed-table'] thead tr th").then(($headers) => {
      const headerTexts = $headers.toArray().map((el) => el.textContent?.trim());

      expect(headerTexts[0]).to.include("Document number");
      expect(headerTexts[1]).to.include("Your reference");
      expect(headerTexts[2]).to.include("Date Created");
      expect(headerTexts[3]).to.equal("EU CATCH integration");
      expect(headerTexts[4]).to.equal("Action");
    });
  });
});

describe("Catch certificate dashboard", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboard,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });

  it("should render a valid page title", () => {
    cy.title().should("eq", "Automation Testing Ltd: catch certificates - Create a UK catch certificate - GOV.UK");
  });

  it("should render a service notification banner", () => {
    cy.get(".govuk-notification-banner .govuk-heading-l").should("have.text", "Title");

    cy.get(".govuk-notification-banner p").first().should("have.text", "Message");
  });

  it("should render a notification banner", () => {
    cy.get(".govuk-notification-banner").should("be.visible");

    cy.get("#govuk-notification-banner-title").should("have.text", "Important");

    cy.get(".govuk-notification-banner__heading").should(
      "have.text",
      "You have reached the maximum limit allowed for draft catch certificates."
    );

    cy.url().should("include", "/catch-certificates");
  });

  it("should render a continue link for each in progress catch certificate", () => {
    const documentNumbers = [
      "GBR-2022-CC-20C81C37F",
      "GBR-2022-CC-C8DEDE7FD",
      "GBR-2022-CC-89BA60007",
      "GBR-2022-CC-4A7B0258F",
      "GBR-2022-CC-916B8F1CC",
    ];

    const slugs = ["progress", "progress", "progress", "check-your-information", "check-your-information"];

    cy.get("a#continue").each(($ele, index) => {
      cy.wrap($ele)
        .contains("Continue")
        .should("have.attr", "href", `/create-catch-certificate/${documentNumbers[index]}/${slugs[index]}`);
    });
  });
});

describe("Catch certificate dashboard with query parameters", () => {
  it("should render a service notification banner", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboard,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams, month: 10, year: 2020, position: 0 } });

    cy.get(".govuk-pagination__item--current > .govuk-link.govuk-pagination__link").should(
      "have.attr",
      "href",
      "/create-catch-certificate/catch-certificates?month=10&year=2020&position=0"
    );
  });
});

describe("Catch certificate dashboard with No completed document", () => {
  it("should render dashboard with No completed document", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardNoCompleted,
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });
});

describe("Catch certificate dashboard with user details", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardUserDetails,
      args: [journey],
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });

  it("should render a header with user details", () => {
    cy.get(".govuk-notification-banner .govuk-heading-l").should("have.text", "Title");

    cy.get("h1.govuk-heading-xl").should("have.text", "Automation Testing Ltd: catch certificates");
  });

  it("should render the landings entry page after creating a document", () => {
    cy.get("#create-export-document").click({ force: true });

    cy.url().should("include", "/landings-entry");
  });
});

describe("Catch certificate dashboard no details", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardAdminLogin,
      args: [journey],
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });

  it("should render a header which equals catch certificates", () => {
    cy.get(".govuk-notification-banner .govuk-heading-l").should("have.text", "Title");
  });

  it("should render a message which equals not have any catch certificate", () => {
    cy.get("p.govuk-body").contains("You do not have any catch certificates in progress.");
  });

  it("should render the forbidden page when a document number is undefined", () => {
    cy.get("#create-export-document").click({ force: true });

    cy.url().should("include", "/forbidden");
  });
});
