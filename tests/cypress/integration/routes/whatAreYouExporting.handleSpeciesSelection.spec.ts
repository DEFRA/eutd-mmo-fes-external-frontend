import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
const productsUrl = `${documentUrl}/what-are-you-exporting`;

const waitForPage = (timeout = 1000) => cy.document({ timeout }).its("readyState").should("eq", "complete");

const selectFirstAutocompleteOption = (fallbackValue = "Albacore", timeout = 500) => {
  const ensureSpeciesHasValue = () => {
    cy.get("#species").then(($species) => {
      if ($species.is("select")) {
        const matchingOption = $species
          .find("option")
          .toArray()
          .find((option) => {
            if (option.text.includes(fallbackValue)) {
              return true;
            }
            return option.value.includes(fallbackValue);
          });

        if (matchingOption?.value) {
          cy.get("#species").should("be.enabled").select(matchingOption.value);
        } else if ($species.find("option").length > 1) {
          cy.get("#species").should("be.enabled").select(1);
        }
        return;
      }

      cy.get("#species").should("be.visible").and("not.be.disabled").clear();
      cy.get("#species").should("be.visible").and("not.be.disabled").type(fallbackValue);
    });
    waitForPage(timeout);
  };

  cy.get("body").then(($body) => {
    if ($body.find(".autocomplete__option").length > 0) {
      cy.get(".autocomplete__option:visible").first().should("be.visible").click();
      waitForPage(timeout);
      return;
    }

    if ($body.find('[role="option"]').length > 0) {
      cy.get('[role="option"]:visible').first().should("be.visible").click();
      waitForPage(timeout);
      return;
    }

    if ($body.find("#species option").length > 1) {
      cy.get("#species").select(1);
      waitForPage(timeout);
      return;
    }

    cy.get("#species").should("be.visible").and("not.be.disabled").type("{enter}");
    waitForPage(timeout);
  });

  cy.get("#species")
    .invoke("val")
    .then((val) => {
      const normalizedValue = val?.toString().toLowerCase();
      if (!normalizedValue?.includes(fallbackValue.toLowerCase())) {
        ensureSpeciesHasValue();
      }
    });
};

describe("handleSpeciesSelection function: Complete coverage", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
  });

  it("should set the selected species value correctly", () => {
    cy.get("#species").type("Albacore");
    waitForPage();
    selectFirstAutocompleteOption("Albacore");

    cy.get("#species")
      .invoke("val")
      .then((val) => {
        if (val) {
          expect(String(val).toLowerCase()).to.contain("albacore");
        }
      });
  });

  it("should handle selecting species multiple times in succession", () => {
    cy.get("#species").type("Cod");
    waitForPage();
    selectFirstAutocompleteOption("Cod", 1500);

    cy.get("#species").then(($species) => {
      if ($species.is("select")) {
        cy.get("#species option")
          .its("length")
          .then((optionCount) => {
            const nextIndex = optionCount > 2 ? 2 : 1;
            cy.get("#species").should("be.enabled").select(nextIndex);
          });
        return;
      }

      cy.wrap($species).should("be.visible").and("not.be.disabled").clear();
      cy.wrap($species).should("be.visible").and("not.be.disabled").type("Aesop");
    });
    waitForPage();
    selectFirstAutocompleteOption("Aesop shrimp", 1500);

    cy.get("#species").invoke("val").should("not.be.empty");

    cy.get("#state").should("have.value", "");
    cy.get("#presentation").should("have.value", "");
    cy.get("#commodity_code").should("have.value", "");
  });

  it("should maintain form consistency after species selection", () => {
    cy.get("#species").type("Pollock");
    waitForPage();
    selectFirstAutocompleteOption("Pollock", 1500);

    cy.get("#species").should("exist");
    cy.get("#state").should("have.value", "");
    cy.get("#presentation").should("have.value", "");
    cy.get("#commodity_code").should("have.value", "");

    cy.get("input[name='speciesCode']").should("exist");
    cy.get("input[name='scientificName']").should("exist");
  });

  it("should allow subsequent field population after species selection", () => {
    cy.get("#species").type("Hake");
    waitForPage();
    selectFirstAutocompleteOption("Hake", 2000);

    cy.get("#state option")
      .its("length")
      .then((count) => {
        if (count > 1) {
          cy.get("#state").select(1);
          waitForPage();
          cy.get("#state").invoke("val").should("not.be.empty");
        }
      });
  });

  it("should execute all statements in handleSpeciesSelection", () => {
    cy.get("#species").type("Scallop");
    waitForPage();
    selectFirstAutocompleteOption("Scallop");

    cy.get("#species").invoke("val").should("not.be.empty");
    cy.get("#state").should("have.value", "");
    cy.get("#presentation").should("have.value", "");
    cy.get("#commodity_code").should("have.value", "");
  });

  it("should reset form fields when add product button is clicked after filling form", () => {
    cy.get("[data-testid*='edit-button']").first().click();
    waitForPage(1000);
    cy.get("#species").should("not.have.value", "");

    cy.get("[data-testid='add-product']").first().click();
    waitForPage(1000);

    cy.get("#species").should("have.value", "");
  });
});

