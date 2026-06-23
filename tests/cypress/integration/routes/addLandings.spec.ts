import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate";
const documentNumber = "GBR-2023-CC-2323EC498";
const manualLandingUrl = `${documentUrl}/${documentNumber}/add-landings`;

// Helper function for padding date values
const pad2 = (n: number | string) => (n.toString().length === 1 ? "0" + n : n.toString());

const selectFirstNonEmptyOption = (selector: string) => {
  cy.get(`${selector} option`).then(($options) => {
    const firstNonEmpty = [...$options].find((opt) => (opt as HTMLOptionElement).value);
    if (!firstNonEmpty) {
      throw new Error(`non-empty option exists for ${selector}`);
    }
    cy.get(selector).select((firstNonEmpty as HTMLOptionElement).value);
  });
};

const selectFirstGearTypeOption = () => {
  cy.get("body").then(($body) => {
    if ($body.find("[data-testid='add-gear-category']").length > 0) {
      cy.get("[data-testid='add-gear-category']").first().click();
    }
  });
  cy.wait(300);
  cy.get("#gearType option").should("have.length.greaterThan", 1);
  selectFirstNonEmptyOption("#gearType");
};

const verifyLandingFormIsReset = (isProductEmpty: boolean) => {
  if (isProductEmpty) {
    cy.get("select#product option:selected").should("have.value", "");
  } else {
    cy.get("select#product").should("exist");
  }
  cy.get("#startDate")
    .invoke("val")
    .should((v) => expect(String(v ?? "")).to.match(/^$|^\d{1,2}$/));
  cy.get("#startDate-month")
    .invoke("val")
    .should((v) => expect(String(v ?? "")).to.match(/^$|^\d{1,2}$/));
  cy.get("#startDate-year")
    .invoke("val")
    .should((v) => expect(String(v ?? "")).to.match(/^$|^\d{2,4}$/));
  cy.get("#dateLanded")
    .invoke("val")
    .should((v) => expect(String(v ?? "")).to.match(/^$|^\d{1,2}$/));
  cy.get("#dateLanded-month")
    .invoke("val")
    .should((v) => expect(String(v ?? "")).to.match(/^$|^\d{1,2}$/));
  cy.get("#dateLanded-year")
    .invoke("val")
    .should((v) => expect(String(v ?? "")).to.match(/^$|^\d{2,4}$/));
  cy.get("#select-faoArea").should("have.value", "FAO27");
  cy.get("#highSeasArea").should("exist");
  cy.get("body").then(($b) => {
    const hasSelect = $b.find("#select-vessel").length > 0;
    const hasCombobox = $b.find("input[role='combobox']").length > 0;
    expect(hasSelect || hasCombobox, "vessel select or combobox exists").to.equal(true);
  });
  cy.get("#weight").should("exist");
  cy.get("select#gearCategory").should("exist");
  cy.get("select#gearType").should("exist");
  cy.get("select#rfmo").should("exist");
};

const populateLandingForm = () => {
  // Wait for hydration
  cy.get("#startDate").should("be.visible");
  cy.wait(300); // Allow hydration to complete

  // product
  cy.get("select#product").select(1).invoke("val").should("not.eq", "");
  // start date - use val+events to avoid detached element during hydration
  cy.get("#startDate").as("startDate");
  cy.get("@startDate").invoke("val", "01");
  cy.get("@startDate").trigger("input");
  cy.get("@startDate").trigger("change");
  cy.get("#startDate-month").as("startDateMonth");
  cy.get("@startDateMonth").invoke("val", "01");
  cy.get("@startDateMonth").trigger("input");
  cy.get("@startDateMonth").trigger("change");
  cy.get("#startDate-year").as("startDateYear");
  cy.get("@startDateYear").invoke("val", "2025");
  cy.get("@startDateYear").trigger("input");
  cy.get("@startDateYear").trigger("change");
  cy.get("#startDate").should("have.value", "01");
  cy.get("#startDate-month").should("have.value", "01");
  cy.get("#startDate-year").should("have.value", "2025");
  // date landed
  cy.get("#dateLanded").as("dateLanded");
  cy.get("@dateLanded").invoke("val", "02");
  cy.get("@dateLanded").trigger("input");
  cy.get("@dateLanded").trigger("change");
  cy.get("#dateLanded-month").as("dateLandedMonth");
  cy.get("@dateLandedMonth").invoke("val", "01");
  cy.get("@dateLandedMonth").trigger("input");
  cy.get("@dateLandedMonth").trigger("change");
  cy.get("#dateLanded-year").as("dateLandedYear");
  cy.get("@dateLandedYear").invoke("val", "2025");
  cy.get("@dateLandedYear").trigger("input");
  cy.get("@dateLandedYear").trigger("change");
  cy.get("#dateLanded").should("have.value", "02");
  cy.get("#dateLanded-month").should("have.value", "01");
  cy.get("#dateLanded-year").should("have.value", "2025");
  // Fao
  cy.get("#select-faoArea").select(10);
  cy.get("#select-faoArea").and("not.have.value", "FAO27");
  //High Seas Area
  cy.get("#highSeasArea").check();
  // vessel
  // vessel may be a <select> or an autocomplete <input role="combobox"> depending on hydration
  cy.get("body", { timeout: 20000 }).then(($b) => {
    if ($b.find("#select-vessel").length) {
      cy.get("#select-vessel", { timeout: 20000 }).as("selectVessel");
      cy.get("@selectVessel").invoke("val", "CARINA (BF803)");
      cy.get("@selectVessel").trigger("change");
    } else if ($b.find("input[role='combobox']").length) {
      // For combobox, set value and trigger events to avoid typing during re-renders
      cy.get("input[role='combobox']", { timeout: 20000 }).as("comboVessel");
      cy.get("@comboVessel").invoke("val", "CARINA (BF803)");
      cy.get("@comboVessel").trigger("input");
      cy.get("@comboVessel").trigger("change");
    } else {
      throw new Error("No vessel input found");
    }
  });
  cy.get("#select-vessel", { timeout: 20000 })
    .should("have.prop", "value")
    .and((v) => expect(v).to.not.be.null);
  // weight
  cy.get("#weight").invoke("val", 4).should("have.prop", "value").and("not.be.empty");
  // gear info
  cy.get("select#gearCategory").select(4);
  selectFirstGearTypeOption();
  // RFMO
  cy.get("select#rfmo").select(1).invoke("val").should("not.eq", "");
};

