import { type ITestParams, TestCaseId } from "~/types";

const sdPageUrl = "create-storage-document/GBR-2022-SD-F71D98A30/check-your-information";

describe("SD: check-your-information page", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformation,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should contain the required heading", () => {
    cy.contains("dt", "Company name");
    cy.contains("dt", "Company address");
    cy.contains("div", "Consignment item");
    cy.contains("dt", "Species");
    cy.contains("dt", "Commodity code");
    cy.contains("dt", "Entry document issued in the UK");
    cy.contains("dt", "Entry document reference");
    cy.contains("dt", "UK entry: Date");
    cy.contains("dt", "UK entry: Place");
    cy.contains("dt", "UK entry: Transport details");
    cy.contains("dt", "UK entry: Weight on document");
    cy.contains("dt", "Storage facility name");
    cy.contains("dt", "Storage facility address");
    cy.contains("dt", "Transport type");
    cy.contains("dt", "Consignment destination");
    cy.contains("dt", "Point of destination");
  });

  it("should contain the required data", () => {
    cy.contains("dd", "GBR-2023-SD-A46E23603");
    cy.contains("dd", "tesrt");
    cy.contains("dd", "MO, LANCASTER HOUSE, HAMPSHIRE COURT");
    cy.contains("dd", "03011100");
    cy.contains("dd", "3 May 2023");
    cy.contains("dd", "dover");
    cy.contains("dd", "43");
    cy.contains("dd", "10");
    cy.contains("dd", "Calais port");
  });

  it("should contain change links with href", () => {
    cy.get("a")
      .contains("Change")
      .each(($el) => {
        cy.wrap($el).should("have.attr", "href").and("not.be.empty");
      });
  });

  it("should have a change link for each summary row", () => {
    cy.get("a")
      .contains("Change")
      .then(($links) => {
        expect($links.length).to.be.greaterThan(0);
      });
  });
});

describe("SD: check-your-information page mandetory", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationMandatory,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should contain the required heading", () => {
    cy.contains("dt", "Company name");
    cy.contains("dt", "Company address");
    cy.contains("div", "Consignment item");
    cy.contains("dt", "Species");
    cy.contains("dt", "Commodity code");
    cy.contains("dt", "Export weight");
    cy.contains("dt", "Entry document issued in the UK");
    cy.contains("dt", "Entry document reference");
    cy.contains("dt", "UK entry: Date");
    cy.contains("dt", "UK entry: Place");
    cy.contains("dt", "UK entry: Transport details");
    cy.contains("dt", "UK entry: Weight on document");
    cy.contains("dt", "Storage facility name");
    cy.contains("dt", "Storage facility address");
    cy.contains("dt", "Transport type");
    cy.contains("dt", "Consignment destination");
  });

  it("should contain the required data", () => {
    cy.contains("dd", "GBR-2023-SD-A46E23603");
    cy.contains("dd", "tesrt");
    cy.contains("dd", "MO, LANCASTER HOUSE, HAMPSHIRE COURT");
    cy.contains("dd", "03011100");
    cy.contains("dd", "10");
    cy.contains("dd", "20");
    cy.contains("dd", "3 May 2023");
    cy.contains("dd", "dover");
    cy.contains("dd", "43");
    cy.contains("dd", "10");
  });
});

describe("SD: check-your-information page transport", () => {
  it("should render the page with train", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationTrain,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should render the page with plain", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationPlane,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });
  it("should render the page with Truck", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationTruckCmr,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.contains("dd", "Dakota Hill");
  });
});

describe("Check Your Information (Summary) page: document submission", () => {
  it("should redirect user to storage document created page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationValidationSuccess,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=create-sd-button]").click({ force: true });
    cy.url().should("include", "/storage-document-created");
  });
});

describe("Check Your Information (Summary) page: document submission validation error", () => {
  it("should redirect user to storage document created page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationValidationFailure,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });

    cy.get("[data-testid=create-sd-button]").click({ force: true });
    cy.url().should("include", "/check-your-information");
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get("a[href='#validationError'").contains("The document entered is no longer valid");
    cy.get(".govuk-error-message").contains("The document entered is no longer valid");
  });
});

