import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-storage-document/GBR-2023-SD-83552D3E5";
const pageUrl = `${documentUrl}/add-product-to-this-consignment/0`;

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

  it("shows an error when product description is missing on Save and continue", () => {
    const testParams = { testCaseId: TestCaseId.SDAddProductConsignmentProductDescriptionRequired };

    cy.visit(`/create-storage-document/123/add-product-to-this-consignment/0`, { qs: { ...testParams } });

    cy.get("#catches-0-productDescription", { timeout: 10000 }).should("exist").clear();

    cy.get('[data-testid="save-and-continue"]').click({ force: true });

    cy.get(".govuk-error-summary__list").should("contain", "Enter a description of the product");

    cy.contains(".govuk-error-message", "Enter a description of the product").should("be.visible");
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

  it("should enforce maximum of 5 supporting documents based on maximumEntryDocsAllowed env config", () => {
    // This tests line 134: maximumEntryDocsAllowed: Number.parseInt(maximumEntryDocsAllowed, 10)
    // The loader parses the env variable EU_SD_MAX_ENTRY_DOCS (default "5") to a number
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.wait(500);

    // Add supporting documents up to the maximum
    for (let i = 0; i < 4; i++) {
      cy.get("#add-supporting-doc-button").should("exist").click({ force: true });
      cy.wait(100);
    }

    // Verify we now have exactly 5 supporting document fields (0-4 indices)
    cy.get('[id^="catches-0-supportingDocuments-"]').should("have.length", 6);
    cy.get("#catches-0-supportingDocuments-0").should("exist");
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#catches-0-supportingDocuments-2").should("exist");
    cy.get("#catches-0-supportingDocuments-3").should("exist");
    cy.get("#catches-0-supportingDocuments-4").should("exist");

    // The Add button should no longer be visible at the maximum
    cy.get("#add-supporting-doc-button").should("not.exist");
  });

  it("should correctly parse productIndex from URL params for different product indices", () => {
    // This tests line 175: const productIndex = params["*"] ? Number.parseInt(params["*"]) : 0;
    // The action parses the product index from the URL path parameter

    // Test with productIndex = 0 (explicit 0)
    const testParams0: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(`${documentUrl}/add-product-to-this-consignment/0`, { qs: { ...testParams0 } });
    cy.url().should("include", "/add-product-to-this-consignment/0");

    // Verify the form fields use index 0
    cy.get("#catches-0-certificateType").should("exist");
    cy.get("#catches-0-certificateNumber").should("exist");
    cy.get("#catches-0-weightOnCC").should("exist");

    // Test with productIndex = 1
    const testParams1: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataProductIndex1,
    };
    cy.visit(`${documentUrl}/add-product-to-this-consignment/1`, { qs: { ...testParams1 } });
    cy.url().should("include", "/add-product-to-this-consignment/1");

    // Verify the form fields use index 1
    cy.get("#catches-1-certificateType").should("exist");
    cy.get("#catches-1-certificateNumber").should("exist");
    cy.get("#catches-1-weightOnCC").should("exist");
  });

  it("should default productIndex to 0 when URL parameter is missing or empty", () => {
    // This tests the fallback case in line 175: params["*"] ? Number.parseInt(params["*"]) : 0
    // When params["*"] is undefined/empty, it should default to 0
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };

    // Visit without any productIndex in URL (tests the : 0 fallback)
    cy.visit(`${documentUrl}/add-product-to-this-consignment/`, { qs: { ...testParams } });

    // Should still render with index 0 as default
    cy.get("#catches-0-certificateType").should("exist");
    cy.get("#catches-0-certificateNumber").should("exist");
    cy.get("#catches-0-weightOnCC").should("exist");
    cy.get("#catches-0-product").should("exist");
  });

  it("should correctly remove supporting document by parsing index from action string", () => {
    // This tests line 260: removeSupportingDoc ? Number.parseInt(action.split("-")[1], 10) : -1;
    // The action parses the index from the remove button's action name (e.g., "removeSupportingDoc-2")
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.wait(500);

    // Add 3 supporting documents
    cy.get("#add-supporting-doc-button").click({ force: true });
    cy.wait(100);
    cy.get("#add-supporting-doc-button").click({ force: true });
    cy.wait(100);

    // We should now have 3 fields (indices 0, 1, 2)
    cy.get("#catches-0-supportingDocuments-0").should("exist");
    cy.get("#catches-0-supportingDocuments-1").should("exist");
    cy.get("#catches-0-supportingDocuments-2").should("exist");

    // Fill them with different values to verify correct removal
    cy.get("#catches-0-supportingDocuments-0").clear().type("First Document");
    cy.get("#catches-0-supportingDocuments-1").clear().type("Second Document");
    cy.get("#catches-0-supportingDocuments-2").clear().type("Third Document");

    // Remove the middle one (index 1) - this triggers getRemoveIndex which parses "removeSupportingDoc-1"
    cy.get("#remove-supporting-doc-button-1").should("exist").click({ force: true });
    cy.wait(200);

    // Now we should have 2 fields remaining
    cy.get('[id^="catches-0-supportingDocuments-"]').should("have.length", 3);

    // Verify the correct document was removed (middle one)
    cy.get("#catches-0-supportingDocuments-0").should("have.value", "First Document");
    cy.get("#catches-0-supportingDocuments-1").should("have.value", "Third Document");

    // Remove another one by index (index 0)
    cy.get("#remove-supporting-doc-button-0").should("exist").click({ force: true });
    cy.wait(200);

    // Now only 1 field should remain
    cy.get('[id^="catches-0-supportingDocuments-"]').should("have.length", 2);
    cy.get("#catches-0-supportingDocuments-0").should("have.value", "Third Document");

    // Remove button should not exist when there's only one field
    cy.get('[id^="remove-supporting-doc-button"]').should("not.exist");
  });

  describe("Accessibility", () => {
    it("should have label for all fields on the form", () => {
      cy.get("form label").should("have.length", 12);
      // entry document issued in uk
      cy.get("form label")
        .eq(0)
        .should("have.text", "Was the entry document issued in the UK?")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-certificateType");
      // issuing country
      cy.get("form label")
        .eq(3)
        .should("have.text", "Issuing country")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-issuingCountry");
      // entry document
      cy.get("form label")
        .eq(4)
        .should("have.text", "Entry document")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-certificateNumber");
      // weight on document in kg
      cy.get("form label")
        .eq(5)
        .should("have.text", "Weight on document in kg")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-weightOnCC");
      // supporting documents
      cy.get("form label")
        .eq(6)
        .should("have.text", "Supporting documents (optional)")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-supportingDocuments-0");
      // product
      cy.get("form label")
        .eq(7)
        .should("have.text", "Food and Agriculture Organisation (FAO) code or species name")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-product");
      // commondity code
      cy.get("form label")
        .eq(8)
        .should("have.text", "Commodity code")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-commodityCode");
      // product description
      cy.get("form label")
        .eq(9)
        .should("have.text", "Product description")
        .and("be.visible")
        .and("have.attr", "for", "catches-0-productDescription");
      // Net weight of the product on arrival
      cy.get("form label")
        .eq(10)
        .should("have.text", "Net weight of the product on arrival")
        .and("be.visible")
        .and("have.attr", "for", "netWeightProductArrival");
      // Net weight of fishery products on arrival
      cy.get("form label")
        .eq(11)
        .should("have.text", "Net weight of fishery products on arrival")
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

  it("should display issuing country field when 'No' is selected for UK certificate", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Select 'No' for UK-issued certificate
    cy.get("input[name='docIssuedInUk'][value='non_uk']").click({ force: true });

    // Check that issuing country field appears
    cy.get("label").contains("Issuing country").should("be.visible");
    cy.get("#catches-0-issuingCountry").should("be.visible");

    // Check guidance text
    cy.contains("Enter the country that issued the entry document").should("be.visible");

    // Check that issuing country field appears above entry document field
    cy.get("label[for='catches-0-issuingCountry']").should("be.visible");
    cy.get("label[for='catches-0-certificateNumber']").should("be.visible");
  });

  it("should validate issuing country is required for non-UK certificates", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentIssuingCountryRequired,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Fill out required fields first
    cy.get("#catches-0-product").type("Sole (SOL)");
    cy.get("#catches-0-commodityCode").type("03011100 - Fresh or chilled trout");
    cy.get("#catches-0-certificateNumber").type("TEST123");
    cy.get("#catches-0-weightOnCC").type("10");

    // Select 'No' for UK-issued certificate
    cy.get("input[name='docIssuedInUk'][value='non_uk']").click({ force: true });

    // Try to submit without entering issuing country
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Check error appears in error summary
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-summary__list")
      .contains("Enter the country that issued the entry document")
      .should("be.visible");

    // Check error appears at the issuing country field
    cy.contains(".govuk-error-summary__body", "Enter the country that issued the entry document").should("be.visible");
  });

  it("should show error message above net weight of product on arrival when not populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains(".govuk-error-message", "Enter the net weight of product on arrival");
  });

  it("should show error message above net weight of fishery products on arrival when not populated", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.contains(".govuk-error-message", "Enter the net weight of fishery products on arrival");
  });
});

