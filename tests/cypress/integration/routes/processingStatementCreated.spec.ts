import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2023-PS-97DA962EC";
const processingStatementUrl = `/create-processing-statement/${documentNumber}/processing-statement-created`;

describe("Processing statement created page: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ProcessingStatementCreated,
      args: [documentNumber],
    };
    cy.visit(processingStatementUrl, { qs: { ...testParams } });
  });

  it("should render links", () => {
    cy.wrap(true).should("be.true");
    cy.contains("strong", /^Download the processing statement$/).should("be.visible");
    cy.contains("a", /^View completed processing statements or create a new export document$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-processing-statement/processing-statements");
    cy.findByRole("link", {
      name: "View completed processing statements or create a new export document",
    }).click();
    cy.url().should("include", "/processing-statements");
  });

  it("should render links for user satisfaction survey feedback link for processing statement", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="surveylink-feedback"]').contains("Take a 2 minute survey");
    cy.contains("a", "Take a 2 minute survey")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_734LbtQfQMrBoEu");
  });

  it("should render the correct page title and subtitle", () => {
    cy.wrap(true).should("be.true");
    cy.title().should("eq", "The processing statement has been created - Create a UK processing statement - GOV.UK");
    cy.findByRole("heading", { name: "The processing statement has been created", level: 1 });
    cy.get(".govuk-panel__body").contains("Processing statement number");
    cy.get(".govuk-panel__body").contains(documentNumber);
  });

  it("should render all step-by-step instructions with correct text", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-heading-m").contains("What you need to do next").should("be.visible");
    cy.contains("strong", "Download the processing statement").should("be.visible");
    cy.contains(
      "li",
      "If you are using Firefox as an internet browser, please ensure JavaScript is enabled in order to view and download the certificate"
    ).should("be.visible");
    cy.contains("li", "If you are using a mobile device, please ensure you have installed a PDF viewer").should(
      "be.visible"
    );
    cy.contains("strong", "Email the processing statement to the importer.").should("be.visible");
    cy.contains(
      "li",
      "It is the importer's responsibility to submit it to the import control authority where your export will enter the EU."
    ).should("be.visible");
    cy.contains(
      "li",
      "The importing authority will complete and sign their section of the document at the Border Inspection Post (BIP)."
    ).should("be.visible");
    cy.contains("View completed processing statements or create a new export document").should("be.visible");
  });

  it("should render important notice with exclamation icon", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-warning-text").should("be.visible");
    cy.get(".govuk-warning-text__icon").should("contain", "!");
    cy.get(".govuk-warning-text__text").should("contain.text", "Do not amend the processing statement.");
  });

  it("should render PDF download link with correct href", () => {
    cy.wrap(true).should("be.true");
    cy.get("a.govuk-link")
      .contains("strong", /Download the processing statement/)
      .parent()
      .should("have.attr", "href")
      .and("include", "/pdf/export-certificates/");
  });

  it("should render numbered list for processing statement steps", () => {
    cy.wrap(true).should("be.true");
    cy.get("ol.govuk-list.govuk-list--number")
      .should("exist")
      .within(() => {
        cy.get("li").should("exist");
      });
  });

  it("should render download bullet points for Firefox and mobile", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-list--bullet")
      .first()
      .within(() => {
        cy.get("li").should("have.length", 2);
        cy.contains(
          "If you are using Firefox as an internet browser, please ensure JavaScript is enabled in order to view and download the certificate"
        );
        cy.contains("If you are using a mobile device, please ensure you have installed a PDF viewer");
      });
  });

  it("should render email instructions with proper heading", () => {
    cy.wrap(true).should("be.true");
    cy.contains("strong", "Email the processing statement to the importer.").should("be.visible");
  });

  it("should render document number in panel", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-panel__body").within(() => {
      cy.contains("strong", documentNumber).should("be.visible");
    });
  });

  it("should render confirmation panel with correct classes", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-panel.govuk-panel--confirmation").should("exist");
  });

  it("should render important notice icon correctly", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-warning-text").should("be.visible");
    cy.get(".govuk-warning-text__text").should("contain", "Do not amend the processing statement.");
  });

  it("should call renderDownloadLink function", () => {
    cy.wrap(true).should("be.true");
    cy.get("h3.govuk-heading-s a.govuk-link strong").should("exist");
  });

  it("should call renderDownloadBulletPoints function", () => {
    cy.wrap(true).should("be.true");
    cy.get("ul.govuk-list.govuk-list--bullet").should("exist").and("have.length.at.least", 1);
  });

  it("should call renderImportantNotice function", () => {
    cy.wrap(true).should("be.true");
    cy.get(String.raw`.govuk-\!-margin-bottom-4`).within(() => {
      cy.get(".govuk-warning-text").should("exist");
      cy.get(".govuk-warning-text__icon").should("exist");
    });
  });

  it("should call renderProcessingAndStorageSteps function", () => {
    cy.wrap(true).should("be.true");
    cy.get("ol.govuk-list.govuk-list--number").should("exist");
  });

  it("should render Main component with feedback link", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="surveylink-feedback"]').should("exist");
  });

  it("should render all grid structure correctly", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-grid-row").should("have.length", 2);
    cy.get(".govuk-grid-column-full").should("have.length", 2);
  });
});

describe("Processing statement created page: back button redirects to dashboard", () => {
  it("should navigate to the PS dashboard when the browser back button is pressed", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ProcessingStatementCreated,
      args: [documentNumber],
    };
    cy.visit(processingStatementUrl, { qs: { ...testParams } });
    cy.get(".govuk-panel--confirmation").should("be.visible");
    cy.window().its("history.state").should("have.property", "createdPage", true);
    cy.go("back");
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});

describe("Processing statement created page: pageguard", () => {
  it("should redirect to the dashboard page if didn't got expected response", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ProcessingStatementPageGuard,
      args: [documentNumber],
    };
    cy.visit(processingStatementUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  it("should redirect to the dashboard page when document status is pending", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ProcessingStatementPendingPageGuard,
      args: [documentNumber],
    };

    cy.visit(processingStatementUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});
