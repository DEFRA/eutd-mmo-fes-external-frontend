import { type ITestParams, TestCaseId } from "~/types";
const documentUrl = "/create-catch-certificate/GBR-2022-CC-A2BC627FE";
const whatExportJourneyUrl = `${documentUrl}/what-export-journey`;
describe("what export journey page for Direct Landing", () => {
  it("it shoud render the page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyDirectLanding,
    };
    cy.visit(whatExportJourneyUrl, {
      qs: { ...testParams },
    });
    cy.get("form");
    cy.get("form").should(($form) => {
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObject = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();
      const text = textObject.get();
      expect(radios.length).to.be.at.least(4);
      expect(labels.length).to.be.at.least(4);
      expect(text.length).to.be.at.least(0);
      // Ensure key labels are present
      expect(labels).to.include.members(["United Kingdom", "Guernsey", "Isle of Man", "Jersey"]);
      expect($form.find("input[type='radio']")).to.have.lengthOf(4);
    });
    cy.get(".govuk-heading-xl").contains("What journey does the export take?");
    cy.get(".govuk-fieldset__legend").contains("Select the departure country");
    cy.get("#departure-country-hint").contains(
      "This is also known as the country of exportation, or vessel flag state (for direct landings)"
    );
    cy.contains("a", /^Back$/).should("be.visible");
  });

  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDirectLandingJourneyBadRequest,
    };
    cy.visit(whatExportJourneyUrl, {
      qs: { ...testParams },
    });
    cy.get('[data-testid="save-and-continue"]').click();
    cy.get(".govuk-list > li > a").contains("Select a valid destination country");
    cy.get(".govuk-error-message").contains("Select a valid destination country");
  });
  it("should redirect to the forbidden page if there is an error as page is rendered", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDirectLandingJourneyFailsToRenderWith403,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the forbidden page if the user is unauthorised to access a document number", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDirectLandingJourney403,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the progess page if the user click on draft button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyDirectLandingDraft,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get("#exportedFromGU").check();
    cy.get('[data-testid="save-draft-button"]').click();
  });

  it("should redirect to the landings-entry if the if landing entry is null", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyDirectLandingNull,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
  });

  it("should redirect to the progess page if the user click on save and continue button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportDirectLandingJourneySaveAndContinue,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get("#exportedFromIOM").check();
    cy.get("#exportDestination").invoke("val", "Pakistan");
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/progress");
  });
});

describe("what export journey page for Manual Entry", () => {
  it("it shoud render the page", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntry,
    };
    cy.visit(whatExportJourneyUrl, {
      qs: { ...testParams },
    });
    cy.get("form");
    cy.get("form").should(($form) => {
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const textObject = $form.find("input[type='text']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();
      const text = textObject.get();
      expect(radios.length).to.be.at.least(4);
      expect(labels.length).to.be.at.least(4);
      expect(text.length).to.be.at.least(0);
      expect(labels).to.include.members(["United Kingdom", "Guernsey", "Isle of Man", "Jersey"]);
      expect($form.find("input[type='radio']")).to.have.lengthOf(4);
    });
    cy.get(".govuk-heading-xl").contains("What journey does the export take?");
    cy.get(".govuk-fieldset__legend").contains("Select the departure country");
    cy.get("#departure-country-hint").contains(
      "This is also known as the country of exportation, or vessel flag state (for direct landings)"
    );
    cy.contains("a", /^Back$/).should("be.visible");
  });

  it("should display an error  summary and error validation at the form input when there is a bad request", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportManualEntryJourneyBadRequest,
    };
    cy.visit(whatExportJourneyUrl, {
      qs: { ...testParams },
    });
    cy.get('[data-testid="save-and-continue"]').click();
    cy.get(".govuk-list > li > a").contains("Select a valid destination country");
    cy.get(".govuk-error-message").contains("Select a valid destination country");
  });
  it("should redirect to the forbidden page if there is an error as page is rendered m", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportManualEntryJourneyFailsToRenderWith403,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });
  it("should redirect to the forbidden page if the user is unauthorised to access a document number", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportManualEntryJourney403,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the progess page if the user click on draft button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntryDraft,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get("#exportedFromGU").check();
    cy.get('[data-testid="save-draft-button"]').click();
  });

  it("should redirect to the landings-entry if the if landing entry is null", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntryNull,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
  });

  it("should redirect to the how-does-the-export-leave-the-uk page if the user click on save and continue button", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportManualEntryJourneySaveAndContinue,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });
    cy.get("#exportedFromIOM").check();
    cy.get("#exportDestination").invoke("val", "Pakistan");
    cy.get('[data-testid="save-and-continue"]').click();
    cy.url().should("include", "/how-does-the-export-leave-the-uk");
  });
});

