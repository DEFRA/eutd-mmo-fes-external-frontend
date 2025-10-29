import { type ITestParams, TestCaseId } from "~/types";
const documentNumber = "GBR-2023-SD-97DA962EC";
const storageDocumentUrl = `/create-storage-document/${documentNumber}/departure-product-summary`;

describe("Storage document departure summary: rendering", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummary,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
  });

  it("should render a back link", () => {
    cy.findByRole("link", { name: "Back" }).click({ force: true });
    cy.url().should(
      "eq",
      `http://localhost:3000/create-storage-document/${documentNumber}/add-transportation-details-plane`
    );
  });

  it("should render the correct page title", () => {
    cy.title().should("eq", "Check and confirm your consignment weight - Create a UK storage document - GOV.UK");
  });

  it("should render the correct content", () => {
    cy.findByRole("heading", { name: "Check and confirm your consignment weight", level: 1 });
    cy.get("#sdProductSummaryGuidanceMessage").contains(
      "If the product weight has changed or remained the same since storage, confirm the details below."
    );
  });

  it("should check the tabs", () => {
    cy.get("#productTabs")
      .find("li")
      .should("have.length", 2)
      .should(($list) => {
        expect($list[0]).to.contain("Storage arrival");
        expect($list[1]).to.contain("Storage departure");
      });
  });

  it("should toggle the tabs and find text", () => {
    cy.get("[data-tab-id='storageArrivalTab']").click({ force: true });
    cy.get(".govuk-tabs__tab").contains("Storage arrival");
    cy.get("[data-tab-id='storageDepartureTab']").click({ force: true });
    cy.get(".govuk-tabs__tab").contains("Storage departure");
  });
});

describe("Storage document departure summary: pageguard", () => {
  it("should redirect to the departure transport page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryNoTransport,
    };
    cy.visit(storageDocumentUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", `/create-storage-document/${documentNumber}/how-does-the-export-leave-the-uk`);
  });

  it("should redirect to the forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryForbidden,
    };
    cy.visit(storageDocumentUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the add product to this consignment page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryNoCatches,
    };
    cy.visit(storageDocumentUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/add-product-to-this-consignment");
  });

  it("should redirect to the add product to this consignment page with an empty catch", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryEmptyCatches,
    };
    cy.visit(storageDocumentUrl, { failOnStatusCode: false, qs: { ...testParams } });
    cy.url().should("include", "/add-product-to-this-consignment");
  });
});