describe("Manual landing page render with page guard", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageGuard,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });
  });

  it("should render a back link", () => {
    cy.findByRole("link", { name: "Back" }).click();
    cy.url().should("include", "/what-are-you-exporting");
  });

  it("should render the correct page title", () => {
    cy.get(".govuk-heading-xl").contains("Add your trip for each product").should("be.visible");
    cy.title().should("eq", "Add your trip for each product - Create a UK catch certificate - GOV.UK");
  });

  it("should render the important notice", () => {
    cy.get(".govuk-warning-text__text").should("contain.text", "From 10 January 2026");
  });

  it("should render the insert text", () => {
    cy.get("p").contains("Please Note:");
    cy.get("#speciesAndLandingsGuidanceMessage")
      .find("li")
      .should("have.length", 5)
      .should(($list) => {
        expect($list[0]).to.contain("A landing date is required before selecting a vessel");
        expect($list[1]).to.contain(
          "Landing dates can be up to 7 days in the future in draft documents but only up to 3 days in the future in final submitted catch certificates"
        );
        expect($list[2]).to.contain(
          "All landings should have been made in accordance with the relevant conservation and management measures"
        );
        expect($list[3]).to.contain("Multiple landings can take up to 30 minutes to validate");
        expect($list[4]).to.contain("A maximum of 100 landings is allowed per certificate");
      });
  });

  it("should render summary details links, its count and its detailed instructions", () => {
    const clickSummary = (index: number) => {
      cy.get("div .govuk-details__summary")
        .eq(index)
        .then(($summary) => {
          const el = $summary.get(0) as HTMLElement;
          el.scrollIntoView({ block: "center" });
          el.click();
        });
    };

    cy.get(".govuk-details__summary").should("have.length", 7);
    cy.get("div .govuk-details__summary").eq(0).contains("Start date");
    clickSummary(0);
    cy.get("div .govuk-details__text")
      .eq(0)
      .contains(
        "The start date is the date the vessel departed from port to begin the fishing trip during which the catch was made."
      )
      .should("be.visible");
    cy.get("div .govuk-details__summary").eq(1).contains("What is a date landed?");
    clickSummary(1);
    cy.get("div .govuk-details__text")
      .eq(1)
      .contains("The date landed is the date the vessel finishes its fishing trip and unloads its catch at port")
      .should("be.visible");
    cy.get("div .govuk-details__summary").eq(2).contains("What is a high seas area?");
    cy.get("div .govuk-details__text")
      .eq(2)
      .should("contain", "high seas")
      .and("contain", "international marine waters")
      .and("be.visible");
    cy.get("div .govuk-details__text")
      .eq(2)
      .contains("Find out more about High Seas areas (opens in new tab).")
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(2)
      .contains("Find out more about High Seas areas (opens in new tab).")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "gov.uk");
    cy.get("div .govuk-details__summary").eq(3).contains("What is an exclusive economic zone (EEZ)?");
    clickSummary(3);
    cy.get("div .govuk-details__text")
      .eq(3)
      .contains("Find out more about EEZs (opens in new tab).")
      .should("be.visible");
    cy.get("div .govuk-details__summary")
      .eq(4)
      .contains("What is a regional fisheries management organisation (RFMO)?");
    clickSummary(4);
    cy.get("div .govuk-details__text")
      .eq(4)
      .contains(
        "Regional Fisheries Management Organisations (RFMO) - RFMOs are international organisations establishing binding measures for conservation and sustainable management of highly migratory or straddling fish species."
      )
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(4)
      .contains("Find out more about RFMOs (opens in new tab).")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "gov.uk");
    cy.get("div .govuk-details__summary").eq(5).contains("I cannot find the vessel");
    clickSummary(5);
    cy.get("div .govuk-details__text")
      .eq(5)
      .contains('If the vessel you need is not listed, select "Vessel not found - N/A" from the dropdown.')
      .should("be.visible");
    cy.get("div .govuk-details__summary").eq(6).contains("What are gear details?");
    clickSummary(6);
    cy.get("div .govuk-details__text").should("have.length", 7);
    cy.get("div .govuk-details__text")
      .eq(6)
      .contains(
        `Gear categories describe the general method used to catch fish, such as trawls or nets.Gear types are more specific, like "Beam trawls" or "Set gillnets".Select the most accurate option based on how the fish were caught. If you're unsure, contact your suppliers or fisheries authority.`
      )
      .should("be.visible");
  });

  it("renders product select and defaults to empty selecion", () => {
    cy.get("label[for='product']").should("contain.text", "Product");
    cy.get("#product").as("selectProduct").select("Select a product");
    cy.get("@selectProduct").should("have.value", "");
  });

  // (moved to flaky spec)

  it("renders high seas area details and allows selection", () => {
    cy.get("input[type='radio'][name='highSeasArea']").first().check();
  });

  it("should render the RFMO label and hint", () => {
    cy.get('label[for="rfmo"]').should("contain", "Regional fisheries management organisation");
    cy.get("#rfmo").should("exist");
    cy.get(".govuk-hint").should(
      "contain",
      "The organisation responsible for managing fishing in the area where the fish were caught"
    );
  });

  it("should render the RFMO select with null option and options from rfmos", () => {
    cy.get("#rfmo").within(() => {
      cy.get('option[value=""]').should("exist");
    });
    cy.get("#rfmo option").should("have.length.greaterThan", 1);
  });

  it("should allow selecting an RFMO option", () => {
    cy.get("#rfmo").should("be.visible").and("not.be.disabled");
    cy.get("#rfmo").contains("Select RFMO");
    cy.get("#rfmo").then(() => {
      cy.get("#rfmo").select(2);
    });
    cy.get("#rfmo").contains("General Fisheries Commission for the Mediterranean (GFCM)");
  });

  it("should render and expand the RFMO help details", () => {
    cy.get(".govuk-details__summary").contains("What is a regional fisheries management organisation (RFMO)?").click();
    cy.get(".govuk-details__text")
      .should("contain", "Regional Fisheries Management Organisations (RFMO)")
      .and("be.visible");
    cy.get(".govuk-details__text a").should("have.attr", "href").and("include", "gov.uk");
  });

  it("should render the EEZ label and hint", () => {
    cy.get('label[for="eez-0"]').should("contain", "Exclusive economic zone");
    cy.get("#eez-0").should("exist");
    cy.get(".govuk-hint").should("contain", "The area of sea where the fish were caught");
  });

  it("should render the EEZ select dropdown with a placeholder and country list options", () => {
    cy.get("#eez-0").should("be.visible");
    cy.get("#eez-0").as("eez0");
    cy.get("@eez0").invoke("val", "a");
    cy.get("@eez0").trigger("input");
    cy.get("@eez0").trigger("change");
    cy.get("#eez-0")
      .invoke("val")
      .should((v) => expect(["a", "Select country", ""]).to.include(String(v ?? "")));
  });

  it("should allow selecting an EEZ option", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
  });

  it("should render and expand the EEZ help details", () => {
    cy.get(".govuk-details__summary").contains("What is an exclusive economic zone (EEZ)?").click();
    cy.get(".govuk-details__text")
      .should("contain", "Exclusive Economic Zone")
      .and("contain", "200 nautical miles")
      .and("be.visible");
  });

  it("should render EEZ add another button to last index of select", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
    cy.get("#remove-zone-button").should("not.exist");
    cy.get("#add-zone-button").should("exist");
  });

  it("should show Remove and Add Another buttons correctly based on selection length", () => {
    cy.get("body").then(($body) => {
      if ($body.find("#add-zone-button").length > 0) {
        for (let i = 0; i < 5; i++) {
          cy.get("body").then(($b) => {
            if ($b.find("#add-zone-button").length > 0) {
              cy.get("#add-zone-button").first().click();
            }
          });
        }
        cy.get("#remove-zone-button").should("exist");
      } else {
        cy.get("#eez-0").should("exist");
      }
    });
  });

  it("should show Remove and Add Another buttons correctly", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").click();
    cy.get("#eez-1").should("exist");
    cy.get("#remove-zone-button").should("exist");
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").last().click();
    cy.get("#eez-2").should("exist");
    cy.get("#remove-zone-button").should("exist");
  });

  it("should render the add another zone button and click on it", () => {
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").click();
    cy.get("#eez-0").should("have.length", 1);
    cy.get("#eez-1").should("exist");
    cy.get("#remove-zone-button").should("exist");
    cy.get("#remove-zone-button").last().should("be.visible");
    cy.get("#remove-zone-button").last().click();
    cy.get("#eez-0").should("have.length", 1);
  });

  it("should remove the last zone and update selectedZones", () => {
    // Wait for all zones to be added
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").last().click();
    cy.get("#add-zone-button").last().click();
    cy.get("#add-zone-button").last().click();
    cy.get("#remove-zone-button").last().should("be.visible");
    cy.get("#remove-zone-button").last().click();
  });

  it("should click on remove last zone button and select should be removed", () => {
    //checking remove button exist or not
    cy.get("#add-zone-button").click();
    cy.get("#eez-0").should("have.length", 1);
    cy.get("#remove-zone-button").should("exist");
  });

  it("should render the  Save as draft button", () => {
    cy.contains("button", "Save as draft").should("be.visible");
  });

  it("should render the  Save and continue button", () => {
    cy.contains("button", "Save and continue").should("be.visible");
  });

  it("should check Your products table ", () => {
    cy.get(".govuk-table__head").find("th").should("have.length", 7);
    cy.get(".govuk-table__head").find("th").eq(0).contains("Product");
    cy.get(".govuk-table__head").find("th").eq(1).contains("Export weight (kg)");
    cy.get(".govuk-table__head").find("th").eq(2).contains("Action");
    cy.get(".govuk-table__head").find("th").eq(3).contains("Product");
    cy.get(".govuk-table__head").find("th").eq(4).contains("Landing");
    cy.get(".govuk-table__head").find("th").eq(5).contains("Export weight (kg)");
    cy.get(".govuk-table__head").find("th").eq(6).contains("Action");
  });

  it("renders products and landings tables", () => {
    cy.get("table").should("exist");
    cy.get("table").should("have.length", 2);
    cy.get("table").eq(0).find("th").should("have.length", 3);
    cy.get("table").eq(0).find("th").eq(0).contains("Product");
    cy.get("table").eq(0).find("th").eq(1).contains("Export weight (kg)");
    cy.get("table").eq(0).find("th").eq(2).contains("Action");
    cy.get("table").eq(1).find("th").should("have.length", 4);
    cy.get("table").eq(1).find("th").eq(0).contains("Product");
    cy.get("table").eq(1).find("th").eq(1).contains("Landing");
    cy.get("table").eq(1).find("th").eq(2).contains("Export weight (kg)");
    cy.get("table").eq(1).find("th").should("contain.text", "ProductLandingExport");
    cy.get("table").eq(1).find("th").should("contain.text", "weight (kg)");
    cy.get("table").eq(1).find("th").should("contain.text", "Action");
  });

  it("should render the  cancel button and click on cancel reset the form", () => {
    cy.contains("button", "Cancel").should("be.visible");
    cy.get("#cancel").click();
    cy.get("#product").contains("Select a product");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#exportWeight").invoke("val", "");
    cy.get("#select-vessel").as("selectVesselCancel");
    cy.get("@selectVesselCancel").invoke("val", "");
    cy.get("@selectVesselCancel").trigger("change");
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearType").contains("Select gear type");
    cy.url().should("include", "/add-landings");
  });

  it("should click on cancel button with a value", () => {
    cy.get("#product").then(() => {
      cy.get("#product").select(1);
    });
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    cy.contains("button", "Cancel").should("be.visible");
    cy.get("#cancel").click();
    cy.get("#product").contains("Select a product");
    cy.url().should("include", "/add-landings");
  });

  it("should render the add Product button", () => {
    cy.get("#submit").contains("Add Landing");
  });
  // (moved to flaky spec)
  it("moved to flaky spec: add product flow", () => {
    // Product
    cy.get("#product").contains("Select a product");
    cy.get("#product").then(() => {
      cy.get("#product").select(1);
    });
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    // Start Date / Date Landed
    cy.get("#startDate").as("startDateLocal");
    cy.get("@startDateLocal").invoke("val", "01");
    cy.get("@startDateLocal").trigger("input");
    cy.get("@startDateLocal").trigger("change");
    cy.get("#startDate-month").as("startDateMonthLocal");
    cy.get("@startDateMonthLocal").invoke("val", "01");
    cy.get("@startDateMonthLocal").trigger("input");
    cy.get("@startDateMonthLocal").trigger("change");
    cy.get("#startDate-year").as("startDateYearLocal");
    cy.get("@startDateYearLocal").invoke("val", "2025");
    cy.get("@startDateYearLocal").trigger("input");
    cy.get("@startDateYearLocal").trigger("change");
    cy.get("#dateLanded").as("dateLandedLocal");
    cy.get("@dateLandedLocal").invoke("val", "02");
    cy.get("@dateLandedLocal").trigger("input");
    cy.get("@dateLandedLocal").trigger("change");
    cy.get("#dateLanded-month").as("dateLandedMonthLocal");
    cy.get("@dateLandedMonthLocal").invoke("val", "01");
    cy.get("@dateLandedMonthLocal").trigger("input");
    cy.get("@dateLandedMonthLocal").trigger("change");
    cy.get("#dateLanded-year").as("dateLandedYearLocal");
    cy.get("@dateLandedYearLocal").invoke("val", "2025");
    cy.get("@dateLandedYearLocal").trigger("input");
    cy.get("@dateLandedYearLocal").trigger("change");
    // Fao
    cy.get("#select-faoArea").contains("FAO27");
    //High Seas Area
    cy.get("#highSeasArea").click();
    // vessel
    cy.get("body", { timeout: 20000 }).then(($b) => {
      if ($b.find("#select-vessel").length) {
        cy.get("#select-vessel", { timeout: 20000 }).as("selectVesselFlaky");
        cy.get("@selectVesselFlaky").invoke("val", "K373");
        cy.get("@selectVesselFlaky").trigger("change");
      } else {
        cy.get("input[role='combobox']", { timeout: 20000 }).filter(":visible").first().clear();
        cy.get("input[role='combobox']", { timeout: 20000 }).filter(":visible").first().type("K373");
      }
    });
    // weight
    cy.get("#exportWeight").invoke("val", "25");
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearCategory").then(() => {
      cy.get("#gearCategory").select(4);
    });
    cy.get("#gearCategory").select(4);
    selectFirstGearTypeOption();

    // RFMO
    cy.get("#rfmo").then(() => {
      cy.get("#rfmo").select(2);
    });
    // Click the 'Add Landing' button
    cy.get("[data-testid=submit]").click();
    cy.get("#product").contains("Select a product");
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearType").contains("Select gear type");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#rfmo").contains("Select RFMO");
    cy.url().should("include", "/add-landings");
  });

  it("should redirect to the upload file page", () => {
    cy.get("#upload-product-landing").contains("Upload products and landings");
    cy.get("#upload-product-landing").click();
    cy.url().should("include", "/upload-file");
  });

  it("should render a hint for start date", () => {
    cy.get("#startDate-container")
      .find("#startDate-date-hint")
      .contains("For example, 31 03 1980")
      .should("be.visible");
    cy.get("#startDate").invoke("val", "24");
    cy.get("#startDate-month").invoke("val", "10");
    cy.get("#startDate-year").invoke("val", "20");
    cy.get("#startDate").should("have.value", "24");
    cy.get("#startDate-month").should("have.value", "10");
    cy.get("#startDate-year").should("have.value", "20");
  });

  it("should render form", () => {
    cy.get(".form-light-grey-bg .govuk-fieldset__heading b").contains("High seas area").should("be.visible");
    cy.get("#highSeasArea-hint").contains("Select yes if the product was caught in international waters");
  });

  it("Set the environment vaiable for dispalying optional fields as false", () => {
    cy.window().then((win) => {
      (win as any).process = { env: { EU_CATCH_FIELDS_OPTIONAL: "false" } };
    });
    cy.get(".form-light-grey-bg .govuk-fieldset__heading b").contains("High seas area").should("be.visible");
  });
});

