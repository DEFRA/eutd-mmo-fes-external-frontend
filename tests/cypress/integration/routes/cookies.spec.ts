import { TestCaseId, type ITestParams } from "~/types";

const ccDashboardUrl = "/create-catch-certificate/catch-certificates";
const psDashboardUrl = "/create-processing-statement/processing-statements";
const sdDashboardUrl = "/create-storage-document/storage-documents";
const cookieUrl = "/cookies";

describe("Cookie Policy page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.UserAttributes,
    };

    cy.visit(cookieUrl, { qs: { ...testParams } });
  });

  it("should render the Google Analytics table contents", () => {
    cy.get("#google-analytics-table thead.govuk-table__head tr.govuk-table__row").each(($row) => {
      cy.wrap($row).within(() => {
        cy.get("th").should("have.length", 4);
        cy.get("th")
          .should("contain", "Cookie")
          .should("contain", "Essential/Optional")
          .should("contain", "Purpose")
          .should("contain", "Expiry");
      });
    });

    cy.get("#google-analytics-table thead.govuk-table__head tr.govuk-table__row").each(($row) => {
      cy.wrap($row).within(() => {
        cy.get("th").should("have.length", 4);
      });
    });
  });

  it("should render the Microsoft Clarity contents", () => {
    cy.contains(".govuk-heading-m", "Microsoft Clarity");
    cy.contains(
      ".govuk-body",
      "We use Microsoft Clarity to understand how you use The Fish Exports Service, including mouse movements, clicks, scrolling and so on. This information helps us to improve the website."
    );
    cy.contains(".govuk-body", "Microsoft Clarity uses the following cookies:");

    cy.get("#ms-clarity-table thead.govuk-table__head tr.govuk-table__row").each(($row) => {
      cy.wrap($row).within(() => {
        cy.get("th").should("have.length", 3);
        cy.get("th").should("contain", "Name").should("contain", "Purpose").should("contain", "Expires");
      });
    });

    cy.get("#ms-clarity-table thead.govuk-table__head tr.govuk-table__row").each(($row) => {
      cy.wrap($row).within(() => {
        cy.get("th").should("have.length", 3);
      });
    });

    cy.contains(
      ".govuk-body",
      "The data is anonymised and we do not allow these analytics providers to share it with others. You can opt out of Clarity telemetry by selecting Microsoft on the "
    );
    cy.contains("a", /^DAA WebChoices service.$/)
      .should("be.visible")
      .should("have.attr", "href", `https://optout.aboutads.info/`)
      .click();
  });

  it("check cookie banner - check No radio button", () => {
    cy.get("form").submit();
    cy.findByRole("link", { name: "Go back to the page you were looking at." }).should("be.visible");
  });

  it("check cookie banner - check Yes radio button", () => {
    cy.get('[type="radio"]').check("Yes");
    cy.get("form").submit();
    cy.findByRole("link", { name: "Go back to the page you were looking at." }).should("be.visible");
  });
});

describe("Journey dashboards should redirect to cookie page when user has not accepted cookie statement", () => {
  it("CC dashboard should redirect to cookie policy", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CookiePolicyEmpty,
    };

    cy.visit(ccDashboardUrl, { qs: { ...testParams } });
    cy.url().should("include", "/cookies");
  });

  it("PS dashboard should redirect to cookie policy", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CookiePolicyEmpty,
    };

    cy.visit(psDashboardUrl, { qs: { ...testParams } });
    cy.url().should("include", "/cookies");
  });

  it("SD dashboard should redirect to cookie policy", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CookiePolicyEmpty,
    };

    cy.visit(sdDashboardUrl, { qs: { ...testParams } });
    cy.url().should("include", "/cookies");
  });
});
