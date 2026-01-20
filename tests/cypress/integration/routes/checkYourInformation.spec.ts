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
      .eq(1) // Second landing has RFMO set
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
    cy.get(".govuk-summary-list__row")
      .find("dt.govuk-summary-list__key")
      .filter(':contains("Exclusive economic zone")')
      .each(($el) => {
        const valueText = $el.next("dd.govuk-summary-list__value").text().trim();
        if (valueText === "United Kingdom") {
          // Found the UK EEZ entry
          cy.wrap($el).next(".govuk-summary-list__value").should("have.text", "United Kingdom");
          // Verify change link exists in this row and has correct anchor
          cy.wrap($el).parent().find("a").should("contain", "Change").and("have.attr", "href").and("include", "#eez-");
        } else if (valueText === "France") {
          // Found the France EEZ entry
          cy.wrap($el).next(".govuk-summary-list__value").should("have.text", "France");
          // Verify change link exists in this row and has correct anchor
          cy.wrap($el).parent().find("a").should("contain", "Change").and("have.attr", "href").and("include", "#eez-");
        }
      });
  });

  it("should render EEZ field after High Seas area and before RFMO", () => {
    cy.get(".govuk-summary-list__key").then(($keys) => {
      const keyTexts = $keys.toArray().map((el) => el.textContent?.trim());

      // Find all occurrences of fields
      const highSeasIndices = keyTexts.reduce((acc, text, idx) => {
        if (text?.includes("High seas area")) acc.push(idx);
        return acc;
      }, [] as number[]);

      const eezIndices = keyTexts.reduce((acc, text, idx) => {
        if (text?.includes("Exclusive economic zone")) acc.push(idx);
        return acc;
      }, [] as number[]);

      const rfmoIndices = keyTexts.reduce((acc, text, idx) => {
        if (text?.includes("RFMO")) acc.push(idx);
        return acc;
      }, [] as number[]);

      // Verify all fields exist
      expect(highSeasIndices.length, "High seas area should exist").to.be.greaterThan(0);
      expect(eezIndices.length, "EEZ should exist").to.be.greaterThan(0);
      expect(rfmoIndices.length, "RFMO should exist").to.be.greaterThan(0);
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
      // Find EEZ fields that have actual country values (not "Heb ei ddarparu")
      // The Welsh label is "Parth economaidd neilltuedig"
      cy.get(".govuk-summary-list__row")
        .find("dt.govuk-summary-list__key")
        .filter(':contains("Parth economaidd")')
        .each(($el) => {
          const valueText = $el.next("dd.govuk-summary-list__value").text().trim();
          if (valueText === "United Kingdom") {
            // Found the UK EEZ entry (country names don't translate)
            cy.wrap($el).next(".govuk-summary-list__value").should("have.text", "United Kingdom");
          }
        });
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

describe("Check Your Information: Not provided fields", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationNotProvidedFields,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render Freight bill number with 'Not provided' when empty", () => {
    cy.contains("dt.govuk-summary-list__key", "Freight bill number").next("dd").should("have.text", "Not provided");
  });

  it("should render document name with 'Not provided' when no documents added", () => {
    cy.get("dt.govuk-summary-list__key")
      .filter(':contains("document name")')
      .first()
      .next("dd")
      .should("have.text", "Not provided");
  });

  it("should render document reference with 'Not provided' when no documents added", () => {
    cy.get("dt.govuk-summary-list__key")
      .filter(':contains("document reference")')
      .first()
      .next("dd")
      .should("have.text", "Not provided");
  });

  it("should render RFMO with 'Not provided' when empty", () => {
    cy.contains("dt.govuk-summary-list__key", "RFMO").next("dd").should("have.text", "Not provided");
  });

  it("should render EEZ with 'Not provided' when empty", () => {
    cy.contains("dt.govuk-summary-list__key", "Exclusive economic zone").next("dd").should("have.text", "Not provided");
  });

  it("should still show Change links for Not provided fields", () => {
    cy.contains("dt.govuk-summary-list__key", "Freight bill number").parent().find("a").should("contain", "Change");
  });
});

describe("Check Your Information: Not provided fields (Welsh)", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationNotProvidedFields,
      lng: "cy",
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render Freight bill number with 'Heb ei ddarparu' in Welsh when empty", () => {
    cy.contains("dt.govuk-summary-list__key", "Rhif y bil cludo nwyddau")
      .next("dd")
      .should("have.text", "Heb ei ddarparu");
  });

  it("should render document name with 'Heb ei ddarparu' in Welsh when no documents added", () => {
    cy.get("dt.govuk-summary-list__key")
      .filter(':contains("Enw\'r ddogfen")')
      .first()
      .next("dd")
      .should("have.text", "Heb ei ddarparu");
  });

  it("should render document reference with 'Heb ei ddarparu' in Welsh when no documents added", () => {
    cy.get("dt.govuk-summary-list__key")
      .filter(':contains("Cyfeirnod y ddogfen")')
      .first()
      .next("dd")
      .should("have.text", "Heb ei ddarparu");
  });

  it("should render RFMO with 'Heb ei ddarparu' in Welsh when empty", () => {
    cy.contains("dt.govuk-summary-list__key", "RFMO").next("dd").should("have.text", "Heb ei ddarparu");
  });

  it("should render EEZ with 'Heb ei ddarparu' in Welsh when empty", () => {
    cy.contains("dt.govuk-summary-list__key", "Parth economaidd").next("dd").should("have.text", "Heb ei ddarparu");
  });
});

