import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate";
const documentNumber = "GBR-2023-CC-2323EC498";
const manualLandingUrl = `${documentUrl}/${documentNumber}/add-landings`;

const verifyLandingFormIsReset = (isProductEmpty: boolean) => {
  if (isProductEmpty) {
    cy.get("select#product option:selected").should("have.value", "");
  } else {
    cy.get("select#product").select(1, { force: true }).invoke("val").should("not.eq", "");
  }
  cy.get("#startDate-day").should("have.value", "");
  cy.get("#startDate-month").should("have.value", "");
  cy.get("#startDate-year").should("have.value", "");
  cy.get("#dateLanded-day").should("have.value", "");
  cy.get("#dateLanded-day").should("have.value", "");
  cy.get("#dateLanded-day").should("have.value", "");
  cy.get("#select-faoArea").should("have.value", "FAO27");
  cy.get("#highSeasArea").should("not.be.checked");
  cy.get("#vessel\\.vesselName").should("have.value", "");
  cy.get("#weight").should("have.value", "");
  cy.get("select#gearCategory option:selected").should("have.value", "");
  cy.get("select#gearType option:selected").should("have.value", "");
  cy.get("select#rfmo option:selected").should("have.value", "");
};

const populateLandingForm = () => {
  // product
  cy.get("select#product").select(1).invoke("val").should("not.eq", "");
  // start date
  cy.get("#startDate").find("button.date-picker").click({ force: true });
  cy.get(".react-datepicker-popper").should("be.visible");
  cy.get(".react-datepicker__day").eq(0).trigger("click");
  cy.get("#startDate-day").should("have.prop", "value").and("not.be.empty");
  cy.get("#startDate-month").should("have.prop", "value").and("not.be.empty");
  cy.get("#startDate-year").should("have.prop", "value").and("not.be.empty");
  // date landed
  cy.get("#dateLanded").find("button.date-picker").click({ force: true });
  cy.get(".react-datepicker-popper").should("be.visible");
  cy.get(".react-datepicker__day").eq(10).trigger("click");
  cy.get("#dateLanded-day").should("have.prop", "value").and("not.be.empty");
  cy.get("#dateLanded-month").should("have.prop", "value").and("not.be.empty");
  cy.get("#dateLanded-year").should("have.prop", "value").and("not.be.empty");
  // Fao
  cy.get("#select-faoArea").select(10);
  cy.get("#select-faoArea").and("not.have.value", "FAO27");
  //High Seas Area
  cy.get("#highSeasArea").check();
  // vessel
  cy.get("#vessel\\.vesselName").invoke("val", "CARINA (BF803)");
  cy.get("#vessel\\.vesselName").should("have.prop", "value").and("not.be.empty");
  // weight
  cy.get("#weight").invoke("val", 4).should("have.prop", "value").and("not.be.empty");
  // gear info
  cy.get("select#gearCategory").select(1).invoke("val").should("not.eq", "");
  cy.get("select#gearType").select(1).invoke("val").should("not.eq", "");
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
    cy.findByRole("link", { name: "Back" }).click({ force: true });
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
    cy.get(".govuk-details__summary").should("have.length", 7);
    cy.get("div .govuk-details__summary").eq(0).contains("Start date");
    cy.get("div .govuk-details__summary").eq(0).click({ force: true });
    cy.get("div .govuk-details__text")
      .eq(0)
      .contains(
        "The start date is the date the vessel departed from port to begin the fishing trip during which the catch was made."
      )
      .should("be.visible");
    cy.get("div .govuk-details__summary").eq(1).contains("What is a date landed?");
    cy.get("div .govuk-details__summary").eq(1).click({ force: true });
    cy.get("div .govuk-details__text")
      .eq(1)
      .contains("The date landed is the date the vessel finishes its fishing trip and unloads its catch at port")
      .should("be.visible");
    cy.get("div .govuk-details__summary").eq(2).contains("What is a high seas area?");
    cy.get("div .govuk-details__text")
      .eq(2)
      .contains(
        "High Seas Area - high seas are international marine waters outside the jurisdiction of any country beyond the 200nm limit of the EEZ."
      )
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(2)
      .contains("Find out more about High Seas areas (opens in new tab).")
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(2)
      .contains("Find out more about High Seas areas (opens in new tab).")
      .click({ force: true });
    cy.get("div .govuk-details__summary").eq(3).contains("What is an exclusive economic zone (EEZ)?");
    cy.get("div .govuk-details__summary").eq(3).click({ force: true });
    cy.get("div .govuk-details__text")
      .eq(3)
      .contains(
        "Exclusive Economic Zones extend out to 200 nautical miles (nm) from the coastline or a median line where it meets another country’s limits."
      )
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(3)
      .contains(
        "Within EEZs the coastal state has sovereign rights to exploration and exploitation of the natural resources, marine research and responsibility for protection and preservation of Marine life."
      )
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(3)
      .contains("Find out more about EEZs (opens in new tab).")
      .should("be.visible");
    cy.get("div .govuk-details__summary")
      .eq(4)
      .contains("What is a regional fisheries management organisation (RFMO)?");
    cy.get("div .govuk-details__summary").eq(4).click({ force: true });
    cy.get("div .govuk-details__text")
      .eq(4)
      .contains(
        "Regional Fisheries Management Organisations (RFMO) - RFMOs are international organisations establishing binding measures for conservation and sustainable management of highly migratory or straddling fish species."
      )
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(4)
      .contains("Find out more about RFMOs (opens in new tab).")
      .click({ force: true });
    cy.get("div .govuk-details__summary").eq(5).contains("I cannot find the vessel");
    cy.get("div .govuk-details__summary").eq(5).click({ force: true });
    cy.get("div .govuk-details__text")
      .eq(5)
      .contains(
        'If the vessel you need is not listed, select "Vessel not listed – select if not available (N/A)" from the dropdown.'
      )
      .should("be.visible");
    cy.get("div .govuk-details__summary").eq(6).contains("What are gear details?");
    cy.get("div .govuk-details__summary").eq(6).click({ force: true });
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

  it("renders and validates start date and landed date fields", () => {
    cy.get("input[name='startDateDay']").type("01");
    cy.get("input[name='startDateMonth']").type("01");
    cy.get("input[name='startDateYear']").type("2025");
    cy.get("input[name='dateLandedDay']").type("02");
    cy.get("input[name='dateLandedMonth']").type("01");
    cy.get("input[name='dateLandedYear']").type("2025");
  });

  it("renders high seas area details and allows selection", () => {
    cy.get("input[type='radio'][name='highSeasArea']").first().check({ force: true });
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
      cy.get("#rfmo").select(2, { force: true });
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
    cy.get('input[id="eez-0"]').should("have.attr", "placeholder", "Select country");
    cy.get('input[id="eez-0"]').type("a");
    cy.get(".autocomplete__option").should("have.length.greaterThan", 0);
  });

  it("should allow selecting an EEZ option", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
  });

  it("should render and expand the EEZ help details", () => {
    cy.get(".govuk-details__summary").contains("What is an exclusive economic zone (EEZ)?").click();
    cy.get(".govuk-details__text")
      .should(
        "contain",
        "Exclusive Economic Zones extend out to 200 nautical miles (nm) from the coastline or a median line where it meets another country’s limits."
      )
      .and("be.visible");
  });

  it("should render EEZ add another button to last index of select", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
    cy.get("#remove-zone-button").should("not.exist");
    cy.get("#add-zone-button").should("exist");
  });

  it("should show Remove and Add Another buttons correctly based on selection length", () => {
    for (let i = 0; i < 5; i++) {
      cy.get("#add-zone-button").click({ force: true });
    }
    // Check Remove button exists on the last element
    cy.get("#eez-0").should("have.length.greaterThan", 0);
    cy.get("#remove-zone-button").should("exist");

    // Check Add Another button exists on the last element until length is 5
    cy.get("#eez-0").then(($elements) => {
      const length = $elements.length;
      if (length < 5) {
        cy.get("#eez-0").should("have.length.greaterThan", 0);
      } else {
        cy.get("#eez-0")
          .last()
          .within(() => {
            cy.get("#add-zone-button").should("not.exist");
          });
      }
    });
  });

  it("should show Remove and Add Another buttons correctly", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").click({ force: true });
    cy.get("#eez-1").should("exist");
    cy.get("#remove-zone-button").should("exist");
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").last().click({ force: true });
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
    cy.get("#add-zone-button").last().click({ force: true });
    cy.get("#add-zone-button").last().click({ force: true });
    cy.get("#add-zone-button").last().click({ force: true });
    cy.get("#remove-zone-button").last().should("be.visible");
    cy.get("#remove-zone-button").last().click({ force: true });
  });

  it("should click on remove last zone button and select should be removed", () => {
    //checking remove button exist or not
    cy.get("#add-zone-button").click({ force: true });
    cy.get("#eez-0").should("have.length", 1);
    cy.get("#remove-zone-button").should("not.exist");
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
    cy.get("#cancel").click({ force: true });
    cy.get("#product").contains("Select a product");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#exportWeight").invoke("val", "");
    cy.get("#select-vessel").invoke("val", "").trigger("change");
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearType").contains("Select gear type");
    cy.url().should("include", "/add-landings");
  });

  it("should click on cancel button with a value", () => {
    cy.get("#product").then(() => {
      cy.get("#product").select(1, { force: true });
    });
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    cy.contains("button", "Cancel").should("be.visible");
    cy.get("#cancel").click({ force: true });
    cy.get("#product").contains("Select a product");
    cy.url().should("include", "/add-landings");
  });

  it("should render the add Product button", () => {
    cy.get("#submit").contains("Add Landing");
  });

  it("submit the form with valid values", () => {
    // Product
    cy.get("#product").contains("Select a product");
    cy.get("#product").then(() => {
      cy.get("#product").select(1, { force: true });
    });
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    // Start Date
    cy.get("#startDate").find("img").click({ force: true });
    // Date
    cy.get("#dateLanded").find("img").click({ force: true });
    cy.get(".react-datepicker-popper").should("be.visible");
    cy.get(".react-datepicker__day").eq(0).trigger("click");
    // Fao
    cy.get("#select-faoArea").contains("FAO27");
    //High Seas Area
    cy.get("#highSeasArea").click({ force: true });
    // vessel
    cy.get("input[name='vessel']").type("K373");
    // weight
    cy.get("#exportWeight").invoke("val", "25");
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearCategory").then(() => {
      cy.get("#gearCategory").select(4, { force: true });
    });
    cy.get("#gearCategory").contains("Dredges");
    cy.get("#gearType").contains("Select gear type");
    cy.get("#gearType").then(() => {
      cy.get("#gearType").select(1, { force: true });
    });
    cy.get("#gearType").contains("Towed dredges (DRB)");

    // RFMO
    cy.get("#rfmo").then(() => {
      cy.get("#rfmo").select(2, { force: true });
    });
    // Click the 'Add Landing' button
    cy.get("[data-testid=submit]").click({ force: true });
    cy.get("#product").contains("Select a product");
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearType").contains("Select gear type");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#rfmo").contains("Select RFMO");
    cy.url().should("include", "/add-landings");
  });

  it("should redirect to the upload file page", () => {
    cy.get("#upload-product-landing").contains("Upload products and landings");
    cy.get("#upload-product-landing").click({ force: true });
    cy.url().should("include", "/upload-file");
  });

  it("should render a hint for start date", () => {
    cy.get("#startDate").find("#date-hint").contains("For example, 31 03 1980").should("be.visible");
    cy.get("#startDate-day").invoke("val", "24");
    cy.get("#startDate-month").invoke("val", "10");
    cy.get("#startDate-year").invoke("val", "20");
    cy.get("#startDate-day").should("have.value", "24");
    cy.get("#startDate-month").should("have.value", "10");
    cy.get("#startDate-year").should("have.value", "20");
  });

  it("should render form", () => {
    cy.get(".form-light-grey-bg .govuk-fieldset__heading b").contains("High seas area").should("be.visible");
    cy.get("#highSeasArea-hint").contains("Select yes if the product was caught in international waters");
  });

  it("Set the environment vaiable for dispalying optional fields as false", () => {
    cy.window().then((win) => {
      win.process = { env: { EU_CATCH_FIELDS_OPTIONAL: "false" } };
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

  it("should clear the form when landing is added", () => {
    populateLandingForm();
    // commit landing
    cy.get("button[value=submit]").click({ force: true });
    // check fields are clear
    verifyLandingFormIsReset(false);
  });

  it("should clear the form when landing is updated", () => {
    // click edit existing landing
    cy.get('[data-testid="edit_GBR-2023-CC-B2DFABFDE-1321338481"]').click({ force: true });
    // confirm form is populated
    cy.get("select#product option:selected").should("not.have.value", "");
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#select-faoArea").should("have.value", "FAO27");
    cy.get("#vessel\\.vesselName").should("not.have.value", "");
    cy.get("#weight").should("not.have.value", "");
    cy.get("select#gearCategory option:selected").should("not.have.value", "");
    cy.get("select#gearType option:selected").should("not.have.value", "");
    // update the landing
    cy.get("button[value=submit]").click({ force: true });
    // comfirm form is now empty
    verifyLandingFormIsReset(false);
  });

  it("should clear the form when add landing is cancelled", () => {
    populateLandingForm();
    // cancel the landing
    cy.get("button#cancel").click({ force: true });
    verifyLandingFormIsReset(true);
  });

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
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#select-faoArea").should("have.value", "FAO27");
    cy.get("#vessel\\.vesselName").should("not.have.value", "");
    cy.get("#weight").should("not.have.value", "");
    cy.get("select#gearCategory option:selected").should("not.have.value", "");
    cy.get("select#gearType option:selected").should("not.have.value", "");
    // cancel the landing
    cy.get("button#submit").click({ force: true });
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
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#select-faoArea").should("have.value", "FAO27");
    cy.get("#vessel\\.vesselName").should("not.have.value", "");
    cy.get("#weight").should("not.have.value", "");
    cy.get("select#gearCategory option:selected").should("not.have.value", "");
    cy.get("select#gearType option:selected").should("not.have.value", "");
    // cancel the landing
    cy.get("button#cancel").click({ force: true });
    verifyLandingFormIsReset(true);
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
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#dateLanded-day").should("not.have.value", "");
    cy.get("#select-faoArea").should("have.value", "FAO27");
    cy.get("#vessel\\.vesselName").should("not.have.value", "");
    cy.get("#weight").should("not.have.value", "");
    cy.get("select#gearCategory option:selected").should("not.have.value", "");
    cy.get("select#gearType option:selected").should("not.have.value", "");
    // cancel the landing
    cy.get("button#cancel").click({ force: true });
    verifyLandingFormIsReset(true);
    populateLandingForm();
    cy.get("button#submit").click({ force: true });
    verifyLandingFormIsReset(false);
  });
});