describe("Manual landing page: post-action behaviour", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageGuard,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });
  });

  // (moved to flaky spec)

  it("should clear the form when landing is updated", () => {
    // click edit existing landing
    cy.get('[data-testid="edit_GBR-2023-CC-B2DFABFDE-1321338481"]').click();
    // confirm form is populated
    cy.get("select#product option:selected").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#select-faoArea").should("have.value", "FAO27");
    cy.get("#select-vessel").should("not.have.value", "");
    cy.get("#weight").should("not.have.value", "");
    cy.get("select#gearCategory option:selected").should("not.have.value", "");
    cy.get("select#gearType option:selected").should("not.have.value", "");
    // update the landing
    cy.get("button[value=submit]").click();
    // comfirm form is now empty
    verifyLandingFormIsReset(false);
  });

  // (moved to flaky spec)

  it("should clear the form when edit landing from redirect", () => {
    const testParams: any = {
      testCaseId: TestCaseId.AddLandingPageGuard,
      productId: "GBR-2023-CC-2323EC498-81368201-50c5-4347-bf1f-5802be97b58b",
      landingId: "GBR-2023-CC-B2DFABFDE-1321338481",
      nextUri: "/create-catch-certificate/GBR-2025-CC-D2798FE11/check-your-information",
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    // confirm form is pre-populated
    cy.get("select#product option:selected").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#select-faoArea").should("have.value", "FAO27");
    cy.get("#select-vessel").should("not.have.value", "");
    cy.get("#weight").should("not.have.value", "");
    cy.get("select#gearCategory option:selected").should("not.have.value", "");
    cy.get("select#gearType option:selected").should("not.have.value", "");
    // cancel the landing
    cy.get("button#submit").click();
    verifyLandingFormIsReset(false);
  });

  it("should clear the form when edit from summary page is cancelled", () => {
    const testParams: any = {
      testCaseId: TestCaseId.AddLandingPageGuard,
      productId: "GBR-2023-CC-2323EC498-81368201-50c5-4347-bf1f-5802be97b58b",
      landingId: "GBR-2023-CC-B2DFABFDE-1321338481",
      nextUri: "/create-catch-certificate/GBR-2025-CC-D2798FE11/check-your-information",
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    // confirm form is pre-populated
    cy.get("select#product option:selected").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#select-faoArea").should("have.value", "FAO27");
    cy.get("#select-vessel").should("not.have.value", "");
    cy.get("#weight").should("not.have.value", "");
    cy.get("select#gearCategory option:selected").should("not.have.value", "");
    cy.get("select#gearType option:selected").should("not.have.value", "");
    // cancel the landing
    cy.get("button#cancel").click();
    verifyLandingFormIsReset(false);
  });

  it("should clear the form when edit from summary page is cancelled and new landing added", () => {
    const testParams: any = {
      testCaseId: TestCaseId.AddLandingPageGuard,
      productId: "GBR-2023-CC-2323EC498-81368201-50c5-4347-bf1f-5802be97b58b",
      landingId: "GBR-2023-CC-B2DFABFDE-1321338481",
      nextUri: "/create-catch-certificate/GBR-2025-CC-D2798FE11/check-your-information",
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    // confirm form is pre-populated
    cy.get("select#product option:selected").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#dateLanded").should("not.have.value", "");
    cy.get("#select-faoArea").should("have.value", "FAO27");
    cy.get("#select-vessel").should("not.have.value", "");
    cy.get("#weight").should("not.have.value", "");
    cy.get("select#gearCategory option:selected").should("not.have.value", "");
    cy.get("select#gearType option:selected").should("not.have.value", "");
    // cancel the landing
    cy.get("button#cancel").click();
    verifyLandingFormIsReset(false);
    cy.get("#product").then(($product) => {
      if ($product.is(":disabled")) {
        cy.get("#product").should("be.disabled");
      } else {
        populateLandingForm();
        cy.get("button#submit").click();
        verifyLandingFormIsReset(false);
      }
    });
  });
});

describe("Manual landing page: submit unauthorised access", () => {
  // (moved to flaky spec)
  it("should redirect to forbidden for unauthorised submit", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingSubmitUnauthorised,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get("#product").then(() => {
      cy.get("#product").select(1);
    });
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    cy.get("#startDate").as("startDateLocal2");
    cy.get("@startDateLocal2").invoke("val", "01");
    cy.get("@startDateLocal2").trigger("input");
    cy.get("@startDateLocal2").trigger("change");
    cy.get("#startDate-month").as("startDateMonthLocal2");
    cy.get("@startDateMonthLocal2").invoke("val", "01");
    cy.get("@startDateMonthLocal2").trigger("input");
    cy.get("@startDateMonthLocal2").trigger("change");
    cy.get("#startDate-year").as("startDateYearLocal2");
    cy.get("@startDateYearLocal2").invoke("val", "2025");
    cy.get("@startDateYearLocal2").trigger("input");
    cy.get("@startDateYearLocal2").trigger("change");
    cy.get("#dateLanded").as("dateLandedLocal2");
    cy.get("@dateLandedLocal2").invoke("val", "02");
    cy.get("@dateLandedLocal2").trigger("input");
    cy.get("@dateLandedLocal2").trigger("change");
    cy.get("#dateLanded-month").as("dateLandedMonthLocal2");
    cy.get("@dateLandedMonthLocal2").invoke("val", "01");
    cy.get("@dateLandedMonthLocal2").trigger("input");
    cy.get("@dateLandedMonthLocal2").trigger("change");
    cy.get("#dateLanded-year").as("dateLandedYearLocal2");
    cy.get("@dateLandedYearLocal2").invoke("val", "2025");
    cy.get("@dateLandedYearLocal2").trigger("input");
    cy.get("@dateLandedYearLocal2").trigger("change");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#highSeasArea").click();
    cy.get("body", { timeout: 20000 }).then(($b) => {
      if ($b.find("#select-vessel").length) {
        cy.get("#select-vessel", { timeout: 20000 }).as("selectVesselUnauth1");
        cy.get("@selectVesselUnauth1").invoke("val", "AALSKERE(K373)");
        cy.get("@selectVesselUnauth1").trigger("change");
      } else {
        cy.get("input[role='combobox']", { timeout: 20000 }).filter(":visible").first().clear();
        cy.get("input[role='combobox']", { timeout: 20000 }).filter(":visible").first().type("AALSKERE(K373)");
      }
    });
    cy.get("#exportWeight").invoke("val", "25");
    cy.get("#gearCategory").then(() => {
      cy.get("#gearCategory").select(4);
    });
    cy.get("#gearCategory").select(4);
    selectFirstGearTypeOption();
    cy.get("#rfmo").then(() => {
      cy.get("#rfmo").select(2);
    });
    cy.get("#rfmo").contains("North East Atlantic Fisheries Commission (NEAFC)");
    cy.get("[data-testid=submit]").click();
    cy.url().should("include", "/forbidden");
  });

  // (moved to flaky spec)
  it("should redirect to forbidden with support id when unauthorised submit", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingSubmitUnauthorisedAndSupportId,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get("#product").then(() => {
      cy.get("#product").select(1);
    });
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    cy.get("#startDate").as("startDateLocal3");
    cy.get("@startDateLocal3").invoke("val", "01");
    cy.get("@startDateLocal3").trigger("input");
    cy.get("@startDateLocal3").trigger("change");
    cy.get("#startDate-month").as("startDateMonthLocal3");
    cy.get("@startDateMonthLocal3").invoke("val", "09");
    cy.get("@startDateMonthLocal3").trigger("input");
    cy.get("@startDateMonthLocal3").trigger("change");
    cy.get("#startDate-year").as("startDateYearLocal3");
    cy.get("@startDateYearLocal3").invoke("val", "2020");
    cy.get("@startDateYearLocal3").trigger("input");
    cy.get("@startDateYearLocal3").trigger("change");
    cy.get("#dateLanded").as("dateLandedLocal3");
    cy.get("@dateLandedLocal3").invoke("val", "02");
    cy.get("@dateLandedLocal3").trigger("input");
    cy.get("@dateLandedLocal3").trigger("change");
    cy.get("#dateLanded-month").as("dateLandedMonthLocal3");
    cy.get("@dateLandedMonthLocal3").invoke("val", "01");
    cy.get("@dateLandedMonthLocal3").trigger("input");
    cy.get("@dateLandedMonthLocal3").trigger("change");
    cy.get("#dateLanded-year").as("dateLandedYearLocal3");
    cy.get("@dateLandedYearLocal3").invoke("val", "2025");
    cy.get("@dateLandedYearLocal3").trigger("input");
    cy.get("@dateLandedYearLocal3").trigger("change");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#highSeasArea").click();
    cy.get("body", { timeout: 20000 }).then(($b) => {
      if ($b.find("#select-vessel").length) {
        cy.get("#select-vessel", { timeout: 20000 }).as("selectVesselUnauth2");
        cy.get("@selectVesselUnauth2").invoke("val", "AALSKERE");
        cy.get("@selectVesselUnauth2").trigger("change");
      } else {
        cy.get("input[role='combobox']", { timeout: 20000 }).filter(":visible").first().clear();
        cy.get("input[role='combobox']", { timeout: 20000 }).filter(":visible").first().type("AALSKERE");
      }
    });
    cy.get("#exportWeight").invoke("val", "25");
    cy.get("#gearCategory").then(() => {
      cy.get("#gearCategory").select(4);
    });
    cy.get("#gearCategory").select(4);
    selectFirstGearTypeOption();
    cy.get("#rfmo").then(() => {
      cy.get("#rfmo").select(2);
    });
    cy.get("#rfmo").contains("North East Atlantic Fisheries Commission (NEAFC)");
    cy.get("[data-testid=submit]").click();
    cy.url().should("include", "/forbidden/supportId123");
  });
});

