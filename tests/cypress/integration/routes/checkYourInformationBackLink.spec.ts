import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2022-CC-24F279E85";
const checkYourInformationUrl = `${documentUrl}/check-your-information`;

describe("Check Your Information: Back link navigation", () => {
  describe("Back link for manual entry without copy context", () => {
    it("should navigate back to progress page with backUri to do-you-have-additional-transport-types for manual entry", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCCheckYourInformationManualLanding,
      };
      cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href")
        .and("include", `${documentUrl}/progress?backUri=`)
        .and("include", "do-you-have-additional-transport-types");
    });
  });

  describe("Back link for non-manual entry (upload/direct landing) without copy context", () => {
    it("should navigate back to progress page with backUri to what-export-journey for upload entry", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCCheckYourInformation,
      };
      cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href")
        .and("include", `${documentUrl}/progress?backUri=`)
        .and("include", "what-export-journey");
    });

    it("should navigate back to progress page with backUri to what-export-journey for direct landing", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCCheckYourInformationDirectLanding,
      };
      cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href")
        .and("include", `${documentUrl}/progress?backUri=`)
        .and("include", "what-export-journey");
    });
  });

  describe("Back link for locked document", () => {
    it("should navigate back to catch certificates dashboard when document is locked", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCCheckYourInformationLocked,
      };
      cy.visit(checkYourInformationUrl, { qs: { ...testParams } });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", "/create-catch-certificate/catch-certificates");
    });
  });
});

describe("Progress Page: Back link with copy context for catch certificate", () => {
  const certificateUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const progressUrl = `${certificateUrl}/progress`;

  describe("Back link for copied catch certificate", () => {
    it("should point back to landings-entry with backUri to copy-this-catch-certificate when document is copied", () => {
      const copyParams: ITestParams = {
        testCaseId: TestCaseId.CCCopyThisCatchCertAllData,
        disableScripts: true,
      };

      cy.visit("create-catch-certificate/GBR-2022-CC-F71D98A30/copy-this-catch-certificate", {
        qs: { ...copyParams },
      });
      cy.get("#voidOriginal").click();
      cy.get("#copyDocumentAcknowledged").check();
      cy.get("[data-testid=continue]").click();

      cy.url().then((landingUrl) => {
        const landingMatch = landingUrl.match(/\/create-catch-certificate\/([^/]+)\/landings-entry/);
        if (!landingMatch) {
          throw new Error("new catch certificate document number should be present in URL");
        }
        const newDocumentNumber = landingMatch?.[1] as string;

        const progressParams: ITestParams = {
          testCaseId: TestCaseId.CCUploadEntryIncompleteProgress,
        };

        cy.visit(`/create-catch-certificate/${newDocumentNumber}/progress`, {
          qs: { ...progressParams },
        });

        cy.contains("a", /^Back$/)
          .should("be.visible")
          .should("have.attr", "href")
          .and("include", `/create-catch-certificate/${newDocumentNumber}/landings-entry?backUri=`)
          .and("include", "copy-this-catch-certificate");
      });
    });

    it("should point back to landings-entry without backUri when no copy context exists", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCUploadEntryIncompleteProgress,
      };

      cy.visit(progressUrl, { qs: { ...testParams } });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .invoke("attr", "href")
        .should("eq", `${certificateUrl}/landings-entry`)
        .and("not.include", "backUri");
    });
  });

  describe("Back link respects backUri query parameter", () => {
    it("should use backUri from query parameter if provided", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCUploadEntryIncompleteProgress,
      };

      const customBackUri = encodeURIComponent(`${certificateUrl}/custom-page`);

      cy.visit(`${progressUrl}?backUri=${customBackUri}`, { qs: { ...testParams } });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/custom-page`);
    });
  });
});

describe("Landings Entry Page: Back link navigation", () => {
  const documentUrl = "/create-catch-certificate/GBR-2022-CC-24F279E85";
  const landingsEntryUrl = `${documentUrl}/landings-entry`;

  describe("Back link with backUri query parameter", () => {
    it("should use backUri from query parameter when provided", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.LandingsTypeNull,
      };

      const customBackUri = encodeURIComponent(`${documentUrl}/copy-this-catch-certificate`);

      cy.visit(`${landingsEntryUrl}?backUri=${customBackUri}`, { qs: { ...testParams } });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `${documentUrl}/copy-this-catch-certificate`);
    });

    it("should navigate to copy-this-catch-certificate when hasCopiedDraftContext is true", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCCopyThisCatchCertAllData,
        disableScripts: true,
      };

      cy.visit("create-catch-certificate/GBR-2022-CC-F71D98A30/copy-this-catch-certificate", {
        qs: { ...testParams },
      });
      cy.get("#voidOriginal").click();
      cy.get("#copyDocumentAcknowledged").check();
      cy.get("[data-testid=continue]").click();

      cy.url().should("include", "/landings-entry");
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", "/create-catch-certificate/GBR-2022-CC-F71D98A30/copy-this-catch-certificate");
    });

    it("should navigate to catch-certificates dashboard when no copy context", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.LandingsTypeNull,
      };

      cy.visit(landingsEntryUrl, { qs: { ...testParams } });

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", "/create-catch-certificate/catch-certificates");
    });
  });
});