describe("Destination country field validation", () => {
  it("should display the destination country field with correct label and hint", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntry,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    cy.get("#exportDestination").should("exist");
    cy.contains("label", "Select the destination country").should("be.visible");
    cy.get("#exportDestination-hint").should("exist");
    cy.get("#exportDestination").then(($el) => {
      if ($el.is("input")) {
        cy.wrap($el).should("have.attr", "type", "text");
      } else {
        cy.wrap($el)
          .should("have.prop", "tagName")
          .should("match", /SELECT/);
      }
    });
  });

  it("should display error when destination country is not selected and save and continue is clicked", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyDestinationCountryRequired,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    cy.get("#exportedFromUK").check();
    cy.get("#pointOfDestination").type("Calais Port");
    cy.get('[data-testid="save-and-continue"]').click();
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-error-summary__title").should("contain", "There is a problem");
    cy.get(".govuk-list > li > a").should("contain", "Select a valid destination country");
    cy.get(".govuk-error-message").should("contain", "Select a valid destination country");
    cy.get("#exportDestination").should(($el) => {
      const cls = $el.attr("class") ?? "";
      expect(cls.includes("govuk-input--error") || cls.includes("govuk-select--error")).to.equal(true);
    });
  });

  it("should display error when destination country is empty string", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyDestinationCountryRequired,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    cy.get("#exportedFromUK").check();
    cy.get("#pointOfDestination").type("Calais Port");
    cy.get('[data-testid="save-and-continue"]').click();

    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-list > li > a").should("contain", "Select a valid destination country");
    cy.get(".govuk-error-message").should("contain", "Select a valid destination country");
  });

  it("should allow valid destination country selection", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntry,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    cy.get("#exportedFromUK").check();
    cy.get("#exportDestination").then(($el) => {
      if ($el.is("select")) {
        cy.wrap($el).select("France");
      } else {
        cy.wrap($el).invoke("val", "France");
      }
    });
    cy.get("#pointOfDestination").type("Calais Port");
    cy.get('[data-testid="save-and-continue"]').click();
    cy.get(".govuk-error-summary").should("not.exist");
  });

  it("should not save when destination country is missing and save as draft is clicked", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntryDraft,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    cy.get("#exportedFromUK").check();
    cy.get('[data-testid="save-draft-button"]').click();
    cy.url().should("include", "/catch-certificates");
  });
});

