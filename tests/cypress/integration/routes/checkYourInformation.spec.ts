import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2022-CC-24F279E85";
const landingsUrl = `${documentUrl}/landings-entry`;
const checkYourInformationUrl = `${documentUrl}/check-your-information`;
const progressUrl = `${documentUrl}/progress`;

describe("Check Your Information (Summary) page: UI", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct page title", () => {
    cy.findByRole("heading", {
      name: "Check your information before you create the catch certificate",
      level: 1,
    });
  });

  it("should render CMR field when set for transport", () => {
    cy.contains("dt.govuk-summary-list__key", "Do you have a road transport document to go with this export?")
      .next("dd")
      .should("have.text", "Yes");
  });

  it("should render high seas area field when set for landing", () => {
    cy.get(".govuk-summary-list__key")
      .filter(':contains("High seas area")')
      .eq(0)
      .next(".govuk-summary-list__value")
      .should("have.text", "Yes");
  });

  it("should render high seas area field when not set for landing", () => {
    cy.get(".govuk-summary-list__key")
      .filter(':contains("High seas area")')
      .eq(1)
      .next(".govuk-summary-list__value")
      .should("have.text", "No");
  });

  it("should render rfmo field when set for landing", () => {
    cy.get(".govuk-summary-list__key")
      .filter(':contains("RFMO")')
      .eq(0)
      .next(".govuk-summary-list__value")
      .should("have.text", "North East Atlantic Fisheries Commission (NEAFC)");
  });

  it("should render gearCateory field when set for landing", () => {
    cy.get(".govuk-summary-list__key")
      .filter(':contains("Gear category")')
      .eq(0)
      .next(".govuk-summary-list__value")
      .should("have.text", "Trawls");
  });
  it("should render gearType field when set for landing", () => {
    cy.get(".govuk-summary-list__key")
      .filter(':contains("Gear type")')
      .eq(0)
      .next(".govuk-summary-list__value")
      .should("have.text", "Beam trawls (TBB)");
  });

  it("should render startDate field when set for landing", () => {
    cy.get(".govuk-summary-list__key")
      .filter(':contains("Start date")')
      .eq(0)
      .next(".govuk-summary-list__value")
      .should("have.text", "16 August 2022");
  });

  it("should render EEZ field when set for landing", () => {
    // verify first EEZ renders
    cy.get(".govuk-summary-list__key")
      .filter(':contains("Exclusive economic zone")')
      .eq(0)
      .next(".govuk-summary-list__value")
      .should("have.text", "United Kingdom");
    // verify change link works
    cy.get('[data-testid="change-0-eez-0"]').should("have.attr", "href").and("include", "#eez-0");
    // verify second EEZ zone (with change link)
    cy.get(".govuk-summary-list__key")
      .filter(':contains("Exclusive economic zone")')
      .eq(1)
      .next(".govuk-summary-list__value")
      .should("have.text", "France");
    // verify change link works
    cy.get('[data-testid="change-0-eez-1"]').should("have.attr", "href").and("include", "#eez-1");
  });

  it("should render EEZ field after High Seas area and before RFMO", () => {
    cy.get(".govuk-summary-list__key").then(($keys) => {
      const keyTexts = $keys.toArray().map((el) => el.textContent?.trim());

      // Find indices of the fields
      const highSeasIndex = keyTexts.findIndex((text) => text?.includes("High seas area"));
      const eezIndex = keyTexts.findIndex((text) => text?.includes("Exclusive economic zone"));
      const rfmoIndex = keyTexts.findIndex((text) => text?.includes("RFMO"));

      // Verify High Seas exists and comes before EEZ
      expect(highSeasIndex, "High seas area should exist").to.be.greaterThan(-1);
      expect(eezIndex, "EEZ should exist").to.be.greaterThan(-1);
      expect(eezIndex, "EEZ should come after High seas area").to.be.greaterThan(highSeasIndex);

      // Verify RFMO exists and comes after EEZ
      expect(rfmoIndex, "RFMO should exist").to.be.greaterThan(-1);
      expect(rfmoIndex, "RFMO should come after EEZ").to.be.greaterThan(eezIndex);
    });
  });

  describe("Welsh translations", () => {
    it("should render translated CMR field when set for transport", () => {
      cy.get('a[hreflang="cy"][lang="cy"]').click();
      cy.contains("dt.govuk-summary-list__key", "Oes gennych chi ddogfen trafnidiaeth ffordd i fynd gyda’r allforion?")
        .next("dd")
        .should("have.text", "Ydw");
    });

    it("should render translated high seas field when set for landing", () => {
      cy.get('a[hreflang="cy"][lang="cy"]').click();
      cy.get(".govuk-summary-list__key")
        .filter(':contains("Ardal gefnfor")')
        .eq(0)
        .next(".govuk-summary-list__value")
        .should("have.text", "Ydw");
    });

    it("should render translated high seas field when not set for landing", () => {
      cy.get('a[hreflang="cy"][lang="cy"]').click();
      cy.get(".govuk-summary-list__key")
        .filter(':contains("Ardal gefnfor")')
        .eq(1)
        .next(".govuk-summary-list__value")
        .should("have.text", "Nac ydw");
    });

    it("should render EEZ field when set for landing", () => {
      cy.get('a[hreflang="cy"][lang="cy"]').click();
      cy.contains(".govuk-summary-list__key", "Parth economaidd neilltuedig")
        .next(".govuk-summary-list__value")
        .should("have.text", "United Kingdom");
    });

    it("should render idAttribute in RFMO change link", () => {
      cy.get(".govuk-summary-list__key")
        .filter(':contains("RFMO")')
        .eq(0)
        .parent()
        .find('a:contains("Change")')
        .should("have.attr", "href")
        .and("include", "#rfmo");
    });

    it("should render idAttribute in Vessel change link", () => {
      cy.get(".govuk-summary-list__key")
        .filter(':contains("Vessel name or PLN")')
        .eq(0)
        .parent()
        .find('a:contains("Change")')
        .should("have.attr", "href")
        .and("include", "#vessel-label");
    });

    it("should render idAttribute in High Seas change link", () => {
      cy.get(".govuk-summary-list__key")
        .filter(':contains("High seas area")')
        .eq(0)
        .parent()
        .find('a:contains("Change")')
        .should("have.attr", "href")
        .and("include", "#highSeasArea-hint");
    });
  });
});

