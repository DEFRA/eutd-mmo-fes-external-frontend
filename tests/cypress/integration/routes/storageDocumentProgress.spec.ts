import { type ITestParams, TestCaseId } from "~/types";

const certificateUrl = "/create-non-manipulation-document/GBR-2021-SD-8EEB7E123";
const progressUrl = `${certificateUrl}/progress`;

describe("ProgressPage - Cache-Control header", () => {
  it("should return Cache-Control: no-store to prevent stale progress state on back navigation (FI0-11073)", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDIncompleteProgress,
    };
    cy.intercept("GET", progressUrl + "*").as("progressPage");
    cy.visit(progressUrl, { qs: { ...testParams } });
    cy.wait("@progressPage").its("response.headers").should("have.property", "cache-control", "no-store");
  });
});

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
      .should("have.attr", "href", "/create-non-manipulation-document/non-manipulation-documents");
  });

  it("should use backUri query parameter when present", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDIncompleteProgress,
    };

    cy.visit(
      `${progressUrl}?backUri=/create-non-manipulation-document/GBR-2021-SD-8EEB7E123/departure-product-summary`,
      { qs: { ...testParams } }
    );

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-non-manipulation-document/GBR-2021-SD-8EEB7E123/departure-product-summary");
  });

  it("should display the correct headings", () => {
    cy.contains("[data-testid='sd-progress-titling']", "Your Progress").should("be.visible");
    cy.contains(
      "[data-testid='sd-progress-heading']",
      "Non-manipulation document application: GBR-2021-SD-8EEB7E123"
    ).should("be.visible");
  });

  it("should display the progress heading without bold styling", () => {
    cy.get("[data-testid='sd-progress-heading']").should("not.have.class", "govuk-!-font-weight-bold");
  });

  it("should display Application incomplete when NOT all required sections have been completed", () => {
    cy.contains("[data-testid='Progress-completed-heading']", "Application incomplete").should("be.visible");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 0 of 6 required sections.").should(
      "be.visible"
    );
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('INCOMPLETE')").should("have.length", 3);
    cy.get("li strong:contains('COMPLETE')").should("have.length", 3);
    cy.get("li strong:contains('CANNOT START YET')").should("have.length", 1);
  });

  it("should not render duplicate id attributes in the progress list", () => {
    cy.get(".app-task-list [id]").then(($elements) => {
      const ids = [...$elements].map((element) => element.id).filter(Boolean);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

      cy.wrap(duplicateIds, { log: false }).should("deep.equal", []);
    });
  });

  it("should not have link on row when status is CANNOT START YET", () => {
    cy.contains("a", "UK departure transport details").should("not.exist");
    cy.contains("[data-testid='progress-transportDetails-title-blocked']", "UK departure transport details").should(
      "exist"
    );
  });

  it("should redirect to the exporter Storage Document dashboard", () => {
    cy.get("[data-testid=return-to-dashboard-button]").click();
    cy.url().should("include", "/non-manipulation-documents");
  });

  it("should display errors", () => {
    cy.get("[data-testid=continue-button]").click();
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
    cy.contains("[data-testid='Progress-completed-heading']", "Application completed").should("be.visible");
  });

  it("should display number of completed required sections", () => {
    cy.contains("[data-testid='completedSections']", "You have completed 6 of 6 required sections.").should(
      "be.visible"
    );
  });

  it("should display the correct tags", () => {
    cy.get("li strong:contains('COMPLETE')").should("have.length", 6);
  });

  it("should redirect to the exporter to the check your information page", () => {
    cy.get("[data-testid=continue-button]").click();
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
    cy.contains("h2", "Storage facility details").should("be.visible");
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

    cy.contains("a", "UK arrival transport details").should("be.visible");
    cy.contains("a", "UK arrival transport details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`);

    cy.contains("a", "Storage facility details").should("be.visible");
    cy.contains("a", "Storage facility details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-storage-facility-details`);
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
    cy.contains("a", "UK arrival transport details")
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`);
  });

  it("should redirect to the exporter forbidden", () => {
    cy.get("[data-testid=continue-button]").click();
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
    cy.contains("a", "UK arrival transport details")
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
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-leave-the-uk`);
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
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-leave-the-uk`);
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
      .should("have.attr", "href", `${certificateUrl}/how-does-the-consignment-leave-the-uk`);
  });
});

describe("should display the notificationBanner", () => {
  it("first visit copy page then click on green buton to navigate progress page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyAllData,
      disableScripts: true,
    };
    cy.visit("create-non-manipulation-document/GBR-2022-SD-F71D98A30/copy-this-non-manipulation-document", {
      qs: { ...testParams },
    });
    cy.waitForUiUpdate(250);
    cy.get("#voidOriginal").click();
    cy.get("#copyDocumentAcknowledged").click();
    cy.get('[data-testid="continue"]').click();
    cy.get(".govuk-notification-banner__heading")
      .contains(
        "This draft was created by copying document GBR-2022-SD-F71D98A30. You are reminded that you must not use a non-manipulation document or data for catches that have already been exported as this is a serious offence and may result in enforcement action being taken."
      )
      .should("be.visible");
  });
});

describe("ProgressPage - Back link from copied non-manipulation document", () => {
  it("should point Back to copy screen when no backUri is provided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyAllData,
      disableScripts: true,
    };

    cy.visit("create-non-manipulation-document/GBR-2022-SD-F71D98A30/copy-this-non-manipulation-document", {
      qs: { ...testParams },
    });
    cy.get("#voidOriginal").click();
    cy.get("#copyDocumentAcknowledged").check();
    cy.get('[data-testid="continue"]').click();

    cy.url().then((currentUrl) => {
      const match = currentUrl.match(/\/create-non-manipulation-document\/([^/]+)\/progress/);
      if (!match) {
        throw new Error("new non-manipulation document number should be present in URL");
      }

      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should(
          "have.attr",
          "href",
          "/create-non-manipulation-document/GBR-2022-SD-F71D98A30/copy-this-non-manipulation-document"
        );
    });
  });

  it("should point Back to non-manipulation-documents dashboard when void-original option was confirmed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PSSDCopyVoidWithProgress,
      disableScripts: true,
    };

    cy.visit("create-non-manipulation-document/GBR-2022-SD-F71D98A30/copy-this-non-manipulation-document", {
      qs: { ...testParams },
    });
    cy.get("#voidDocumentConfirm").invoke("prop", "checked", true).trigger("change");
    cy.get("#copyDocumentAcknowledged").check();
    cy.get('[data-testid="continue"]').click();

    cy.url().should("include", "/copy-void-confirmation");
    cy.get("#voidOriginal").click();
    cy.get('[data-testid="continue"]').click();

    cy.url().should("include", "/progress");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", "/create-non-manipulation-document/non-manipulation-documents");
  });
});

describe("ProgressPage - Product details link behavior", () => {
  describe("Scenario 1: No products added - links to add-product-to-this-consignment", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDIncompleteProgress,
      };

      cy.visit(progressUrl, { qs: { ...testParams } });
    });

    it("should link to add-product-to-this-consignment when no products have been added", () => {
      cy.contains("a", "Product details")
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/add-product-to-this-consignment`);
    });
  });

  describe("Scenario 1b (FIO-10614): 1 draft product saved-as-draft - links to add-product-to-this-consignment", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDIncompleteProgressWithDraftProducts,
      };

      cy.visit(progressUrl, { qs: { ...testParams } });
    });

    it("should link to add-product-to-this-consignment when only 1 incomplete draft product exists", () => {
      cy.contains("a", "Product details")
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/add-product-to-this-consignment`);
    });
  });

  describe("Scenario 2: More than 1 product present (INCOMPLETE) - links to you-have-added-a-product", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDIncompleteProgressWithProducts,
      };

      cy.visit(progressUrl, { qs: { ...testParams } });
    });

    it("should link to you-have-added-a-product when more than 1 product is present", () => {
      cy.contains("a", "Product details")
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/you-have-added-a-product`);
    });
  });

  describe("Scenario 3: Complete progress with products - links to you-have-added-a-product", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDCompleteProgress,
      };

      cy.visit(progressUrl, { qs: { ...testParams } });
    });

    it("should link to you-have-added-a-product when document is complete with products", () => {
      cy.contains("a", "Product details")
        .should("be.visible")
        .should("have.attr", "href", `${certificateUrl}/you-have-added-a-product`);
    });
  });
});
