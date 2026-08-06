import { type ITestParams, TestCaseId } from "~/types";

const storageDocumentDashboardUrl = "/create-non-manipulation-document/non-manipulation-documents";

describe("Storage document dashboard coverage", () => {
  it("renders pagination links with month and year query params", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDLoadDasboardWithCompletedAndInProgress,
    };

    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams, month: 10, year: 2020, position: 0 } });

    cy.get(".govuk-pagination").should("be.visible");
    cy.get(".govuk-pagination a.govuk-pagination__link").should("have.length.at.least", 2);
    cy.get(".govuk-pagination a.govuk-pagination__link").first().should("have.attr", "href").and("include", "month=");
    cy.get(".govuk-pagination a.govuk-pagination__link").first().should("have.attr", "href").and("include", "year=");
  });

  it("creates a storage document and redirects to progress", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardUserDetails,
    };

    cy.visit(storageDocumentDashboardUrl, { qs: { ...testParams } });
    cy.get("#create-export-document").should("be.visible").click();
    cy.location("pathname", { timeout: 10000 }).should("match", /\/create-non-manipulation-document\/[^/]+\/progress$/);
  });
});