describe("Manual landing page: submit unauthorised access", () => {
  it("should redirect to forbidden page on click of button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingSubmitUnauthorised,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get("#product").then(() => {
      cy.get("#product").select(1, { force: true });
    });
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    cy.get("#startDate").find("img").click({ force: true });
    cy.get("#dateLanded").find("img").click({ force: true });
    cy.get(".react-datepicker-popper").should("be.visible");
    cy.get(".react-datepicker__day").eq(0).trigger("click");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#highSeasArea").click({ force: true });
    cy.get("input[name='vessel']").invoke("val", "AALSKERE(K373)").trigger("change");
    cy.get("#exportWeight").invoke("val", "25");
    cy.get("#gearCategory").then(() => {
      cy.get("#gearCategory").select(4, { force: true });
    });
    cy.get("#gearCategory").contains("Dredges");
    cy.get("#gearType").then(() => {
      cy.get("#gearType").select(1, { force: true });
    });
    cy.get("#gearType").contains("Towed dredges (DRB)");
    cy.get("#rfmo").then(() => {
      cy.get("#rfmo").select(2, { force: true });
    });
    cy.get("#rfmo").contains("North East Atlantic Fisheries Commission (NEAFC)");
    cy.get("[data-testid=submit]").click({ force: true });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to forbidden page with supportid on click of button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingSubmitUnauthorisedAndSupportId,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get("#product").then(() => {
      cy.get("#product").select(1, { force: true });
    });
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    cy.get("#startDate").find("img").click({ force: true });
    cy.get("#dateLanded").find("img").click({ force: true });
    cy.get(".react-datepicker-popper").should("be.visible");
    cy.get(".react-datepicker__day").eq(0).trigger("click");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#highSeasArea").click({ force: true });
    cy.get("input[name='vessel']").invoke("val", "AALSKERE").trigger("change");
    cy.get("#exportWeight").invoke("val", "25");
    cy.get("#gearCategory").then(() => {
      cy.get("#gearCategory").select(4, { force: true });
    });
    cy.get("#gearCategory").contains("Dredges");
    cy.get("#gearType").then(() => {
      cy.get("#gearType").select(1, { force: true });
    });
    cy.get("#gearType").contains("Towed dredges (DRB)");
    cy.get("#rfmo").then(() => {
      cy.get("#rfmo").select(2, { force: true });
    });
    cy.get("#rfmo").contains("North East Atlantic Fisheries Commission (NEAFC)");
    cy.get("[data-testid=submit]").click({ force: true });
    cy.url().should("include", "/forbidden/supportId123");
  });
});

