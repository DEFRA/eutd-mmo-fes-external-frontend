import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-storage-document/GBR-2023-SD-83552D3E5";
const pageUrl = `${documentUrl}/add-product-to-this-consignment`;

describe("Add product to this consignment  page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
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

  it("should render summary details for all relevant fields and find out the count", () => {
    cy.get(".govuk-details__summary").should("have.length", 4);

    cy.get("div .govuk-details__summary").eq(0).contains("Help with entry document reference");
    cy.get("div .govuk-details__summary").eq(0).click({ force: true });
    cy.get("div .govuk-details__text")
      .contains("The UK entry document is the official paperwork that allowed the product to enter the UK.")
      .should("be.visible");
    cy.get("div .govuk-details__text").contains("Make sure the document is one of the following:").should("be.visible");
    cy.get("div .govuk-details__text").contains("A catch certificate").should("be.visible");
    cy.get("div .govuk-details__text").contains("A processing statement").should("be.visible");
    cy.get("div .govuk-details__text").contains("A non-manipulation document").should("be.visible");

    cy.get("div .govuk-details__summary").eq(1).contains("Help with supporting documents");
    cy.get("div .govuk-details__summary").eq(1).click({ force: true });
    cy.get("div .govuk-details__text")
      .contains("Supporting documents are additional records that back up the information in your UK entry document.")
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .contains(
        "If you’re using a processing statement, you’ll need to include the reference number for each supporting document."
      )
      .should("be.visible");
    cy.get("div .govuk-details__text").contains("These might include:").should("be.visible");
    cy.get("div .govuk-details__text").contains("Catch certificates").should("be.visible");
    cy.get("div .govuk-details__text").contains("Processing statements").should("be.visible");
    cy.get("div .govuk-details__text").contains("Non-manipulation documents").should("be.visible");

    cy.get("div .govuk-details__summary").eq(2).contains("Help with species names");
    cy.get("div .govuk-details__summary").eq(2).click({ force: true });
    cy.get("div .govuk-details__text").contains("Some species are exempt from this requirement:").should("be.visible");
    cy.get("div .govuk-details__text")
      .contains("See the list of exempt species on europa.eu (opens in new tab)")
      .should("be.visible");

    cy.get("div .govuk-details__summary").eq(3).contains("Help with commodity codes");
    cy.get("div .govuk-details__summary").eq(3).click({ force: true });
    cy.get("div .govuk-details__text")
      .contains("You can use the UK Integrated Online Tariff to find the correct commodity code (opens in new tab)")
      .should("be.visible");
  });

  it("should redirect to dashboard on click of save as draft button", () => {
    cy.get("[data-testid=save-draft-button]").click({ force: true });
    cy.url().should("include", "/create-storage-document/storage-documents");
  });

  it("should redirect to progress page", () => {
    cy.get("#backToProgress").click({ force: true });
    cy.url().should("include", "/progress");
  });

  it("should show only the add another button (and not the remove button) when there is a single supporting document input", () => {
    cy.get("#catches-0-supportingDocuments-0").should("be.visible").and("not.be.disabled");
    cy.get('[id^="remove-supporting-doc-button"]').should("not.exist");
    cy.get("#add-supporting-doc-button").should("exist");
  });

  it("should have empty supporting documents if none are added", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("#catches-0-supportingDocuments-0").should("be.visible").and("not.be.disabled");
    cy.get("#catches-0-supportingDocuments-0").should("have.value", "");
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/you-have-added-a-product");
  });
  it("should show Remove and Add Another buttons correctly based on selection length", () => {
    cy.wait(500); // Adding a wait to ensure the button is interactable
    for (let i = 0; i < 4; i++) {
      cy.get("#add-supporting-doc-button").click({ force: true });
    }
    // Check Remove button exists on the last element
    cy.get("[id^=catches-0-supportingDocuments]").should("have.length.greaterThan", 0);
    cy.get("#remove-supporting-doc-button-0").should("exist");
    cy.get("#remove-supporting-doc-button-1").should("exist");
    cy.get("#remove-supporting-doc-button-2").should("exist");
    cy.get("#remove-supporting-doc-button-3").should("exist");
    cy.get("#remove-supporting-doc-button-4").should("exist");

    // Check Add Another button exists on the last element until length is 5
    cy.get("[id^=catches-0-supportingDocuments]").then(($elements) => {
      const length = $elements.length;
      if (length < 5) {
        cy.get("[id^=catches-0-supportingDocuments]").should("have.length.greaterThan", 0);
      } else {
        cy.get("#catches-0-supportingDocuments-4").within(() => {
          cy.get("#add-supporting-doc-button").should("not.exist");
        });
      }
    });
  });

  it("should show Remove and Add Another buttons correctly", () => {
    cy.get("#catches-0-supportingDocuments-0").should("be.visible").and("not.be.disabled");
    cy.get("#add-supporting-doc-button").should("exist");
    cy.get("#remove-supporting-doc-button-0").should("not.exist");
    cy.wait(500); // Adding a wait to ensure the button is interactable
    cy.get("#add-supporting-doc-button").click({ force: true });
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#remove-supporting-doc-button-0").should("exist");
    cy.get("#remove-supporting-doc-button-1").should("exist");
    cy.get("#add-supporting-doc-button").should("exist");
    cy.get("#add-supporting-doc-button").click({ force: true });
    cy.get("#catches-0-supportingDocuments-2").should("exist");
    cy.get("#remove-supporting-doc-button-0").should("exist");
    cy.get("#remove-supporting-doc-button-1").should("exist");
    cy.get("#remove-supporting-doc-button-2").should("exist");
  });
  it("should render the add another doc button and click on it", () => {
    cy.get("#add-supporting-doc-button").should("exist");
    cy.wait(500); // Adding a wait to ensure the button is interactable
    cy.get("#add-supporting-doc-button").click({ force: true });
    cy.get("#catches-0-supportingDocuments-0").should("exist");
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#remove-supporting-doc-button-0").should("exist");
    cy.get("#remove-supporting-doc-button-1").should("exist");
    cy.get("#remove-supporting-doc-button-1").click();
    cy.wait(500);
    cy.get("#catches-0-supportingDocuments-1").should("not.exist");
  });
  it("should remove the last doc and update selectedSupportingDocuments", () => {
    // Wait for all docs to be added
    cy.get("#add-supporting-doc-button").should("exist");
    cy.wait(500); // Adding a wait to ensure the button is interactable
    cy.get("#add-supporting-doc-button").click({ force: true });
    cy.get("#add-supporting-doc-button").click({ force: true });
    cy.get("#add-supporting-doc-button").click({ force: true });
    cy.get("#remove-supporting-doc-button-0").should("be.visible");
    cy.get("#remove-supporting-doc-button-0").click({ force: true });
  });

  it("should click on remove last doc button and select should be removed", () => {
    cy.get("#add-supporting-doc-button").click({ force: true });
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#remove-supporting-doc-button-1").click({ force: true });
    cy.get("#catches-0-supportingDocuments-0").should("exist");
    cy.get("[id^=remove-supporting-doc-button]").should("not.exist");
  });

  it("should enter a value in the supporting documents input field", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.wait(500);
    cy.get("#catches-0-supportingDocuments-0").should("exist");
    cy.get("#catches-0-supportingDocuments-0").type("Supporting Document 1");
    cy.get("#catches-0-supportingDocuments-0").should("have.value", "Supporting Document 1");
  });

  it("should redirect to forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentForbidden,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  describe("Accessibility", () => {
    it("should have label for all fields on the form", () => {
      cy.get("form label").should("have.length", 11);
      // entry document issued in uk
      cy.get("form label")
        .eq(0)
        .should("have.text", "Was the entry document issued in the UK?")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-certificateType");
      // entry document
      cy.get("form label")
        .eq(3)
        .should("have.text", "Entry document")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-certificateNumber");
      // weight on document in kg
      cy.get("form label")
        .eq(4)
        .should("have.text", "Weight on document in kg")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-weightOnCC");
      // supporting documents
      cy.get("form label")
        .eq(5)
        .should("have.text", "Supporting documents (optional)")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-supportingDocuments-0");
      // product
      cy.get("form label")
        .eq(6)
        .should("have.text", "Food and agriculture organisation (FAO) code or species name")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-product");
      // commondity code
      cy.get("form label")
        .eq(7)
        .should("have.text", "Commodity code")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-commodityCode");
      // product description
      cy.get("form label")
        .eq(8)
        .should("have.text", "Product description (optional)")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-productDescription");
      // Net weight of the product on arrival
      cy.get("form label")
        .eq(9)
        .should("have.text", "Net weight of the product on arrival (optional)")
        .and("be.visible")
        .and("have.attr", "for", "netWeightProductArrival");
      // Net weight of fishery products on arrival
      cy.get("form label")
        .eq(10)
        .should("have.text", "Net weight of fishery products on arrival (optional)")
        .and("be.visible")
        .and("have.attr", "for", "netWeightFisheryProductArrival");
    });
    it("should have valid aria-describedby attributes for was entry document issued in uk", () => {
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
    it("should have valid aria-describedby attributes for entry document", () => {
      cy.get("#catches-0-certificateNumber").should(
        "have.attr",
        "aria-describedby",
        "catches-0-certificateNumber-hint"
      );
      cy.get("#catches-0-certificateNumber-hint").should(
        "have.text",
        "Enter the entry document reference number, including any hyphens, dashes or other characters. For example: GBR-2024-CC-BEFCD6036"
      );
    });

    it("should have valid aria-describedby attributes for supporting documents", () => {
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
    it("should have valid aria-describedby attributes for product field", () => {
      cy.get("#catches-0-product").should("have.attr", "aria-describedby", "catches-0-product-hint");
      cy.get("#catches-0-product-hint").should(
        "have.text",
        "Start typing a species name or FAO code to see suggestions, for example Atlantic cod or COD."
      );
    });
    it("should have valid aria-describedby attributes for commodity code field", () => {
      cy.get("#catches-0-commodityCode").should("have.attr", "aria-describedby", "catches-0-commodityCode-hint");
      cy.get("#catches-0-commodityCode-hint").should(
        "have.text",
        "Start typing to search for the correct commodity code for your fish product."
      );
    });
    it("should have valid aria-describedby attributes for product description field", () => {
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
    it("should have valid aria-describedby attributes for net weight of products on arrival field", () => {
      cy.get("#catches-0-netWeightProductArrival").should(
        "have.attr",
        "aria-describedby",
        "catches-0-netWeightProductArrival-hint"
      );
      cy.get("#catches-0-netWeightProductArrival-hint").should(
        "have.text",
        "This is the weight of the whole product, including all ingredients – not just the fish. For example, a fish pie weighing 350g."
      );
    });
    it("should have valid aria-describedby attributes for net weight of fishery products on arrival field", () => {
      cy.get("#catches-0-netWeightFisheryProductArrival").should(
        "have.attr",
        "aria-describedby",
        "catches-0-netWeightFisheryProductArrival-hint"
      );
      cy.get("#catches-0-netWeightFisheryProductArrival-hint").should(
        "have.text",
        "This is the weight of the fish only – do not include any other ingredients. For example, 200g of cod used in a fish pie."
      );
    });
  });
});

describe("Add product to this consignment  page- save and continue", () => {
  it("should click save and continue button with no error response", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
  });

  it("should click on save and continue button with error response", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
  });

  it("should click on save and continue button with error response if species is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataSpeicesError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("You have entered an incorrect FAO code or species name");
  });

  it("should click on save and continue button with error response with species suggestions", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataSpeicesSuggestError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains(
      "You have entered an incorrect FAO code or species name, did you mean one of the following:"
    );
  });
});

describe("Add product to this consignment page: unauthorized access", () => {
  it("should redirect to the forbidden page if the user is unauthorized to get the storage document", () => {
    const testParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentForbidden,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });
});

describe("Add product to this consignment page: form submission and interaction", () => {
  it("should handle form submission and redirect", () => {
    const testParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "/you-have-added-a-product");
  });

  it("should handle form submission and redirect based on nextUri", () => {
    const testParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    const nextUri = "?nextUri=/create-storage-document/GBR-2023-SD-9F893164C/check-your-information";
    cy.visit(pageUrl + nextUri, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click();
    cy.url().should("include", "/you-have-added-a-product");
    cy.url().should("include", nextUri);
  });

  it("should handle non-JS component interaction", () => {
    const testParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };

    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("input[name='species']").should("exist");
    cy.get("input[name='species']").should("have.value", "Peacock sole (ADJ)");
  });

  it("should show error message above document issued in UK radio button when not selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains(".govuk-error-message", "Select Yes if the document was issued in the UK");
  });
});
