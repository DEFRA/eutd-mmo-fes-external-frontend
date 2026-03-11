// Test Intent: Verify static page structure, navigation, guidance sections, and accessibility
// of the Add Product to This Consignment page. Each describe uses a shared beforeEach that
// asserts the page heading as the Remix SSR hydration-ready signal – no fixed cy.wait() calls.

import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-non-manipulation-document/GBR-2023-SD-83552D3E5";
const pageUrl = `${documentUrl}/add-product-to-this-consignment/0`;
const defaultTestParams: ITestParams = { testCaseId: TestCaseId.SDAddProductConsignmentData };

describe("Add product to this consignment: page structure and navigation", () => {
  beforeEach(() => {
    cy.visit(pageUrl, { qs: defaultTestParams });
    cy.get(".govuk-heading-xl").should("be.visible");
  });

  it("should render the page title", () => {
    cy.get(".govuk-heading-xl").should("contain", "Product details");
  });

  it("should have a back link to the add exporters details page", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .and("have.attr", "href", `${documentUrl}/add-exporter-details`);
  });

  it("should have a progress link to the progress page", () => {
    cy.contains("a", "Back to your progress").should("be.visible").and("have.attr", "href", `${documentUrl}/progress`);
  });

  it("should display a warning message for product details", () => {
    cy.get("[data-testid='warning-message']").should("be.visible");
    cy.get(".govuk-warning-text__icon").should("contain", "!");
  });

  it("should display all form fields with correct IDs", () => {
    cy.get("#catches-0-certificateType").should("exist");
    cy.get("input[name='entryDocument']").should("exist");
    cy.get("input[name='weight']").should("exist");
    cy.get("#catches-0-product").should("exist");
    cy.get("#catches-0-commodityCode").should("exist");
    cy.get("#catches-0-productDescription").should("exist");
    cy.get("#netWeightProductArrival").should("exist");
    cy.get("#netWeightFisheryProductArrival").should("exist");
  });

  it("should render a POST form with CSRF, nextUri, and isNonJs hidden inputs", () => {
    cy.get("form").should("exist").and("have.attr", "method", "post");
    cy.get("input[name='csrf']").should("exist");
    cy.get("input[name='nextUri']").should("exist");
    cy.get("input[name='isNonJs']").should("exist");
  });

  it("should render save-and-continue and save-draft buttons", () => {
    cy.get("[data-testid=save-and-continue]").should("exist");
    cy.get("[data-testid=save-draft-button]").should("exist");
  });

  it("should display kg suffix on net weight fields", () => {
    cy.get("#catches-0-netWeightProductArrival").parent().find(".govuk-input__suffix").should("contain", "kg");
    cy.get("#catches-0-netWeightFisheryProductArrival").parent().find(".govuk-input__suffix").should("contain", "kg");
  });

  it("should have maxLength of 16 on net weight inputs", () => {
    cy.get("#netWeightProductArrival").should("have.attr", "maxLength", "16");
    cy.get("#netWeightFisheryProductArrival").should("have.attr", "maxLength", "16");
  });

  it("should have spellCheck disabled on net weight inputs", () => {
    cy.get("#netWeightProductArrival").should("have.attr", "spellCheck", "false");
    cy.get("#netWeightFisheryProductArrival").should("have.attr", "spellCheck", "false");
  });

  it("should display certificate type hint text", () => {
    cy.get("#catches-0-certificateType-hint")
      .should("be.visible")
      .and("contain", "This is the last document used to bring the product into the UK");
  });

  it("should display product description hint text", () => {
    cy.get("#catches-0-productDescription-hint").should("be.visible").and("contain", "Battered cod fillets");
  });

  it("should render 4 expandable guidance sections", () => {
    cy.get(".govuk-details__summary").should("have.length", 4);
  });

  it("should expand entry document guidance and show correct content", () => {
    cy.get(".govuk-details__summary").contains("Help with entry document reference").click();
    cy.get(".govuk-details__text")
      .contains("The UK entry document is the official paperwork that allowed the product to enter the UK.")
      .should("be.visible");
    cy.get(".govuk-details__text").contains("A catch certificate").should("be.visible");
    cy.get(".govuk-details__text").contains("A processing statement").should("be.visible");
    cy.get(".govuk-details__text").contains("A non-manipulation document").should("be.visible");
  });

  it("should expand supporting documents guidance and show correct content", () => {
    cy.get(".govuk-details__summary").contains("Help with supporting documents").click();
    cy.get(".govuk-details__text")
      .contains("Supporting documents are additional records that back up the information in your UK entry document.")
      .should("be.visible");
    cy.get(".govuk-details__text").contains("Catch certificates").should("be.visible");
    cy.get(".govuk-details__text").contains("Processing statements").should("be.visible");
    cy.get(".govuk-details__text").contains("Non-manipulation documents").should("be.visible");
  });

  it("should expand species guidance and show correct content", () => {
    cy.get(".govuk-details__summary").contains("Help with species names").click();
    cy.get(".govuk-details__text").contains("Some species are exempt from this requirement:").should("be.visible");
    cy.get(".govuk-details__text")
      .contains("See the list of exempt species on europa.eu (opens in new tab)")
      .should("be.visible");
  });

  it("should expand commodity code guidance and show correct content", () => {
    cy.get(".govuk-details__summary").contains("Help with commodity codes").click();
    cy.get(".govuk-details__text")
      .contains("You can use the UK Integrated Online Tariff to find the correct commodity code (opens in new tab)")
      .should("be.visible");
  });

  it("should show form fields keyed to productIndex=0 from the URL", () => {
    cy.get("#catches-0-certificateType").should("exist");
    cy.get("#catches-0-certificateNumber").should("exist");
    cy.get("#catches-0-weightOnCC").should("exist");
    cy.get("#catches-0-product").should("exist");
  });

  it("should show issuing country field when non-UK certificate is selected", () => {
    cy.get("input[name='docIssuedInUk'][value='non_uk']").click({ force: true });
    cy.get("label[for='catches-0-issuingCountry']").should("be.visible");
    cy.get("#catches-0-issuingCountry").should("be.visible");
    cy.contains("Enter the country that issued the entry document").should("be.visible");
  });

  it("should redirect to forbidden page when user is unauthorized", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentForbidden } });
    cy.url().should("include", "/forbidden");
  });
});

