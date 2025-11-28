import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate";
const documentNumber = "GBR-2022-CC-6BC952BA3";
const directLandingUrl = `${documentUrl}/${documentNumber}/direct-landing`;

const waitForHydration = () => {
  // if the date pickers are there then we can assume the UI is ready
  cy.get("button.date-picker").should("be.visible");
};

describe("Direct landing page render", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLanding,
    };

    cy.visit(directLandingUrl, { qs: { ...testParams } });
  });

  it("should render a back link", () => {
    cy.findByRole("link", { name: "Back" }).click({ force: true });
    cy.url().should("include", "/what-are-you-exporting");
  });

  it("should render the correct page title", () => {
    cy.get(".govuk-heading-xl").contains("Add your trip").should("be.visible");
    cy.title().should("eq", "Add your trip - Create a UK catch certificate - GOV.UK");
  });

  it("should render the important notice", () => {
    cy.get(".govuk-warning-text__text").should("contain.text", "From 10 January 2026");
  });

  it("should render the insert text", () => {
    cy.get("p").contains("Please Note:");
    cy.get("#directLandingsGuidanceMessage")
      .find("li")
      .should("have.length", 3)
      .should(($list) => {
        expect($list[0]).to.contain("A landing date is required before selecting a vessel");
        expect($list[1]).to.contain(
          "Landing dates can be up to 7 days in the future in draft documents but only up to 3 days in the future in final submitted catch certificates"
        );
        expect($list[2]).to.contain(
          "All landings should have been made in accordance with the relevant conservation and management measures"
        );
      });
  });

  it("should render summary details links and text", () => {
    cy.get(".govuk-details__summary").should("have.length", 7);
    cy.get("div .govuk-details__summary").eq(0).contains("Start date");
    cy.get("div .govuk-details__summary").eq(0).click({ force: true });
    cy.get("div .govuk-details__text")
      .contains(
        "The start date is the date the vessel departed from port to begin the fishing trip during which the catch was made."
      )
      .should("be.visible");
    cy.get("div .govuk-details__text").eq(0).contains("The start date is not:").should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(0)
      .contains("The date the catch was landed (see Date Landed)")
      .should("be.visible");
    cy.get("div .govuk-details__text").eq(0).contains("The date the catch was sold or processed").should("be.visible");
    cy.get("div .govuk-details__summary").eq(1).contains("What is a date landed?");
    cy.get("div .govuk-details__summary").eq(1).click({ force: true });
    cy.get("div .govuk-details__text")
      .contains("The date landed is the date the vessel finishes its fishing trip and unloads its catch at port.")
      .should("be.visible");
    cy.get("div .govuk-details__text").eq(1).contains("You can enter a landing date:").should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(1)
      .contains("up to 7 days in the future in draft documents")
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .eq(1)
      .contains("up to 3 days in the future in final submitted catch certificates")
      .should("be.visible");
    cy.get("div .govuk-details__summary").eq(2).contains("What is a high seas area?");
    cy.get("div .govuk-details__summary").eq(2).click({ force: true });
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
      .contains(
        'If the vessel you need is not listed, select "Vessel not listed – select if not available (N/A)" from the dropdown.'
      )
      .should("be.visible");
    cy.get("div .govuk-details__text")
      .contains("This option is for cases where the vessel is not in the system or cannot be found using the search.")
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

  it("should display the EEZ label and its corresponding hint", () => {
    cy.get('label[for="eez-0"]').should("contain", "Exclusive economic zone");
    cy.get("#eez-0").should("exist");
    cy.get(".govuk-hint").should("contain", "The area of sea where the fish were caught");
  });

  it("should render the EEZ select dropdown with a placeholder and country list options", () => {
    cy.get('input[id="eez-0"]').should("have.attr", "placeholder", "Select country");
    cy.get('input[id="eez-0"]').type("a");
    cy.get(".autocomplete__option").should("have.length.greaterThan", 0);
  });

  it("should correctly handle EEZ option selection", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
  });

  it("should display and expand the EEZ help section when triggered", () => {
    cy.get(".govuk-details__summary").contains("What is an exclusive economic zone (EEZ)?").click();
    cy.get(".govuk-details__text")
      .should(
        "contain",
        "Exclusive Economic Zones extend out to 200 nautical miles (nm) from the coastline or a median line where it meets another country’s limits."
      )
      .and("be.visible");
  });

  it("should render the 'Add Another EEZ' button after the last select dropdown", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
    cy.wait(250);
    for (let i = 0; i < 2; i++) {
      cy.get("#remove-zone-button").click({ force: true });
    }
    cy.get("#remove-zone-button").should("not.exist");
    cy.get("#add-zone-button").should("exist");
  });

  it("should display 'Remove' and 'Add Another' buttons appropriately depending on selection count", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
    cy.wait(250);
    cy.get("#add-zone-button").should("exist");
    for (let i = 0; i < 4; i++) {
      cy.get("body").then(($body) => {
        if ($body.find("#add-zone-button").length > 0) {
          cy.get("#add-zone-button").click({ force: true });
          cy.wait(250);
        }
      });
    }
    cy.get('[id^="eez-"]').should("have.length.greaterThan", 1);
    cy.get("#remove-zone-button").should("exist");
    cy.get('[id^="eez-"]').then(($elements) => {
      if ($elements.length >= 5) {
        cy.get("#add-zone-button").should("not.exist");
      } else {
        cy.get("#add-zone-button").should("exist");
      }
    });
  });

  it("should correctly display 'Remove' and 'Add Another' buttons based on EEZ selection state", () => {
    cy.get("#eez-0").should("be.visible").and("not.be.disabled");
    cy.wait(300);
    cy.get("#add-zone-button").trigger("click", { force: true });
    cy.wait(300);
    cy.get("#eez-1").should("exist");
    cy.get("#remove-zone-button").should("exist");
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").last().click({ force: true });
    cy.get("#eez-2").should("exist");
    cy.get("#remove-zone-button").should("exist");
  });

  it("should render the add another zone button and click on it", () => {
    cy.wait(300);
    cy.get("#add-zone-button").trigger("click", { force: true });
    cy.wait(300);
    cy.get("#eez-0").should("have.length", 1);
    cy.get("#eez-1").should("exist");
    cy.get("#remove-zone-button").should("exist");
    cy.get("#remove-zone-button").last().should("be.visible");
    cy.get("#remove-zone-button").last().click();
    cy.get("#eez-0").should("have.length", 1);
  });

  it("should correctly render and respond to click on the 'Add Another Zone' button", () => {
    cy.wait(300);
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").last().click({ force: true });
    cy.get("#remove-zone-button").last().should("be.visible");
    cy.get("#remove-zone-button").last().click({ force: true });
  });

  it("should remove the last EEZ select field when the 'Remove Zone' button is clicked", () => {
    cy.get("#add-zone-button").should("exist");
    cy.get("#add-zone-button").last().click({ force: true });
    cy.get("#add-zone-button").last().click({ force: true });
    cy.get("#add-zone-button").last().click({ force: true });
    cy.get("#remove-zone-button").last().should("be.visible");
    cy.get("#remove-zone-button").last().click({ force: true });
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

  it("should check product weights table ", () => {
    cy.get(".govuk-table__head").find("th").should("have.length", 2);
    cy.get(".govuk-table__head").find("th").eq(0).contains("Product");
    cy.get(".govuk-table__head").find("th").eq(1).contains("Export Weight");
  });

  it("should check start date label as Start date of fishing trip", () => {
    cy.get("#startDate").find("legend").find("b").contains("Start date of fishing trip");
  });

  it("should fill the start date details from date picker", () => {
    cy.get("#startDate-day").invoke("val").should("be.empty");
    cy.get("#startDate-month").invoke("val").should("be.empty");
    cy.get("#startDate-year").invoke("val").should("be.empty");
    // use picker
    cy.get("#startDate img").should("be.visible");
    cy.get("#startDate img").click({ force: true });
    cy.get(".react-datepicker-popper").should("be.visible");
    cy.get(".react-datepicker__day").eq(0).trigger("click");
    // check fields now have values
    cy.get("#startDate-day").invoke("val").and("not.be.empty");
    cy.get("#startDate-month").invoke("val").and("not.be.empty");
    cy.get("#startDate-year").invoke("val").and("not.be.empty");
  });

  it("should change the date landed details from picker", () => {
    cy.get("#dateLanded-day").invoke("val").should("eq", "11");
    cy.get("#dateLanded-month").invoke("val").should("eq", "12");
    cy.get("#dateLanded-year").invoke("val").should("eq", "2021");
    // use picker
    cy.get("#dateLanded img").should("be.visible");
    cy.get("#dateLanded img").click({ force: true });
    cy.get(".react-datepicker-popper").should("be.visible");
    cy.get(".react-datepicker__day").eq(0).trigger("click");
    // check fields have values
    cy.get("#dateLanded-day").invoke("val").should("not.eq", "11");
    cy.get("#dateLanded-month").invoke("val").should("not.eq", "12");
    cy.get("#dateLanded-year").invoke("val").should("eq", "2021");
  });

  it("should disable vessel input until date landed is populated", () => {
    waitForHydration();
    cy.get("#vessel\\.vesselName").clear();
    cy.get("#vessel\\.vesselName").invoke("val").should("eq", "");
    cy.get("#dateLanded-day").clear();
    cy.get("#dateLanded-day").invoke("val").should("eq", "");
    cy.get("#dateLanded-month").clear();
    cy.get("#dateLanded-month").invoke("val").should("eq", "");
    cy.get("#dateLanded-year").clear();
    cy.get("#dateLanded-year").invoke("val").should("eq", "");
    // attempt to change vessel
    cy.get("#vessel\\.vesselName").type("CARINA (BF803)");
    cy.get("#vessel\\.vesselName").invoke("val").should("eq", "");
    // populate valid landed date
    cy.get("#dateLanded-day").type("11");
    cy.get("#dateLanded-month").type("12");
    cy.get("#dateLanded-year").type("2021");
    // attempt to change vessel
    cy.get("#vessel\\.vesselName").type("CARINA (BF803)");
    cy.get("#vessel\\.vesselName").invoke("val").should("eq", "CARINA (BF803)");
  });

  it("should fill the form fields with gear details", () => {
    // start date
    cy.get("#startDate").find("img").click({ force: true });
    cy.get(".react-datepicker-popper").should("be.visible");
    cy.get(".react-datepicker__day").eq(0).trigger("click");
    // date landed
    cy.get("#dateLanded").find("img").click({ force: true });
    cy.get(".react-datepicker-popper").should("be.visible");
    cy.get(".react-datepicker__day").eq(10).trigger("click");
    // Fao
    cy.get("#select-faoArea").contains("FAO27");
    //High Seas Area
    cy.get("#highSeasArea").click({ force: true });
    // RFMO
    cy.get("#rfmo").then(() => {
      cy.get("#rfmo").select(2, { force: true });
    });
    // vessel
    cy.get("#vessel\\.vesselName").invoke("val", "CARINA (BF803)");
    // weight
    cy.get("#weights\\.0\\.exportWeight").invoke("val", 4);
    cy.get("#weights\\.1\\.exportWeight").invoke("val", 8);
    // gear details
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
  });

  it("should render the  Save as draft button", () => {
    cy.contains("button", "Save as draft").should("be.visible");
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "catch-certificates");
  });

  it("should render the  Save and continue button", () => {
    cy.contains("button", "Save and continue").should("be.visible");
  });

  it("should render 0kg if the entered weights are not defined", () => {
    cy.get("#weights\\.0\\.exportWeight").should("have.value", "2");
    cy.get("#weights\\.1\\.exportWeight").should("have.value", "3");
    cy.get("#weights\\.0\\.exportWeight").invoke("val", "").trigger("change");
    cy.get("#weights\\.1\\.exportWeight").invoke("val", "").trigger("change");
    cy.get("#yourproducts tr:last-child td:last-of-type").contains("0kg");
  });

  it("should render gearCategory and gearType", () => {
    cy.get("#gearCategory").should("have.value", "Surrounding nets");
    cy.get("#gearType").should("have.value", "Purse seines (PS)");
  });

  it("should clear gearTypes when gearCategory is deselected", () => {
    cy.get("#gearCategory").should("have.value", "Surrounding nets");
    cy.get("#gearType").should("have.value", "Purse seines (PS)");
    // deselect category
    cy.get("#gearCategory").select("");
    cy.get("#gearCategory").invoke("val", "").trigger("change");
    // confirm gear category / type values are cleared
    cy.get("#gearType").invoke("val", "").trigger("change");
  });

  it("should trigger vessel dropdown when user types", () => {
    waitForHydration();
    cy.get("#vessel\\.vesselName").invoke("val").should("eq", "AARON (N370)");
    cy.get("#vessel\\.vesselName").clear();
    cy.get("#vessel\\.vesselName").invoke("val").should("be.empty");
    cy.get("#vessel\\.vesselName").type("ff");
    cy.get(".autocomplete__option").should("have.length", 5501);
  });
});

