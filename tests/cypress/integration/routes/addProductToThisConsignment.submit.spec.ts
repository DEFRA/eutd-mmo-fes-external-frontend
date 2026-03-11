// Test Intent: Verify form submission behaviour, validation error rendering, issuing country
// validation, net weight / fishery weight validation, and product index tracking in redirect URLs.
// Page readiness is asserted via .govuk-heading-xl visibility – no fixed cy.wait() calls.

import { TestCaseId } from "~/types";

const documentUrl = "/create-non-manipulation-document/GBR-2023-SD-83552D3E5";
const pageUrl = `${documentUrl}/add-product-to-this-consignment/0`;

describe("Add product to this consignment: form submission", () => {
  it("should redirect to non-manipulation-documents on save as draft", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentData } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-draft-button]").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should redirect to progress page via Back to your progress link", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentData } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("#backToProgress").click();
    cy.url().should("include", "/progress");
  });

  it("should redirect to you-have-added-a-product on successful save and continue", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentData } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "/you-have-added-a-product");
  });

  it("should include nextUri in redirect URL when nextUri query param is provided", () => {
    const nextUri = "?nextUri=/create-non-manipulation-document/GBR-2023-SD-9F893164C/check-your-information";
    cy.visit(pageUrl + nextUri, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentData } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "/you-have-added-a-product").and("include", nextUri);
  });

  it("should pre-populate the non-JS species input with existing catch data", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentData } });
    cy.get("input[name='species']").should("exist").and("have.value", "Peacock sole (ADJ)");
  });
});

describe("Add product to this consignment: validation errors", () => {
  it("should show certificate type error when not selected on submit", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataError } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains(".govuk-error-message", "Select Yes if the document was issued in the UK");
  });

  it("should display error summary and scroll to errorIsland on submit with errors", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataError } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.get("#error-summary-title").should("be.visible");
    cy.get("#errorIsland").should("be.visible");
  });

  it("should apply error styling to invalid fields", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataError } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.get(".govuk-input--error").should("have.length.greaterThan", 0);
    cy.get(".govuk-form-group--error").should("have.length.greaterThan", 0);
  });

  it("should show net weight of product on arrival error when not populated", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataError } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains(".govuk-error-message", "Enter the net weight of product on arrival");
  });

  it("should show net weight of fishery products on arrival error when not populated", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataError } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains(".govuk-error-message", "Enter the net weight of fishery products on arrival");
  });

  it("should show error summary and form group errors for all common error fields", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentCommonErrors } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.get("#error-summary-title").should("be.visible");
    cy.get(".govuk-error-summary__list").should("exist");
    cy.get(".govuk-form-group--error").should("have.length.greaterThan", 0);
  });

  it("should show error message for invalid entry document", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentInvalidEntryDocError } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.get(".govuk-error-message").should("be.visible");
  });

  it("should show incorrect species error when species does not match", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataSpeicesError } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("You have entered an incorrect FAO code or species name");
  });

  it("should show species suggestion error when a close match exists", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataSpeicesSuggestError } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains(
      "You have entered an incorrect FAO code or species name, did you mean one of the following:"
    );
  });

  it("should show error when product description is missing", () => {
    cy.visit("/create-non-manipulation-document/123/add-product-to-this-consignment/0", {
      qs: { testCaseId: TestCaseId.SDAddProductConsignmentProductDescriptionRequired },
    });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("#catches-0-productDescription").should("exist").clear();
    cy.get('[data-testid="save-and-continue"]').click();
    cy.get(".govuk-error-summary__list").should("contain", "Enter a description of the product");
    cy.contains(".govuk-error-message", "Enter a description of the product").should("be.visible");
  });

  it("should show supporting documents error when applicable", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataSupportingDocumentsError } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("[data-testid=save-and-continue]").click();
    cy.get(".govuk-error-message").should("be.visible");
  });
});

describe("Add product to this consignment: issuing country validation", () => {
  it("should show issuing country required error in summary and field", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentIssuingCountryRequired } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get("input[name='docIssuedInUk'][value='non_uk']").click({ force: true });
    cy.get("[data-testid=save-and-continue]").click();
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list")
      .contains("Enter the country that issued the entry document")
      .should("be.visible");
    cy.contains(".govuk-error-summary__body", "Enter the country that issued the entry document").should("be.visible");
  });
});