describe("Check Your Information (Summary) page: Locked CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationLocked,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct back link", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-catch-certificate/catch-certificates");
  });
});

describe("Check Your Information (Summary) page: DirectLanding CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationDirectLanding,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct back link", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${documentUrl}/progress`);
  });

  it("should render a single transportation", () => {
    cy.contains(".govuk-summary-list__value", "Fishing vessel").should("be.visible");
  });

  it("should not render gear info labels if not set", () => {
    cy.contains(".govuk-summary-list__key", "Gear category").should("not.exist");
    cy.contains(".govuk-summary-list__key", "Gear type").should("not.exist");
  });
});

describe("Check Your Information (Summary) page: DirectLanding CC with Gear Info", () => {
  const testParams: ITestParams = {
    testCaseId: TestCaseId.CCCheckYourInformationDirectLandingGearInfo,
  };

  it("should render gear info if present", () => {
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.contains(".govuk-summary-list__key", "Gear category").should("be.visible");
    cy.contains(".govuk-summary-list__value", "Surrounding nets").should("be.visible");
    cy.contains(".govuk-summary-list__key", "Gear type").should("be.visible");
    cy.contains(".govuk-summary-list__value", "Purse seines (PS)").should("be.visible");
  });

  it("should render gear labels in Welsh if present", () => {
    cy.visit(checkYourInformationUrl, { qs: { ...testParams, lng: "cy" } });
    cy.contains(".govuk-summary-list__key", "Categori’r gêr").should("be.visible");
    cy.contains(".govuk-summary-list__key", "Math o Gêr").should("be.visible");
  });
});

describe("Check Your Information (Summary) page: DirectLanding CC with RFMO", () => {
  const testParams: ITestParams = {
    testCaseId: TestCaseId.CCCheckYourInformationDirectLandingGearInfo,
  };

  it("should render rfmo info if present", () => {
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.contains(".govuk-summary-list__key", "RFMO").should("be.visible");
    cy.contains(".govuk-summary-list__value", "General Fisheries Commission for the Mediterranean (GFCM)").should(
      "be.visible"
    );
  });
});

describe("Check Your Information (Summary) page: ManualLanding CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationManualLanding,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should redirect to add-landings page when change vessel name or pln link is clicked", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${documentUrl}/progress`);
    cy.get("[data-testid='change-0-vessel-label']").should("be.visible");
    cy.get("[data-testid='change-0-vessel-label']").click({ force: true });
    cy.url().should("include", "/add-landings");
  });

  it("should check if total no of vessels is holding vessel count in the hidden field", () => {
    cy.get('input[name="noOfVessels"]').should("have.value", "2");
  });

  it("should not render gear info labels if not set", () => {
    cy.contains(".govuk-summary-list__key", "Gear category").should("not.exist");
    cy.contains(".govuk-summary-list__key", "Gear type").should("not.exist");
  });
});

