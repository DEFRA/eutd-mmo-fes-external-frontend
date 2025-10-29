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
    cy.contains("strong", /^Download the catch certificate$/).should("be.visible");

    cy.contains("a", /^View completed catch certificates or create a new export document$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-catch-certificate/catch-certificates");
    cy.findByRole("link", {
      name: "View completed catch certificates or create a new export document",
    }).click({ force: true });
    cy.url().should("include", "/catch-certificates");
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
    cy.contains("strong", /^Email the catch certificate to the importer$/).should("be.visible");

    cy.contains(
      "li",
      /^if you are using Firefox as an internet browser, please ensure JavaScript is enabled in order to view and download the certificate$/
    ).should("be.visible");
    cy.contains("li", /^if you are using a mobile device, please ensure you have installed a PDF viewer$/).should(
      "be.visible"
    );
  });

  it("should render survey component", () => {
    cy.get('[data-testid="surveylink-feedback"]').contains("Take a 2 minute survey");
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
});