describe("Check Your Information (Summary) page: guard", () => {
  it("should redirect user to the forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationValidationGuard,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/forbidden");
  });

  it("should redirect user to the progress page for an incomplete storage document", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationValidationProgress,
    };

    cy.visit(sdPageUrl, { qs: { ...testParams } });
    cy.url().should("include", "/progress");
  });
});

describe("SD: check-your-information page with issuing country", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformation,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should display issuing country for non-UK certificates", () => {
    // Check that the issuing country field is displayed
    cy.contains("dt", "Issuing country").should("be.visible");

    // Check that the issuing country value is displayed correctly
    cy.contains("dt", "Issuing country").next("dd").should("contain.text", "France");
  });

  it("should not display issuing country for UK certificates", () => {
    // The second catch is UK-issued, so there should be only one issuing country field
    cy.get("dt").contains("Issuing country").should("have.length", 1);
  });

  it("should have change link for issuing country", () => {
    // Check that the change link exists for issuing country
    cy.contains("dt", "Issuing country")
      .nextAll()
      .find("a")
      .contains("Change")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/add-product-to-this-consignment/0");
  });
});

describe("SD: check-your-information page - container numbers for truck departure", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationTruckWithContainers,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should display container identification numbers label", () => {
    cy.contains("dt", "Container identification number").should("be.visible");
  });

  it("should display container numbers values", () => {
    cy.contains("dd", "CONT123, CONT456, CONT789").should("be.visible");
  });

  it("should have change link for container numbers", () => {
    cy.contains("dt", "Container identification number")
      .parent()
      .find("a")
      .contains("Change")
      .should("be.visible")
      .should("have.attr", "href");
  });

  it("should have correct anchor in change link URL", () => {
    cy.contains("dt", "Container identification number")
      .parent()
      .find("a")
      .contains("Change")
      .should("have.attr", "href");
  });
});

describe("SD: check-your-information page - container numbers for train departure", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformationTrainWithContainers,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should display container identification numbers label", () => {
    cy.contains("dt", "Container identification number").should("be.visible");
  });

  it("should display container numbers values", () => {
    cy.contains("dd", "TRAIN001, TRAIN002").should("be.visible");
  });

  it("should have change link for container numbers", () => {
    cy.contains("dt", "Container identification number")
      .parent()
      .find("a")
      .contains("Change")
      .should("be.visible")
      .should("have.attr", "href");
  });

  it("should have correct anchor in change link URL", () => {
    cy.contains("dt", "Container identification number")
      .parent()
      .find("a")
      .contains("Change")
      .should("have.attr", "href");
  });
});

describe("SD: check-your-information page - Point of destination display", () => {
  beforeEach(() => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SDCheckYourInformation,
    };
    cy.visit(sdPageUrl, { qs: { ...testParams } });
  });

  it("should display Point of destination label", () => {
    cy.contains("dt", "Point of destination").should("be.visible");
  });

  it("should display Point of destination value", () => {
    cy.contains("dd", "Calais port").should("be.visible");
  });

  it("should have change link for Point of destination", () => {
    cy.contains("dt", "Point of destination")
      .parent()
      .find("a")
      .contains("Change")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/add-transportation-details-");
  });

  it("should have correct anchor in change link URL for Point of destination", () => {
    cy.contains("dt", "Point of destination")
      .parent()
      .find("a")
      .contains("Change")
      .should("have.attr", "href")
      .and("include", "#pointOfDestination");
  });
});