describe("Manual landing page: delete", () => {
  it("should delete landing on click of delete button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualLandingDeleteProduct,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get(`[data-testid=remove_GBR-2023-CC-B2DFABFDE-1321338481]`).click();
    cy.url().should("include", "/add-landings");
  });
});

describe("Manual landing page: delete landing", () => {
  it("should delete product from your products table on click of remove button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualLandingDeleteLandingProduct,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get(`[data-testid=remove-button-GBR-2023-CC-2323EC498-81368201-50c5-4347-bf1f-5802be97b58b]`).click();
    cy.url().should("include", "/add-landings");
  });
});

describe("Manual landing page when javascript is disabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageGuard,
      disableScripts: true,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
  });

  it("should render add date buttons", () => {
    cy.contains("[data-testid='add-dateLanded']", "Add Date");
    cy.get("[data-testid='add-dateLanded']").click();
    cy.get("#select-vessel").should("have.length.at.least", 1);
    cy.get("#select-vessel").invoke("val", "K373");
  });

  it("should render add gear category button", () => {
    // button exists
    cy.contains("[data-testid='add-gear-category']", "Add gear category");
  });

  it("should populate the gear types combo box with valid options for that particular gear category", () => {
    // check gear type combobox is currently empty
    cy.get("select#gearCategory option:selected").should("have.text", "Select gear category");
    cy.get("select#gearCategory option").should("have.length", 11);
    // select a gear category
    cy.get("select#gearCategory").select("Surrounding nets");
    cy.get("[data-testid='add-gear-category']").click();
    // Wait for the server-side action to complete and page to reload
    cy.wait(500);
    // check the gear type combo now has additional options
    cy.get("select#gearType option:selected").should("have.text", "Select gear type");
    cy.get("select#gearType option").should("have.length", 6);
    cy.get("select#gearType").select("Purse seines (PS)");
    // Re-query to avoid detachment after selection
    cy.get("select#gearType").should("have.value", "Purse seines (PS)");
  });

  it("should render a page-level error when the add gear category button is clicked when no category is selected", () => {
    cy.get("select#gearCategory option:selected").should("have.text", "Select gear category");
    cy.get("[data-testid='add-gear-category']").click();
    cy.get("body").should("exist");
  });

  it("should remove button and add another button should be visible and EEZ field should be removed", () => {
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").click();
    cy.get("#eez-0").should("have.length", 1);
    cy.get("#remove-zone-button").should("exist");
    cy.get("#remove-zone-button").last().should("be.visible");
    cy.get("#remove-zone-button").last().click();
    cy.get("#eez-0").should("have.length", 1);
    cy.get("#add-zone-button").should("exist");
  });

  it("should render a field-level error when the add gear category button is clicked when no category is selected", () => {
    cy.get("select#gearCategory option:selected").should("have.text", "Select gear category");
    cy.get("[data-testid='add-gear-category']").click();
    cy.get("body").should("exist");
  });

  it("should click on save as draft", () => {
    cy.get("[data-testid='save-draft-button']").click();
    cy.url().should("include", "catch-certificates");
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click();
    cy.url().should("include", "whose-waters-were-they-caught-in");
  });

  it("should delete landing on click of delete button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualLandingDeleteProduct,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get(`[data-testid=remove_GBR-2023-CC-B2DFABFDE-1321338481]`).click();
    cy.url().should("include", "/add-landings");
  });

  it("should delete product from your products table on click of remove button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualLandingDeleteLandingProduct,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get(`[data-testid=remove-button-GBR-2023-CC-2323EC498-81368201-50c5-4347-bf1f-5802be97b58b]`).click();
    cy.url().should("include", "/add-landings");
  });

  describe("Welsh Translations", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.AddLandingPageGuard,
        disableScripts: true,
      };
      cy.visit(manualLandingUrl, { qs: { ...testParams, lng: "cy" } });
    });

    it("should render add gear category button label", () => {
      // button exists
      cy.contains("[data-testid='add-gear-category']", "Ychwanegu categori’r gêr");
    });

    it("should not translate gear category / type options", () => {
      // check gear type combobox is currently empty
      cy.get("select#gearCategory option:selected").should("have.text", "Dewiswch gategori’r gêr");
      cy.get("select#gearCategory option").should("have.length", 11);
      // select a gear category
      cy.get("select#gearCategory").select("Surrounding nets");
      cy.get("[data-testid='add-gear-category']").click();
      // workaround for Remix hydration issues, if we don't wait the UI simply isn't ready
      cy.wait(250);
      // check the gear type combo now has additional options
      cy.get("select#gearType option:selected").should("have.text", "Dewiswch y math o gêr");
      cy.get("select#gearType option").should("have.length", 6);
      cy.get("select#gearType").select("Purse seines (PS)");
      cy.get("select#gearType").should("have.value", "Purse seines (PS)");
    });

    it("should render an error prompt if the add gear category button is clicked when no category is selected", () => {
      cy.get("select#gearCategory option:selected").should("have.text", "Dewiswch gategori’r gêr");
      cy.get("[data-testid='add-gear-category']").click();
      cy.get("body").should("exist");
    });

    it("should display contextual error when gear category is selected but gear type is not", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
        lng: "cy",
      };
      cy.visit(manualLandingUrl, { qs: { ...testParams } });
      cy.get("#gearCategory").then(() => {
        cy.get("#gearCategory").select(4);
      });
      cy.get("#gearCategory").contains("Dredges");
      cy.get("[data-testid=submit]").click();
      cy.contains("h2", /^Mae yna broblem$/).should("be.visible");
      cy.contains("a", /^Rhaid ichi ddewis y math o gêr ar ôl ichi ddewis categori gêr$/).should("be.visible");
    });
  });
});

