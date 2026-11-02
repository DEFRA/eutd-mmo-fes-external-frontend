import { type ITestParams, TestCaseId } from "~/types";

const ccDocumentNumber = "GBR-2022-CC-3FE1169D1";
const ccTruckPageUrl = `create-catch-certificate/${ccDocumentNumber}/add-transportation-details-truck/0`;

const sdDocumentNumber = "GBR-2022-SD-3FE1169D1";
const sdArrivalTruckPageUrl = `/create-non-manipulation-document/${sdDocumentNumber}/add-arrival-transportation-details-truck`;

const sdEuPendingDocumentNumber = "GBR-2022-SD-1C9833456";
const sdEuPendingStatusUrl = `/create-non-manipulation-document/${sdEuPendingDocumentNumber}/eu-data-integration-check-status`;

// Hydration-complete gate: root.tsx useEffect focuses this span after hydrateRoot() settles
const waitForHydration = () => cy.get('span[tabindex="-1"]', { timeout: 15000 }).should("be.focused");

// Delays the JS bundle response so the pre-hydration (server-rendered) error state is observable
const delayClientScripts = () => {
  cy.intercept({ method: "GET", url: "**/assets/*.js" }, (req) => {
    req.on("response", (res) => {
      res.setDelay(1500);
    });
  });
};

describe("Root: pre-hydration validation errors must survive hydration", () => {
  it("CC truck transport: errors from a native pre-hydration POST remain visible after hydration", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportErrors,
    };

    delayClientScripts();
    cy.intercept("GET", "**/add-transportation-details-truck/0.data*").as("revalidate");

    cy.visit(ccTruckPageUrl, { qs: { ...testParams } });
    // Click before JS has hydrated so the browser performs a native form POST
    cy.get("[data-testid=save-and-continue]").click();
    cy.get("#errorIsland").should("exist");

    waitForHydration();

    cy.get("#errorIsland").should("be.visible");
    cy.get("#nationalityOfVehicle").should("have.class", "govuk-input--error");
    cy.get("@revalidate.all").should("have.length", 0);
  });

  it("SD arrival truck transport: errors from a native pre-hydration POST remain visible after hydration", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportErrors,
    };

    delayClientScripts();
    cy.intercept("GET", "**/add-arrival-transportation-details-truck.data*").as("revalidate");

    cy.visit(sdArrivalTruckPageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.get("#errorIsland").should("exist");

    waitForHydration();

    cy.get("#errorIsland").should("be.visible");
    cy.get("#nationalityOfVehicle").should("have.class", "govuk-input--error");
    cy.get("@revalidate.all").should("have.length", 0);
  });

  it("client-side link navigation after hydration triggers exactly one loader fetch for the destination route", () => {
    // Uses the EU integration pending page's dashboard link, one of the few genuine
    // React Router <Link> transitions in this app (most "change" links are plain <a> tags
    // that perform a full page reload and never issue a .data fetch).
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDashboardWithPendingEUStatus,
    };

    cy.visit(sdEuPendingStatusUrl, { qs: { ...testParams } });
    waitForHydration();

    cy.intercept("GET", "**/*.data*").as("dataFetch");
    cy.contains("a", "view or download it from your dashboard").click();

    cy.url().should("include", "/non-manipulation-documents");
    cy.get("@dataFetch.all").should("have.length", 1);
  });
});