describe("SD: Point of destination - Edit from check-your-information", () => {
  describe("Truck transport - Point of destination edit flow", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDCheckYourInformationTruckEdit,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });
    });

    it("should navigate to truck transport page when clicking point of destination change link", () => {
      cy.contains("dt", "Point of destination").parent().find("a").contains("Change").click({ force: true });

      cy.url().should("include", "/add-transportation-details-truck");
      cy.url().should("include", "#pointOfDestination");
    });

    it("should pre-populate point of destination field with existing value", () => {
      cy.contains("dt", "Point of destination").parent().find("a").contains("Change").click({ force: true });

      cy.get("#pointOfDestination").should("have.value", "Brussels Central Station");
    });
  });

  describe("Plane transport - Point of destination edit flow", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDCheckYourInformationPlaneEdit,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });
    });

    it("should navigate to plane transport page when clicking point of destination change link", () => {
      cy.contains("dt", "Point of destination").parent().find("a").contains("Change").click({ force: true });

      cy.url().should("include", "/add-transportation-details-plane");
      cy.url().should("include", "#pointOfDestination");
    });

    it("should pre-populate point of destination field with existing value", () => {
      cy.contains("dt", "Point of destination").parent().find("a").contains("Change").click({ force: true });

      cy.get("#pointOfDestination").should("have.value", "Amsterdam Schiphol Airport");
    });
  });

  describe("Train transport - Point of destination edit flow", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDCheckYourInformationTrainEdit,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });
    });

    it("should navigate to train transport page when clicking point of destination change link", () => {
      cy.contains("dt", "Point of destination").parent().find("a").contains("Change").click({ force: true });

      cy.url().should("include", "/add-transportation-details-train");
      cy.url().should("include", "#pointOfDestination");
    });

    it("should pre-populate point of destination field with existing value", () => {
      cy.contains("dt", "Point of destination").parent().find("a").contains("Change").click({ force: true });

      cy.get("#pointOfDestination").should("have.value", "Paris Gare du Nord");
    });
  });

  describe("Container Vessel transport - Point of destination edit flow", () => {
    beforeEach(() => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.SDCheckYourInformationContainerVesselEdit,
      };
      cy.visit(sdPageUrl, { qs: { ...testParams } });
    });

    it("should navigate to container vessel transport page when clicking point of destination change link", () => {
      cy.contains("dt", "Point of destination").parent().find("a").contains("Change").click({ force: true });

      cy.url().should("include", "/add-transportation-details-container-vessel");
      cy.url().should("include", "#pointOfDestination");
    });

    it("should pre-populate point of destination field with existing value", () => {
      cy.contains("dt", "Point of destination").parent().find("a").contains("Change").click({ force: true });

      cy.get("#pointOfDestination").should("have.value", "Rotterdam Port");
    });
  });
});

describe("SD: Point of destination - Field visibility on all transport types", () => {
  const documentNumber = "GBR-2022-SD-F71D98A30";

  it("should display Point of destination field on truck transport page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TruckTransportAllowed,
    };
    cy.visit(`create-storage-document/${documentNumber}/add-transportation-details-truck`, { qs: { ...testParams } });

    cy.contains("label", "Point of destination").should("be.visible");
    cy.get("#pointOfDestination").should("be.visible");
    cy.contains(
      ".govuk-hint",
      "For example, Calais port, Calais-Dunkerque airport or the destination point of the consignment."
    ).should("be.visible");
  });

  it("should display Point of destination field on plane transport page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PlaneTransportAllowed,
    };
    cy.visit(`create-storage-document/${documentNumber}/add-transportation-details-plane`, { qs: { ...testParams } });

    cy.contains("label", "Point of destination").should("be.visible");
    cy.get("#pointOfDestination").should("be.visible");
  });

  it("should display Point of destination field on train transport page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.TrainTransportAllowed,
    };
    cy.visit(`create-storage-document/${documentNumber}/add-transportation-details-train`, { qs: { ...testParams } });

    cy.contains("label", "Point of destination").should("be.visible");
    cy.get("#pointOfDestination").should("be.visible");
  });

  it("should display Point of destination field on container vessel transport page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.ContainerVesselTransportAllowed,
    };
    cy.visit(`create-storage-document/${documentNumber}/add-transportation-details-container-vessel`, {
      qs: { ...testParams },
    });

    cy.contains("label", "Point of destination").should("be.visible");
    cy.get("#pointOfDestination").should("be.visible");
  });
});