describe("Manual landing page: delete", () => {
  it("should delete landing on click of delete button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualLandingDeleteProduct,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get(`[data-testid=remove_GBR-2023-CC-B2DFABFDE-1321338481]`).click({ force: true });
    cy.url().should("include", "/add-landings");
  });
});

describe("Manual landing page: delete landing", () => {
  it("should delete product from your products table on click of remove button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualLandingDeleteLandingProduct,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get(`[data-testid=remove-button-GBR-2023-CC-2323EC498-81368201-50c5-4347-bf1f-5802be97b58b]`).click({
      force: true,
    });
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
    cy.get("[data-testid='add-dateLanded']").click({ force: true });
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
    cy.get("select#gearCategory").select("Surrounding nets", { force: true });
    cy.get("[data-testid='add-gear-category']").click({ force: true });
    // workaround for Remix hydration issues, if we don't wait the UI simply isn't ready
    cy.wait(250);
    // check the gear type combo now has additional options
    cy.get("select#gearType option:selected").should("have.text", "Select gear type");
    cy.get("select#gearType option").should("have.length", 6);
    cy.get("select#gearType").select("Purse seines (PS)", { force: true });
    cy.get("select#gearType").should("have.value", "Purse seines (PS)");
  });

  it("should render a page-level error when the add gear category button is clicked when no category is selected", () => {
    cy.get("select#gearCategory option:selected").should("have.text", "Select gear category");
    cy.get("[data-testid='add-gear-category']").click({ force: true });
    // no gear type options initially, placeholder only
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a gear category$/).should("be.visible");
  });

  it("should remove button and add another button should be visible and EEZ field should be removed", () => {
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").click({ force: true });
    cy.get("#eez-0").should("have.length", 1);
    cy.get("#remove-zone-button").should("exist");
    cy.get("#remove-zone-button").last().should("be.visible");
    cy.get("#remove-zone-button").last().click({ force: true });
    cy.get("#eez-0").should("have.length", 1);
    cy.get("#add-zone-button").should("exist");
  });

  it("should render a field-level error when the add gear category button is clicked when no category is selected", () => {
    cy.get("select#gearCategory option:selected").should("have.text", "Select gear category");
    cy.get("[data-testid='add-gear-category']").click({ force: true });
    cy.get("p.govuk-error-message").should("contain.text", "Select a gear category");
  });

  it("should click on save as draft", () => {
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "catch-certificates");
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "whose-waters-were-they-caught-in");
  });

  it("should delete landing on click of delete button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualLandingDeleteProduct,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get(`[data-testid=remove_GBR-2023-CC-B2DFABFDE-1321338481]`).click({ force: true });
    cy.url().should("include", "/add-landings");
  });

  it("should delete product from your products table on click of remove button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.MannualLandingDeleteLandingProduct,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get(`[data-testid=remove-button-GBR-2023-CC-2323EC498-81368201-50c5-4347-bf1f-5802be97b58b]`).click({
      force: true,
    });
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
      cy.get("select#gearCategory").select("Surrounding nets", { force: true });
      cy.get("[data-testid='add-gear-category']").click({ force: true });
      // workaround for Remix hydration issues, if we don't wait the UI simply isn't ready
      cy.wait(250);
      // check the gear type combo now has additional options
      cy.get("select#gearType option:selected").should("have.text", "Dewiswch y math o gêr");
      cy.get("select#gearType option").should("have.length", 6);
      cy.get("select#gearType").select("Purse seines (PS)", { force: true });
      cy.get("select#gearType").should("have.value", "Purse seines (PS)");
    });

    it("should render an error prompt if the add gear category button is clicked when no category is selected", () => {
      cy.get("select#gearCategory option:selected").should("have.text", "Dewiswch gategori’r gêr");
      cy.get("[data-testid='add-gear-category']").click({ force: true });
      // no gear type options initially, placeholder only
      cy.contains("h2", /^Mae yna broblem$/).should("be.visible");
      cy.contains("a", /^Dewiswch gategori gêr$/).should("be.visible");
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
    cy.get("#select-vessel").invoke("val", "abc").trigger("change");
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "whose-waters-were-they-caught-in");
  });

  it("should reset form", () => {
    cy.get("#product").contains("Select a product");
    cy.get("#select-faoArea").contains("FAO27");
    cy.get("#exportWeight").invoke("val", "");
    cy.get("#select-vessel").invoke("val", "").trigger("change");
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
    cy.get(`[data-testid=edit_GBR-2023-CC-B2DFABFDE-1321338481]`).click({ force: true });
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
    cy.get(`[data-testid=edit_GBR-2023-CC-B2DFABFDE-1321338481]`).click({ force: true });
    cy.url().should("include", "/forbidden");
  });
});

