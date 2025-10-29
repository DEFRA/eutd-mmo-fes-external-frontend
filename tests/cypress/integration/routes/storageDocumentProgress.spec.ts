import { type ITestParams, TestCaseId } from "~/types";

const certificateUrl = "/create-storage-document/GBR-2021-SD-8EEB7E123";
const progressUrl = `${certificateUrl}/progress`;

describe("ProgressPage - Incomplete Application", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDIncompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display back button and back button should have correct href pointing to landings entry page", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-storage-document/storage-documents");
  });

  it("should display the correct headings", () => {
    cy.contains("[data-testid='sd-progress-titling']", "Your Progress");
    cy.contains("[data-testid='sd-progress-heading']", "Storage Document application: GBR-2021-SD-8EEB7E123");
  });

  it("should display Application incomplete when NOT all required sections have been completed", () => {
    cy.contains("[data-testid='Progress-completed-heading']", "Application incomplete");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 0 of 6 required sections.");
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('INCOMPLETE')").should("have.length", 3);
    cy.get("li strong:contains('COMPLETE')").should("have.length", 3);
    cy.get("li strong:contains('CANNOT START YET')").should("have.length", 1);
  });

  it("should not have link on row when status is CANNOT START YET", () => {
    cy.contains("a", "UK departure transport details").should("not.exist");
    cy.contains("[data-testid='progress-transportDetails-title-blocked']", "UK departure transport details").should(
      "exist"
    );
  });

  it("should redirect to the exporter Storage Document dashboard", () => {
    cy.get("[data-testid=return-to-dashboard-button]").click({ force: true });
    cy.url().should("include", "/storage-documents");
  });

  it("should display errors", () => {
    cy.get("[data-testid=continue-button]").click({ force: true });
    cy.url().should("include", "/progress");
    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^You must complete the exporter details section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the product details section before being able to continue$/).should(
      "be.visible"
    );
    cy.contains("a", /^You must complete the storage facilities section before being able to continue$/).should(
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
      testCaseId: TestCaseId.SDCompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display Application completed when all required sections have been completed", () => {
    cy.contains("[data-testid='Progress-completed-heading']", "Application completed");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 6 of 6 required sections.");
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('COMPLETE')").should("have.length", 6);
  });

  it("should redirect to the exporter to the check your information page", () => {
    cy.get("[data-testid=continue-button]").click({ force: true });
    cy.url().should("include", "/check-your-information");
  });
});

describe("ProgressPage - Links", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDIncompleteProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display correct sections", () => {
    cy.contains("h2", "Exporter").should("be.visible");
    cy.contains("h2", "Products").should("be.visible");
    cy.contains("h2", "Arrival at storage facility").should("be.visible");
    cy.contains("h2", "Storage facilities").should("be.visible");
    cy.contains("h2", "Departure from storage facility").should("be.visible");
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
      .should("have.attr", "href", `${certificateUrl}/add-product-to-this-consignment`);

    cy.contains("a", "UK arrival transport details (optional)").should("be.visible");
    cy.contains("a", "UK arrival transport details (optional)")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`);

    cy.contains("a", "Storage facilities").should("be.visible");
    cy.contains("a", "Storage facilities")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/you-have-added-a-storage-facility`);
  });
});

describe("ProgressPage - Links with transport selected", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCompleteUnauthorisedProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display correct links", () => {
    cy.contains("a", "UK arrival transport details (optional)")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`);
  });

  it("should redirect to the exporter forbidden", () => {
    cy.get("[data-testid=continue-button]").click({ force: true });
    cy.url().should("include", "/forbidden");
  });
});

describe("ProgressPage - Links with transport selected - truck", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCompleteTruckProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display correct links", () => {
    cy.contains("a", "UK arrival transport details (optional)")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`);
  });
});

describe("ProgressPage - Links with transport selected - truck - No CMR", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCompleteTruckCMRProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display correct links", () => {
    cy.contains("a", "UK departure transport details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk`);
  });
});

describe("ProgressPage - Links with transport selected - train", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCompleteTrainProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display correct links", () => {
    cy.contains("a", "UK departure transport details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk`);
  });
});

describe("ProgressPage - Links with transport selected - container vessel", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCompleteContainerVesselProgress,
    };

    cy.visit(progressUrl, { qs: { ...testParams } });
  });

  it("should display correct links", () => {
    cy.contains("a", "UK departure transport details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-export-leave-the-uk`);
  });
});

describe("should display the notificationBanner", () => {
  it("first visit copy page then click on green buton to navigate progress page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyAllData,
      disableScripts: true,
    };
    cy.visit("create-storage-document/GBR-2022-SD-F71D98A30/copy-this-storage-document", {
      qs: { ...testParams },
    });
    cy.wait(250);
    cy.get("#voidOriginal").click({ force: true });
    cy.get("#copyDocumentAcknowledged").click({ force: true });
    cy.get('[data-testid="continue"]').click({ force: true });
    cy.get(".govuk-notification-banner__heading").contains(
      "This draft was created by copying document GBR-2022-SD-F71D98A30. You are reminded that you must not use a storage document or data for catches that have already been exported as this is a serious offence and may result in enforcement action being taken."
    );
  });
});