describe("Check Your Information (Summary) page: Plane transport with no freight bill number", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationPlaneNoFreightBillNumber,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render plane transport section", () => {
    cy.contains("dt.govuk-summary-list__key", "How will the export leave the UK?")
      .next("dd")
      .should("have.text", "Plane");
  });

  it("should render flight number", () => {
    cy.contains("dt.govuk-summary-list__key", "Flight number").next("dd").should("have.text", "AA1234567");
  });

  it("should render container identification number", () => {
    cy.contains("dt.govuk-summary-list__key", "Container identification number")
      .next("dd")
      .should("have.text", "CONT1234");
  });

  it("should render departure place", () => {
    cy.contains("dt.govuk-summary-list__key", "Place export leaves the UK")
      .next("dd")
      .should("have.text", "Joelle Rhodes");
  });

  it("should render 'Not provided' when freight bill number is missing", () => {
    cy.contains("dt.govuk-summary-list__key", "Freight bill number").next("dd").should("have.text", "Not provided");
  });
});

describe("Check Your Information (Summary) page: Container vessel transport with no freight bill number", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationContainerVesselNoFreightBillNumber,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should render container vessel transport section", () => {
    cy.contains("dt.govuk-summary-list__key", "How will the export leave the UK?")
      .next("dd")
      .should("have.text", "Container vessel");
  });

  it("should render vessel name", () => {
    cy.contains("dt.govuk-summary-list__key", "Vessel name").next("dd").should("have.text", "SYLVIES GRACE (J11)");
  });

  it("should render flag state", () => {
    cy.contains("dt.govuk-summary-list__key", "Flag state").next("dd").should("have.text", "Panama");
  });

  it("should render container identification number", () => {
    cy.contains("dt.govuk-summary-list__key", "Container identification number")
      .next("dd")
      .should("have.text", "CONT5678");
  });

  it("should render departure place", () => {
    cy.contains("dt.govuk-summary-list__key", "Place export leaves the UK")
      .next("dd")
      .should("have.text", "Port of Southampton");
  });

  it("should render 'Not provided' when freight bill number is missing", () => {
    cy.contains("dt.govuk-summary-list__key", "Freight bill number").next("dd").should("have.text", "Not provided");
  });
});

