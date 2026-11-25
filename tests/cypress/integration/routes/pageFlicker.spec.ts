import { type ITestParams, TestCaseId } from "~/types";

// The pre-hydration state is held by blocking the client JS bundles. The inline script in root.tsx still runs,
// so <html data-js="enabled"> is set exactly as it is for a real JS user before React hydrates.
let blockClientScripts = false;

const visitBeforeHydration = (url: string, testParams: ITestParams) => {
  blockClientScripts = true;
  cy.visit(url, { qs: { ...testParams } });
  cy.get("html[data-js='enabled']").should("exist");
  cy.get("html").should("not.have.attr", "data-hydrated");
};

const reloadAndHydrate = () => {
  blockClientScripts = false;
  cy.reload();
  cy.waitForHydration();
};

const catchCertificateUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
const whatAreYouExportingUrl = `${catchCertificateUrl}/what-are-you-exporting`;
const processingStatementDestinationUrl = "/create-processing-statement/GBR-2023-PS-DE53D6E7C/what-export-destination";
const processingPlantUrl = "/create-processing-statement/GBR-2022-PS-0D12ABA0A/add-processing-plant";
const addProductUrl = "/create-non-manipulation-document/GBR-2023-SD-83552D3E5/add-product-to-this-consignment/0";

describe("Page flicker: pre-hydration rendering matches the hydrated page", () => {
  beforeEach(() => {
    blockClientScripts = false;
    cy.intercept("GET", /\/assets\/.*\.js(\?.*)?$/, (req) => {
      if (blockClientScripts) {
        req.reply({ statusCode: 404, body: "" });
      } else {
        req.continue();
      }
    });
  });

  describe("autocomplete fallback", () => {
    it("shows the fallback select without a dropdown arrow, at the same size as the hydrated input", () => {
      visitBeforeHydration(processingStatementDestinationUrl, { testCaseId: TestCaseId.PSWhatExportDestination });

      let preSize: { width: number; height: number; top: number };
      cy.get("select#exportDestination")
        .should("be.visible")
        .and("have.css", "appearance", "none")
        .and("have.css", "background-image", "none")
        .then(($select) => {
          const rect = $select[0].getBoundingClientRect();
          preSize = { width: rect.width, height: rect.height, top: rect.top };
        });

      reloadAndHydrate();

      cy.get("input#exportDestination")
        .should("be.visible")
        .then(($input) => {
          const rect = $input[0].getBoundingClientRect();
          expect(rect.width, "width").to.equal(preSize.width);
          expect(rect.height, "height").to.equal(preSize.height);
          expect(rect.top, "top").to.equal(preSize.top);
        });
    });

    it("keeps the catch certificate export journey destination field the same size", () => {
      visitBeforeHydration("/create-catch-certificate/GBR-2022-CC-A2BC627FE/what-export-journey", {
        testCaseId: TestCaseId.WhatExportJourneyDirectLanding,
      });

      let preWidth: number;
      cy.get("select#exportDestination")
        .should("be.visible")
        .then(($select) => {
          preWidth = $select[0].getBoundingClientRect().width;
        });

      reloadAndHydrate();

      cy.get("input#exportDestination")
        .should("be.visible")
        .then(($input) => {
          expect($input[0].getBoundingClientRect().width).to.equal(preWidth);
        });
    });

    it("shows the processing plant field straight away instead of revealing it on hydration", () => {
      visitBeforeHydration(processingPlantUrl, { testCaseId: TestCaseId.PSAddProcessingPlantContinue });

      cy.get("select#processingPlant").should("be.visible");
      cy.get("label[for='processingPlant']").should("be.visible");
      cy.get("[data-testid='save-and-continue']").should("be.visible");

      let preButtonTop: number;
      cy.get("[data-testid='save-and-continue']").then(($button) => {
        preButtonTop = $button[0].getBoundingClientRect().top;
      });

      reloadAndHydrate();

      cy.get("input#processingPlant").should("be.visible");
      cy.get("[data-testid='save-and-continue']").then(($button) => {
        expect($button[0].getBoundingClientRect().top).to.equal(preButtonTop);
      });
    });
  });

  describe("What are you exporting", () => {
    it("hides the no-JS-only buttons and the favourites panel before hydration", () => {
      visitBeforeHydration(whatAreYouExportingUrl, { testCaseId: TestCaseId.WhatAreYouExporting });

      cy.get("[data-testid='add-species']").should("not.be.visible");
      cy.get("[data-testid='add-state']").should("not.be.visible");
      cy.get("[data-testid='add-presentation']").should("not.be.visible");
      cy.get("#productsTab").should("be.visible");
      cy.get("#favouritesTab").should("not.be.visible");
    });

    it("renders the same page height before and after hydration", () => {
      visitBeforeHydration(whatAreYouExportingUrl, { testCaseId: TestCaseId.WhatAreYouExporting });

      let preHeight: number;
      cy.document().then((doc) => {
        preHeight = doc.documentElement.scrollHeight;
      });

      reloadAndHydrate();

      cy.document().then((doc) => {
        expect(doc.documentElement.scrollHeight).to.equal(preHeight);
      });
    });

    it("does not jump the scroll position when switching tabs", () => {
      cy.visit(whatAreYouExportingUrl, { qs: { testCaseId: TestCaseId.WhatAreYouExporting } });
      cy.waitForHydration();

      cy.scrollTo(0, 300);
      cy.window().its("scrollY").should("equal", 300);

      // Cypress scrolls the target into view before clicking, which would hide the browser's own jump
      cy.get("[data-tab-id='favouritesTab']").click({ scrollBehavior: false });
      cy.get("#favouritesTab").should("be.visible");
      cy.window().its("scrollY").should("equal", 300);
      cy.location("hash").should("equal", "#favouritesTab");

      cy.get("[data-tab-id='productsTab']").click({ scrollBehavior: false });
      cy.get("#productsTab").should("be.visible");
      cy.window().its("scrollY").should("equal", 300);
      cy.location("hash").should("equal", "#productsTab");
    });
  });

  describe("Add product to this consignment", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments,
    };

    it("shows a single supporting document row and the Add another button before hydration", () => {
      visitBeforeHydration(addProductUrl, testParams);

      cy.get(".supporting-document-row:visible").should("have.length", 1);
      cy.get("[data-testid='add-supporting-doc-button']").should("not.exist");
      cy.contains("button.app-show-when-js", "Add another").should("be.visible");

      reloadAndHydrate();

      cy.get(".supporting-document-row").should("have.length", 1);
      cy.get("[data-testid='add-supporting-doc-button']").should("be.visible");
      cy.get("button.app-show-when-js").should("not.exist");
    });

    it("renders the same page height before and after hydration", () => {
      visitBeforeHydration(addProductUrl, testParams);

      let preHeight: number;
      cy.document().then((doc) => {
        preHeight = doc.documentElement.scrollHeight;
      });

      reloadAndHydrate();

      cy.document().then((doc) => {
        expect(doc.documentElement.scrollHeight).to.equal(preHeight);
      });
    });
  });
});

describe("Page flicker: no-JS journeys keep their fallback controls", () => {
  it("still shows the add species, state and presentation buttons", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.WhatAreYouExporting, disableScripts: true };
    cy.visit(whatAreYouExportingUrl, { qs: { ...testParams } });

    cy.get("html").should("not.have.attr", "data-js");
    cy.get("[data-testid='add-species']").should("be.visible");
    cy.get("[data-testid='add-state']").should("be.visible");
    cy.get("[data-testid='add-presentation']").should("be.visible");
    cy.get("#favouritesTab").should("be.visible");
  });

  it("still shows the upload button", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.CCUploadLandingsEmptyRows, disableScripts: true };
    cy.visit(`${catchCertificateUrl}/upload-file`, { qs: { ...testParams } });

    cy.get("[data-testid='upload']").should("be.visible");
  });

  it("still shows the destination country as a select with its dropdown arrow", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.PSWhatExportDestination, disableScripts: true };
    cy.visit(processingStatementDestinationUrl, { qs: { ...testParams } });

    cy.get("select#exportDestination").should("be.visible").and("not.have.css", "appearance", "none");
  });
});