describe("Check Your Information (Summary) page: ManualLanding CC with Gear Info", () => {
  const testParams: ITestParams = {
    testCaseId: TestCaseId.CCCheckYourInformationManualLandingGearInfo,
  };

  it("should render gear info if present", () => {
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.contains(".govuk-summary-list__key", "Gear category").should("be.visible");
    cy.contains(".govuk-summary-list__value", "Surrounding nets").should("be.visible");
    cy.contains(".govuk-summary-list__key", "Gear type").should("be.visible");
    cy.contains(".govuk-summary-list__value", "Purse seines (PS)").should("be.visible");
  });

  it("should render gear labels in Welsh if present", () => {
    cy.visit(checkYourInformationUrl, { qs: { ...testParams, lng: "cy" } });
    cy.contains(".govuk-summary-list__key", "Categori’r gêr").should("be.visible");
    cy.contains(".govuk-summary-list__key", "Math o Gêr").should("be.visible");
  });
});

describe("Check Your Information (Summary) page: Vessel not Found CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationVesselNotFound,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct notification banner", () => {
    cy.contains(
      ".govuk-notification-banner__heading",
      "Contact support on 0330 159 1989 to replace your Vessel name or PLN entries of 'Vessel not found (N/A)'."
    ).should("be.visible");
  });
});

describe("Check Your Information (Summary) page: Vessel Overriden by admin and direct landing CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationVesselOverridenDirectLanding,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct notification banner", () => {
    cy.contains(
      ".govuk-notification-banner__heading",
      "Landings amended and authorised by service support cannot be changed."
    ).should("be.visible");
  });
});

describe("Check Your Information (Summary) page: Vessel Overriden by admin CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationVesselOverriden,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct notification banner", () => {
    cy.contains(
      ".govuk-notification-banner__heading",
      "Landings amended and authorised by service support cannot be changed but can be removed."
    ).should("be.visible");
  });
});

describe("Check Your Information (Summary) page: Exporter updated CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationExporterUpdated,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct notification banner", () => {
    cy.contains(
      ".govuk-notification-banner__heading",
      "Due to improvements in the way addresses are managed, the exporter’s address in this document has been reloaded from your Defra account. Please check the address is correct and change if necessary"
    ).should("be.visible");
  });
});

describe("Check Your Information (Summary) page: Validation errors for species", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationRuleValidationErrors,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should click on accept and create catch certificate", () => {
    cy.get("[data-testid=create-cc-button]").click({ force: true });
    cy.contains(
      ".govuk-notification-banner__heading",
      "There was an error in processing. Please resubmit. If the problem persists, contact support on 0330 159 1989."
    ).should("be.visible");
    cy.contains("a", "Submitted catch certificates cannot contain landing dates more than 3 days in the future");
  });
});

describe("Check Your Information (Summary) page: Validation errors on load of CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationOnLoadValidationErrors,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct error", () => {
    cy.contains(
      ".govuk-error-summary__list",
      "Contact support on 0330 159 1989 to replace ‘Vessel not found (N/A)’ for Black dogfish (CFB) caught on 04/10/2023."
    ).should("be.visible");
  });

  it("should check if the species fullname is displayed instead of species code", () => {
    cy.contains(".govuk-error-summary__list", "Black dogfish (CFB)").should("be.visible");
  });
});

describe("Check Your Information (Summary) page: Validation errors CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationValidationError,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render the correct notification banner", () => {
    cy.contains(
      ".govuk-notification-banner__heading",
      "There was an error in processing. Please resubmit. If the problem persists, contact support on 0330 159 1989."
    ).should("be.visible");
  });

  it("should click on accept and create catch certificate", () => {
    cy.get("[data-testid=create-cc-button]").click({ force: true });
    cy.contains(
      ".govuk-notification-banner__heading",
      "There was an error in processing. Please resubmit. If the problem persists, contact support on 0330 159 1989."
    ).should("be.visible");
  });
});

describe("Check Your Information (Summary) page: Validation success CC", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationValidationSuccess,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should click on accept and create catch certificate", () => {
    cy.get("[data-testid=create-cc-button]").click({ force: true });
    cy.url().should("include", "catch-certificate-created");
  });
});