describe("DirectLanding page when not vessel is returned", () => {
  it("should redirect to the dashboard", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingNoVessels,
    };

    cy.visit(directLandingUrl, { qs: { ...testParams } });

    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "catch-certificates");
  });
});

describe("DirectLanding page when the weights are not numbers", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingIncorrectWeights,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
  });

  it("should render 0kg if the entered weights are not numbers", () => {
    cy.get("#yourproducts tr:last-child td:last-of-type").contains("0kg");
  });
});

describe("DirectLanding page: unauthorised", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingUnauthorised,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
  });

  it("should redirect to forbidden page on click of save-and-continue button", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "forbidden");
  });
  it("should redirect to forbidden page on click of save-draft-button button", () => {
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "forbidden");
  });
});

describe("DirectLanding page when javascript is disabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLanding,
      disableScripts: true,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
  });

  it("should render add date buttons when JavaScript is disabled", () => {
    cy.contains("[data-testid='add-dateLanded']", "Add Date");
  });

  it("should render a select box with pre-populated vessel names when valid date landed exists", () => {
    cy.get("select#vessel\\.vesselName").should("exist");
    cy.get("select#vessel\\.vesselName option").should("not.have.length", 0);
  });

  it("should retain existing vessel name when date landed is added", () => {
    cy.get("[data-testid='add-dateLanded']").click({ force: true });
    cy.get("select#vessel\\.vesselName").should("have.length.at.least", 1);
    cy.get("select#vessel\\.vesselName").should("have.value", "AARON (N370)");
  });

  it("should retain existing vessel name when date landed is added", () => {
    cy.get("[data-testid='add-dateLanded']").click({ force: true });
    cy.get("select#vessel\\.vesselName").should("have.length.at.least", 1);
    cy.get("select#vessel\\.vesselName").should("have.value", "AARON (N370)");
  });

  it("should trigger add date button with values", () => {
    cy.get("#dateLanded-day").type("20");
    cy.get("#dateLanded-month").type("03");
    cy.get("#dateLanded-year").type("2023");
    cy.get("[data-testid='add-dateLanded']").click({ force: true });
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "whose-waters-were-they-caught-in");
  });

  it("should click on save as draft", () => {
    cy.get("[data-testid='save-draft-button']").click({ force: true });
    cy.url().should("include", "catch-certificates");
  });

  it("should display add gear category button", () => {
    cy.contains("[data-testid='add-gear-category']", "Add gear category");
  });
});