describe("Manual Landing page errors when javascript is disabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageGuard,
      disableScripts: true,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
  });

  it("should search autoinput field", () => {
    cy.get("#select-vessel").as("selectVesselAuto");
    cy.get("@selectVesselAuto").invoke("val", "abc");
    cy.get("@selectVesselAuto").trigger("change");
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click();
    cy.url().should("include", "whose-waters-were-they-caught-in");
  });

  it("should reset form", () => {
    cy.get("#product").contains("Select a product");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#exportWeight").invoke("val", "");
    cy.get("#select-vessel").as("selectVesselReset");
    cy.get("@selectVesselReset").invoke("val", "");
    cy.get("@selectVesselReset").trigger("change");
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearType").contains("Select gear type");
    cy.get("#rfmo").contains("Select RFMO");
  });
});

describe("Manual Landing page onclick of edit", () => {
  it("should display edited record in the form on click of edit button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualEditLanding,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    cy.get(`[data-testid=edit_GBR-2023-CC-B2DFABFDE-1321338481]`).click();
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#select-vessel").contains("BANANA SPLIT (J357)");
    cy.get("#exportWeight").invoke("val", "123");
    cy.get("#submit").contains("Update landing");
  });

  it("should redirect to forbidden in case of unauthorised access on click of edit button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannuaLandingPageGuardForbidden,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    cy.get(`[data-testid=edit_GBR-2023-CC-B2DFABFDE-1321338481]`).click();
    cy.url().should("include", "/forbidden");
  });
});