describe("Storage document departure summary: arrival tab", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryCatches,
      disableScripts: true,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
  });
  it("loads the page with catches", () => {
    cy.url().should("include", storageDocumentUrl);
    cy.findByRole("heading", { name: "Check and confirm your consignment weight", level: 1 });
    cy.get("#sdProductSummaryGuidanceMessage").contains(
      "If the product weight has changed or remained the same since storage, confirm the details below."
    );
    cy.get("[data-tab-id='storageArrivalTab']").click();
    cy.get(".govuk-tabs__tab").contains("Storage arrival");
    cy.get("#storage-arrival-tab").within(() => {
      cy.findByRole("heading", { name: "Storage arrival", level: 2 });
      cy.get("table").within(() => {
        cy.get("thead").within(() => {
          cy.get("tr").should("have.length", 1);
          cy.get("th").should("have.length", 4);
          cy.get("th").eq(0).contains("Product");
          cy.get("th").eq(1).contains("Net weight on arrival (optional)");
          cy.get("th").eq(2).contains("Fishery product weight (optional)");
          cy.get("th").eq(3).should("exist");
        });
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(0).contains("Golden damselfish (ADH)");
              cy.get("td").eq(1).find("input").should("have.value", "100");
              cy.get("td").eq(2).find("input").should("have.value", "100");

              cy.get("td").eq(3).find("button").eq(0).contains("Edit");
              cy.get("td").eq(3).find("button").eq(1).contains("Remove");
            });
          cy.get("tr")
            .eq(1)
            .within(() => {
              cy.get("td").eq(0).contains("Peacock sole (ADJ)");
              cy.get("td").eq(1).find("input").should("have.value", "50");
              cy.get("td").eq(2).find("input").should("have.value", "50");

              cy.get("td").eq(3).find("button").eq(0).contains("Edit");

              cy.get("td").eq(3).find("button").eq(1).contains("Remove");
            });
        });
      });
    });
  });

  it("loads the edit page with catches", () => {
    cy.url().should("include", storageDocumentUrl);
    cy.findByRole("heading", { name: "Check and confirm your consignment weight", level: 1 });
    cy.get("#sdProductSummaryGuidanceMessage").contains(
      "If the product weight has changed or remained the same since storage, confirm the details below."
    );
    cy.get("[data-tab-id='storageArrivalTab']").click();
    cy.get(".govuk-tabs__tab").contains("Storage arrival");
    cy.get("#storage-arrival-tab").within(() => {
      cy.get("table").within(() => {
        cy.get("thead").within(() => {
          cy.get("tr").should("have.length", 1);
          cy.get("th").should("have.length", 4);
          cy.get("th").eq(0).contains("Product");
          cy.get("th").eq(1).contains("Net weight on arrival (optional)");
          cy.get("th").eq(2).contains("Fishery product weight (optional)");
          cy.get("th").eq(3).should("exist");
        });
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(3).find("button").eq(0).contains("Edit").click({ force: true });
            });
        });
      });
    });

    cy.url().should("include", `create-storage-document/${documentNumber}/add-product-to-this-consignment`);
  });

  it("should remove catch", () => {
    cy.url().should("include", storageDocumentUrl);
    cy.findByRole("heading", { name: "Check and confirm your consignment weight", level: 1 });
    cy.get("#sdProductSummaryGuidanceMessage").contains(
      "If the product weight has changed or remained the same since storage, confirm the details below."
    );
    cy.get("[data-tab-id='storageArrivalTab']").click();
    cy.get(".govuk-tabs__tab").contains("Storage arrival");
    cy.get("#storage-arrival-tab").within(() => {
      cy.get("table").within(() => {
        cy.get("thead").within(() => {
          cy.get("tr").should("have.length", 1);
          cy.get("th").should("have.length", 4);
          cy.get("th").eq(0).contains("Product");
          cy.get("th").eq(1).contains("Net weight on arrival (optional)");
          cy.get("th").eq(2).contains("Fishery product weight (optional)");
          cy.get("th").eq(3).should("exist");
        });
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(3).find("button").eq(1).contains("Remove").click({ force: true });
            });
        });
      });
    });

    cy.url().should("include", storageDocumentUrl);
  });
});

describe("Storage document departure summary: arrival tab with one catch", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryCatchesSingleCatch,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
  });
  it("should not have remove button in arrival tab with one product", () => {
    cy.url().should("include", storageDocumentUrl);
    cy.wait(500);
    cy.get("[data-tab-id='storageArrivalTab']").click();
    cy.get(".govuk-tabs__tab").contains("Storage arrival");
    cy.get("#storage-arrival-tab").within(() => {
      cy.get("table").within(() => {
        cy.get("thead").within(() => {
          cy.get("tr").should("have.length", 1);
          cy.get("th").should("have.length", 4);
          cy.get("th").eq(0).contains("Product");
          cy.get("th").eq(1).contains("Net weight on arrival (optional)");
          cy.get("th").eq(2).contains("Fishery product weight (optional)");
          cy.get("th").eq(3).should("exist");
        });
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 1);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(3).find("button").contains("Remove").should("not.exist");
            });
        });
      });
    });
  });
});

