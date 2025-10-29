import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2022-CC-24F279E85";
const landingsUrl = `${documentUrl}/landings-entry`;
const progressUrl = `${documentUrl}/progress`;
const landingsTypeConfirmationUrl = `${documentUrl}/landings-type-confirmation`;

describe("Landings confirmation page: user Interface", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeConfirmationCaseTwo,
    };
    cy.visit(landingsUrl, { qs: { ...testParams } });
    // eslint-disable-next-line
    cy.wait(200);
    cy.get("#manualOptionEntry").click({ force: true });
    cy.get("form").submit();
    cy.url().should("include", landingsTypeConfirmationUrl);
  });

  it("should render back button", () => {
    cy.contains("a", /^Back$/).should("be.visible");
  });

  it("should render the correct headings", () => {
    cy.contains("h1", "Are you sure you want to change your landings type?");
  });

  it("should render the correct warning text", () => {
    cy.contains(
      "div > strong",
      "Switching between direct and non-direct landings types will require the re-entry of landings data."
    );
  });

  it("should render the two landings entry confirmation options and labels ", () => {
    cy.get("form").should(($form) => {
      expect($form.find("input[type='radio']")).to.have.lengthOf(2);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();

      expect(radios).to.have.length(2);
      expect(labels).to.have.length(2);
      expect(labels).to.deep.eq([
        "Yes, I want to change my landings type",
        "No, I want to keep my current landings type",
      ]);
    });
  });

  it("should render the  cancel button", () => {
    cy.contains("button", "Cancel").should("be.visible");
  });

  it("should render the  continue button", () => {
    cy.contains("button", "Continue").should("be.visible");
  });
});

describe("Landings confirmation page: Error summary", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeConfirmationCaseTwo,
    };
    cy.visit(landingsUrl, { qs: { ...testParams } });
    // eslint-disable-next-line
    cy.wait(200);
    cy.get("#manualOptionEntry").click({ force: true });
    cy.get("form").submit();
    cy.url().should("include", landingsTypeConfirmationUrl);
  });

  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    cy.get("[data-testid=continue]").click({ force: true });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select an option to continue$/).should("be.visible");
    cy.contains("p.govuk-error-message > span", /^Error:$/).should("be.visible");
  });
});

describe("Landings confirmation page: buttons functionality", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeConfirmation,
    };
    cy.visit(landingsUrl, { qs: { ...testParams } });
    // eslint-disable-next-line
    cy.wait(200);
    cy.get("#manualOptionEntry").click({ force: true });
    cy.get("form").submit();
    cy.url().should("include", landingsTypeConfirmationUrl);
  });

  it("should be able to navigate to the progress page when the user selects Yes and clicks continue button", () => {
    cy.get("#confirmLandingsTypes").click({ force: true });
    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", progressUrl);
  });

  it("should be able to navigate to landings entry page when the user selects No and clicks continue button", () => {
    // eslint-disable-next-line
    cy.wait(200);
    cy.get("#landingsTypeNo").click({ force: true });
    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", landingsUrl);
  });

  it("should be able to navigate to landings entry page when the user clicks cancel button", () => {
    cy.get("#landingsTypeNo").click({ force: true });
    cy.get("[data-testid=cancel]").click({ force: true });
    cy.url().should("include", landingsUrl);
  });
});

describe("Landings confirmation page: page guard", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeConfirmationPageGuard,
    };
    cy.visit(landingsTypeConfirmationUrl, { qs: { ...testParams } });
  });

  it("should redirect to the fobidden when the user tries to access the confirmation page unless arrived via landings-entry page", () => {
    cy.url().should("include", "/forbidden");
  });
});

describe("Landings confirmation page: redirect to forbidden page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeConfirmationCaseOne,
    };
    cy.visit(landingsUrl, { qs: { ...testParams } });
    // eslint-disable-next-line
    cy.wait(200);
    cy.get("#manualOptionEntry").click({ force: true });
    cy.get("form").submit();
    cy.url().should("include", landingsTypeConfirmationUrl);
  });

  it("should redirect to the forbidden page when unauthorised is true", () => {
    cy.get("[data-testid=continue]").click({ force: true });

    cy.url().should("include", "/forbidden");
  });
});