describe("Check Your Information (Summary) page: offline validation set to true", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationOfflineValidation,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should click on accept and create catch certificate", () => {
    cy.get("[data-testid=create-cc-button]").click({ force: true });
    cy.url().should("include", "catch-certificate-pending");
  });
});

describe("Check Your Information (Summary) page: invalid catch certificate", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationInvalidCatchCert,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should click on accept and create catch certificate and redirect to add-landings", () => {
    cy.get("[data-testid=create-cc-button]").click({ force: true });
    cy.url().should("include", "add-landings");
  });
});

describe("Check Your Information (Summary) page: invalid catch certificate with direct landing", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationInvalidCatchCertDirectLanding,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should click on accept and create catch certificate and redirect to direct-landing", () => {
    cy.get("[data-testid=create-cc-button]").click({ force: true });
    cy.url().should("include", "direct-landing");
  });
});

describe("Check Your Information (Summary) page: catch certificate is LOCKED", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationLockedCatchCert,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should click on accept and create catch certificate and redirect to catch-certificates", () => {
    cy.get("[data-testid=create-cc-button]").click({ force: true });
    cy.url().should("include", "catch-certificates");
  });
});

describe("Check Your Information (Summary) page: page guard", () => {
  it("should redirect to landings entry page when the user tries to access the CC Check Your Information (Summary) page with null landings entry", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationPageGuardCaseOne,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.url().should("include", landingsUrl);
  });

  it("should redirect to the progress page when the user tries to access the CC Check Your Information (Summary) page with completedSections !== requiredSections", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationPageGuardCaseTwo,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.url().should("include", progressUrl);
  });

  it("should redirect to the progress page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationPageGuardCaseThree,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.url().should("include", "/progress");
  });
});

describe("Check Your Information (Summary) page: change links", () => {
  it("should link to the exporter details page to change the exporter name", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(2) > .govuk-summary-list__row:nth-of-type(1) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "add-exporter-details")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });
    cy.url().should("include", "/add-exporter-details");
    cy.focused();
    cy.should("have.attr", "name", "exporterFullName");
  });

  it("should link to the exporter details page to change the exporter company name", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(2) > .govuk-summary-list__row:nth-of-type(2) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "add-exporter-details")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });
    cy.url().should("include", "/add-exporter-details");
    cy.focused();
    cy.should("have.attr", "name", "exporterCompanyName");
  });

  it("should link to the exporter details page to change the exporter address", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(2) > .govuk-summary-list__row:nth-of-type(3) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "add-exporter-details")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });
    cy.url().should("include", "/add-exporter-details");
  });

  it("should link to the landings entry page to change the landing entry", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(3) > .govuk-summary-list__row:nth-of-type(1) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "landings-entry")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });
    cy.url().should("include", "/landings-entry");
  });

  it("should link to the what export journey page to change to the departure country", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(4) > .govuk-summary-list__row:nth-of-type(1) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "what-export-journey")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });
    cy.url().should("include", "/what-export-journey");
  });

  it("should link to the what export journey page to change the destination country", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(4) > .govuk-summary-list__row:nth-of-type(2) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "what-export-journey")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });
    cy.url().should("include", "/what-export-journey");
  });

  it("should link to the conservation page to change the conservation", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(5) > .govuk-summary-list__row:nth-of-type(1) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "whose-waters-were-they-caught-in")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });
    cy.url().should("include", "/whose-waters-were-they-caught-in");
  });

  it("should link to the product page to change the selected product", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(3) > .govuk-summary-list__row:nth-of-type(2) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "what-are-you-exporting?productId=GBR-2022-CC-99BBF3669-a9ec91a4-58b4-42a2-a5d3-2812e5d33044")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });

    cy.url().should(
      "include",
      "/what-are-you-exporting?productId=GBR-2022-CC-99BBF3669-a9ec91a4-58b4-42a2-a5d3-2812e5d33044"
    );
    cy.get("#add-product").contains("Update product");
  });

  it("should link to the respective transportation page to change the transportation document name", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(4) > .govuk-summary-list__row:nth-of-type(9) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "add-additional-transport-documents-truck/1")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });

    cy.url().should("include", "/add-additional-transport-documents-truck/1");
  });

  it("should link to the respective transportation page to change the transportation document reference", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformation,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("dl:nth-of-type(4) > .govuk-summary-list__row:nth-of-type(10) > .govuk-summary-list__actions > .govuk-link")
      .should("have.attr", "href")
      .and("include", "add-additional-transport-documents-truck/1")
      .then((elem: JQuery<HTMLElement>) => {
        // @ts-ignore
        cy.visit(elem);
      });

    cy.url().should("include", "/add-additional-transport-documents-truck/1");
  });
});