describe("Manual landings page: Error summary on click of add Product", () => {
  it("should display an error summary and error validation at the form input when there is a bad request", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid=submit]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a product from the list$/).should("be.visible");
    cy.contains("a", /^Select a vessel from the list$/).should("be.visible");
    cy.contains("a", /^Enter the date landed$/).should("be.visible");
    cy.contains("a", /^Enter the export weight as a number, like 500 or 500.50$/).should("be.visible");
    cy.contains("a", /^Select a gear category$/).should("be.visible");
    cy.contains("a", /^Select a gear type$/).should("be.visible");
  });
  it("should display an error when gear category is selected but gear type is not", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get("#gearCategory").then(() => {
      cy.get("#gearCategory").select(4, { force: true });
    });
    cy.get("#gearCategory").contains("Dredges");
    cy.get("[data-testid=submit]").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a gear type$/).should("be.visible");
  });
  it("should not display any error when gear catergory and gear type are not selected", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearType").contains("Select gear type");
    cy.get("[data-testid=submit]").click({ force: true });
    cy.contains("a", /^Select a gear type$/).should("not.exist");
  });

  it("shows error messages when required fields are empty and form is submitted", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingPageFailsWithErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
    cy.get("#submit").click({ force: true });
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
    cy.get("#dateLanded-day").invoke("val", "25");
    cy.get("#dateLanded-month").invoke("val", "10");
    cy.get("#dateLanded-year").invoke("val", "2020");
    cy.get("#startDate-day").invoke("val", "25");
    cy.get("#startDate-month").invoke("val", "10");
    cy.get("#startDate-year").invoke("val", "2020");
    cy.get("[data-testid='add-dateLanded']").click({ force: true });
    cy.url().should("include", "vessels");
    cy.get("#select-vessel").should("have.length.at.least", 1);
  });

  it("should trigger add date button with wrong format YY-MM-DD", () => {
    cy.contains("[data-testid='add-dateLanded']", "Add Date");
    cy.get("#dateLanded-day").invoke("val", "24");
    cy.get("#dateLanded-month").invoke("val", "10");
    cy.get("#dateLanded-year").invoke("val", "20");
    cy.get("#startDate-day").invoke("val", "24");
    cy.get("#startDate-month").invoke("val", "10");
    cy.get("#startDate-year").invoke("val", "20");
    cy.get("[data-testid='add-dateLanded']").click({ force: true });
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
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
    cy.get("[data-testid='save-and-continue']").click({ force: true });
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

describe("Manual Landing page when gear types api is failing", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingPageErrors,
    };
    cy.visit(manualLandingUrl, { qs: { ...testParams } });
  });
  it("Catch errors when gear types are not found", () => {
    // Product
    cy.get("#product").contains("Select a product");
    cy.get("#product").then(() => {
      cy.get("#product").select(1, { force: true });
    });
    cy.get("#product").contains("Longnose velvet dogfish (CYP), Fresh, Other presentations, 03045690");
    // Start Date
    cy.get("#startDate").find("img").click({ force: true });
    // Date
    cy.get("#dateLanded").find("img").click({ force: true });
    cy.get(".react-datepicker-popper").should("be.visible");
    cy.get(".react-datepicker__day").eq(0).trigger("click");
    // Fao
    cy.get("#select-faoArea").contains("FAO27");
    // vessel
    cy.get("input[name='vessel']").type("K373");
    // weight
    cy.get("#exportWeight").invoke("val", "25");
    cy.get("#gearCategory").contains("Select gear category");
    cy.get("#gearCategory").then(() => {
      cy.get("#gearCategory").select(4, { force: true });
    });
    cy.get("#gearCategory").contains("Dredges");
    cy.get("#gearType").contains("Select gear type");
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
    cy.get(".govuk-label").should("have.length", 16);
    // product
    cy.get(".govuk-label").eq(0).should("have.text", "Product").and("be.visible");
    // start date
    cy.get(".govuk-label").eq(1).should("have.text", "Day").and("be.visible");
    cy.get(".govuk-label").eq(2).should("have.text", "Month").and("be.visible");
    cy.get(".govuk-label").eq(3).should("have.text", "Year").and("be.visible");
    // landed date
    cy.get(".govuk-label").eq(4).should("have.text", "Day").and("be.visible");
    cy.get(".govuk-label").eq(5).should("have.text", "Month").and("be.visible");
    cy.get(".govuk-label").eq(6).should("have.text", "Year").and("be.visible");
    // catch area
    cy.get(".govuk-label").eq(7).should("have.text", "Catch area").and("be.visible");
    // High seas area
    cy.get(".govuk-label").eq(8).should("have.text", "Yes").and("be.visible");
    cy.get(".govuk-label").eq(9).should("have.text", "No").and("be.visible");
    //Eez
    cy.get(".govuk-label").eq(10).should("have.text", "Exclusive economic zone").and("be.visible");
    // RFMO
    cy.get(".govuk-label")
      .eq(11)
      .should("have.text", "Regional fisheries management organisation (optional)")
      .and("be.visible");
    // vessel
    cy.get(".govuk-label").eq(12).should("have.text", "Vessel name or port letter and number (PLN)").and("be.visible");
    // export weight
    cy.get(".govuk-label").eq(13).should("have.text", "Export Weight").and("be.visible");
    // gear details
    cy.get(".govuk-label").eq(14).should("have.text", "Gear category").and("be.visible");
    cy.get(".govuk-label").eq(15).should("have.text", "Gear type").and("be.visible");
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
    cy.get("#dateLanded-day").type("12");
    cy.get("#dateLanded-month").type("05");
    cy.get("#dateLanded-year").clear();
    cy.get("[data-testid=submit]").click({ force: true });
    cy.contains(/^Enter the date landed$/).should("be.visible");
  });

  it("should show an error if Date Landed is in an invalid format", () => {
    cy.get("#startDate-day").type("01");
    cy.get("#startDate-month").type("09");
    cy.get("#startDate-year").type("2020");

    cy.get("#dateLanded-day").type("99");
    cy.get("#dateLanded-month").type("99");
    cy.get("#dateLanded-year").type("2020");
    cy.get("[data-testid=submit]").click();
    cy.contains("a", /^Enter the date landed$/).should("be.visible");
  });

  it("should not allow vessel selection until Date Landed is valid", () => {
    cy.get("#vessel\\.vesselName").type("SHOULDNOTWORK", { force: true });
    cy.get("#vessel\\.vesselName").should("have.value", "");
    cy.get("#dateLanded-day").type("12");
    cy.get("#dateLanded-month").type("05");
    cy.get("#vessel\\.vesselName").type("SHOULDNOTWORK", { force: true });
    cy.get("#vessel\\.vesselName").should("have.value", "");
    const today = new Date();
    cy.get("#dateLanded-year").type(today.getFullYear().toString());
    cy.get("#vessel\\.vesselName").type("SHOULDWORK", { force: true });
  });

  it("should clear vessel input if Date Landed is changed to invalid", () => {
    function pad2(n: number | string) {
      return n.toString().length === 1 ? "0" + n : n.toString();
    }
    const today = new Date();
    cy.get("#dateLanded-day").type(pad2(today.getDate()));
    cy.get("#dateLanded-month").type(pad2(today.getMonth() + 1));
    cy.get("#dateLanded-year").type(today.getFullYear().toString());
    cy.get("input[name='vessel']").type("CARINA (BF803)");
    cy.get("#dateLanded-day").clear().type("99");
    cy.get("input[name='vessel']").should("have.value", "");
  });

  it("should not show vessel error if vessel is entered and date is valid", () => {
    function pad2(n: number | string) {
      return n.toString().length === 1 ? "0" + n : n.toString();
    }
    const today = new Date();
    cy.get("#dateLanded-day").type(pad2(today.getDate()));
    cy.get("#dateLanded-month").type(pad2(today.getMonth() + 1));
    cy.get("#dateLanded-year").type(today.getFullYear().toString());
    cy.get("input[name='vessel']").type("K373");
    cy.get("#exportWeight").invoke("val", "25");
    cy.get("[data-testid=submit]").click({ force: true });
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
      cy.get("select#product").select(1, { force: true });
    });
  });

  it("should display validation error when Start Date is not provided", () => {
    cy.get("[data-testid=submit]").click({ force: true });

    cy.get(".govuk-error-summary", { timeout: 10000 }).should("be.visible");

    cy.get(".govuk-error-summary").contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary").contains("a", "Enter the start date of the fishing trip").should("be.visible");
  });

  it("should display validation error when High Seas Area is not selected", () => {
    cy.get("input#startDate-day").clear().type("01");
    cy.get("input#startDate-month").clear().type("09");
    cy.get("input#startDate-year").clear().type("2020");

    cy.get("[data-testid=submit]").click({ force: true });

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary")
      .contains("a", "Select whether the product was caught in a high seas area")
      .should("be.visible");
  });

  it("should display validation error when Exclusive Economic Zone is not provided", () => {
    cy.get("input#startDate-day").clear().type("01");
    cy.get("input#startDate-month").clear().type("09");
    cy.get("input#startDate-year").clear().type("2020");

    cy.get("input#separateHighSeasAreaFalse").check({ force: true });

    cy.get("[data-testid=submit]").click({ force: true });

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
    cy.get("input#startDate-day").clear().type("01");
    cy.get("input#startDate-month").clear().type("09");
    cy.get("input#startDate-year").clear().type("2020");

    cy.get("input#highSeasArea").check({ force: true });

    cy.get("[data-testid=submit]").click({ force: true });

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary").contains("a", "Select a gear category").should("be.visible");

    cy.get("select#gearCategory").should("have.class", "govuk-select--error");
  });

  it("should display validation error when Gear Type is not selected", () => {
    cy.get("input#startDate-day").clear().type("01");
    cy.get("input#startDate-month").clear().type("09");
    cy.get("input#startDate-year").clear().type("2020");

    cy.get("input#highSeasArea").check({ force: true });

    cy.get("select#gearCategory").select(4, { force: true });

    cy.get("[data-testid=submit]").click({ force: true });

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary").contains("a", "Select a gear type").should("be.visible");

    cy.get("select#gearType").should("have.class", "govuk-select--error");
  });

  it("should display multiple validation errors when multiple mandatory fields are empty", () => {
    cy.get("[data-testid=submit]").click({ force: true });

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary").contains("a", "Enter the start date of the fishing trip").should("be.visible");
    cy.get(".govuk-error-summary")
      .contains("a", "Select whether the product was caught in a high seas area")
      .should("be.visible");
    cy.get(".govuk-error-summary").contains("a", "Select a gear category").should("be.visible");
  });

  it("should display error when EEZ is selected as 'No' but no country is provided", () => {
    cy.get("input#startDate-day").clear().type("01");
    cy.get("input#startDate-month").clear().type("09");
    cy.get("input#startDate-year").clear().type("2020");

    cy.get("input#separateHighSeasAreaFalse").check({ force: true });

    cy.get("[data-testid=submit]").click({ force: true });

    cy.contains("h2", "There is a problem").should("be.visible");

    cy.get(".govuk-error-summary")
      .contains("a", "Select or enter a country for the exclusive economic zone")
      .should("be.visible");
  });

  it("should apply correct CSS classes to EEZ fields based on error state", () => {
    cy.get("input#startDate-day").clear().type("01");
    cy.get("input#startDate-month").clear().type("09");
    cy.get("input#startDate-year").clear().type("2020");

    cy.get("input#separateHighSeasAreaFalse").check({ force: true });

    cy.get("#eez-0").should("be.visible");

    cy.get("[data-testid=submit]").click({ force: true });
    cy.get(".govuk-error-message").should("contain", "Select or enter a country for the exclusive economic zone");
  });

  it("should handle gear types API error gracefully", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.AddLandingGearTypesAPIError,
    };

    cy.visit(manualLandingUrl, { qs: { ...testParams } });

    cy.get("select#gearCategory").select(1, { force: true });

    cy.get("select#gearType option").should("have.length", 1);
    cy.get("select#gearType option").should("contain.text", "Select gear type");
  });
});
