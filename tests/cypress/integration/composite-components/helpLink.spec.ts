import { type ITestParams, TestCaseId } from "~/types";

describe("HelpSection", () => {
  it("renders help section on progress page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadEntryCompleteProgress,
    };

    cy.visit("/create-catch-certificate/GBR-2022-CC-488FE89C1/progress", { qs: { ...testParams } });
    cy.get("[data-testid=help-section]").should("exist");
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
      "Monday to Friday, 8am to 6pm (except public holidays)"
    );
    cy.get("[data-test-id=call-charges-link]").should("have.attr", "href", "https://www.gov.uk/call-charges");
    cy.get("[data-test-id=call-charges-link]").should("contain.text", "Find out about call charges");
    cy.get("[data-test-id=get-help-guidance]").should("contain.text", "Read the guidance on");
    cy.get("[data-test-id=exporting-link]").should(
      "have.attr",
      "href",
      "https://www.gov.uk/guidance/exporting-or-moving-fish-from-the-uk#get-help-with-fish-export-documents"
    );

    cy.get("[data-test-id='exporting-link']").should("have.attr", "target", "_blank");
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
      "Os oes gennych rif cyfeirnod unigryw tystysgrif dalfa, gofalwch fod hwnnw gennych pan fyddwch chi'n ffonio."
    );
    cy.get("[data-test-id=get-help-phone]").should("contain.text", "Ffôn: 0330 159 1989");
    cy.get("[data-test-id=get-help-hours]").should(
      "contain.text",
      "Dydd Llun i ddydd Gwener, 8am i 6pm (ac eithrio gwyliau cyhoeddus)"
    );
    cy.get("[data-test-id=call-charges-link]").should("contain.text", "Gwybodaeth am gostau galwadau");
    cy.get("[data-test-id=get-help-guidance]").should("contain.text", "Darllen y canllawiau ar");

    cy.get("[data-test-id='exporting-link']")
      .invoke("text")
      .should("match", /allforio neu symud pysgod o['’]r DU\s*\(yn agor mewn tab newydd\)\.?/i); // normalise whitespace and apostrophe variants
  });

  it("uses processing statement wording for PS document numbers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSAddExporterDetailsFull,
    };

    const url = "/create-processing-statement/GBR-2021-PS-8EEB7E123/add-exporter-details";

    cy.visit(url, { qs: { ...testParams } });
    cy.get("[data-testid=help-section]").should("exist");
    cy.get("[data-test-id=get-help-body]").should("contain.text", "processing statement");
  });

  it("uses non-manipulation wording for SD document numbers", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDAddExporterDetails,
    };

    const url = "/create-non-manipulation-document/GBR-2021-SD-8EEB7E123/add-exporter-details";

    cy.visit(url, { qs: { ...testParams } });
    cy.get("[data-testid=help-section]").should("exist");
    cy.get("[data-test-id=get-help-body]").should("contain.text", "non-manipulation document");
  });
});