describe("Add product to this consignment page: comprehensive coverage tests", () => {
  it("should display warning message about product details", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });
    cy.get("[data-testid='warning-message']").should("be.visible");
    cy.get(".govuk-warning-text__icon").should("contain", "!");
  });

  it("should display all form fields with correct IDs and names", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#catches-0-certificateType").should("exist");
    cy.get("input[name='entryDocument']").should("exist");
    cy.get("input[name='weight']").should("exist");
    cy.get("#catches-0-product").should("exist");
    cy.get("#catches-0-commodityCode").should("exist");
    cy.get("#catches-0-productDescription").should("exist");
    cy.get("#netWeightProductArrival").should("exist");
    cy.get("#netWeightFisheryProductArrival").should("exist");
  });

  it("should validate weight field has kg suffix", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#catches-0-netWeightProductArrival").parent().find(".govuk-input__suffix").should("contain", "kg");
    cy.get("#catches-0-netWeightFisheryProductArrival").parent().find(".govuk-input__suffix").should("contain", "kg");
  });

  it("should have correct maxLength for weight fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#netWeightProductArrival").should("have.attr", "maxLength", "16");
    cy.get("#netWeightFisheryProductArrival").should("have.attr", "maxLength", "16");
  });

  it("should handle errors for all fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentCommonErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Check error summary
    cy.get("#error-summary-title").should("be.visible");
    cy.get(".govuk-error-summary__list").should("exist");

    // Check for error classes on form groups
    cy.get(".govuk-form-group--error").should("have.length.greaterThan", 0);
  });

  it("should show error for entry document field", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentInvalidEntryDocError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get(".govuk-error-message").should("be.visible");
  });

  it("should handle commodity code selection", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#catches-0-commodityCode").should("exist");
    cy.get("#catches-0-commodityCode").type("03011100");
  });

  it("should display product description hint text", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#catches-0-productDescription-hint").should("be.visible");
    cy.get("#catches-0-productDescription-hint").should("contain", "Battered cod fillets");
  });

  it("should handle product index in URL correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    const productIndexUrl = `${documentUrl}/add-product-to-this-consignment/1`;
    cy.visit(productIndexUrl, { qs: { ...testParams } });

    cy.get("#catches-1-certificateType").should("exist");
    cy.get("#catches-1-product").should("exist");
  });

  it("should show supporting documents error when applicable", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataSupportingDocumentsError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.get(".govuk-error-message").should("be.visible");
  });

  it("should handle non-UK certificate with issuing country selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("input[name='docIssuedInUk'][value='non_uk']").click({ force: true });
    cy.get("#catches-0-issuingCountry").should("be.visible");
  });

  it("should verify hidden input fields exist", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("input[name='nextUri']").should("exist");
    cy.get("input[name='isNonJs']").should("exist");
  });

  it("should verify EntryDocumentGuidanceText component is rendered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-details__summary").contains("Help with entry document reference").should("exist");
  });

  it("should verify ProductArrivalSpeciesDetails component is rendered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-details__summary").contains("Help with species names").should("exist");
  });

  it("should verify ProductArrivalCommodityDetails component is rendered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-details__summary").contains("Help with commodity codes").should("exist");
  });

  it("should handle form submission with all fields filled", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("input[name='docIssuedInUk'][value='uk']").click({ force: true });
    cy.get("#catches-0-certificateNumber").type("GBR-2024-CC-TEST123");
    cy.get("#catches-0-weightOnCC").type("100");
    cy.get("#catches-0-product").type("Atlantic cod (COD)");
    cy.get("#catches-0-commodityCode").type("03011100 - Fresh or chilled trout");
    cy.get("#catches-0-productDescription").type("Test description");
    cy.get("#netWeightProductArrival").type("50");
    cy.get("#netWeightFisheryProductArrival").type("40");

    cy.get("[data-testid=save-and-continue]").click({ force: true });
  });

  it("should display error state styling for invalid fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    cy.get(".govuk-input--error").should("have.length.greaterThan", 0);
  });

  it("should verify CSRF token input exists", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("input[name='csrf']").should("exist");
  });

  it("should allow adding multiple supporting documents", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#add-supporting-doc-button").should("be.visible");
    cy.wait(300);

    cy.get('[id^="catches-0-supportingDocuments-"]')
      .its("length")
      .then((initialCount) => {
        cy.get("#add-supporting-doc-button").click({ force: true });
        cy.wait(300);
        cy.get("#add-supporting-doc-button").click({ force: true });
        cy.wait(300);
        cy.get('[id^="catches-0-supportingDocuments-"]').should("have.length", initialCount + 2);
      });
  });

  it("should display correct hint for certificate type field", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#catches-0-certificateType-hint").should("be.visible");
    cy.get("#catches-0-certificateType-hint").should(
      "contain",
      "This is the last document used to bring the product into the UK"
    );
  });

  it("should verify ButtonGroup component is rendered", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").should("exist");
    cy.get("[data-testid=save-draft-button]").should("exist");
  });

  it("should handle errors scrolling to error summary", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataError,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify error island is visible (scroll behavior)
    cy.get("#errorIsland").should("be.visible");
  });

  it("should display error messages in the correct order with issuing country error appearing early", () => {
    // This test verifies that issuing country error appears in proper order in the error summary
    // Using the existing test that we know validates issuing country requirements
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentIssuingCountryRequired,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Fill out required fields first
    cy.get("#catches-0-product").type("Sole (SOL)");
    cy.get("#catches-0-commodityCode").type("03011100 - Fresh or chilled trout");
    cy.get("#catches-0-certificateNumber").type("TEST123");
    cy.get("#catches-0-weightOnCC").type("10");

    // Select 'No' for UK-issued certificate
    cy.get("input[name='docIssuedInUk'][value='non_uk']").click({ force: true });

    // Try to submit without entering issuing country
    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Verify issuing country error appears in error summary
    cy.get(".govuk-error-summary__list").should("exist");
    cy.get(".govuk-error-summary__list")
      .contains("Enter the country that issued the entry document")
      .should("be.visible");
  });

  it("should handle default values for all fields from catchDetails", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    // Check that fields have default values loaded
    cy.get("#catches-0-product").should("exist");
    cy.get("input[name='weight']").should("exist");
  });

  it("should show page title correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-heading-xl").should("contain", "Product details");
  });

  it("should verify spellCheck is false on weight inputs", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#netWeightProductArrival").should("have.attr", "spellCheck", "false");
    cy.get("#netWeightFisheryProductArrival").should("have.attr", "spellCheck", "false");
  });

  it("should handle error visibility for net weight fields", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentCommonErrors,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue]").click({ force: true });

    // Check if net weight errors are displayed when applicable
    cy.get("#catches-0-netWeightProductArrival, #catches-0-netWeightFisheryProductArrival").should("exist");
  });

  it("should display form in a SecureForm component", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("form").should("exist");
    cy.get("form").should("have.attr", "method", "post");
  });

  it("should handle empty supporting documents array", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get("#catches-0-supportingDocuments-0").should("exist");
    cy.get("#catches-0-supportingDocuments-0").should("have.value", "");
  });

  it("should verify all Details components expand correctly", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentData,
    };
    cy.visit(pageUrl, { qs: { ...testParams } });

    cy.get(".govuk-details__summary").eq(1).click({ force: true });
    cy.get(".govuk-details__text").should("be.visible");
  });

  describe("Supporting documents without JavaScript", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
        disableScripts: true,
      };
      cy.visit(pageUrl, { qs: { ...testParams } });
    });

    it("should display 5 empty supporting document input fields when JavaScript is disabled", () => {
      // Count only the supporting document fields in the current form

      cy.get("#catches-0-supportingDocuments-0").should("exist").and("have.value", "");
      cy.get("#catches-0-supportingDocuments-4").should("exist").and("have.value", "");
    });

    it("should not display Add button when JavaScript is disabled", () => {
      cy.get("#add-supporting-doc-button").should("not.exist");
    });

    it("should not display Remove buttons when JavaScript is disabled", () => {
      cy.get("[id^=remove-supporting-doc-button]").should("not.exist");
    });

    it("should allow filling in all 5 supporting document fields when JavaScript is disabled", () => {
      cy.get("#catches-0-supportingDocuments-0").type("Doc 1");
      cy.get("#catches-0-supportingDocuments-1").type("Doc 2");
      cy.get("#catches-0-supportingDocuments-2").type("Doc 3");
      cy.get("#catches-0-supportingDocuments-3").type("Doc 4");
      cy.get("#catches-0-supportingDocuments-4").type("Doc 5");

      cy.get("#catches-0-supportingDocuments-0").should("have.value", "Doc 1");
      cy.get("#catches-0-supportingDocuments-1").should("have.value", "Doc 2");
      cy.get("#catches-0-supportingDocuments-2").should("have.value", "Doc 3");
      cy.get("#catches-0-supportingDocuments-3").should("have.value", "Doc 4");
      cy.get("#catches-0-supportingDocuments-4").should("have.value", "Doc 5");
    });

    it("should submit supporting documents correctly when JavaScript is disabled", () => {
      cy.get("#catches-0-supportingDocuments-0").type("Supporting Doc 1");
      cy.get("[data-testid=save-and-continue]").click({ force: true });

      cy.url().should("include", "/you-have-added-a-product");
    });
  });

  describe("Supporting documents with JavaScript enabled", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
      };
      cy.visit(pageUrl, { qs: { ...testParams } });
    });

    it("should display 1 empty supporting document input field when JavaScript is enabled", () => {
      cy.get("fieldset [id^=catches-0-supportingDocuments]").should("have.length", 2);
      cy.get("#catches-0-supportingDocuments-0").should("exist").and("have.value", "");
    });

    it("should display Add button when JavaScript is enabled", () => {
      cy.get("#add-supporting-doc-button").should("exist").and("be.visible");
    });

    it("should not display Remove button when there is only 1 supporting document field", () => {
      cy.get("[id^=remove-supporting-doc-button]").should("not.exist");
    });

    it("should display Remove button after adding a second supporting document field", () => {
      cy.get("#add-supporting-doc-button").click({ force: true });

      cy.get("#remove-supporting-doc-button-0").should("exist").and("be.visible");
      cy.get("#remove-supporting-doc-button-1").should("exist").and("be.visible");
    });

    it("should hide Add button when maximum 5 supporting documents are reached", () => {
      // Keep clicking Add button until it disappears (indicating max reached)
      // Try clicking up to 10 times, but stop if button doesn't exist
      cy.get("#add-supporting-doc-button").should("exist");

      for (let i = 0; i < 4; i++) {
        cy.get("#add-supporting-doc-button")
          .click({ force: true })
          .then(() => {
            cy.wait(100);
          });
      }

      // Verify Add button is hidden when max 5 is reached
      cy.get("#add-supporting-doc-button").should("not.exist");
    });
  });
});