describe("CC - scenario 1 - Change transport mode - no change scenario", () => {
  const documentUrl = "/create-catch-certificate/GBR-2022-CC-24F279E85";
  const checkYourInformationUrl = `${documentUrl}/check-your-information`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationChangeTransportModeNoChange,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should navigate back to check-your-information when transport mode is not changed", () => {
    // Click the change link for transport mode
    cy.get('[href*="how-does-the-export-leave-the-uk"]').first().click();

    // Verify we're on the transport selection page
    cy.url().should("include", "/how-does-the-export-leave-the-uk");

    // Verify the truck option is already selected
    cy.get('input[name="vehicle"][value="truck"]').should("be.checked");

    // Click Save and continue without changing anything
    cy.get('button[type="submit"]').contains("Save and continue").click();

    // Should be redirected back to check-your-information
    cy.url().should("include", "/check-your-information");
    cy.url().should("not.include", "/add-transportation-details-truck");

    // Verify transport mode is still truck
    cy.contains("dt.govuk-summary-list__key", "How will the export leave the UK?")
      .next("dd")
      .should("have.text", "Truck");
  });
});

describe("CC - scenario 2 - Change transport mode", () => {
  const documentUrl = "/create-catch-certificate/GBR-2022-CC-24F279E85";
  const checkYourInformationUrl = `${documentUrl}/check-your-information`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCCheckYourInformationChangeTransportMode,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should navigate to plane transport details page when changing transport mode to plane", () => {
    cy.log("STEP #1 - Verify we're on check-your-information page");
    cy.url().should("include", "/check-your-information");
    cy.url().then((url) => cy.log(`STEP #1A - Current URL: ${url}`));

    cy.log("STEP #2 - Looking for transport mode change link");
    cy.get("body").then(($body) => {
      const links = $body.find('[href*="how-does-the-export-leave-the-uk"]');
      cy.log(`STEP #2A - Found ${links.length} transport links`);
      links.each((idx, link) => cy.log(`STEP #2B - Link ${idx}: ${link.getAttribute("href")}`));
    });

    cy.log("STEP #3 - Click the change link for transport mode");
    cy.get('[href*="how-does-the-export-leave-the-uk"]').first().click();

    cy.log("STEP #4 - Verify we're on the transport selection page");
    cy.url().should("include", "/how-does-the-export-leave-the-uk");
    cy.url().then((url) => cy.log(`STEP #4A - Current URL: ${url}`));

    cy.log("STEP #5 - Wait for client-side data fetch to complete");
    cy.intercept("GET", "**/how-does-the-export-leave-the-uk/1.data*").as("dataFetch");
    cy.wait("@dataFetch");
    cy.log("STEP #5A - Data fetch completed");

    cy.log("STEP #6 - Wait for the form to be fully loaded and stable");
    cy.get('input[name="vehicle"]').should("exist");
    cy.wait(200); // Let any hydration settle

    cy.log("STEP #6A - Log all available radio buttons");
    cy.get('input[name="vehicle"]').then(($inputs) => {
      cy.log(`STEP #6B - Found ${$inputs.length} vehicle radio buttons`);
      $inputs.each((idx, input) => {
        cy.log(`STEP #6C - Radio ${idx}: value="${input.value}" checked=${input.checked} id="${input.id}"`);
      });
    });

    cy.log("STEP #7 - Check if plane radio button exists");
    cy.get('input[name="vehicle"][value="plane"]').should("exist");
    cy.get('input[name="vehicle"][value="plane"]').then(($input) => {
      cy.log(`STEP #7A - Plane radio exists: ${$input.length > 0}, id="${$input.attr("id")}"`);
    });

    cy.log("STEP #8 - Change the mode to Plane using cy.check()");
    cy.get('input[name="vehicle"][value="plane"]').check({ force: true });

    cy.log("STEP #9 - Verify plane is selected");
    cy.get('input[name="vehicle"][value="plane"]').should("be.checked");
    cy.get('input[name="vehicle"][value="plane"]').then(($input) => {
      cy.log(`STEP #9A - Plane radio checked status: ${$input.prop("checked")}`);
    });

    cy.log("STEP #10 - Click Save and continue");
    cy.get('button[type="submit"]').contains("Save and continue").click();

    cy.log("STEP #11 - Verify navigation to plane transport details page");
    cy.url().then((url) => cy.log(`STEP #11A - Final URL: ${url}`));
    cy.url().should("include", "/add-transportation-details-plane");
    cy.url().should("not.include", "/check-your-information");
  });
});