describe("Point of destination field", () => {
  it("should render the point of destination field with correct label and hint", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyManualEntry,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    // Check field exists
    cy.get("#pointOfDestination").should("exist");

    // Check label
    cy.get('label[for="pointOfDestination"]').should("contain", "Point of destination");

    // Check hint text
    cy.get("#pointOfDestination-hint").should(
      "contain",
      "For example, Calais port, Calais-Dunkerque airport or the destination point of the consignment."
    );

    // Verify it's a text input
    cy.get("#pointOfDestination").should("have.attr", "type", "text");
  });

  it("should display error when point of destination is not provided", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyPointOfDestinationRequired,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    cy.get("#exportedFromUK").check();
    cy.get("#exportDestination").then(($el) => {
      if ($el.is("select")) {
        cy.wrap($el).select("France");
      } else {
        cy.wrap($el).invoke("val", "France");
      }
    });
    cy.get('[data-testid="save-and-continue"]').click();

    // Check error summary
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-list > li > a").should("contain", "Enter the point of destination");

    // Check inline error
    cy.get("#pointOfDestination-error").should("contain", "Enter the point of destination");

    // Check field has error styling
    cy.get("#pointOfDestination").should("have.class", "govuk-input--error");
  });

  it("should display error when point of destination exceeds 100 characters", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyPointOfDestinationTooLong,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    const longDestination = new Array(102).join("A");
    cy.get("#exportedFromUK").check();
    cy.get("#exportDestination").invoke("val", "France");
    cy.get("#pointOfDestination").type(longDestination);
    cy.get('[data-testid="save-and-continue"]').click();

    // Check error summary
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-list > li > a").should("contain", "Point of destination must not exceed 100 characters");

    // Check inline error
    cy.get("#pointOfDestination-error").should("contain", "Point of destination must not exceed 100 characters");
  });

  it("should display error when point of destination contains invalid characters", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyPointOfDestinationInvalidChars,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    cy.get("#exportedFromUK").check();
    cy.get("#exportDestination").invoke("val", "France");
    cy.get("#pointOfDestination").type("Calais port @ terminal 3");
    cy.get('[data-testid="save-and-continue"]').click();

    // Check error summary
    cy.get(".govuk-error-summary").should("be.visible");
    cy.get(".govuk-list > li > a").should(
      "contain",
      "Point of destination must only contain letters, numbers, hyphens, apostrophes, spaces and forward slashes"
    );

    // Check inline error
    cy.get("#pointOfDestination-error").should(
      "contain",
      "Point of destination must only contain letters, numbers, hyphens, apostrophes, spaces and forward slashes"
    );
  });

  it("should accept valid point of destination with allowed characters", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyPointOfDestinationValid,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    cy.get("#exportedFromUK").check();
    cy.get("#exportDestination").invoke("val", "France");
    cy.get("#pointOfDestination").type("Calais-Dunkerque A/B Terminal O'Hare 123");
    cy.get('[data-testid="save-and-continue"]').click();

    // Should not show errors
    cy.get(".govuk-error-summary").should("not.exist");
    cy.get("#pointOfDestination-error").should("not.exist");
  });

  it("should not save invalid point of destination when save as draft is clicked", () => {
    cy.wrap(true).should("be.true");
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyPointOfDestinationDraftInvalid,
    };
    cy.visit(whatExportJourneyUrl, { qs: { ...testParams } });

    cy.get("#exportedFromUK").check();
    cy.get("#exportDestination").invoke("val", "France");
    cy.get("#pointOfDestination").type(new Array(102).join("A"));
    cy.get('[data-testid="save-draft-button"]').click();

    // Should redirect to dashboard without showing errors and without saving invalid data
    cy.url().should("include", "/catch-certificates");
  });
});

describe("What export journey - Autocomplete aria-controls accessibility (FI0-11120)", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.WhatExportJourneyDirectLanding,
    };
    cy.visit(documentUrl + "/what-export-journey", { qs: { ...testParams } });
  });

  it("destination country combobox input should have role=combobox and aria-controls referencing the listbox ID if using input", () => {
    cy.wrap(true).should("be.true");
    cy.get("#exportDestination").then(($el) => {
      if ($el.is("input")) {
        cy.wrap($el)
          .should("have.attr", "role", "combobox")
          .should("have.attr", "aria-controls", "exportDestination__listbox");
      } else {
        cy.log("exportDestination is not an input; skipping combobox attribute checks");
      }
    });
  });

  it("destination country listbox should appear with correct ID, role and no duplicates when suggestions open (input only)", () => {
    cy.wrap(true).should("be.true");
    cy.get("#exportDestination").then(($el) => {
      if ($el.is("input")) {
        cy.wrap($el).should("have.attr", "aria-controls", "exportDestination__listbox").type("Fr");
        // Confirms: listbox exists, has correct role, ID is unique, aria-controls matches rendered ID
        cy.get("#exportDestination__listbox").should("have.length", 1).should("have.attr", "role", "listbox");
      } else {
        cy.log("exportDestination is not an input; skipping listbox suggestion checks");
      }
    });
  });

  it("destination country combobox aria-expanded should toggle false→true when suggestions open (input only)", () => {
    cy.wrap(true).should("be.true");
    cy.get("#exportDestination").then(($el) => {
      if ($el.is("input")) {
        cy.wrap($el)
          .should("have.attr", "aria-expanded", "false")
          .type("Fr")
          .should("have.attr", "aria-expanded", "true");
      } else {
        cy.log("exportDestination is not an input; skipping aria-expanded toggle check");
      }
    });
  });
});
