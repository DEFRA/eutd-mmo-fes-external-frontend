import { TestCaseId, type ITestParams } from "~/types";

const ccDashboardUrl = "/create-catch-certificate/catch-certificates";
const psDashboardUrl = "/create-processing-statement/processing-statements";
const sdDashboardUrl = "/create-non-manipulation-document/non-manipulation-documents";
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

    cy.contains(
      ".govuk-body",
      "The data is anonymised and we do not allow these analytics providers to share it with others. You can opt out of Clarity telemetry by selecting Microsoft on the "
    );
    cy.contains("a", /^DAA WebChoices service.$/)
      .should("be.visible")
      .should("have.attr", "href", `https://optout.aboutads.info/`)
      .click();
  });

  it("should render the cookie preferences and Google Analytics section", () => {
    cy.contains("h2", "Cookie Preferences").should("be.visible");
    cy.contains(".govuk-body", "This cookie is used to remember your choice about cookies.").should("be.visible");
    cy.contains("h2", "Google Analytics").should("be.visible");
    cy.get(".govuk-list.govuk-list--bullet")
      .first()
      .within(() => {
        cy.get("li").should("have.length", 5);
      });
  });

  it("should render the essential and strictly necessary cookies section", () => {
    cy.contains("h2", "Essential Cookies and Cookies you can choose").should("be.visible");
    cy.contains("h2", "Strictly Necessary Cookies").should("be.visible");
    cy.get(".govuk-list.govuk-list--bullet")
      .eq(1)
      .within(() => {
        cy.get("li").should("have.length", 3);
      });
  });

  it("should have correct heading hierarchy for cookie settings section", () => {
    cy.contains("h2", "Change your cookie settings").should("be.visible");
    cy.contains("h3", "Do you want to accept the analytics cookies?").should("be.visible");
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