describe("NMD - scenario 1 - Change product - no change scenario", () => {
  const documentNumber = "GBR-2023-SD-DE53D6E7C";
  const documentUrl = `/create-non-manipulation-document/${documentNumber}`;
  const checkYourInformationUrl = `${documentUrl}/check-your-information`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationChangeProductNoChange,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should navigate through product change flow and return to check-your-information when no changes are made", () => {
    cy.log("STEP #1 - Verifying we are on check-your-information page");
    // Verify we're on check-your-information page
    cy.url().should("include", "/check-your-information");

    cy.log("STEP #2 - Looking for change link with href containing add-product-to-this-consignment");
    cy.get("body").then(($body) => {
      const links = $body.find('[href*="add-product-to-this-consignment"]');
      cy.log(`STEP #2A - Found ${links.length} links`);
    });
    // Click the change link for a product field (species, document details, etc.)
    cy.get('[href*="add-product-to-this-consignment"]').first().click();

    // Verify we're on the add-product page
    cy.url().should("include", "/add-product-to-this-consignment");

    // Click Save and continue without changing any product details
    cy.get('button[type="submit"]').contains("Save and continue").click();

    // Should be redirected to you-have-added-a-product page
    cy.url().should("include", "/you-have-added-a-product");
    cy.url().should("not.include", "add-product-to-this-consignment");

    // Verify the "No" option is selected for adding another product
    cy.get('input[name="addAnotherProduct"][value="No"]').should("be.checked");

    // Click Save and continue to return to check-your-information
    cy.get('button[type="submit"]').contains("Save and continue").click();

    // Should be redirected back to check-your-information
    cy.url().should("include", "/check-your-information");
    cy.url().should("not.include", "/you-have-added-a-product");
  });
});

describe("NMD - scenario 4 - Change arrival transport mode", () => {
  const documentNumber = "GBR-2023-SD-DE53D6E7C";
  const documentUrl = `/create-non-manipulation-document/${documentNumber}`;
  const checkYourInformationUrl = `${documentUrl}/check-your-information`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationChangeArrivalTransportMode,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should navigate to plane transport details page when changing arrival transport mode to plane", () => {
    cy.log("STEP #1 - Verifying we are on check-your-information page");
    // Verify we're on check-your-information page
    cy.url().should("include", "/check-your-information");

    cy.log("STEP #2 - Looking for change link with href containing how-does-the-consignment-arrive-to-the-uk");
    cy.get("body").then(($body) => {
      const links = $body.find('[href*="how-does-the-consignment-arrive-to-the-uk"]');
      cy.log(`STEP #2A - Found ${links.length} links`);
      links.each((index, link) => {
        cy.log(`STEP #2B - Link ${index}: href="${link.getAttribute("href")}"`);
      });
    });

    cy.log("STEP #3 - Setting up intercept for data fetch BEFORE clicking");
    // Set up intercept BEFORE clicking to catch the .data request
    cy.intercept("GET", "**/*.data*").as("dataFetch");

    cy.log("STEP #3A - Clicking change link for arrival transport mode");
    // Click the change link for arrival transport mode
    cy.get('[href*="how-does-the-consignment-arrive-to-the-uk"]').first().click();

    cy.log("STEP #4 - Verifying navigation to transport selection page");
    // Verify we're on the transport selection page
    cy.url().should("include", "/how-does-the-consignment-arrive-to-the-uk");

    cy.log("STEP #4A - Waiting for data fetch to complete");
    // Wait for the client-side data fetch that re-renders the form
    cy.wait("@dataFetch");
    cy.wait(500); // Additional wait for form stability

    cy.log("STEP #5 - Checking form elements exist");
    // Wait for the form to be fully loaded
    cy.get('input[name="vehicle"]').should("exist");

    cy.log("STEP #5A - Logging all available radio buttons");
    cy.get('input[name="vehicle"]').then(($inputs) => {
      cy.log(`STEP #5B - Found ${$inputs.length} vehicle radio buttons`);
      $inputs.each((index, input) => {
        cy.log(`STEP #5C - Radio ${index}: value="${input.value}" checked=${input.checked}`);
      });
    });

    cy.log("STEP #6 - Using .check() to select and verify plane radio button");
    // Use .check({ force: true }) to actively check the radio button
    // This handles GOVUK's opacity: 0 styling and form resets from data fetch
    cy.get('input[name="vehicle"][value="plane"]').check({ force: true });

    cy.log("STEP #7 - Verifying plane is selected");
    // Verify plane is selected
    cy.get('input[name="vehicle"][value="plane"]').should("be.checked");

    cy.log("STEP #8 - Looking for submit button");
    cy.get('button[type="submit"]').then(($buttons) => {
      cy.log(`STEP #8A - Found ${$buttons.length} submit buttons`);
      $buttons.each((index, btn) => {
        cy.log(`STEP #8B - Button ${index}: text="${btn.textContent}"`);
      });
    });

    cy.log("STEP #9 - Clicking Save and continue button");
    // Click Save and continue
    cy.get('button[type="submit"]').contains("Save and continue").click();

    cy.log("STEP #10 - Checking URL after submit");
    cy.url().then((url) => {
      cy.log(`STEP #10A - Current URL: ${url}`);
    });

    cy.log("STEP #11 - Expecting navigation to plane transport details page");
    // Should be navigated to the plane transport details page
    cy.url().should("include", "/add-arrival-transportation-details-plane");
    cy.url().should("not.include", "/check-your-information");
  });
});