describe("DirectLanding page errors when javascript is disabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingErrors,
      disableScripts: true,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
  });

  it("should trigger add date button", () => {
    cy.get("[data-testid='add-dateLanded']").click({ force: true });
    cy.url().should("include", "vessels");
    cy.get("#vessel\\.vesselName").should("have.length.at.least", 1);
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "direct-landing");
  });

  it("should render a page-level error when vessel name is missing", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select a vessel from the list$/).should("be.visible");
  });

  it("should render a field-level error when vessel is missing", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("span.govuk-error-message").should("contain.text", "Select a vessel from the list");
  });

  it("should render a page-level error when the add gear category button is clicked when no category is selected", () => {
    cy.get("select#gearCategory").select("Select gear category", { force: true });
    cy.get("[data-testid='add-gear-category']").click({ force: true });
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^You must select a gear category option to add gear category$/).should("be.visible");
  });

  it("should render a field-level error when the add gear category button is clicked when no category is selected", () => {
    cy.get("select#gearCategory").select("Select gear category", { force: true });
    cy.get("[data-testid='add-gear-category']").click({ force: true });
    cy.get("p.govuk-error-message").should(
      "contain.text",
      "You must select a gear category option to add gear category"
    );
  });
});

describe("DirectLanding page errors when javascript is enabled", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLanding,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
  });

  it("should search autoinput field", () => {
    cy.get("#vessel\\.vesselName").invoke("val", "abc").trigger("change");
  });

  it("should click on save and continue", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.url().should("include", "whose-waters-were-they-caught-in");
  });

  it("should calculate total weight when individual product weights are changed", () => {
    cy.contains(".govuk-table__cell", "Total export weight").next(".govuk-table__cell").should("have.text", "5.00kg");
    cy.get('input[id="weights.0.exportWeight"]').clear();
    cy.get('input[id="weights.0.exportWeight"]').type("2");
    cy.contains(".govuk-table__cell", "Total export weight").next(".govuk-table__cell").should("have.text", "25.00kg");
    cy.get('input[id="weights.1.exportWeight"]').clear();
    cy.get('input[id="weights.1.exportWeight"]').type("2");
    cy.contains(".govuk-table__cell", "Total export weight").next(".govuk-table__cell").should("have.text", "24.00kg");
  });
});

