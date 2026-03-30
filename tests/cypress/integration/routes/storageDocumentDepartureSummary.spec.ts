import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2023-SD-97DA962EC";

const getStorageDocumentUrl = (docNumber = documentNumber) =>
  `/create-non-manipulation-document/${docNumber}/departure-product-summary`;

const EN_HEADING = "Check and confirm your consignment weight";
const EN_GUIDANCE = "If the product weight has changed or remained the same since storage, confirm the details below.";

const CY_FISHERY_WEIGHT_ERROR =
  "Ni chaiff pwysau net cynhyrchion pysgodfeydd wrth gyrraedd fod yn fwy na phwysau net y cynhyrchion";

const visitDepartureSummary = (
  testCaseId: TestCaseId,
  options?: {
    lng?: "cy";
    disableScripts?: boolean;
    failOnStatusCode?: boolean;
    docNumber?: string;
  }
) => {
  const { lng, disableScripts, failOnStatusCode, docNumber } = options ?? {};

  const testParams: ITestParams = {
    testCaseId,
    ...(disableScripts ? { disableScripts: true } : {}),
  };

  cy.visit(getStorageDocumentUrl(docNumber), {
    qs: {
      ...testParams,
      ...(lng ? { lng } : {}),
    },
    ...(failOnStatusCode !== undefined ? { failOnStatusCode } : {}),
  });
};

const assertEnglishHeading = () => {
  cy.findByRole("heading", { name: EN_HEADING, level: 1 });
};

const assertAnyHeading = () => {
  cy.findByRole("heading", { level: 1 }).should("be.visible");
};

const clickSaveAndContinue = () => {
  cy.get("[data-testid=save-and-continue]").click();
};

const submitDepartureSummary = (alias = "saveDepartureSummary") => {
  cy.intercept("POST", "**/departure-product-summary**").as(alias);
  clickSaveAndContinue();
  cy.wait(`@${alias}`);
};

const submitDepartureSummaryAndAssertStatus = (alias = "saveDepartureSummary") => {
  cy.intercept("POST", "**/departure-product-summary**").as(alias);
  clickSaveAndContinue();
  cy.wait(`@${alias}`).its("response.statusCode").should("be.oneOf", [200, 400, 422]);
};

const assertErrorSummaryContains = (message: string) => {
  cy.get(".govuk-error-summary").should("be.visible").and("contain.text", message);
};

const openArrivalTab = () => {
  cy.get("[data-tab-id='storageArrivalTab']").click({ force: true });
  cy.get(".govuk-tabs__tab").contains("Storage arrival");
};

const openDepartureTab = () => {
  cy.get("[data-tab-id='storageDepartureTab']").click({ force: true });
  cy.get(".govuk-tabs__tab").contains("Storage departure");
};

const assertArrivalTableHeaders = () => {
  cy.get("thead").within(() => {
    cy.get("tr").should("have.length", 1);
    cy.get("th").should("have.length", 4);
    cy.get("th").eq(0).contains("Product");
    cy.get("th").eq(1).contains("Net weight on arrival");
    cy.get("th").eq(2).contains("Fishery product weight");
    cy.get("th").eq(3).should("exist");
  });
};

const assertDepartureTableHeaders = () => {
  cy.get("thead").within(() => {
    cy.get("tr").should("have.length", 1);
    cy.get("th").should("have.length", 4);
    cy.get("th").eq(0).contains("Product");
    cy.get("th").eq(1).contains("Net weight on departure");
    cy.get("th").eq(2).contains("Fishery product weight");
    cy.get("th").eq(3).should("exist");
  });
};

