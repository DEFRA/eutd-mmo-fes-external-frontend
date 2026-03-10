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
    cy.contains("strong", /^1\. Download the catch certificate$/).should("be.visible");

    cy.contains("a", /^View completed catch certificates or create a new export document$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-catch-certificate/catch-certificates");
    cy.findByRole("link", {
      name: "View completed catch certificates or create a new export document",
    }).click({ force: true });
    cy.url().should("include", "/catch-certificates");
  });

  it("should render email section heading", () => {
    cy.contains("strong", /^2\. Email the catch certificate to the importer$/).should("be.visible");
  });

  it("should render important notice with icon and text", () => {
    cy.contains("strong", /^Do not amend the catch certificate\.$/).should("be.visible");
    cy.get("svg title").should("contain", "icon important");
  });

  it("should render email section with two bullet points", () => {
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
    cy.get('[data-testid="surveylink-feedback"]').contains("Take a 2 minute survey");
    cy.contains("a", "Take a 2 minute survey")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_734LbtQfQMrBoEu");
  });

  it("should render the correct page title and subtitle", () => {
    cy.findByRole("heading", { name: "The catch certificate has been created", level: 1 });
    cy.get(".govuk-panel__body").contains("Catch certificate number");
    cy.get(".govuk-panel__body").contains(documentNumber);
  });

  it("should render other content", () => {
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
    cy.get('[data-testid="surveylink-feedback"]').contains("Take a 2 minute survey");
  });

  it("should render PDF download link with correct href", () => {
    cy.get("a.govuk-link")
      .contains("strong", /Download the catch certificate/)
      .parent()
      .should("have.attr", "href")
      .and("include", "/pdf/export-certificates/");
  });

  it("should render download bullet points for Firefox and mobile", () => {
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
    cy.get('svg[viewBox="0 0 35.000000 35.000000"]')
      .should("be.visible")
      .find("title")
      .should("contain", "icon important");
    cy.contains("strong", "Do not amend the catch certificate.").should("be.visible");
  });

  it("should render email instructions with proper heading", () => {
    cy.contains("strong", "2. Email the catch certificate to the importer").should("be.visible");
  });

  it("should render all email bullet points", () => {
    cy.get(".govuk-list--bullet")
      .last()
      .within(() => {
        cy.get("li").should("have.length", 2);
      });
  });

  it("should render document number correctly", () => {
    cy.get(".govuk-panel__body").within(() => {
      cy.contains("strong", documentNumber).should("be.visible");
    });
  });

  it("should render confirmation panel with correct classes", () => {
    cy.get(".govuk-panel.govuk-panel--confirmation").should("exist");
  });

  it("should call renderDownloadLink function", () => {
    cy.get("h3.govuk-heading-s a.govuk-link strong").should("exist");
  });

  it("should call renderDownloadBulletPoints function", () => {
    cy.get("ul.govuk-list.govuk-list--bullet").should("exist").and("have.length.at.least", 1);
  });

  it("should call renderImportantNotice function", () => {
    cy.get(".govuk-\\!-margin-bottom-4").within(() => {
      cy.get("svg").should("exist");
      cy.get(".govuk-\\!-display-inline-block").should("exist");
    });
  });

  it("should call renderCatchCertificateSteps function", () => {
    cy.get(".govuk-\\!-margin-bottom-6").should("have.length.at.least", 2);
  });

  it("should render Main component with feedback link", () => {
    cy.get('[data-testid="surveylink-feedback"]').should("exist");
  });

  it("should render all grid structure correctly", () => {
    cy.get(".govuk-grid-row").should("have.length", 2);
    cy.get(".govuk-grid-column-full").should("have.length", 2);
  });
});

describe("Catch certificate created page: back button redirects to dashboard", () => {
  it("should navigate to the CC dashboard when the browser back button is pressed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CatchCertificateCreated,
      args: [documentNumber],
    };
    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.get(".govuk-panel--confirmation").should("be.visible");
    cy.window().its("history.state").should("have.property", "createdPage", true);
    cy.go("back");
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });
});

describe("Catch certificate created page: pageguard", () => {
  it("should redirect to the dashboard page if didn't got expected response", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CatchCertificatePageGuard,
      args: [documentNumber],
    };
    cy.visit(catchCertificateUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should redirect to the dashboard page when document status is pending", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CatchCertificatePendingPageGuard,
      args: [documentNumber],
    };

    cy.visit(catchCertificateUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });
});