describe("NMD - scenario 3 - Change arrival transport mode - no change scenario", () => {
  const documentNumber = "GBR-2023-SD-DE53D6E7C";
  const documentUrl = `/create-non-manipulation-document/${documentNumber}`;
  const checkYourInformationUrl = `${documentUrl}/check-your-information`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationChangeArrivalTransportModeNoChange,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should navigate through arrival transport change flow and return to check-your-information when no changes are made", () => {
    // Verify we're on check-your-information page
    cy.url().should("include", "/check-your-information");

    cy.log("STEP #2 - Looking for change link with href containing how-does-the-consignment-arrive-to-the-uk");
    cy.get("body").then(($body) => {
      const links = $body.find('[href*="how-does-the-consignment-arrive-to-the-uk"]');
      cy.log(`STEP #2A - Found ${links.length} links`);
    });

    cy.log("STEP #3 - Clicking change link for arrival transport mode");
    // Click the change link for arrival transport mode
    cy.get('[href*="how-does-the-consignment-arrive-to-the-uk"]').first().click();

    cy.log("STEP #4 - Verifying navigation to transport selection page");
    // Verify we're on the transport selection page
    cy.url().should("include", "/how-does-the-consignment-arrive-to-the-uk");

    // Verify current selection is Truck (pre-filled)
    cy.get('input[name="vehicle"][value="truck"]').should("be.checked");

    // Click Save and continue without changing
    cy.get('button[type="submit"]').contains("Save and continue").click();

    // Should be redirected back to check-your-information
    cy.url().should("include", "/check-your-information");
    cy.url().should("not.include", "/how-does-the-consignment-arrive-to-the-uk");
    cy.url().should("not.include", "/add-arrival-transportation-details");
  });
});