describe("Check Your Information (Summary) page: Manual Landing render container identification number and change link when present", () => {
  it("should render container identification number for truck when present on manual landing journey", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationManualLandingTruckContainerNumber,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.contains("dt", "Container identification number").should("be.visible");
    cy.contains("dt", "Container identification number").next("dd").should("contain", "CONTAINER123");
  });

  it("should link to the truck transportation page to change the container identification number", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationManualLandingTruckContainerNumber,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get('[data-testid="change-container-truck"]')
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/add-transportation-details-truck")
      .and("include", "#containerIdentificationNumber");
  });

  it("should render container identification number for train when present on manual landing journey", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationManualLandingTrainContainerNumber,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.contains("dt", "Container identification number").should("be.visible");
    cy.contains("dt", "Container identification number").next("dd").should("contain", "CONTAINER123");
  });

  it("should link to the train transportation page to change the container identification number", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationManualLandingTrainContainerNumber,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get('[data-testid="change-container-train"]')
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/add-transportation-details-train")
      .and("include", "#containerIdentificationNumber");
  });

  it("should not render container identification number for train when not present on manual landing journey", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationManualLandingTrainContainerNumberNull,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.contains("dt", "Container identification number").should("not.exist");
  });
});

describe("Check Your Information (Summary) page: Manual Landing when JavaScript is disabled", () => {
  it("should render container identification number for truck transport without JavaScript", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationManualLanding,
      disableScripts: true,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

    cy.contains("dt", "Container identification number").should("be.visible");
    cy.contains("dt", "Container identification number").next("dd").should("contain", "CONTAINER123");
    cy.get('[data-testid="change-container-truck"]')
      .should("have.attr", "href")
      .and("include", "/add-transportation-details-truck")
      .and("include", "#containerIdentificationNumber");
  });

  it("should render container identification number for train transport without JavaScript", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationManualLandingTrainContainerNumber,
      disableScripts: true,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

    cy.contains("dt", "Container identification number").should("be.visible");
    cy.contains("dt", "Container identification number").next("dd").should("contain", "CONTAINER123");
    cy.get('[data-testid="change-container-train"]')
      .should("have.attr", "href")
      .and("include", "/add-transportation-details-train")
      .and("include", "#containerIdentificationNumber");
  });

  it("should allow form submission without JavaScript", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationManualLanding,
      disableScripts: true,
    };

    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
    cy.get("[data-testid=create-cc-button]").click();
    cy.url().should("include", "catch-certificate-created");
  });
});

describe("Check Your Information: Point of Destination", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationWithPointOfDestination,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render Point of destination field underneath Destination country", () => {
    // Verify Destination country is present
    cy.contains("dt.govuk-summary-list__key", "Destination country")
      .should("be.visible")
      .next("dd")
      .should("have.text", "France");

    // Verify Point of destination appears after Destination country
    cy.contains("dt.govuk-summary-list__key", "Destination country")
      .parent()
      .next("div.govuk-summary-list__row")
      .find("dt.govuk-summary-list__key")
      .should("have.text", "Point of destination");
  });

  it("should display the Point of destination value", () => {
    cy.contains("dt.govuk-summary-list__key", "Point of destination")
      .next("dd.govuk-summary-list__value")
      .should("have.text", "Calais Port");
  });

  it("should have a Change link for Point of destination", () => {
    cy.contains("dt.govuk-summary-list__key", "Point of destination")
      .parent()
      .find("dd.govuk-summary-list__actions")
      .find("a")
      .should("contain", "Change")
      .and("have.attr", "href");
  });

  it("should navigate to what-export-journey page when Change link is clicked", () => {
    cy.contains("dt.govuk-summary-list__key", "Point of destination")
      .parent()
      .find("dd.govuk-summary-list__actions a")
      .should("have.attr", "href")
      .and("include", "/what-export-journey");
  });

  it("should include nextUri parameter in Change link to return to check-your-information", () => {
    cy.contains("dt.govuk-summary-list__key", "Point of destination")
      .parent()
      .find("dd.govuk-summary-list__actions a")
      .should("have.attr", "href")
      .and("include", "nextUri=")
      .and("include", "check-your-information");
  });

  it("should include anchor for Point of destination field in Change link", () => {
    cy.contains("dt.govuk-summary-list__key", "Point of destination")
      .parent()
      .find("dd.govuk-summary-list__actions a")
      .should("have.attr", "href")
      .and("include", "#pointOfDestination");
  });
});