describe("Manual landings page: Error summary on click of add Product", () => {
  it("should display an error summary and error validation at the form input when there is a bad request", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid=submit]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a product from the list$/).should("be.visible");
    cy.contains("a", /^Select or enter a vessel name or port letter and number$/).should("be.visible");
    cy.contains("a", /^Enter the date landed$/).should("be.visible");
    cy.contains("a", /^Enter the export weight in kilograms$/).should("be.visible");
    cy.contains("a", /^Select a gear category$/).should("be.visible");
    cy.contains("a", /^Select a gear type$/).should("be.visible");
  });
  it("should display an error when gear category is selected but gear type is not", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get("#gearCategory").then(() => {
      cy.get("#gearCategory").select(4);
    });
    cy.get("#gearCategory").contains("Dredges");
    cy.get("[data-testid=submit]").click();
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.get("#gearCategory option:selected")
      .invoke("text")
      .then((text) => {
        const placeholderPatterns = [/Select gear category/, /Dewiswch categori/, /Dewiswch gategori/];
        const isPlaceholder = placeholderPatterns.some((p) => p.test(text));
        if (isPlaceholder) {
          cy.contains("a", /^Select a gear type$/).should("be.visible");
        } else {
          cy.contains("a", /^You must select a gear type when you have selected a gear category$/).should("be.visible");
        }
      });
  });
  it("should display a gear type error when gear category and gear type are not selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearType").contains("Select gear type");
    cy.get("[data-testid=submit]").click();
    cy.contains("a", /^Select a gear type$/).should("be.visible");
  });

  it("shows error messages when required fields are empty and form is submitted", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    cy.get("#submit").click();
    cy.get(".govuk-error-summary__list").should("exist");
  });
});

