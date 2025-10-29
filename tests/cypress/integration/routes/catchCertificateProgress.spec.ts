import { type ITestParams, TestCaseId } from "~/types";

const certificateUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
const progressUrl = `${certificateUrl}/progress`;

describe("ProgressPage - Incomplete Application", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadEntryIncompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display back button and back button should have correct href pointing to landings entry page", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/landings-entry`);
  });

  it("should display the correct headings", () => {
    cy.contains("[data-testid='progress-titling']", "Your Progress");
    cy.contains("[data-testid='Progress-heading']", "Catch Certificate application: GBR-2021-CC-8EEB7E123");
  });

  it("should display Application incomplete when NOT all required sections have been completed", () => {
    cy.contains("[data-testid='Progress-completed-heading']", "Application incomplete");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 2 of 7 required sections.");
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('INCOMPLETE')").should("have.length", 4);
    cy.get("li strong:contains('COMPLETE')").its("length").should("be.greaterThan", 0);
    cy.get("li strong:contains('CANNOT START YET')").should("have.length", 1);
  });

  it("should not have link on row when status is CANNOT START YET", () => {
    cy.contains("a", "Landings details").should("not.exist");
    cy.contains("[data-testid='progress-landings-title-blocked']", "Landings details").should("exist");
  });

  it("should redirect to the exporter catch certificate dashboard", () => {
    cy.get("[data-testid=return-to-dashboard-button]").click({ force: true });
    cy.url().should("include", "/catch-certificates");
  });

  it("should display errors", () => {
    cy.get("[data-testid=continue-button]").click({ force: true });
    cy.url().should("include", "/progress");
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^You must complete the product details section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the landing details section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the catch waters section before being able to continue$/).should("be.visible");
    cy.contains("a", /^You must complete the export journey section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the transport details section before being able to continue$/).should(
      "be.visible"
    );
  });
});

describe("ProgressPage - Completed Application", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadEntryCompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display Application completed when all required sections have been completed", () => {
    cy.contains("[data-testid='Progress-completed-heading']", "Application completed");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 7 of 7 required sections.");
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('COMPLETE')").its("length").should("be.greaterThan", 0);
  });

  it("should redirect to the exporter forbidden", () => {
    cy.get("[data-testid=continue-button]").click({ force: true });
    cy.url().should("include", "/forbidden");
  });
});

describe("ProgressPage - landings entry type: directLanding", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCDirectLandingCompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display correct sections", () => {
    cy.contains("h2", "Exporter").should("be.visible");
    cy.contains("h2", "Products/Landings").should("be.visible");
    cy.contains("h2", "Transportation").should("be.visible");
  });

  it("should display correct links", () => {
    cy.contains("a", "Your reference (Optional)").should("be.visible");
    cy.contains("a", "Your reference (Optional)")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-your-reference`);

    cy.contains("a", "Exporter details").should("be.visible");
    cy.contains("a", "Exporter details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-exporter-details`);

    cy.contains("a", "Product details").should("be.visible");
    cy.contains("a", "Product details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/what-are-you-exporting`);

    cy.contains("a", "Landings details").should("be.visible");
    cy.contains("a", "Landings details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/direct-landing`);

    cy.contains("a", "Catch waters").should("be.visible");
    cy.contains("a", "Catch waters")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/whose-waters-were-they-caught-in`);

    cy.contains("a", "Export journey").should("be.visible");
    cy.contains("a", "Export journey")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/what-export-journey`);
  });

  it("should not display Data upload link", () => {
    cy.get('[data-testid="progress-dataUpload-title"]').should("not.exist");
  });

  it("should not display Transport type and Transport details links", () => {
    cy.get('[data-testid="progress-transportType-title"]').should("not.exist");
    cy.get('[data-testid="progress-transportDetails-title"]').should("not.exist");
  });

  it("should redirect to the exporter to the check your information page", () => {
    cy.get("[data-testid=continue-button]").click({ force: true });
    cy.url().should("include", "/check-your-information");
  });
});