describe("Add product to this consignment: fishery weight validation", () => {
  describe("when fishery product weight exceeds product weight", () => {
    beforeEach(() => {
      cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentFisheryWeightExceedsProductWeight } });
      cy.get(".govuk-heading-xl").should("be.visible");
      cy.get("[data-testid=save-and-continue]").click();
      // Assert error island visible as the deterministic error-state readiness signal
      cy.get("#errorIsland").should("be.visible");
    });

    it("should show field-level error message", () => {
      cy.contains(
        ".govuk-error-message",
        "Fishery products net weight on arrival cannot exceed the product net weight on arrival."
      ).should("be.visible");
    });

    it("should show the error in the error summary", () => {
      cy.get(".govuk-error-summary__list").should(
        "contain",
        "Fishery products net weight on arrival cannot exceed the product net weight on arrival."
      );
    });

    it("should apply error styling to the fishery product weight form group and input", () => {
      cy.get("#catches-0-netWeightFisheryProductArrival").should("have.class", "govuk-form-group--error");
      cy.get("#netWeightFisheryProductArrival").should("have.class", "govuk-input--error");
    });
  });

  it("should not show fishery weight error when fishery weight is within product weight", () => {
    cy.visit(pageUrl, { qs: { testCaseId: TestCaseId.SDAddProductConsignmentData } });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get('input[value="uk"]').click({ force: true });
    cy.get("#catches-0-certificateNumber").type("GBR-2024-CC-TEST123");
    cy.get("#catches-0-weightOnCC").type("100");
    cy.get("#catches-0-product").type("Atlantic cod (COD)").blur();
    cy.get("#catches-0-commodityCode").type("03011100 - Fresh or chilled trout").blur();
    cy.get("#catches-0-productDescription").type("Test description");
    cy.get("#netWeightProductArrival").type("100");
    cy.get("#netWeightFisheryProductArrival").type("100");
    cy.get("[data-testid=save-and-continue]").click();
    cy.contains(
      ".govuk-error-message",
      "Fishery products net weight on arrival cannot exceed the product net weight on arrival."
    ).should("not.exist");
  });
});

describe("Add product to this consignment: product index in redirect URL", () => {
  it("should include productIndex=0 in redirect URL when adding first product", () => {
    cy.visit(`${documentUrl}/add-product-to-this-consignment/0`, {
      qs: { testCaseId: TestCaseId.SDAddProductConsignmentData },
    });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get('input[value="uk"]').click({ force: true });
    cy.get("#catches-0-certificateNumber").type("TEST123");
    cy.get("#catches-0-weightOnCC").type("100");
    cy.get("#catches-0-product").type("COD").blur();
    cy.get("#catches-0-commodityCode").type("03").blur();
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/you-have-added-a-product").and("include", "productIndex=0");
  });

  it("should include productIndex=1 in redirect URL when adding second product", () => {
    cy.visit(`${documentUrl}/add-product-to-this-consignment/1`, {
      qs: { testCaseId: TestCaseId.SDAddProductConsignmentData },
    });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get('input[value="uk"]').click({ force: true });
    cy.get("#catches-1-certificateNumber").type("TEST456");
    cy.get("#catches-1-weightOnCC").type("200");
    cy.get("#catches-1-product").type("HAD").blur();
    cy.get("#catches-1-commodityCode").type("03").blur();
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/you-have-added-a-product").and("include", "productIndex=1");
  });

  it("should include productIndex=2 in redirect URL when editing product at index 2", () => {
    cy.visit(`${documentUrl}/add-product-to-this-consignment/2`, {
      qs: { testCaseId: TestCaseId.SDAddProductConsignmentData },
    });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get('input[value="uk"]').click({ force: true });
    cy.get("#catches-2-certificateNumber").clear();
    cy.get("#catches-2-certificateNumber").type("EDITED123");
    cy.get("#catches-2-weightOnCC").clear();
    cy.get("#catches-2-weightOnCC").type("150");
    cy.get("#catches-2-product").type("COD").blur();
    cy.get("#catches-2-commodityCode").type("03").blur();
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/you-have-added-a-product").and("include", "productIndex=2");
  });

  it("should preserve both nextUri and productIndex in the redirect URL", () => {
    const productIndex = 1;
    const nextUri = "/some-next-page";
    cy.visit(`${documentUrl}/add-product-to-this-consignment/${productIndex}?nextUri=${encodeURIComponent(nextUri)}`, {
      qs: { testCaseId: TestCaseId.SDAddProductConsignmentData },
    });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get('input[value="uk"]').click({ force: true });
    cy.get(`#catches-${productIndex}-certificateNumber`).type("TEST789");
    cy.get(`#catches-${productIndex}-weightOnCC`).type("100");
    cy.get(`#catches-${productIndex}-product`).type("COD").blur();
    cy.get(`#catches-${productIndex}-commodityCode`).type("03").blur();
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url()
      .should("include", "/you-have-added-a-product")
      .and("include", `productIndex=${productIndex}`)
      .and("include", `nextUri=${nextUri}`);
  });

  it("should include productIndex=0 in redirect when submitted from empty supporting docs case", () => {
    cy.visit(`${documentUrl}/add-product-to-this-consignment/0`, {
      qs: { testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments },
    });
    cy.get(".govuk-heading-xl").should("be.visible");
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/you-have-added-a-product").and("include", "productIndex=0");
  });
});