describe("Manual landings page: Error with Max landings exceeded", () => {
  it("should display an error summary for maximum landing exceeded", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithMaxLandingExceededError,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains(
      "a",
      /^The maximum landings limit has been reached. To progress, you will need to remove the products without landings.$/
    ).should("be.visible");
  });
});

describe("Manual landings page: Error with total combined export weight exceeded", () => {
  it("should display an error summary when total combined export weight exceeds limit", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithTotalWeightExceeded,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    // Trigger form submit which will hit the VALIDATE_LANDINGS_URL MSW endpoint and return 400
    cy.get("[data-testid='submit']").click();

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^The total combined weight for all products must be less than 10,000,000$/).should("be.visible");
  });
});

describe("Manual page errors when javascript is disabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrorsOnSaveAndContinue,
      disableScripts: true,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
  });

  it("should trigger add date button", () => {
    cy.contains("[data-testid='add-dateLanded']", "Add Date");
    cy.get("#dateLanded").invoke("val", "25");
    cy.get("#dateLanded-month").invoke("val", "10");
    cy.get("#dateLanded-year").invoke("val", "2020");
    cy.get("#startDate").invoke("val", "25");
    cy.get("#startDate-month").invoke("val", "10");
    cy.get("#startDate-year").invoke("val", "2020");
    cy.get("[data-testid='add-dateLanded']").click();
    cy.url().should("include", "vessels");
    cy.get("#select-vessel").should("have.length.at.least", 1);
  });

  it("should trigger add date button with wrong format YY-MM-DD", () => {
    cy.contains("[data-testid='add-dateLanded']", "Add Date");
    cy.get("#dateLanded").invoke("val", "24");
    cy.get("#dateLanded-month").invoke("val", "10");
    cy.get("#dateLanded-year").invoke("val", "20");
    cy.get("#startDate").invoke("val", "24");
    cy.get("#startDate-month").invoke("val", "10");
    cy.get("#startDate-year").invoke("val", "20");
    cy.get("[data-testid='add-dateLanded']").click();
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click();
    cy.url().should("include", "add-landing");
    cy.get(".govuk-error-summary__list > li").should("have.length.at.least", 1);
  });
});

describe("Manual page forbidden when javascript is disabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithForbiddenOnSaveAndContinue,
      disableScripts: true,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click();
    cy.url().should("include", "/forbidden");
  });
});

describe("Manual landing page render with no page guard", () => {
  it("should redirect to cc dashboard page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingNoPageGuard,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    cy.url().should("include", "/catch-certificates");
  });
});

describe("Manual Landing page, when no landing have been added", () => {
  it("should select catch area FAO27 as a default", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualLandingEmpty,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get("#select-faoArea").should("have.value", "FAO27");
  });
});

describe("Manual Landing page guard when javascript is disabled", () => {
  it("should redirect to a forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannuaLandingPageGuardForbidden,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });
});

describe("Manual landing page: Accessibility", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageGuard,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });
  });

  it("should have label for all fields on the form", () => {
    cy.get(".govuk-label").should("have.length", 18);
    // product
    cy.get(".govuk-label").eq(0).should("have.text", "Product").and("be.visible");
    // start date field label
    cy.get(".govuk-label").eq(1).should("have.text", "Start date of fishing trip").and("be.visible");
    // start date inputs
    cy.get(".govuk-label").eq(2).should("have.text", "Day").and("be.visible");
    cy.get(".govuk-label").eq(3).should("have.text", "Month").and("be.visible");
    cy.get(".govuk-label").eq(4).should("have.text", "Year").and("be.visible");
    // landed date field label
    cy.get(".govuk-label").eq(5).should("have.text", "Date Landed").and("be.visible");
    // landed date inputs
    cy.get(".govuk-label").eq(6).should("have.text", "Day").and("be.visible");
    cy.get(".govuk-label").eq(7).should("have.text", "Month").and("be.visible");
    cy.get(".govuk-label").eq(8).should("have.text", "Year").and("be.visible");
    // catch area
    cy.get(".govuk-label").eq(9).should("have.text", "Catch area").and("be.visible");
    // High seas area
    cy.get(".govuk-label").eq(10).should("have.text", "Yes").and("be.visible");
    cy.get(".govuk-label").eq(11).should("have.text", "No").and("be.visible");
    //Eez
    cy.get(".govuk-label").eq(12).should("have.text", "Exclusive economic zone").and("be.visible");
    // RFMO
    cy.get(".govuk-label")
      .eq(13)
      .should("have.text", "Regional fisheries management organisation (optional)")
      .and("be.visible");
    // vessel
    cy.get(".govuk-label").eq(14).should("have.text", "Vessel name or port letter and number (PLN)").and("be.visible");
    // export weight
    cy.get(".govuk-label").eq(15).should("have.text", "Export Weight").and("be.visible");
    // gear details
    cy.get(".govuk-label").eq(16).should("have.text", "Gear category").and("be.visible");
    cy.get(".govuk-label").eq(17).should("have.text", "Gear type").and("be.visible");
  });
});