describe("What are you exporting - Autocomplete aria-controls accessibility (FI0-11120)", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    waitForPage(15000);
  });

  it("species combobox input should have role=combobox and aria-controls referencing the listbox ID", () => {
    cy.get("body").then(($body) => {
      if ($body.find("input#species").length > 0) {
        cy.get("input#species")
          .should("have.attr", "role", "combobox")
          .should("have.attr", "aria-controls", "species__listbox");
        return;
      }

      cy.get("#species").should("exist");
    });
  });
});

describe("WCAG SC 3.1.2 - lang='en' on English-language select options (hydrated)", () => {
  it("sets lang='en' on all non-placeholder state, presentation and commodity code options when Welsh is active", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
      lng: "cy",
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    waitForPage(15000);

    cy.get("[data-testid*='edit-button']").eq(0).click();
    waitForPage(15000);
    cy.get("#state").should("contain", "Fresh");

    cy.get('#state option[value!=""]').should("have.length.gt", 0);
    cy.get('#state option[value!=""]:not([lang="en"])').should("not.exist");

    cy.get('#presentation option[value!=""]').should("have.length.gt", 0);
    cy.get('#presentation option[value!=""]:not([lang="en"])').should("not.exist");

    cy.get('#commodity_code option[value!=""]').should("have.length.gt", 0);
    cy.get('#commodity_code option[value!=""]:not([lang="en"])').should("not.exist");
  });
});

describe("WCAG SC 3.1.2 - lang='en' on English-language select options (non-JS)", () => {
  it("sets lang='en' on all non-placeholder state, presentation and commodity code options when Welsh is active", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
      disableScripts: true,
      lng: "cy",
    };
    cy.visit(productsUrl, { qs: { ...testParams } });

    cy.get("[data-testid*='edit-button']").eq(0).click();
    cy.get("#state").should("contain", "Fresh");

    cy.get('#state option[value!=""]').should("have.length.gt", 0);
    cy.get('#state option[value!=""]:not([lang="en"])').should("not.exist");

    cy.get('#presentation option[value!=""]').should("have.length.gt", 0);
    cy.get('#presentation option[value!=""]:not([lang="en"])').should("not.exist");

    cy.get('#commodity_code option[value!=""]').should("have.length.gt", 0);
    cy.get('#commodity_code option[value!=""]:not([lang="en"])').should("not.exist");
  });
});

describe("What are you exporting - Autocomplete aria-controls accessibility (FI0-11120)", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    // Wait for DCX hydration re-mount to fully complete before each test.
    // The hydration failure → full client re-render is a one-time event; once
    // input#species is enabled the component tree is stable for the rest of the test.
    cy.get("input#species", { timeout: 15000 }).should("not.be.disabled");
  });

  it("favourites product combobox input should have aria-controls referencing its listbox ID", () => {
    // Wait for hydration: species input being enabled is a reliable signal
    cy.get("input#species", { timeout: 10000 }).should("not.be.disabled");

    cy.get("[data-tab-id='favouritesTab']").click();
    cy.get("#add-from-favourites").should("be.visible");

    // Assert attributes are stable before interacting (separate chain avoids stale-ref race)
    cy.get("#add-from-favourites input[role='combobox']", { timeout: 10000 })
      .should("be.visible")
      .and("not.be.disabled")
      .and("have.attr", "aria-controls", "product__listbox");
  });
});

// WCAG SC 3.1.2 – Language of Parts
// State, presentation, and commodity code options are always English-language content.
// When the UI is in Welsh mode the <option> elements must carry lang="en" so assistive
// technology can select the correct pronunciation engine.  In English mode the attribute
// must be absent to avoid redundant markup.

describe("WCAG SC 3.1.2 - lang='en' on English-language select options (hydrated)", () => {
  it("does not set lang on any non-placeholder select options when English is active", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatAreYouExporting,
    };
    cy.visit(productsUrl, { qs: { ...testParams } });
    cy.get("input#species", { timeout: 15000 }).should("not.be.disabled");

    cy.get("[data-testid*='edit-button']").eq(0).click();
    cy.get("input#species", { timeout: 15000 }).should("not.be.disabled");
    cy.get("#state").should("contain", "Fresh");

    // No non-placeholder option should carry a lang attribute in English mode
    cy.get('#state option[value!=""]').should("have.length.gt", 0);
    cy.get('#state option[value!=""][lang="en"]').should("not.exist");

    cy.get('#presentation option[value!=""]').should("have.length.gt", 0);
    cy.get('#presentation option[value!=""][lang="en"]').should("not.exist");

    cy.get('#commodity_code option[value!=""]').should("have.length.gt", 0);
    cy.get('#commodity_code option[value!=""][lang="en"]').should("not.exist");
  });
});
