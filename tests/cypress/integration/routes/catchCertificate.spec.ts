import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2021-CC-1C9833091";
const catchCertificateUrl = `/create-catch-certificate/${documentNumber}/catch-certificate-created`;

describe("Catch certificate created page: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CatchCertificateCreated,
      args: [documentNumber],
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
  });

  it("should render links", () => {
    cy.wrap(true).should("be.true");
    cy.contains("strong", /^1\. Download the catch certificate$/).should("be.visible");

    cy.contains("a", /^View completed catch certificates or create a new export document$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-catch-certificate/catch-certificates");
    cy.findByRole("link", {
      name: "View completed catch certificates or create a new export document",
    }).click();
    cy.url().should("include", "/catch-certificates");
  });

  it("should render email section heading", () => {
    cy.wrap(true).should("be.true");
    cy.contains("strong", /^2\. Email the catch certificate to the importer$/).should("be.visible");
  });

  it("should render important notice with icon and text", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-warning-text").should("be.visible");
    cy.get(".govuk-warning-text__icon").should("contain", "!");
    cy.get(".govuk-warning-text__text").should("contain.text", "Do not amend the catch certificate.");
  });

  it("should render email section with two bullet points", () => {
    cy.wrap(true).should("be.true");
    cy.contains(
      "li",
      /^It is the importer's responsibility to submit it to the import control authority where your export will enter the EU\.$/
    ).should("be.visible");
    cy.contains(
      "li",
      /^The importing authority will complete and sign their section of the document at the Border Inspection Post \(BIP\)\.$/
    ).should("be.visible");
  });

  it("should render links for send feedback for catch certificate", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="surveylink-feedback"]').contains("Take a 2 minute survey");
    cy.contains("a", "Take a 2 minute survey")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_734LbtQfQMrBoEu");
  });

  it("should render the correct page title and subtitle", () => {
    cy.wrap(true).should("be.true");
    cy.findByRole("heading", { name: "The catch certificate has been created", level: 1 });
    cy.get(".govuk-panel__body").contains("Catch certificate number");
    cy.get(".govuk-panel__body").contains(documentNumber);
  });

  it("should render other content", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-heading-m").contains("What you need to do next");
    cy.contains("strong", /^2\. Email the catch certificate to the importer$/).should("be.visible");

    cy.contains(
      "li",
      /^If you are using Firefox as an internet browser, please ensure JavaScript is enabled in order to view and download the certificate$/
    ).should("be.visible");
    cy.contains("li", /^If you are using a mobile device, please ensure you have installed a PDF viewer$/).should(
      "be.visible"
    );
  });

  it("should render survey component", () => {
    cy.wrap(true).should("be.true");
    cy.get('[data-testid="surveylink-feedback"]').contains("Take a 2 minute survey");
  });

  it("should render PDF download link with correct href", () => {
    cy.wrap(true).should("be.true");
    cy.get("a.govuk-link")
      .contains("strong", /Download the catch certificate/)
      .parent()
      .should("have.attr", "href")
      .and("include", "/pdf/export-certificates/");
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

  it("should render important notice icon and text", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-warning-text").should("be.visible");
    cy.get(".govuk-warning-text__text").should("contain.text", "Do not amend the catch certificate.");
  });

  it("should render email instructions with proper heading", () => {
    cy.wrap(true).should("be.true");
    cy.contains("strong", "2. Email the catch certificate to the importer").should("be.visible");
  });

  it("should render all email bullet points", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-list--bullet")
      .last()
      .within(() => {
        cy.get("li").should("have.length", 2);
      });
  });

  it("should render document number correctly", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-panel__body").within(() => {
      cy.contains("strong", documentNumber).should("be.visible");
    });
  });

  it("should render confirmation panel with correct classes", () => {
    cy.wrap(true).should("be.true");
    cy.get(".govuk-panel.govuk-panel--confirmation").should("exist");
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

  it("should call renderCatchCertificateSteps function", () => {
    cy.wrap(true).should("be.true");
    cy.get(String.raw`.govuk-\!-margin-bottom-6`).should("have.length.at.least", 2);
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

describe("Catch certificate created page: back button redirects to dashboard", () => {
  it("should navigate to the CC dashboard when the browser back button is pressed", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CatchCertificateCreated,
      args: [documentNumber],
    };
    cy.visit("/create-catch-certificate/catch-certificates", { qs: { ...testParams } });
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.get(".govuk-panel--confirmation").should("be.visible");
    cy.go("back");
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });
});

describe("Catch certificate created page: pageguard", () => {
  it("should redirect to the dashboard page if didn't got expected response", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CatchCertificatePageGuard,
      args: [documentNumber],
    };
    cy.visit(catchCertificateUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should redirect to the dashboard page when document status is pending", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CatchCertificatePendingPageGuard,
      args: [documentNumber],
    };

    cy.visit(catchCertificateUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });
});