describe("ProgressPage - landings entry type: manualEntry", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCManualEntryCompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display correct sections", () => {
    cy.contains("h2", "Exporter").should("be.visible");
    cy.contains("h2", "Products/Landings").should("be.visible");
    cy.contains("h2", "Transportation").should("be.visible");
  });

  it("should display correct links", () => {
    cy.contains("a", "Your reference (Optional)").should("be.visible");
    cy.contains("a", "Your reference (Optional)")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-your-reference`);

    cy.contains("a", "Exporter details").should("be.visible");
    cy.contains("a", "Exporter details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-exporter-details`);

    cy.contains("a", "Product details").should("be.visible");
    cy.contains("a", "Product details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/what-are-you-exporting`);

    cy.contains("a", "Landings details").should("be.visible");
    cy.contains("a", "Landings details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-landings`);

    cy.contains("a", "Catch waters").should("be.visible");
    cy.contains("a", "Catch waters")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/whose-waters-were-they-caught-in`);

    cy.contains("a", "Export journey").should("be.visible");
    cy.contains("a", "Export journey")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/what-export-journey`);

    cy.get("a").then((links: any) => {
      const target = [...links].find((el) => el.textContent.trim() === "Transport type");
      if (target) {
        cy.contains("a", "Transport type")
          .should("be.visible")
          .should("have.attr", "href", `${certificateUrl}/do-you-have-additional-transport-types`);
      }
    });

    cy.get("a").then((links: any) => {
      const target = [...links].find((el) => el.textContent.trim() === "Transport details");
      if (target) {
        cy.contains("a", "Transport details")
          .should("be.visible")
          .should("have.attr", "data-testid", `progress-transportDetails-title`);
      }
    });
  });

  it("should not display Data upload link", () => {
    cy.get('[data-testid="progress-dataUpload-title"]').should("not.exist");
  });
});

describe("ProgressPage - landings entry type: uploadEntry", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadEntryCompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display correct sections", () => {
    cy.contains("h2", "Exporter").should("be.visible");
    cy.contains("h2", "Products/Landings").should("be.visible");
    cy.contains("h2", "Transportation").should("be.visible");
  });

  it("should display correct links", () => {
    cy.contains("a", "Your reference (Optional)").should("be.visible");
    cy.contains("a", "Your reference (Optional)")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-your-reference`);

    cy.contains("a", "Exporter details").should("be.visible");
    cy.contains("a", "Exporter details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-exporter-details`);

    cy.contains("a", "Data upload").should("be.visible");
    cy.contains("a", "Data upload").should("be.visible").should("have.attr", "href", `${certificateUrl}/upload-file`);

    cy.contains("a", "Product details").should("be.visible");
    cy.contains("a", "Product details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/what-are-you-exporting`);

    cy.contains("a", "Landings details").should("be.visible");
    cy.contains("a", "Landings details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-landings`);

    cy.contains("a", "Catch waters").should("be.visible");
    cy.contains("a", "Catch waters")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/whose-waters-were-they-caught-in`);

    cy.contains("a", "Export journey").should("be.visible");
    cy.contains("a", "Export journey")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/what-export-journey`);

    cy.get("a").then((links: any) => {
      const target = [...links].find((el) => el.textContent.trim() === "Transport type");
      if (target) {
        cy.contains("a", "Transport type")
          .should("be.visible")
          .should("have.attr", "href", `${certificateUrl}/do-you-have-additional-transport-types`);
      }
    });

    cy.get("a").then((links: any) => {
      const target = [...links].find((el) => el.textContent.trim() === "Transport details");
      if (target) {
        cy.contains("a", "Transport details")
          .should("be.visible")
          .should("have.attr", "data-testid", `progress-transportDetails-title`);
      }
    });
  });
});

describe("ProgressPage - landings entry type: null", () => {
  it("should redirect to landings-entry if landings entry type is empty and the user is authorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCLandingsTypeNull,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });

    cy.url().should("include", "landings-entry");
  });

  it("should redirect to the forbidden page if the user is unauthorised to progress to the landings-entry page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCLandingsTypeUnauthorised,
    };

    cy.visit(progressUrl, {
      failOnStatusCode: false,
      qs: { ...testParams },
    });

    cy.url().should("include", "forbidden");
  });
});