describe("Add product to this consignment: accessibility", () => {
  beforeEach(() => {
    cy.visit(pageUrl, { qs: defaultTestParams });
    cy.get(".govuk-heading-xl").should("be.visible");
  });

  it("should have correct label for certificate type field", () => {
    cy.get("label[for='catches-0-certificateType']")
      .should("have.text", "Was the entry document issued in the UK?")
      .and("be.visible");
  });

  it("should have correct label for issuing country field", () => {
    cy.get("label[for='catches-0-issuingCountry']").should("have.text", "Issuing country").and("be.visible");
  });

  it("should have correct label for entry document field", () => {
    cy.get("label[for='catches-0-certificateNumber']").should("have.text", "Entry document").and("be.visible");
  });

  it("should have correct label for weight field", () => {
    cy.get("label[for='catches-0-weightOnCC']").should("have.text", "Weight on document in kg").and("be.visible");
  });

  it("should have correct label for supporting documents field", () => {
    cy.get("label[for='catches-0-supportingDocuments-0']")
      .should("have.text", "Supporting documents (optional)")
      .and("be.visible");
  });

  it("should have correct label for species field", () => {
    cy.get("label[for='catches-0-product']")
      .should("have.text", "Food and Agriculture Organisation (FAO) code or species name")
      .and("be.visible");
  });

  it("should have correct label for commodity code field", () => {
    cy.get("label[for='catches-0-commodityCode']").should("have.text", "Commodity code").and("be.visible");
  });

  it("should have correct label for product description field", () => {
    cy.get("label[for='catches-0-productDescription']").should("have.text", "Product description").and("be.visible");
  });

  it("should have correct label for net weight of product on arrival field", () => {
    cy.get("label[for='netWeightProductArrival']")
      .should("have.text", "Net weight of the product on arrival")
      .and("be.visible");
  });

  it("should have correct label for net weight of fishery products on arrival field", () => {
    cy.get("label[for='netWeightFisheryProductArrival']")
      .should("have.text", "Net weight of fishery products on arrival")
      .and("be.visible");
  });

  it("should have valid aria-describedby for document issued in UK fieldset", () => {
    cy.get("#catches-0-certificateType fieldset").should(
      "have.attr",
      "aria-describedby",
      "catches-0-certificateType-hint"
    );
    cy.get("#catches-0-certificateType-hint").should(
      "have.text",
      "This is the last document used to bring the product into the UK."
    );
  });

  it("should have valid aria-describedby for entry document field", () => {
    cy.get("#catches-0-certificateNumber").should("have.attr", "aria-describedby", "catches-0-certificateNumber-hint");
    cy.get("#catches-0-certificateNumber-hint").should(
      "have.text",
      "Enter the entry document reference number, including any hyphens, dashes or other characters. For example: GBR-2024-CC-BEFCD6036"
    );
  });

  it("should have valid aria-describedby for supporting documents field", () => {
    cy.get("#catches-0-supportingDocuments-0").should(
      "have.attr",
      "aria-describedby",
      "catches-0-supportingDocuments-0-hint"
    );
    cy.get("#catches-0-supportingDocuments-0-hint").should(
      "have.text",
      "If your UK entry document is a processing statement, you must provide the reference number for any supporting documents."
    );
  });

  it("should have valid aria-describedby for product field", () => {
    cy.get("#catches-0-product").should("have.attr", "aria-describedby", "catches-0-product-hint");
    cy.get("#catches-0-product-hint").should(
      "have.text",
      "Start typing a species name or FAO code to see suggestions, for example Atlantic cod or COD."
    );
  });

  it("should have valid aria-describedby for commodity code field", () => {
    cy.get("#catches-0-commodityCode").should("have.attr", "aria-describedby", "catches-0-commodityCode-hint");
    cy.get("#catches-0-commodityCode-hint").should(
      "have.text",
      "Start typing to search for the correct commodity code for your fish product."
    );
  });

  it("should have valid aria-describedby for product description field", () => {
    cy.get("#catches-0-productDescription").should(
      "have.attr",
      "aria-describedby",
      "catches-0-productDescription-hint"
    );
    cy.get("#catches-0-productDescription-hint").should(
      "have.text",
      "The details entered here will appear on your document and must be legible in English. For example, Battered cod fillets"
    );
  });

  it("should have valid aria-describedby for net weight product arrival field", () => {
    cy.get("#catches-0-netWeightProductArrival").should(
      "have.attr",
      "aria-describedby",
      "catches-0-netWeightProductArrival-hint"
    );
    cy.get("#catches-0-netWeightProductArrival-hint").should(
      "have.text",
      "This is the weight of the whole product, including all ingredients \u2013 not just the fish. For example, a fish pie weighing 350g."
    );
  });

  it("should have valid aria-describedby for net weight fishery product arrival field", () => {
    cy.get("#catches-0-netWeightFisheryProductArrival").should(
      "have.attr",
      "aria-describedby",
      "catches-0-netWeightFisheryProductArrival-hint"
    );
    cy.get("#catches-0-netWeightFisheryProductArrival-hint").should(
      "have.text",
      "This is the weight of the fish only \u2013 do not include any other ingredients. For example, 200g of cod used in a fish pie."
    );
  });
});