describe("Storage document departure summary: rendering", () => {
  beforeEach(() => {
    visitDepartureSummary(TestCaseId.SDDepartureSummary);
  });

  it("should render a back link", () => {
    cy.findByRole("link", { name: "Back" }).click();
    cy.url().should(
      "eq",
      `http://localhost:3000/create-non-manipulation-document/${documentNumber}/add-transportation-details-plane`
    );
  });

  it("should render the correct page title", () => {
    cy.title().should(
      "eq",
      "Check and confirm your consignment weight - Create a UK non-manipulation document - GOV.UK"
    );
  });

  it("should render the correct content", () => {
    assertEnglishHeading();
    cy.get("#sdProductSummaryGuidanceMessage").contains(EN_GUIDANCE);
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
    openArrivalTab();
    openDepartureTab();
  });
});

describe("Storage document departure summary: pageguard", () => {
  it("should redirect to the departure transport page", () => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryNoTransport, { failOnStatusCode: false });
    cy.url().should(
      "include",
      `/create-non-manipulation-document/${documentNumber}/how-does-the-consignment-leave-the-uk`
    );
  });

  it("should redirect to the forbidden page", () => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryForbidden, { failOnStatusCode: false });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect to the add product to this consignment page", () => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryNoCatches, { failOnStatusCode: false });
    cy.url().should("include", "/add-product-to-this-consignment");
  });

  it("should redirect to the add product to this consignment page with an empty catch", () => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryEmptyCatches, { failOnStatusCode: false });
    cy.url().should("include", "/add-product-to-this-consignment");
  });
});

