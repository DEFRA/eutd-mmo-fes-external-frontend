import { TestCaseId } from "~/types";

describe("HelpSection", () => {
  const progressCases = [
    {
      url: "/create-catch-certificate/GBR-2022-CC-488FE89C1/progress",
      documentName: "Catch Certificate",
      testCaseId: TestCaseId.CCUploadEntryCompleteProgress,
    },
    {
      url: "/create-processing-statement/GBR-2022-CC-488FE89C1/progress",
      documentName: "Processing Statement",
      testCaseId: TestCaseId.PSCompleteProgress,
    },
    {
      url: "/create-storage-document/GBR-2022-CC-488FE89C1/progress",
      documentName: "Non-Manipulation Document",
      testCaseId: TestCaseId.SDCompleteProgress,
    },
  ];

  progressCases.forEach(({ url, documentName, testCaseId }) => {
    it(`displays help section and document documentName for ${documentName}`, () => {
      cy.visit(url, { qs: { testCaseId } });
      cy.get("[data-testid=help-section]").should("exist");
      cy.get(".govuk-heading-l").should("contain.text", "Get help with your application");
      cy.get("[data-test-id=get-help-body]").should(
        "contain.text",
        `If you have a ${documentName} unique reference number, have it with you when you call.`
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

  it("does not display on the following types of pages", () => {
    const dashboardCases = [
      {
        url: "/create-catch-certificate/catch-certificates",
        testCaseId: TestCaseId.CCDashboard,
      },
      {
        url: "/create-processing-statement/processing-statements",
        testCaseId: TestCaseId.PSDashboard,
      },
      {
        url: "/create-storage-document/storage-documents",
        testCaseId: TestCaseId.SDDashboard,
      },
      {
        url: "/manage-favourites",
        testCaseId: TestCaseId.ManageFavourites,
      },
    ];

    dashboardCases.forEach(({ url, testCaseId }) => {
      cy.visit(url, { qs: { testCaseId } });
      cy.get("[data-testid=help-section]").should("not.exist");
    });
  });
});