describe("Add product to this consignment: product index URL parameters", () => {
  it("should render form fields with index 0 for productIndex=0 URL", () => {
    cy.visit(`${documentUrl}/add-product-to-this-consignment/0`, {
      qs: { testCaseId: TestCaseId.SDAddProductConsignmentData },
    });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("#catches-0-certificateType").should("exist");
    cy.get("#catches-0-certificateNumber").should("exist");
    cy.get("#catches-0-weightOnCC").should("exist");
  });

  it("should render form fields with index 1 for productIndex=1 URL", () => {
    cy.visit(`${documentUrl}/add-product-to-this-consignment/1`, {
      qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataProductIndex1 },
    });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("#catches-1-certificateType").should("exist");
    cy.get("#catches-1-certificateNumber").should("exist");
    cy.get("#catches-1-weightOnCC").should("exist");
  });

  it("should default to index 0 when URL productIndex parameter is missing", () => {
    cy.visit(`${documentUrl}/add-product-to-this-consignment/`, {
      qs: { testCaseId: TestCaseId.SDAddProductConsignmentData },
    });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("#catches-0-certificateType").should("exist");
    cy.get("#catches-0-certificateNumber").should("exist");
    cy.get("#catches-0-weightOnCC").should("exist");
    cy.get("#catches-0-product").should("exist");
  });
});
