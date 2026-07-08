import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate/GBR-2022-CC-24F279E85";
const landingsUrl = `${documentUrl}/landings-entry`;
const progressUrl = `${documentUrl}/progress`;
const landingsTypeConfirmationUrl = `${documentUrl}/landings-type-confirmation`;

describe("Landings entry page: visuals", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeNull,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });
  });

  it("should render back button", () => {
    cy.contains("a", /^Back$/).should("be.visible");
  });

  it("should display the correct headings", () => {
    cy.contains("h1", "How do you want to enter your products and landings?");
  });

  it("displays all possible landings entry options, labels and hints", () => {
    cy.get("form").should(($form) => {
      expect($form.find("input[type='radio']")).to.have.lengthOf(3);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const hintObjects = $form.find("div.govuk-hint").map((i, el) => Cypress.$(el).text());
      const labels = labelObjects.get();
      const radios = radioObjects.get();
      const hints = hintObjects.get();

      expect(radios).to.have.length(3);
      expect(labels).to.have.length(3);
      expect(labels).to.deep.eq(["Direct Landing", "Manual entry", "Upload from a CSV file"]);
      expect(hints).to.deep.eq([
        "Recommended for UK registered fishing vessels landing and exporting their catch simultaneously in the EU (or a GB registered fishing vessel direct landing in Northern Ireland).",
        "Recommended for small to medium sized exports.",
        "Recommended for large exports. (Requires the set up of product favourites).",
      ]);
    });
  });

  it("associates every landing option radio with a matching label", () => {
    cy.get("input[type='radio']").each(($radio) => {
      const radioId = $radio.attr("id");
      cy.wrap(radioId).should("not.be.undefined");
      cy.get(`label[for='${radioId}']`).should("have.length", 1).and("be.visible");
    });

    cy.contains("label", "Upload from a CSV file")
      .should("have.attr", "for")
      .then((csvRadioId) => {
        cy.get(`#${csvRadioId}`).should("exist");
      });
  });

  it("should display the save and continue button", () => {
    cy.contains("button", "Save and continue").should("be.visible");
  });

  it("should display the details summary", () => {
    cy.contains("summary", "What is a CSV file?").should("be.visible");
    cy.get("#what-is-a-csv-file-summary-text")
      .should("have.class", "govuk-details__summary-text")
      .and("have.attr", "aria-label", "What is a CSV file?");

    cy.contains("summary", "What is a CSV file?").click();
    cy.contains(
      "div > p",
      "A CSV file is a text file that uses commas to separate its values. Each value in the file is a data field and each line is a data record."
    ).should("be.visible");

    cy.contains(
      "div > p",
      "A CSV file is a text file that uses commas to separate its values. Each value in the file is a data field and each line is a data record."
    ).should("be.visible");
    cy.contains("div > p", "Spreadsheets and some software can usually export their data to a CSV file.").should(
      "be.visible"
    );
  });
});

describe("Landings entry page: choosing an option", () => {
  it("should be able to navigate to the progress page when the user selects an option", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeManualEntry,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });

    cy.get("#manualOptionEntry").click();
    cy.get("form").submit();
    cy.url().should("include", progressUrl);
  });

  it("should display an error when there is a server error with an array of error messages", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeFailsWithErrors,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });
    cy.get("form").submit();

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a[href='#landingsEntryOption']", /^Select an option to continue$/).should("be.visible");
  });

  it("should redirect to the forbidden page if the user is unauthorised to get the landings type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.GetLandingsTypeFailsWith403,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the forbidden page if the user is unauthorised but tries to save the landings type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PostLandingsTypeFailsWith403,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });
    cy.get("form").submit();

    cy.url().should("include", "/forbidden");
  });
});

describe("Landings entry page: changing landings type", () => {
  it("should not to navigate to the landings type confirmation page when the user changes from manual entry to upload entry or vice versa", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeNoConfirmation,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });

    cy.get("#manualOptionEntry").click();
    cy.get("form").submit();
    cy.url().should("not.include", landingsTypeConfirmationUrl);
    cy.url().should("include", progressUrl);
  });
});

describe("Landings entry page: unauthorized access", () => {
  it("should redirect to the forbidden page if the user is unauthorized to get the landings type", () => {
    const testParams = {
      testCaseId: TestCaseId.GetLandingsTypeFailsWith403,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the forbidden page if the user is unauthorized but tries to save the landings type", () => {
    const testParams = {
      testCaseId: TestCaseId.PostLandingsTypeFailsWith403,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });
    cy.get("form").submit();

    cy.url().should("include", "/forbidden");
  });
});

describe("Landings entry page: notification messages", () => {
  it("should display notification messages if generatedByContent is true", () => {
    const testParams = {
      testCaseId: TestCaseId.LandingsTypeNotification,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });

    const notifMsg =
      "This new page offers ways to enter products and landings for different types of export. Select an option to continue";

    cy.contains("div", notifMsg).should("be.visible");
  });

  it("should point Back to copy screen when opened from copied catch certificate flow", () => {
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

    cy.findByRole("link", { name: "Back" }).click();
    cy.url().should("include", "/copy-this-catch-certificate");
    cy.url().should("not.include", "/forbidden");
  });

  it("should respect backUri query parameter when provided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeNull,
    };

    const customBackUri = encodeURIComponent(`${documentUrl}/custom-page`);

    cy.visit(`${landingsUrl}?backUri=${customBackUri}`, { qs: { ...testParams } });

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${documentUrl}/custom-page`);
  });

  it("should point Back to catch-certificates dashboard when no copy context or backUri", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.LandingsTypeNull,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-catch-certificate/catch-certificates");
  });
});

describe("Landings entry page: form submission and errors", () => {
  it("should display an error when there is a server error with an array of error messages", () => {
    const testParams = {
      testCaseId: TestCaseId.LandingsTypeFailsWithErrors,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });
    cy.get("form").submit();

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a[href='#landingsEntryOption']", /^Select an option to continue$/).should("be.visible");
  });

  it("should handle form submission and redirect correctly based on nextUri", () => {
    const testParams = {
      testCaseId: TestCaseId.LandingsTypeManualEntry,
    };

    cy.visit(landingsUrl, { qs: { ...testParams } });

    cy.get("#manualOptionEntry").click();
    cy.get("form").submit();
    cy.url().should("include", progressUrl);
  });
});
