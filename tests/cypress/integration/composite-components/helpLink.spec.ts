import { type ITestParams, TestCaseId } from "~/types";

describe("HelpSection", () => {
  it("displays help section on three types of pages", () => {
    const urls = [
      "/create-catch-certificate/GBR-2022-CC-488FE89C1/progress",
      "/create-processing-statement/GBR-2022-CC-488FE89C1/progress",
      "/create-storage-document/GBR-2022-CC-488FE89C1/progress",
    ];

    urls.forEach((url) => {
      it(`Should display tHe help section on ${url}`, () => {
        cy.visit(url);
        cy.get("[data-testid=help-section]").should("exist");
      });
    });
  });

  it("does not display on the following types of pages", () => {
    const urls = [
      "/create-catch-certificate/catch-certificates",
      "/create-processing-statement/processing-statements",
      "/create-storage-document/storage-documents",
      "/manage-favourites",
    ];

    urls.forEach((url) => {
      it(`Should not display the help section on ${url}`, () => {
        cy.visit(url);
        cy.get("[data-testid=help-section]").should("exist");
      });
    });
  });

  it("displays help section contents", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadEntryCompleteProgress,
    };

    const url = "/create-catch-certificate/GBR-2022-CC-488FE89C1/progress";

    cy.visit(url, { qs: { ...testParams } });

    cy.get(".govuk-heading-l").should("contain.text", "Get help with your application");
    cy.get("[data-test-id=get-help-body]").should(
      "contain.text",
      "If you have a GBR-2022-CC-488FE89C1 unique reference number, have it with you when you call."
    );
    cy.get("[data-test-id=get-help-phone]").should("contain.text", "Phone: 0330 159 198");
    cy.get("[data-test-id=get-help-hours]").should(
      "contain.text",
      "Monday to Friday, 9am to 5pm (except public holidays)"
    );
    cy.get("[data-test-id=call-charges-link]").should("have.attr", "href", "https://www.gov.uk/call-charges");
    cy.get("[data-test-id=call-charges-link]").should("contain.text", "Find out about call charges");
    cy.get("[data-test-id=get-help-guidance]").should("contain.text", "Read the guidance on");
    cy.get("[data-test-id=exporting-link]").should(
      "have.attr",
      "href",
      "https://www.gov.uk/guidance/exporting-or-moving-fish-from-the-uk#get-help-with-fish-export-documents"
    );
    cy.get("[data-test-id='exporting-link']")
      .invoke("text")
      .should("match", /exporting or moving fish from the UK\s*\(opens in new tab\)/i); // normalise whitespace
  });
});