describe("Storage document departure summary: arrival tab", () => {
  beforeEach(() => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryCatches, { disableScripts: true });
  });

  it("loads the page with catches", () => {
    assertEnglishHeading();
    cy.get("#sdProductSummaryGuidanceMessage").contains(EN_GUIDANCE);

    openArrivalTab();

    cy.get("#storage-arrival-tab").within(() => {
      cy.findByRole("heading", { name: "Storage arrival", level: 2 });

      cy.get("table").within(() => {
        assertArrivalTableHeaders();

        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);

          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(0).contains("Golden damselfish (ADH)");
              cy.get("td").eq(1).find("input").should("have.value", "100.00");
              cy.get("td").eq(2).find("input").should("have.value", "100.00");
              cy.get("td").eq(3).find("button").eq(0).contains("Edit");
              cy.get("td").eq(3).find("button").eq(1).contains("Remove");
            });

          cy.get("tr")
            .eq(1)
            .within(() => {
              cy.get("td").eq(0).contains("Peacock sole (ADJ)");
              cy.get("td").eq(1).find("input").should("have.value", "50.00");
              cy.get("td").eq(2).find("input").should("have.value", "50.00");
              cy.get("td").eq(3).find("button").eq(0).contains("Edit");
              cy.get("td").eq(3).find("button").eq(1).contains("Remove");
            });
        });
      });
    });
  });

  it("loads the edit page with catches", () => {
    assertEnglishHeading();
    cy.get("#sdProductSummaryGuidanceMessage").contains(EN_GUIDANCE);

    openArrivalTab();

    cy.get("#storage-arrival-tab").within(() => {
      cy.get("table").within(() => {
        assertArrivalTableHeaders();

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

    cy.url().should("include", `create-non-manipulation-document/${documentNumber}/add-product-to-this-consignment`);
  });

  it("should remove catch", () => {
    assertEnglishHeading();
    cy.get("#sdProductSummaryGuidanceMessage").contains(EN_GUIDANCE);

    openArrivalTab();

    cy.get("#storage-arrival-tab").within(() => {
      cy.get("table").within(() => {
        assertArrivalTableHeaders();

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

    cy.url().should("include", getStorageDocumentUrl());
  });
});

describe("Storage document departure summary: arrival tab with one catch", () => {
  beforeEach(() => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryCatchesSingleCatch);
  });

  it("should not have remove button in arrival tab with one product", () => {
    assertEnglishHeading();
    openArrivalTab();

    cy.get("#storage-arrival-tab").within(() => {
      cy.get("table").within(() => {
        assertArrivalTableHeaders();

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
    visitDepartureSummary(TestCaseId.SDDepartureSummaryCatches);
  });

  it("loads the page with catches", () => {
    assertEnglishHeading();
    cy.get("#sdProductSummaryGuidanceMessage").contains(EN_GUIDANCE);

    openDepartureTab();

    cy.get("#storage-departure-tab").within(() => {
      cy.findByRole("heading", { name: "Storage departure", level: 2 });

      cy.get("table").within(() => {
        assertDepartureTableHeaders();

        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);

          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(0).contains("Golden damselfish (ADH)");
              cy.get("td").eq(1).find("input").should("have.value", "100.00");
              cy.get("td").eq(2).find("input").should("have.value", "100.00");
              cy.get("td").eq(3).should("exist");
            });

          cy.get("tr")
            .eq(1)
            .within(() => {
              cy.get("td").eq(0).contains("Peacock sole (ADJ)");
              cy.get("td").eq(1).find("input").should("have.value", "50.00");
              cy.get("td").eq(2).find("input").should("have.value", "50.00");
              cy.get("td").eq(3).should("exist");
            });
        });
      });
    });
  });

  it("loads the page with catches and save weight", () => {
    assertEnglishHeading();

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

    clickSaveAndContinue();
    cy.url().should("include", "/progress");
  });

  it("loads the page with catches and save wrong weight", () => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryCatchesInvalidWeightSave);
    assertEnglishHeading();

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

    clickSaveAndContinue();
  });

  it("should render the save as draft button", () => {
    assertEnglishHeading();
    cy.findByRole("button", { name: "Save as draft" });
    cy.get("#saveAsDraft").click();
    cy.url().should("include", "/create-non-manipulation-document");
  });

  it("should navigate to progress when back to progress is clicked", () => {
    assertEnglishHeading();
    cy.get("#backToProgress").click();
    cy.url().should("include", "/progress");
  });
});

describe("Storage document departure summary: tab with empty departure and load arrival weight", () => {
  beforeEach(() => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryCatchesEmptyWeights);
  });

  it("loads the page with catches", () => {
    assertEnglishHeading();
    cy.get("#sdProductSummaryGuidanceMessage").contains(EN_GUIDANCE);

    openDepartureTab();

    cy.get("#storage-departure-tab").within(() => {
      cy.findByRole("heading", { name: "Storage departure", level: 2 });

      cy.get("table").within(() => {
        assertDepartureTableHeaders();

        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);

          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(0).contains("Golden damselfish (ADH)");
              cy.get("td").eq(1).find("input").should("have.value", "100.00");
              cy.get("td").eq(2).find("input").should("have.value", "100.00");
              cy.get("td").eq(3).should("exist");
            });

          cy.get("tr")
            .eq(1)
            .within(() => {
              cy.get("td").eq(0).contains("Peacock sole (ADJ)");
              cy.get("td").eq(1).find("input").should("have.value", "50.00");
              cy.get("td").eq(2).find("input").should("have.value", "50.00");
              cy.get("td").eq(3).should("exist");
            });
        });
      });
    });
  });

  it("loads the page with catches and save weight", () => {
    assertEnglishHeading();

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

    clickSaveAndContinue();
    cy.url().should("include", "/progress");
  });

  it("loads the page with catches and save wrong weight", () => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryCatchesInvalidWeightSave);
    assertEnglishHeading();

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

    clickSaveAndContinue();
  });

  it("should render the save as draft button", () => {
    assertEnglishHeading();
    cy.findByRole("button", { name: "Save as draft" });
    cy.get("#saveAsDraft").click();
    cy.url().should("include", "/create-non-manipulation-document");
  });

  it("should navigate to progress when back to progress is clicked", () => {
    assertEnglishHeading();
    cy.get("#backToProgress").click();
    cy.url().should("include", "/progress");
  });
});

describe("Storage document departure summary: save as draft with validation errors (FI0-10577)", () => {
  it("should redirect to the NMD dashboard when Save as Draft is clicked with validation errors", () => {
    visitDepartureSummary(TestCaseId.SDDepartureSummarySaveAsDraftWithErrors);
    assertEnglishHeading();
    cy.get("#saveAsDraft").click();
    cy.url().should("include", "/create-non-manipulation-document/non-manipulation-documents");
  });
});

