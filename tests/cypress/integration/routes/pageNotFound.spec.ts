import { type ITestParams, TestCaseId } from "~/types";

const dashboardLink = "/create-catch-certificate/catch-certificates";

describe("PageNotFound", () => {
  it("should render as expected for an unknown main route", () => {
    cy.visit("/qwekjhzxc");

    cy.contains("h1", /^Page not found$/).should("be.visible");

    cy.contains("a", /^check the document is in progress$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);

    cy.contains("a", /^Create a UK catch certificate$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);
  });

  it("CC: should render as expected for an unknown route that begins with a known route", () => {
    const dashboardLink = "/create-catch-certificate/catch-certificates";

    cy.visit(`${dashboardLink}qwekjhzxc`);

    cy.contains("h1", /^Page not found$/).should("be.visible");

    cy.contains("a", /^check the document is in progress$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);

    cy.contains("a", /^Create a UK catch certificate$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);
  });

  it("PS: should render as expected for an unknown route that begins with a known route", () => {
    const dashboardLink = "/create-processing-statement/processing-statements";

    cy.visit(`${dashboardLink}qwekjhzxc`);

    cy.contains("h1", /^Page not found$/).should("be.visible");

    cy.contains("a", /^check the document is in progress$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);

    cy.contains("a", /^Create a UK processing statement$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);
  });

  it("SD: should render as expected for an unknown route that begins with a known route", () => {
    const dashboardLink = "/create-non-manipulation-document/non-manipulation-documents";

    cy.visit(`${dashboardLink}qwekjhzxc`);

    cy.contains("h1", /^Page not found$/).should("be.visible");

    cy.contains("a", /^check the document is in progress$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);

    cy.contains("a", /^Create a UK non-manipulation document$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);
  });

  it("should render CatchBoundary for thrown responses", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CatchBoundary,
    };

    cy.request({
      url: dashboardLink,
      failOnStatusCode: false,
      qs: { ...testParams },
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 302, 500]);
    });
  });

  it("should render ErrorBoundary for uncaught thrown errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ErrorBoundary,
    };

    cy.visit(dashboardLink, { failOnStatusCode: false, qs: { ...testParams } });

    cy.findByRole("heading", { name: "Sorry, there is a problem with the service", level: 1 }).should("be.visible");
  });
});
