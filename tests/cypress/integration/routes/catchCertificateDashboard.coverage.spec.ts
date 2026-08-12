import { type ITestParams, TestCaseId } from "~/types";

const catchCertificateUrl = "/create-catch-certificate/catch-certificates";

describe("Catch certificate dashboard coverage", () => {
  it("renders pagination links with month and year query params", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboard,
    };

    cy.visit(catchCertificateUrl, { qs: { ...testParams, month: 10, year: 2020, position: 0 } });

    cy.get(".govuk-pagination").should("be.visible");
    cy.get(".govuk-pagination a.govuk-pagination__link").should("have.length.at.least", 2);
    cy.get(".govuk-pagination a.govuk-pagination__link").first().should("have.attr", "href").and("include", "month=");
    cy.get(".govuk-pagination a.govuk-pagination__link").first().should("have.attr", "href").and("include", "year=");
  });

  it("renders in-progress continue links with supported destinations", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboard,
    };

    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.get("a[id^='continue-']").should("have.length.at.least", 1);
    cy.get("a[id^='continue-']")
      .first()
      .should("have.attr", "href")
      .and("match", /\/create-catch-certificate\/.+\/(progress|check-your-information)/);
  });

  it("renders the dashboard when there are no completed documents", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDashboardNoCompleted,
    };

    cy.visit(catchCertificateUrl, { qs: { ...testParams } });
    cy.location("pathname").should("eq", "/create-catch-certificate/catch-certificates");
    cy.get("h1").should("contain.text", "catch certificates");
  });

  it("renders default and user-prefixed headings for dashboard scenarios", () => {
    cy.visit(catchCertificateUrl, { qs: { testCaseId: TestCaseId.CCDashboard } });
    cy.get("h1").should("contain.text", "catch certificates");

    cy.visit(catchCertificateUrl, {
      qs: { testCaseId: TestCaseId.CCDashboardUserDetails },
    });
    cy.get("h1").should("contain.text", "Automation Testing Ltd: catch certificates");
  });
});
