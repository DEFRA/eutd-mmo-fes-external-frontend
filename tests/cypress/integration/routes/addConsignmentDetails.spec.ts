import { type ITestParams, TestCaseId } from "~/types";

describe("Add consignment details page", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-consignment-details`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
  });

  it("will have a back link to the add exporters details page", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${documentUrl}/add-exporter-details`);
  });

  it("will have a progress link to the progress page", () => {
    cy.contains("a", "Back to your progress").should("be.visible");
    cy.contains("a", "Back to your progress")
      .should("be.visible")
      .should("have.attr", "href", `${documentUrl}/progress`);
  });

  it("will have a help link", () => {
    cy.contains("a", "Get help exporting fish from the UK (gov.uk)").should("be.visible");
    cy.contains("a", "Get help exporting fish from the UK (gov.uk)")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/guidance/exporting-and-importing-fish-if-theres-no-brexit-deal");
  });

  it("will have a hint for commodity codes", () => {
    cy.get("#commodityCode-hint")
      .should("be.visible")
      .should("have.text", "Start typing to search  for the correct commodity code for your fish product");
  });

  it("will have a hint for description of the product", () => {
    cy.get(".dcx-hint")
      .should("be.visible")
      .should(
        "have.text",
        "The details entered here will appear on your document and must be legible in English. For example Battered cod fillets"
      );
  });

  it("will link to the processing statement progress page", () => {
    cy.get("#backToProgress").click({ force: true });
    cy.url().should("include", "/create-processing-statement/GBR-2021-PS-8EEB7E123/progress");
  });

  it("should show validation errors once adding commodity code and product description with no values", () => {
    cy.get("[data-testid*='save-and-continue'").eq(0).click({ force: true });
    cy.url().should("include", "/add-consignment-details");
    cy.get("#error-summary-title").contains("There is a problem");

    cy.get("a").contains("Select a commodity code");
    cy.get(".govuk-error-message").contains("Select a commodity code");
    cy.get("a").contains("Enter a description of the product");
    cy.get(".govuk-error-message").contains("Enter a description of the product");
  });
});

describe("Add consignment details when updating product description", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-consignment-details/0`;

  it("will display current added consignment details", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetails,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get('input[name="consignmentDescription"]')
      .should("be.visible")
      .should("have.value", "Herring fillets and Atlantic cod fishcakes");

    cy.get("#continue").should("be.visible").should("have.text", "Save and continue");
    cy.get('[data-testid="save-and-continue"]').click({ force: true });
    cy.url().should("contain", "/add-consignment-details");
  });
});

describe("Get consignment details page: unauthorised access", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-consignment-details`;

  it("will have a back link to the add exporters details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsUnauthorised,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
    cy.get("h1").contains("Forbidden");
  });
});

describe("Add consignment details page: get unauthorised access", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-consignment-details`;

  it("will render the unauthorised page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddProcessingPlantDetailsUnauthorised,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
    cy.get("h1").contains("Forbidden");
  });
});

describe("Add consignment details page: post unauthorised access", () => {
  const documentUrl = "/create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-consignment-details`;

  it("will redirect to the exporter dashboard", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddConsignmentDetailsUnauthorised,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-processing-statement/processing-statements");
  });
});

describe("Add consignment details: save consignment details", () => {
  const documentUrl = "create-processing-statement/GBR-2021-PS-8EEB7E123";
  const pageUrl = `${documentUrl}/add-consignment-details`;

  it("will save the consignment details as draft and take the exporter the PS dashboard", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddConsignmentDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-processing-statement/processing-statements");
  });

  it("will save the consignment details and take the exporter the next page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddConsignmentDetails,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/create-processing-statement/GBR-2021-PS-8EEB7E123/add-catch-details");
  });

  it("will click on save and continue button and redirect to forbidden page for unauthorised access", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddConsignmentDetailsSaveAndContinueUnauthorised,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("will display a consignment detail error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSPostAddConsignmentDetailsError,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/add-consignment-details");
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get("a").contains("Enter at least one product");
    cy.get(".govuk-error-message").contains("Enter at least one product");
  });
});