describe("Direct Landing mandatory fields unpopulated errors", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingValidationErrors,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
  });

  it("should display an error when start date is unpopulated", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("Enter the start date of the fishing trip");
  });

  it("should display an error when high seas is unpopulated", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("Select whether the product was caught in a high seas area");
  });

  it("should display an error when gear type is unpopulated", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("Select a gear type");
  });

  it("should display an error when gear category is unpopulated", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("Select a gear category");
  });
});

describe("High Seas Component - validation error", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingValidationErrors,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("[data-testid='save-and-continue']").click({ force: true });
  });

  it("should apply error modifier class to form-group", () => {
    cy.get(".govuk-form-group--error").find("fieldset").should("exist");
  });

  it("should set aria-describedby to include both error and hint IDs", () => {
    cy.get("fieldset.govuk-fieldset")
      .filter('[aria-describedby*="highSeasArea-error"]')
      .should("have.attr", "aria-describedby", "highSeasArea-error highSeasArea-hint");
  });

  it("should render error message with correct structure", () => {
    cy.get("#highSeasArea-error").should("exist").should("have.class", "govuk-error-message");
  });

  it("should display visually hidden error prefix text", () => {
    cy.get("#highSeasArea-error").find(".govuk-visually-hidden").should("contain.text", "Error");
  });

  it("should clear error when valid selection is made", () => {
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#highSeasArea-error").should("exist");
    cy.get("#highSeasArea").click({ force: true });
  });
});

