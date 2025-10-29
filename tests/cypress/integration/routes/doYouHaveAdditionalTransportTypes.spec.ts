import { type ITestParams, TestCaseId } from "~/types";

describe("Transport Details Table Empty Transport", () => {
  const certificateUrl = "/create-catch-certificate/GBR-2025-CC-136BEC4E4";
  const doYouHaveAdditionalTransportTypesUrl = `${certificateUrl}/do-you-have-additional-transport-types`;
  const testParams: ITestParams = {
    testCaseId: TestCaseId.DoYouHaveAdditionalTransportTypesEmptyTransport,
  };

  it("will page guard for empty transportations", () => {
    cy.visit(doYouHaveAdditionalTransportTypesUrl, { qs: { ...testParams } });
    cy.get('a[href="/create-catch-certificate/GBR-2025-CC-136BEC4E4/what-export-journey"]').should("exist");
  });
});

describe("Transport Details Table Empty", () => {
  const certificateUrl = "/create-catch-certificate/GBR-2025-CC-136BEC4E4";
  const doYouHaveAdditionalTransportTypesUrl = `${certificateUrl}/do-you-have-additional-transport-types`;
  const testParams: ITestParams = {
    testCaseId: TestCaseId.DoYouHaveAdditionalTransportTypesEmpty,
  };

  it("will page guard for empty transportations", () => {
    cy.visit(doYouHaveAdditionalTransportTypesUrl, { qs: { ...testParams } });
    cy.url().should("include", "/how-does-the-export-leave-the-uk");
  });
});

describe("Transport Details Table", () => {
  const certificateUrl = "/create-catch-certificate/GBR-2025-CC-136BEC4E4";
  const doYouHaveAdditionalTransportTypesUrl = `${certificateUrl}/do-you-have-additional-transport-types`;
  const testParams: ITestParams = {
    testCaseId: TestCaseId.DoYouHaveAdditionalTransportTypes,
  };

  beforeEach(() => {
    cy.visit(doYouHaveAdditionalTransportTypesUrl, { qs: { ...testParams } });
  });

  it("renders the page title", () => {
    cy.get('[data-testid="transport-details-page-header"]').should("exist");
  });

  it("renders the table with correct headers", () => {
    const headers = ["Transport type", "Documents", "References", "", "Action"];

    headers.forEach((header) => {
      if (header) {
        cy.contains("th", header).should("exist");
      }
    });
  });

  it("renders all transport rows with correct data", () => {
    cy.get("tbody.govuk-table__body tr.govuk-table__row").each(($row) => {
      cy.wrap($row).within(() => {
        cy.get("td").should("have.length.at.least", 4);
      });
    });
  });

  it("renders edit buttons", () => {
    cy.get('[data-testid^="edit-button"]').each(($btn) => {
      cy.wrap($btn).should("contain.text", "Edit");
    });

    cy.get('[data-testid^="edit-button"]').first().click({ force: true });
    cy.url().should("include", "/how-does-the-export-leave-the-uk");
  });

  it("renders remove buttons", () => {
    cy.get('[data-testid^="remove-button"]').each(($btn) => {
      cy.wrap($btn).should("contain.text", "Remove");
    });

    cy.get('[data-testid^="remove-button"]').first().click({ force: true });
    cy.url().should("include", "/do-you-have-additional-transport-types");
  });

  it('shows the "Primary" tag only on the first row', () => {
    cy.get("tbody.govuk-table__body tr.govuk-table__row")
      .first()
      .within(() => {
        cy.contains("strong.govuk-tag", "Primary").should("exist");
      });

    cy.get("tbody.govuk-table__body tr.govuk-table__row")
      .eq(1)
      .within(() => {
        cy.contains("strong.govuk-tag", "Primary").should("not.exist");
      });
  });

  it("displays the warning text", () => {
    cy.get(".govuk-warning-text__text").should("contain.text", "Warning");
  });
});

describe("DoYouHaveAdditionalTransportTypes", () => {
  const certificateUrl = "/create-catch-certificate/GBR-2025-CC-136BEC4E4";
  const doYouHaveAdditionalTransportTypesUrl = `${certificateUrl}/do-you-have-additional-transport-types`;

  it("should render page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveAdditionalTransportTypes,
    };

    cy.visit(doYouHaveAdditionalTransportTypesUrl, { qs: { ...testParams } });
    cy.contains("a", /^Back$/).should("be.visible");

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-additional-transport-documents-truck/1`);

    cy.get(".govuk-fieldset__heading").contains("Do you want to add more transport modes?").should("be.visible");
    cy.get(".govuk-hint")
      .contains(
        "You only need to enter the first transport mode leaving the country. But if you know additional transport stages, you can add them too."
      )
      .should("be.visible");

    cy.get("form").should(($form) => {
      expect($form.find("input[type='radio']")).to.have.lengthOf(2);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();

      expect(radios).to.have.length(2);
      expect(labels).to.have.length(2);
      expect(labels).to.deep.eq(["Yes", "No"]);
    });
  });

  it("should redirect user to CC dashboard page when user clicks on Save as Draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveAdditionalTransportTypes,
    };

    cy.visit(doYouHaveAdditionalTransportTypesUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-draft-button").click({ force: true });
    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should redirect user to progress page when user selects and submits YES", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveAdditionalTransportTypesYes,
    };

    cy.visit(doYouHaveAdditionalTransportTypesUrl, { qs: { ...testParams } });
    // eslint-disable-next-line
    cy.get("#addTransportation").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });
    cy.url().should("include", "/how-does-the-export-leave-the-uk");
  });

  it("should redirect user to progress page when user selects and submits NO", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveAdditionalTransportTypesNo,
    };

    cy.visit(doYouHaveAdditionalTransportTypesUrl, { qs: { ...testParams } });

    cy.get("#separateAddTransportationFalse").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/progress");
  });

  it("should display error summary and inline error message when saving fails with an error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveAdditionalTransportTypesSaveFailsWithError,
    };

    cy.visit(doYouHaveAdditionalTransportTypesUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
  });

  it("should display forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DoYouHaveAdditionalTransportTypesSaveFailsWith403,
    };

    cy.visit(doYouHaveAdditionalTransportTypesUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/forbidden");
  });
});