describe("Storage document departure summary: departure weight exceeds arrival weight (FI0-10945)", () => {
  it("should display EN and CY error when the departure weight exceeds the arrival weight", () => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryProductWeightExceedsArrival);
    assertEnglishHeading();
    submitDepartureSummary("savePostEn");
    assertErrorSummaryContains("Departure weight cannot be greater than arrival weight");

    visitDepartureSummary(TestCaseId.SDDepartureSummaryProductWeightExceedsArrival, { lng: "cy" });
    assertAnyHeading();
    submitDepartureSummaryAndAssertStatus("savePostCy");
    assertErrorSummaryContains("Ni chaiff pwysau ymadael fod yn fwy na’r pwysau cyrraedd.");
  });
});

describe("Storage document departure summary: fishery product weight exceeds product weight (FI0-10945)", () => {
  it("should display EN and CY error when the fishery product weight exceeds the product departure weight", () => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryFisheryWeightExceedsProduct);
    assertEnglishHeading();
    submitDepartureSummary("savePostEn");
    assertErrorSummaryContains("Fishery products net weight on arrival cannot exceed the product net weight");

    visitDepartureSummary(TestCaseId.SDDepartureSummaryFisheryWeightExceedsProduct, { lng: "cy" });
    assertAnyHeading();
    submitDepartureSummaryAndAssertStatus("savePostCy");
    assertErrorSummaryContains(CY_FISHERY_WEIGHT_ERROR);
  });
});

describe("Storage document departure summary: departure weights reflect updated arrival weights (FI0-10714)", () => {
  beforeEach(() => {
    visitDepartureSummary(TestCaseId.SDDepartureSummaryCopiedDocUpdatedArrival);
  });

  it("loads the departure tab with updated arrival weights when departure weights have been cleared after editing a copied document", () => {
    assertEnglishHeading();

    openDepartureTab();

    cy.get("#storage-departure-tab").within(() => {
      cy.findByRole("heading", { name: "Storage departure", level: 2 });

      cy.get("table").within(() => {
        assertDepartureTableHeaders();

        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);

          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(0).contains("Golden damselfish (ADH)");
              // Departure should fall back to updated arrival weight (75) not original copied value
              cy.get("td").eq(1).find("input").should("have.value", "75.00");
              cy.get("td").eq(2).find("input").should("have.value", "75.00");
            });

          cy.get("tr")
            .eq(1)
            .within(() => {
              cy.get("td").eq(0).contains("Peacock sole (ADJ)");
              // Departure should fall back to updated arrival weight (35) not original copied value
              cy.get("td").eq(1).find("input").should("have.value", "35.00");
              cy.get("td").eq(2).find("input").should("have.value", "35.00");
            });
        });
      });
    });
  });

  it("loads the arrival tab with the updated arrival weights", () => {
    assertEnglishHeading();

    openArrivalTab();

    cy.get("#storage-arrival-tab").within(() => {
      cy.findByRole("heading", { name: "Storage arrival", level: 2 });

      cy.get("table").within(() => {
        assertArrivalTableHeaders();

        cy.get("tbody").within(() => {
          cy.get("tr").should("have.length", 2);

          cy.get("tr")
            .eq(0)
            .within(() => {
              cy.get("td").eq(0).contains("Golden damselfish (ADH)");
              cy.get("td").eq(1).find("input").should("have.value", "75.00");
              cy.get("td").eq(2).find("input").should("have.value", "75.00");
            });

          cy.get("tr")
            .eq(1)
            .within(() => {
              cy.get("td").eq(0).contains("Peacock sole (ADJ)");
              cy.get("td").eq(1).find("input").should("have.value", "35.00");
              cy.get("td").eq(2).find("input").should("have.value", "35.00");
            });
        });
      });
    });
  });
});
