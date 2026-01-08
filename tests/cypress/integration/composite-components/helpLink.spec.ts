import { type ITestParams, TestCaseId } from "~/types";

describe("HelpSection", () => {
  it("displays help section on three types of pages", () => {
    const urls = [
      "/create-catch-certificate/GBR-2022-CC-488FE89C1/progress",
      "/create-catch-certificate/GBR-2022-CC-488FE89C1/landings-entry",
      "/create-catch-certificate/GBR-2022-CC-488FE89C1/add-your-reference",
      "/create-catch-certificate/GBR-2022-CC-488FE89C1/add-exporter-details",
      "/create-catch-certificate/GBR-2022-CC-488FE89C1/what-are-you-exporting",
      "/create-catch-certificate/GBR-2022-CC-488FE89C1/whose-waters-were-they-caught-in",
      "/create-catch-certificate/GBR-2022-CC-488FE89C1/what-export-journey",
      "/create-catch-certificate/GBR-2022-CC-488FE89C1/delete-this-draft-catch-certificate",
      "/create-processing-statement/GBR-2022-CC-488FE89C1/progress",
      "/create-processing-statement/GBR-2022-CC-488FE89C1/add-your-reference",
      "/create-processing-statement/GBR-2022-CC-488FE89C1/add-exporter-details",
      "/create-processing-statement/GBR-2022-CC-488FE89C1/add-consignment-details",
      "/create-processing-statement/GBR-2022-CC-488FE89C1/add-processing-plant-address",
      "/create-processing-statement/GBR-2022-CC-488FE89C1/add-health-certificate",
      "/create-processing-statement/GBR-2022-CC-488FE89C1/what-export-destination",
      "/create-processing-statement/GBR-2022-CC-488FE89C1/delete-this-draft-processing-statement",
      "/create-storage-document/GBR-2022-CC-488FE89C1/progress",
      "/create-storage-document/GBR-2022-CC-488FE89C1/add-your-reference",
      "/create-storage-document/GBR-2022-CC-488FE89C1/add-exporter-details",
      "/create-storage-document/GBR-2022-CC-488FE89C1/add-product-to-this-consignment",
      "/create-storage-document/GBR-2022-CC-488FE89C1/how-does-the-consignment-arrive-to-the-uk",
      "/create-storage-document/GBR-2022-CC-488FE89C1/add-storage-facility-details",
      "/create-storage-document/GBR-2022-CC-488FE89C1/delete-this-draft-storage-document",
    ];

    urls.forEach((url) => {
      it(`Should display the help section on ${url}`, () => {
        cy.visit(url);
        cy.get("[data-testid=help-section]").should("exist");
      });
    });
  });

  it("does not display on the create pages ore the manage pages", () => {
    const urls = [
      "/create-catch-certificate/catch-certificates",
      "/create-processing-statement/processing-statements",
      "/create-storage-document/storage-documents",
      "/manage-favourites",
    ];

    urls.forEach(({ url, testCaseId }) => {
      cy.visit(url, { qs: { testCaseId } });
      cy.get("[data-testid=help-section]").should("not.exist");
    });
  });

  it("displays help section contents in English", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadEntryCompleteProgress,
    };

    const url = "/create-catch-certificate/GBR-2022-CC-488FE89C1/progress";

    cy.visit(url, { qs: { ...testParams } });

    cy.get(".govuk-heading-l").should("contain.text", "Get help with your application");
    cy.get("[data-test-id=get-help-body]").should(
      "contain.text",
      "If you have a catch certificate unique reference number, have it with you when you call."
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
      .should("match", /exporting or moving fish from the UK\s*\(opens in new tab\)\.?/i);
  });

  it("displays help section contents in Welsh", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadEntryCompleteProgress,
    };

    const url = "/create-catch-certificate/GBR-2022-CC-488FE89C1/progress";

    cy.visit(url, { qs: { ...testParams } });

    cy.get("a[hreflang='cy']").click();

    cy.get(".govuk-heading-l").should("contain.text", "Cael help gyda'ch cais");
    cy.get("[data-test-id=get-help-body]").should(
      "contain.text",
      "Os oes gennych rif cyfeirnod unigryw catch certificate, gofalwch fod hwnnw gennych pan fyddwch chi'n ffonio."
    );
    cy.get("[data-test-id=get-help-phone]").should("contain.text", "Ffôn: 0330 159 1989");
    cy.get("[data-test-id=get-help-hours]").should(
      "contain.text",
      "Dydd Llun i ddydd Gwener, 9am i 5pm (ac eithrio gwyliau cyhoeddus)"
    );
    cy.get("[data-test-id=call-charges-link]").should("contain.text", "Gwybodaeth am gostau galwadau");
    cy.get("[data-test-id=get-help-guidance]").should("contain.text", "Darllen y canllawiau ar");

    cy.get("[data-test-id='exporting-link']")
      .invoke("text")
      .should("match", /allforio neu symud pysgod o['’]r DU\s*\(yn agor mewn tab newydd\)\.?/i); // normalise whitespace and apostrophe variants
  });
});
