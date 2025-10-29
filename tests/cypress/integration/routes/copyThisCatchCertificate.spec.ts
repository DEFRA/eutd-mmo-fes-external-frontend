import { type ITestParams, TestCaseId } from "~/types";

const pageUrl = "create-catch-certificate/GBR-2022-CC-F71D98A30/copy-this-catch-certificate";

describe("Copy this catch certificate address page: Allowed", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyAllowed,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("should render back button when on click should to navigate to cc dashboard page", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `/create-catch-certificate/catch-certificates`);
    cy.findByRole("link", { name: "Back" }).click({ force: true });
    cy.url().should("include", "/catch-certificates");
  });

  it("should render Acknowledgement text", () => {
    cy.contains("[data-testid='ackid']", "Acknowledgement");
  });

  it("should render the correct warning text", () => {
    cy.contains(
      "div > strong",
      "You must not use a catch certificate or landing data for catches that have already been exported. Knowingly reusing catch certificates or using landing data that relate to a previous export is a serious offence and may result in enforcement action being taken."
    );
  });

  it("should render the  cancel button and on click should navigate to cc dashboard page", () => {
    cy.contains("button", "Cancel").should("be.visible");
    cy.get("[data-testid=cancel]").click({ force: true });
    cy.url().should("include", "/catch-certificates");
  });

  it("should render the  Create draft catch certificate button", () => {
    cy.contains("button", "Create draft catch certificate").should("be.visible");
  });

  it("should render the radio and check box copy options and labels ", () => {
    cy.get("form").should(($form) => {
      expect($form.find("input[type='radio']")).to.have.lengthOf(3);
      expect($form.find("input[type='checkbox']")).to.have.lengthOf(1);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radioBoxes = radioObjects.get();

      expect(radioBoxes).to.have.length(3);
      expect(labels).to.have.length(4);
      expect(labels).to.deep.eq([
        "Copy all certificate data",
        "Copy all certificate data EXCEPT the landings",
        "Copy all certificate data AND void the original",
        "I understand I must not reuse the same catch certificate or landing data for catches that have already been exported",
      ]);
    });
  });
});

describe("Error summary", () => {
  it("should display errors on empty form submitted", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyThisCatchCertfifcateSave,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=continue]").click({ force: true });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select an option to continue$/).should("be.visible");
    cy.contains("a", /^Check the acknowledgement to continue$/).should("be.visible");
  });
});

describe("Submit form with copy all certificate data option on click of continue button", () => {
  it("should redirect to landing entry page when copyAllCertificateData option is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyThisCatchCertAllData,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#voidOriginal").click({ force: true });
    cy.get("#copyDocumentAcknowledged").check();
    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", "/landings-entry");
  });
});

describe("Submit form with copy excludeLandings option on click of continue button", () => {
  it("should redirect to landing entry page when copyExcludeLandings option is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyThisCatchCertAllData,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#copyExcludeLandings").click({ force: true });
    cy.get("#copyDocumentAcknowledged").check();
    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", "/landings-entry");
  });
});

describe("Submit form with copy all certificate data AND void the original option on click of continue button", () => {
  it("should redirect to copy-void-confirmation page when voidDocumentConfirm option is selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyThisCatchCertAllData,
      disableScripts: true,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#voidDocumentConfirm").click();
    cy.get("#copyDocumentAcknowledged").check();
    cy.get("[data-testid=continue]").click({ force: true });
    cy.url().should("include", "/copy-void-confirmation");
  });
});

describe("Copy this catch certificate address page: Disallowed", () => {
  it("should redirect to the forbidden page if copying is not permitted", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCopyDisallowed,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });
});