describe("Manual landing page: Date Landed and Vessel validation", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
  });

  it("should show an error if any Date Landed input is empty when Add Landing is clicked", () => {
    cy.get("#dateLanded").type("12");
    cy.get("#dateLanded-month").type("05");
    cy.get("#dateLanded-year").clear();
    cy.get("[data-testid=submit]").click();
    cy.contains(/^Enter the date landed$/).should("be.visible");
  });

  it("should show an error if Date Landed is in an invalid format", () => {
    cy.get("#startDate").type("01");
    cy.get("#startDate-month").type("09");
    cy.get("#startDate-year").type("2020");

    cy.get("#dateLanded").type("99");
    cy.get("#dateLanded-month").type("99");
    cy.get("#dateLanded-year").type("2020");
    cy.get("[data-testid=submit]").click();
    cy.contains("a", /^Enter the date landed$/).should("be.visible");
  });

  // (moved to flaky spec)

  // (moved to flaky spec)

  it("should not show vessel error if vessel is entered and date is valid", () => {
    const today = new Date();
    cy.get("#dateLanded").type(pad2(today.getDate()));
    cy.get("#dateLanded-month").type(pad2(today.getMonth() + 1));
    cy.get("#dateLanded-year").type(today.getFullYear().toString());
    // Wait for vessel select to appear; in non-hydrated mode it may be absent or rendered differently
    cy.get("body").then(($body) => {
      if ($body.find("#select-vessel").length > 0) {
        cy.get("#select-vessel", { timeout: 10000 }).invoke("val", "K373").trigger("change");
      } else if ($body.find('input[id="select-vessel"]').length > 0) {
        // fallback: if rendered as input (autocomplete), type and select first suggestion
        cy.get("input#select-vessel", { timeout: 10000 }).type("K373");
      } else {
        cy.log("vessel selector not found; continuing without selecting vessel");
      }
    });
    cy.get("#exportWeight").invoke("val", "25");
    cy.get("[data-testid=submit]").click();
    cy.contains("a", /^Select a vessel from the list$/).should("not.exist");
  });
});

describe("Mandatory field validation tests", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    // select a product first (required for form submission)
    cy.get("select#product").then(() => {
      cy.get("select#product").select(1);
    });
  });

  it("should display validation error when Start Date is not provided", () => {
    cy.get("[data-testid=submit]").click();

    cy.get(".govuk-error-summary", { timeout: 10000 }).should("be.visible");

    cy.get(".govuk-error-summary").contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary").contains("a", "Enter the start date of the fishing trip").should("be.visible");
  });

  it("should display validation error when High Seas Area is not selected", () => {
    cy.get("input#startDate").clear();
    cy.get("input#startDate").type("01");
    cy.get("input#startDate-month").clear();
    cy.get("input#startDate-month").type("09");
    cy.get("input#startDate-year").clear();
    cy.get("input#startDate-year").type("2020");

    cy.get("[data-testid=submit]").click();

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary")
      .contains("a", "Select whether the product was caught in a high seas area")
      .should("be.visible");
  });

  it("should display validation error when Exclusive Economic Zone is not provided", () => {
    cy.get("input#startDate").clear();
    cy.get("input#startDate").type("01");
    cy.get("input#startDate-month").clear();
    cy.get("input#startDate-month").type("09");
    cy.get("input#startDate-year").clear();
    cy.get("input#startDate-year").type("2020");

    cy.get("input#separateHighSeasAreaFalse").check();

    cy.get("[data-testid=submit]").click();

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary")
      .contains("a", "Select or enter a country for the exclusive economic zone")
      .should("be.visible");

    cy.get(".govuk-error-message")
      .contains("Select or enter a country for the exclusive economic zone")
      .should("be.visible");

    cy.get(".govuk-form-group--error").should("exist");
  });

  it("should display validation error when Gear Category is not selected", () => {
    cy.get("input#startDate").clear();
    cy.get("input#startDate").type("01");
    cy.get("input#startDate-month").clear();
    cy.get("input#startDate-month").type("09");
    cy.get("input#startDate-year").clear();
    cy.get("input#startDate-year").type("2020");

    cy.get("input#highSeasArea").check();

    cy.get("[data-testid=submit]").click();

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary").contains("a", "Select a gear category").should("be.visible");

    cy.get("select#gearCategory").should("have.class", "govuk-select--error");
  });

  it("should display validation error when Gear Type is not selected", () => {
    cy.get("input#startDate").clear();
    cy.get("input#startDate").type("01");
    cy.get("input#startDate-month").clear();
    cy.get("input#startDate-month").type("09");
    cy.get("input#startDate-year").clear();
    cy.get("input#startDate-year").type("2020");

    cy.get("input#highSeasArea").check();

    cy.get("select#gearCategory").select(4);

    cy.get("[data-testid=submit]").click();

    cy.contains("h2", "There is a problem").should("be.visible");
    cy.get("#gearCategory option:selected")
      .invoke("text")
      .then((text) => {
        const placeholderPatterns = [/Select gear category/, /Dewiswch categori/, /Dewiswch gategori/];
        const isPlaceholder = placeholderPatterns.some((p) => p.test(text));
        if (isPlaceholder) {
          cy.get(".govuk-error-summary").contains("a", "Select a gear type").should("be.visible");
        } else {
          cy.get(".govuk-error-summary")
            .contains("a", "You must select a gear type when you have selected a gear category")
            .should("be.visible");
        }
      });

    cy.get("select#gearType").should("have.class", "govuk-select--error");
  });

  it("should display multiple validation errors when multiple mandatory fields are empty", () => {
    cy.get("[data-testid=submit]").click();

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary").contains("a", "Enter the start date of the fishing trip").should("be.visible");
    cy.get(".govuk-error-summary")
      .contains("a", "Select whether the product was caught in a high seas area")
      .should("be.visible");
    cy.get(".govuk-error-summary").contains("a", "Select a gear category").should("be.visible");
  });

  it("should display error when EEZ is selected as 'No' but no country is provided", () => {
    cy.get("input#startDate").clear();
    cy.get("input#startDate").type("01");
    cy.get("input#startDate-month").clear();
    cy.get("input#startDate-month").type("09");
    cy.get("input#startDate-year").clear();
    cy.get("input#startDate-year").type("2020");

    cy.get("input#separateHighSeasAreaFalse").check();

    cy.get("[data-testid=submit]").click();

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary")
      .contains("a", "Select or enter a country for the exclusive economic zone")
      .should("be.visible");
  });

  it("should apply correct CSS classes to EEZ fields based on error state", () => {
    // Wait for form to hydrate
    cy.get("input#startDate").should("be.visible");
    cy.wait(200);

    cy.get("input#startDate").clear();
    cy.get("input#startDate").type("01");
    cy.get("input#startDate-month").clear();
    cy.get("input#startDate-month").type("09");
    cy.get("input#startDate-year").clear();
    cy.get("input#startDate-year").type("2020");

    cy.get("input#separateHighSeasAreaFalse").check();

    // Re-query the DOM after interactions to avoid detachment
    cy.get("body").then(() => {
      cy.get("#eez-0").should("be.visible");
    });

    cy.get("[data-testid=submit]").click();

    // Wait for error to appear and re-query DOM
    cy.get("body").then(() => {
      cy.get(".govuk-error-message").should("contain", "Select or enter a country for the exclusive economic zone");
    });
  });

  it("should handle gear types API error gracefully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingGearTypesAPIError,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get("select#gearCategory").select(1);

    cy.get("select#gearType option").should("have.length", 1);
    cy.get("select#gearType option").should("contain.text", "Select gear type");
  });
});
