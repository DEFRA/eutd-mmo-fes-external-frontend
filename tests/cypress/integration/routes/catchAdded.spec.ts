import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-processing-statement/GBR-2022-PS-12EE387DB";
const progressUrl = `${documentUrl}/progress`;
const pageUrl = `${documentUrl}/catch-added`;

describe("PS: Catch added", () => {
  it("navigating from the Progress page should redirect to add consignment details if there is no products", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedFromProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });

    cy.title().should("eq", "Your Progress - Create a UK processing statement - GOV.UK");

    cy.findByRole("link", { name: "Processed product details" }).click({ force: true });
    cy.url().should("include", "/add-consignment-details");
  });

  it("should have correct backlink", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedFromProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/);
  });

  it("navigating from the Progress page should redirect to add consignment details if the second catch does not have either a species or catch certificate number", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedFromProgressNoCatchDetails1,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });

    cy.findByRole("link", { name: "Processed product details" }).click({ force: true });
    cy.url().should("include", "/add-consignment-details");
  });

  it("navigating from the Progress page should render with an Edit link but without the Remove button if there is only one catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });

    cy.findByRole("link", { name: "Processed product details" }).click({ force: true });

    cy.url().should("include", "/catch-added");

    cy.contains("a", /^Back$/)
      .should("have.attr", "href")
      .and("include", "add-catch-details");

    cy.get("[data-testid='edit-button']").should("have.length", 1);
    cy.get("[data-testid='remove-button']").should("not.exist");
  });

  it("should render with only Edit links at least one catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 2 processed products to this consignment - Create a UK processing statement - GOV.UK"
    );

    cy.get("button[id^=edit-species]").should("have.length", 2);

    cy.contains("button", "Save and continue").click({ force: true });

    cy.url().should("include", "/add-processing-plant-details");
  });

  it("should click Edit link", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedTwoCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 2 processed products to this consignment - Create a UK processing statement - GOV.UK"
    );
    cy.get("[data-testid='edit-button']").eq(0).click({ force: true });
    cy.url().should("include", "create-processing-statement");
    cy.url().should("include", "add-catch-details");
  });

  it("should allow continuing if the catch is valid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.title().should(
      "eq",
      "You have added 1 processed product to this consignment - Create a UK processing statement - GOV.UK"
    );

    cy.contains("button", "Save and continue").click({ force: true });

    cy.url().should("include", "/add-processing-plant-details");

    cy.url().should("not.include", "/add-catch-details");
  });

  it("should allow continuing if trying to add a new catch entry", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedBlankOneCatch,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.wait(200);
    cy.get('[type="radio"]').first().check();
    cy.contains("button", "Save and continue").click({ force: true });

    cy.url().should("include", "/add-catch-details");
  });

  it("should prevent continuing and display errors if one or more catches are invalid", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.contains("button", "Save and continue").click({ force: true });

    cy.get("#errorIsland").should("exist");

    cy.url().should("include", "/catch-added");
  });

  it("should be able to temporarily mark catches for removal", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    const originalEntryCount = 3;
    cy.get("tbody > tr").should("have.length", originalEntryCount);

    cy.get("[data-testid=remove-button]").eq(1).click({ force: true });
    cy.get("tbody > tr").should("have.length", originalEntryCount - 1);

    cy.contains("a", "Back to your progress").click({ force: true });
    cy.contains("a", "Processed product details").click({ force: true });

    cy.get("tbody > tr").should("have.length", originalEntryCount);
  });

  it("should be able to temporarily mark catches for removal and click on saveandcontinue", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    const originalEntryCount = 3;
    cy.get("tbody > tr").should("have.length", originalEntryCount);

    cy.get("[data-testid=remove-button]").eq(1).click({ force: true });
    cy.get("tbody > tr").should("have.length", originalEntryCount - 1);

    cy.contains("button", "Save and continue").click({ force: true });
  });

  it("should be able to temporarily mark catches for removal in non-JS mode", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
      disableScripts: true,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    const originalEntryCount = 3;
    cy.get("tbody tr").should("have.length", originalEntryCount);

    cy.get("button[id^=remove-species]").eq(1).click({ force: true });
    cy.get("tbody tr").should("have.length", originalEntryCount - 1);

    cy.contains("a", "Back to your progress").click({ force: true });
    cy.contains("a", "Processed product details").click({ force: true });

    cy.get("tbody tr").should("have.length", originalEntryCount);
  });

  it("should navigate to the correct entry if editing a catch after temporarily marking another catch for removal", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchAddedOneValidTwoInvalidCatches,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("tbody tr").first().find("td").first().invoke("text").should("have.length", 16);
  });

  it("should restore removed lines if you press save as draft", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCatchRestoreRemovedLines,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("tbody > tr").should("have.length", 3);

    cy.get("[data-testid=remove-button]").eq(1).click({ force: true });
    cy.get("tbody > tr").should("have.length", 2);

    cy.contains("button", "Save as draft").click({ force: true });

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("tbody > tr").should("have.length", 3);
  });
});