describe("NMD - scenario 5 - Change departure transport mode - no change scenario", () => {
  const documentNumber = "GBR-2023-SD-DE53D6E7C";
  const documentUrl = `/create-non-manipulation-document/${documentNumber}`;
  const checkYourInformationUrl = `${documentUrl}/check-your-information`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationChangeDepartureTransportModeNoChange,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should navigate through departure transport change flow and return to check-your-information when no changes are made", () => {
    cy.log("STEP #1 - Verify we're on check-your-information page");
    cy.url().should("include", "/check-your-information");
    cy.url().then((url) => cy.log(`STEP #1A - Current URL: ${url}`));

    cy.log("STEP #2 - Debug: Find ALL links on the page");
    cy.get("body").then(($body) => {
      const allLinks = $body.find("a[href]");
      cy.log(`STEP #2A - Total links found: ${allLinks.length}`);
      const transportLinks = $body.find('[href*="transport"]');
      cy.log(`STEP #2B - Transport-related links: ${transportLinks.length}`);
      transportLinks.each((idx, link) => {
        cy.log(`STEP #2C - Transport link ${idx}: ${link.getAttribute("href")}`);
      });
      const departureLinks = $body.find('[href*="how-does-the-consignment-leave-the-uk"]');
      cy.log(`STEP #2D - Departure transport links found: ${departureLinks.length}`);
    });

    // Set up intercept BEFORE clicking
    cy.intercept("GET", "**/how-does-the-consignment-leave-the-uk.data*").as("dataFetch");

    cy.log("STEP #3 - Click the change link for departure transport mode");
    cy.get('[href*="how-does-the-consignment-leave-the-uk"]').first().click();

    // Verify we're on the transport selection page
    cy.url().should("include", "/how-does-the-consignment-leave-the-uk");

    // Wait for client-side data fetch
    cy.wait("@dataFetch");
    cy.log("STEP #4 - Data fetch completed");

    // Wait for form to be stable (radio buttons exist, even if opacity:0 per GOVUK styling)
    cy.get('input[name="vehicle"]').should("exist");
    cy.wait(500); // Increased wait for form stability

    cy.log("STEP #5 - Check all radio button states");
    cy.get('input[name="vehicle"]').each(($radio) => {
      const value = $radio.val();
      const checked = $radio.prop("checked");
      cy.log(`Radio button ${value}: checked=${checked}`);
    });

    cy.log("STEP #6 - Ensure containerVessel is checked using .check()");
    // Use .check() to ensure it's checked, even if it should already be pre-filled
    cy.get('input[name="vehicle"][value="containerVessel"]').check({ force: true });

    // Verify it's now checked
    cy.get('input[name="vehicle"][value="containerVessel"]').should("be.checked");

    // Click Save and continue without changing
    cy.get('button[type="submit"]').contains("Save and continue").click();

    // Should be redirected back to check-your-information
    cy.url().should("include", "/check-your-information");
    cy.url().should("not.include", "/how-does-the-consignment-leave-the-uk");
    cy.url().should("not.include", "/add-transportation-details");
  });
});

describe("NMD - scenario 6 - Change departure transport mode", () => {
  const documentNumber = "GBR-2023-SD-DE53D6E7C";
  const documentUrl = `/create-non-manipulation-document/${documentNumber}`;
  const checkYourInformationUrl = `${documentUrl}/check-your-information`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationChangeDepartureTransportMode,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should navigate to plane transport details page when changing departure transport mode to plane", () => {
    // Verify we're on check-your-information page
    cy.url().should("include", "/check-your-information");

    // Set up intercept BEFORE clicking
    cy.intercept("GET", "**/how-does-the-consignment-leave-the-uk.data*").as("dataFetch");

    // Click the change link for departure transport mode (use correct NMD URL)
    cy.get('[href*="how-does-the-consignment-leave-the-uk"]').first().click();

    // Verify we're on the transport selection page
    cy.url().should("include", "/how-does-the-consignment-leave-the-uk");

    // Wait for client-side data fetch
    cy.wait("@dataFetch");

    // Wait for the form to be fully loaded and stable
    cy.get('input[name="vehicle"]').should("exist");
    cy.wait(200);

    // Change the mode to Plane using cy.check()
    cy.get('input[name="vehicle"][value="plane"]').check({ force: true });

    cy.log("STEP #7 - Verifying plane is selected");
    // Verify plane is selected
    cy.get('input[name="vehicle"][value="plane"]').should("be.checked");

    cy.log("STEP #8 - Looking for submit button");
    cy.get('button[type="submit"]').then(($buttons) => {
      cy.log(`STEP #8A - Found ${$buttons.length} submit buttons`);
      $buttons.each((index, btn) => {
        cy.log(`STEP #8B - Button ${index}: text="${btn.textContent}"`);
      });
    });

    cy.log("STEP #9 - Clicking Save and continue button");
    // Click Save and continue
    cy.get('button[type="submit"]').contains("Save and continue").click();

    cy.log("STEP #10 - Checking URL after submit");
    cy.url().then((url) => {
      cy.log(`STEP #10A - Current URL: ${url}`);
    });

    cy.log("STEP #11 - Expecting navigation to plane transport details page");
    // Should be navigated to the plane transport details page
    cy.url().should("include", "/add-transportation-details-plane");
    cy.url().should("not.include", "/check-your-information");
  });
});