describe("Storage document departure summary: departure tab", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryCatches,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
  });
  it("loads the page with catches", () => {
    cy.url().should("include", storageDocumentUrl);
    cy.findByRole("heading", { name: "Check and confirm your consignment weight", level: 1 });
    cy.get("#sdProductSummaryGuidanceMessage").contains(
      "If the product weight has changed or remained the same since storage, confirm the details below."
    );
    cy.get("[data-tab-id='storageDepartureTab']").click({ force: true });
    cy.get(".govuk-tabs__tab").contains("Storage departure");
    cy.get("#storage-departure-tab").within(() => {
      cy.findByRole("heading", { name: "Storage departure", level: 2 });
      cy.get("table").within(() => {
        cy.get("thead").within(() => {
          cy.get("tr").should("have.length", 1);
          cy.get("th").should("have.length", 4);
          cy.get("th").eq(0).contains("Product");
          cy.get("th").eq(1).contains("Net weight on departure (optional)");
          cy.get("th").eq(2).contains("Fishery product weight (optional)");
          cy.get("th").eq(3).should("exist");
        });
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(0).contains("Golden damselfish (ADH)");
              cy.get("td").eq(1).find("input").should("have.value", "100");
              cy.get("td").eq(2).find("input").should("have.value", "100");

              cy.get("td").eq(3).should("exist");
            });
          cy.get("tr")
            .eq(1)
            .within(() => {
              cy.get("td").eq(0).contains("Peacock sole (ADJ)");
              cy.get("td").eq(1).find("input").should("have.value", "50");
              cy.get("td").eq(2).find("input").should("have.value", "50");

              cy.get("td").eq(3).should("exist");
            });
        });
      });
    });
  });

  it("loads the page with catches and save weight", () => {
    cy.get("#storage-departure-tab").within(() => {
      cy.get("table").within(() => {
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(1).find("input").type("20");
            });
        });
      });
    });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/progress");
  });

  it("loads the page with catches and save wrong weight", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryCatchesInvalidWeightSave,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.get("#storage-departure-tab").within(() => {
      cy.get("table").within(() => {
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(1).find("input").type("-1");
            });
        });
      });
    });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
  });

  it("loads the page with catches and save wrong weight", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryCatchesInvalidWeightSave,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.get("#storage-departure-tab").within(() => {
      cy.get("table").within(() => {
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(1).find("input").type("-1");
            });
        });
      });
    });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
  });

  it("should render the  save as draft button", () => {
    cy.findByRole("button", { name: "Save as draft" });
    cy.get("#saveAsDraft").click({ force: true });
    cy.url().should("include", "/create-storage-document");
  });

  it("should render the  save as draft button", () => {
    cy.get("#backToProgress").click({ force: true });
    cy.url().should("include", "/progress");
  });
});

describe("Storage document departure summary: tab with empty departure and load arrival weight ", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryCatchesEmptyWeights,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
  });
  it("loads the page with catches", () => {
    cy.url().should("include", storageDocumentUrl);
    cy.findByRole("heading", { name: "Check and confirm your consignment weight", level: 1 });
    cy.get("#sdProductSummaryGuidanceMessage").contains(
      "If the product weight has changed or remained the same since storage, confirm the details below."
    );
    cy.get("[data-tab-id='storageDepartureTab']").click({ force: true });
    cy.get(".govuk-tabs__tab").contains("Storage departure");
    cy.get("#storage-departure-tab").within(() => {
      cy.findByRole("heading", { name: "Storage departure", level: 2 });
      cy.get("table").within(() => {
        cy.get("thead").within(() => {
          cy.get("tr").should("have.length", 1);
          cy.get("th").should("have.length", 4);
          cy.get("th").eq(0).contains("Product");
          cy.get("th").eq(1).contains("Net weight on departure (optional)");
          cy.get("th").eq(2).contains("Fishery product weight (optional)");
          cy.get("th").eq(3).should("exist");
        });
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(0).contains("Golden damselfish (ADH)");
              cy.get("td").eq(1).find("input").should("have.value", "100");
              cy.get("td").eq(2).find("input").should("have.value", "100");

              cy.get("td").eq(3).should("exist");
            });
          cy.get("tr")
            .eq(1)
            .within(() => {
              cy.get("td").eq(0).contains("Peacock sole (ADJ)");
              cy.get("td").eq(1).find("input").should("have.value", "50");
              cy.get("td").eq(2).find("input").should("have.value", "50");

              cy.get("td").eq(3).should("exist");
            });
        });
      });
    });
  });

  it("loads the page with catches and save weight", () => {
    cy.get("#storage-departure-tab").within(() => {
      cy.get("table").within(() => {
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(1).find("input").type("20");
            });
        });
      });
    });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
    cy.url().should("include", "/progress");
  });

  it("loads the page with catches and save wrong weight", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryCatchesInvalidWeightSave,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.get("#storage-departure-tab").within(() => {
      cy.get("table").within(() => {
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(1).find("input").type("-1");
            });
        });
      });
    });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
  });

  it("loads the page with catches and save wrong weight", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDDepartureSummaryCatchesInvalidWeightSave,
    };
    cy.visit(storageDocumentUrl, { qs: { ...testParams } });
    cy.get("#storage-departure-tab").within(() => {
      cy.get("table").within(() => {
        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);
          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(1).find("input").type("-1");
            });
        });
      });
    });
    cy.get("[data-testid=save-and-continue]").click({ force: true });
  });

  it("should render the  save as draft button", () => {
    cy.findByRole("button", { name: "Save as draft" });
    cy.get("#saveAsDraft").click({ force: true });
    cy.url().should("include", "/create-storage-document");
  });

  it("should render the  save as draft button", () => {
    cy.get("#backToProgress").click({ force: true });
    cy.url().should("include", "/progress");
  });
});
