import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2022-CC-24F279E85";
const landingsUrl = `${documentUrl}/landings-entry`;
const WhoseWaterUrl = `${documentUrl}/whose-waters-were-they-caught-in`;
const WhatExportUrl = `${documentUrl}/what-export-journey`;

describe("Whose waters page: user Interface", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersNull,
    };
    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });
  });

  it("should render back button", () => {
    cy.wrap(true).should("be.true");
    cy.contains("a", /^Back$/).should("be.visible");
  });

  it("should render the correct headings", () => {
    cy.wrap(true).should("be.true");
    cy.contains("h1", "Whose waters were the fish or shellfish caught in?").should("be.visible");
  });

  it("should render the three whose waters checkboxes and labels ", () => {
    cy.wrap(true).should("be.true");
    cy.get("form").should(($form) => {
      expect($form.find("input[type='checkbox']")).to.have.lengthOf(3);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const radioObjects = $form.find("input[type='checkbox']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const checkBoxes = radioObjects.get();

      expect(checkBoxes).to.have.length(3);
      expect(labels).to.have.length(3);
      expect(labels).to.deep.eq(["UK, British Isles", "EU", "Other"]);
    });
  });

  it("should render the whose waters input conditionally", () => {
    cy.wrap(true).should("be.true");
    cy.contains(
      "label",
      "The details entered here will appear on your document and must be legible in English."
    ).should("not.exist");
    cy.get("#otherWaters").should("not.exist");

    cy.get("#caughtInOtherWaters").check();

    cy.contains(
      "label",
      "The details entered here will appear on your document and must be legible in English."
    ).should("exist");
    cy.get("#otherWaters").should("exist");
  });

  it("should render the  Save as draft button", () => {
    cy.wrap(true).should("be.true");
    cy.contains("button", "Save as draft").should("be.visible");
  });

  it("should render the  Save and continue button", () => {
    cy.wrap(true).should("be.true");
    cy.contains("button", "Save and continue").should("be.visible");
  });
});

describe("Whose waters page: page guard", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersTypePageGuard,
    };
    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });
  });

  it("should redirect to landings entry page when the user tries to access the whose waters page with null landings entry", () => {
    cy.wrap(true).should("be.true");
    cy.url().should("include", landingsUrl);
  });
});

describe("Whose waters page: redirect to forbidden page", () => {
  it("should redirect to the forbidden page if the user is unauthorised to access a document number", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.GetWhoseWatersFailsWith403,
    };

    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the forbidden page if the user is unauthorised to save the whose waters data", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PostWhoseWatersFailsWith403,
    };

    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "/forbidden");
  });
});

describe("Whose waters page page: Error summary", () => {
  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersFailsWithErrors,
    };
    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click();

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select whose waters the fish or shellfish were caught in$/).should("be.visible");
    cy.contains("a", /^Enter whose waters the fish or shellfish were caught in$/).should("be.visible");
    cy.contains("div > fieldset > p.govuk-error-message > span", /^Error:/).should("be.visible");
  });
});

describe("Whose waters page page: buttons functionality", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersSuccess,
    };
    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });
  });

  it("should be able to navigate to the dashboard when the user clicks save-as-draft button", () => {
    cy.wrap(true).should("be.true");
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should be able to navigate to the export journey page when the user checks all and clicks save and continue button", () => {
    cy.wrap(true).should("be.true");
    cy.get("#caughtInEUWaters").check();
    cy.get("[name=caughtInEUWaters]").check();
    cy.get("#caughtInOtherWaters").check();
    cy.get("#otherWaters").type("canada");
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", WhatExportUrl);
  });
});

describe("Whose waters page: conditional input", () => {
  it("should not render conditional input by default", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersNull,
    };

    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });

    cy.findByRole("textbox").should("not.exist");
    cy.findGovUkLabel("The details entered here will appear on your document and must be legible in English.").should(
      "not.exist"
    );
  });

  it("should render conditional input when JavaScript is disabled", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersNull,
      disableScripts: true,
    };

    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });

    cy.findByRole("textbox").should("exist");
    cy.findGovUkLabel("The details entered here will appear on your document and must be legible in English.").should(
      "exist"
    );
  });
});

describe("Whose waters page: back button", () => {
  it("will redirect to the 'what-are-you-exporting' page with zero products", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersNoProducts,
    };

    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/).click();
    cy.url().should("include", "/create-catch-certificate/GBR-2022-CC-24F279E85/what-are-you-exporting");
  });

  it("will redirect to the 'add-landings' page with 1 or more products", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersNull,
    };

    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/).click();
    cy.url().should("include", "/create-catch-certificate/GBR-2022-CC-24F279E85/add-landings");
  });

  it("will redirect to the 'direct-landings' page with 1 or more products", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersSuccess,
    };

    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/).click();
    cy.url().should("include", "/create-catch-certificate/GBR-2022-CC-24F279E85/direct-landing");
  });
});

describe("Whose waters page: save as draft — valid fields only (FI0-10577)", () => {
  it("should redirect to dashboard and save only valid checkboxes when Other is checked with blank text", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhoseWatersSaveAsDraftWithInvalidOtherWaters,
    };

    cy.visit(WhoseWaterUrl, { qs: { ...testParams } });

    // Check UK waters (valid) and Other (invalid — leave text blank)
    cy.get("#watersCaughtIn").check();
    cy.get("#other").check();
    // Intentionally leave otherWaters text empty

    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });
});