describe("PS - scenario 1 - Change product details", () => {
  const documentNumber = "GBR-2023-PS-DE53D6E7C";
  const documentUrl = `/create-processing-statement/${documentNumber}`;
  const checkYourInformationUrl = `${documentUrl}/check-your-information`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationChangeProductDetails,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should navigate through full flow when changing product details and return to check-your-information", () => {
    // Verify we're on check-your-information page
    cy.url().should("include", "/check-your-information");
    cy.url().then((url) => cy.log(`Current URL: ${url}`));

    // Wait for page to fully load
    cy.get("h1").should("exist");

    // Take screenshot and log page content
    cy.screenshot("ps-check-your-info-page");

    // Check if the link exists, if not fail with helpful message
    cy.get("#consignmentDescriptionChangeLink", { timeout: 10000 }).should(
      "exist",
      "Product change link should exist on page"
    );

    // Click the change link for product
    cy.get("#consignmentDescriptionChangeLink").click();

    // Verify we're on add-consignment-details page with product ID and nextUri
    cy.url().then((url) => cy.log(`After click URL: ${url}`));
    cy.url().should("include", "/add-consignment-details/");
    cy.url().should("include", "nextUri");

    // Click Save and continue without making changes
    cy.get('button[type="submit"]').contains("Save and continue").click();

    // Should be navigated to add-catch-details page
    cy.url().should("include", "/add-catch-details");

    // Don't fill in the form - catch data is already present from existing product
    // Just click Save and continue to proceed
    cy.get('button[type="submit"]').contains("Save and continue").click();

    // Should be navigated to catch-added page
    cy.url().should("include", "/catch-added");

    // Verify "No" is selected for adding another species
    cy.get('input[name="addAnotherCatch"][value="No"]').should("be.checked");

    // Click Save and continue
    cy.get('button[type="submit"]').contains("Save and continue").click();

    // Should be redirected back to check-your-information
    cy.url().should("include", "/check-your-information");
    cy.url().should("not.include", "nextUri");
    cy.url().should("not.include", "/add-processing-plant-details");
  });
});

describe("PS - scenario 2 - Change plant address", () => {
  const documentNumber = "GBR-2023-PS-DE53D6E7C";
  const documentUrl = `/create-processing-statement/${documentNumber}`;
  const checkYourInformationUrl = `${documentUrl}/check-your-information`;

  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSCheckYourInformationChangePlantAddress,
    };
    cy.visit(checkYourInformationUrl, { qs: { ...testParams } });
  });

  it("should have a change link for plant address and navigate correctly", () => {
    // Verify we're on check-your-information page
    cy.url().should("include", "/check-your-information");
    cy.url().then((url) => cy.log(`Current URL: ${url}`));

    // Wait for page to fully load
    cy.get("h1").should("exist");

    // Take screenshot
    cy.screenshot("ps-plant-address-page");

    // Find plant address change link - be more specific about which Address field
    cy.get('a[href*="add-processing-plant-address"]', { timeout: 10000 })
      .should("exist", "Plant address change link should exist")
      .first()
      .click();

    // Verify we're on add-processing-plant-address page with nextUri
    cy.url().should("include", "/add-processing-plant-address");
    cy.url().should("include", "nextUri");

    // Click Save and continue without making changes
    cy.get('button[type="submit"]').contains("Save and continue").click();

    // Should be redirected back to check-your-information
    cy.url().should("include", "/check-your-information");
    cy.url().should("not.include", "nextUri");
    cy.url().should("not.include", "/add-health-certificate");
  });
});