describe("DirectLanding page guard when javascript is disabled", () => {
  it("should redirect to a forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingPageGuard,
      disableScripts: true,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });
});

describe("DirectLanding page, when no landing have been added", () => {
  it("should select catch area FAO27 as a default", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingEmpty,
    };

    cy.visit(directLandingUrl, { qs: { ...testParams } });

    cy.get("#select-faoArea").should("have.value", "FAO27");
  });
});

describe("Direct Landing page when gear types api is failing", () => {
  it("should catch errors when gear types are not found", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingPageGearTypeErrors,
    };

    cy.visit(directLandingUrl, { qs: { ...testParams } });

    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").contains("Select a gear type");
  });
});
describe("Direct landing page: Accessibility", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLanding,
    };

    cy.visit(directLandingUrl, { qs: { ...testParams } });
  });

  it("should have label for all fields on the form", () => {
    cy.get(".form-light-grey-bg label").should("have.length", 14);
    // start date
    cy.get(".form-light-grey-bg label").eq(0).should("have.text", "Day").and("be.visible");
    cy.get(".form-light-grey-bg label").eq(1).should("have.text", "Month").and("be.visible");
    cy.get(".form-light-grey-bg label").eq(2).should("have.text", "Year").and("be.visible");
    // landed date
    cy.get(".form-light-grey-bg label").eq(3).should("have.text", "Day").and("be.visible");
    cy.get(".form-light-grey-bg label").eq(4).should("have.text", "Month").and("be.visible");
    cy.get(".form-light-grey-bg label").eq(5).should("have.text", "Year").and("be.visible");
    // catch area
    cy.get(".form-light-grey-bg label").eq(6).should("have.text", "Catch area").and("be.visible");
    // high seas area
    cy.get(".form-light-grey-bg label").eq(7).should("have.text", "Yes").and("be.visible");
    cy.get(".form-light-grey-bg label").eq(8).should("have.text", "No").and("be.visible");
    // EEZ
    cy.get(".govuk-label").eq(9).should("have.text", "Exclusive economic zone").and("be.visible");
    // RFMO
    cy.get(".form-light-grey-bg label")
      .eq(10)
      .should("have.text", "Regional fisheries management organisation (optional)")
      .and("be.visible");
    // vessel
    cy.get(".form-light-grey-bg label")
      .eq(11)
      .should("have.text", "Vessel name or port letter and number (PLN)")
      .and("be.visible");
    // gear details
    cy.get(".form-light-grey-bg label").eq(12).should("have.text", "Gear category").and("be.visible");
    cy.get(".form-light-grey-bg label").eq(13).should("have.text", "Gear type").and("be.visible");
  });
});

describe("Direct Landing - EEZ validation when high seas is No", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingEEZValidationErrors,
    };
    cy.visit(directLandingUrl, { qs: { ...testParams } });
  });

  it("should display error when EEZ field is empty", () => {
    cy.wait(300);
    cy.get("#add-zone-button").click({ force: true });
    cy.wait(300);
    cy.get("#eez-0").type("France");
    cy.get(".autocomplete__option").first().click();
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").should("contain", "Select or enter a country for the exclusive economic zone");
  });

  it("should display error when EEZ field has invalid country", () => {
    cy.wait(300);
    cy.get("#eez-0").type("Invalid Country Name XYZ");
    cy.get("[data-testid='save-and-continue']").click({ force: true });
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get(".govuk-error-message").should("contain", "Select a country for the exclusive economic zone from the list");
  });
});
