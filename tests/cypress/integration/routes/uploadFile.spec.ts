import { TestCaseId, type ITestParams } from "~/types";
import "cypress-file-upload";
const certificateUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
const uploadFileUrl = `${certificateUrl}/upload-file`;

describe("Upload File Page", () => {
  it("should render upload file page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsEmptyRows,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/add-exporter-details`);

    cy.get(".govuk-heading-xl").contains("Upload products and landings");

    cy.contains("a", "upload guidance")
      .should("be.visible")
      .should("have.attr", "href", "/create-catch-certificate/GBR-2021-CC-8EEB7E123/upload-guidance");
    cy.contains("a", "product favourites")
      .should("be.visible")
      .should("have.attr", "href", "/create-catch-certificate/GBR-2021-CC-8EEB7E123/product-favourites");
  });
});

describe("Upload File Page Upload", () => {
  it("should not display a notification when rows are empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsEmptyRows,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("form").submit();
    cy.get(".govuk-notification-banner.govuk-notification-banner--success").should("not.exist");
    cy.get(".govuk-notification-banner__heading").should("not.exist");
  });

  it("should not display a notification when response is undefined", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsUndefined,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("form").submit();
    cy.get(".govuk-notification-banner.govuk-notification-banner--success").should("not.exist");
    cy.get(".govuk-notification-banner__heading").should("not.exist");
  });

  it("should display a error summary for an upload file error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsFileError,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("form").submit();
    cy.url().should("include", "/upload-file");
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get("a").contains("The selected file is empty");
    cy.get(".govuk-error-message").contains("The selected file is empty");
  });

  it("should attempt to upload a .csv file", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsSuccess,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("form").submit();
    cy.get(".govuk-notification-banner__heading").contains("3 out of 3 rows uploaded successfully");
  });

  it("should render summary information for valid uploaded landings", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsSuccess,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("form").submit();
    cy.get('[data-testid="PRD765"]').should("have.length", 3);
    // check row 1 details
    cy.get('[data-testid="PRD765"]').eq(0).children("td").eq(0).should("have.text", "1");
    cy.get('[data-testid="PRD765"]')
      .eq(0)
      .children("td")
      .eq(1)
      .should("have.text", "PRD765,10/10/2020,FAO18,PH1100,100");
    cy.get('[data-testid="PRD765"]')
      .eq(0)
      .children("td")
      .eq(2)
      .should("contain.html", "<strong>Product:</strong> Beaked redfish (REB), Fresh, Filleted and skinned, 03044950");
    cy.get('[data-testid="PRD765"]')
      .eq(0)
      .children("td")
      .eq(2)
      .should("contain.html", "<strong>Landing:</strong> 10/10/2020, FAO18, WIRON 5 (PH1100)");
    cy.get('[data-testid="PRD765"]')
      .eq(0)
      .children("td")
      .eq(2)
      .should("contain.html", "<strong>Export weight:</strong> 100");
    // check row 2 details
    cy.get('[data-testid="PRD765"]').eq(1).children("td").eq(0).should("have.text", "2");
    cy.get('[data-testid="PRD765"]')
      .eq(1)
      .children("td")
      .eq(1)
      .should("have.text", "PRD765,10/10/2020,FAO18,PH1100,100");
    cy.get('[data-testid="PRD765"]')
      .eq(1)
      .children("td")
      .eq(2)
      .should("contain.html", "<strong>Product:</strong> Beaked redfish (REB), Fresh, Filleted and skinned, 03044950");
    cy.get('[data-testid="PRD765"]')
      .eq(1)
      .children("td")
      .eq(2)
      .should("contain.html", "<strong>Landing:</strong> 10/10/2020, FAO18, WIRON 5 (PH1100)");
    cy.get('[data-testid="PRD765"]')
      .eq(1)
      .children("td")
      .eq(2)
      .should("contain.html", "<strong>Export weight:</strong> 100");
    // check row 3 details (includes optional fields)
    cy.get('[data-testid="PRD765"]').eq(2).children("td").eq(0).should("have.text", "3");
    cy.get('[data-testid="PRD765"]')
      .eq(2)
      .children("td")
      .eq(1)
      .should("have.text", "PRD765,10/10/2020,10/10/2020,FAO18,Yes,GBR,IOTC,PH1100,PS,100");
    cy.get('[data-testid="PRD765"]')
      .eq(2)
      .children("td")
      .eq(2)
      .should("contain.html", "<strong>Product:</strong> Beaked redfish (REB), Fresh, Filleted and skinned, 03044950");
    cy.get('[data-testid="PRD765"]')
      .eq(2)
      .children("td")
      .eq(2)
      .should(
        "contain.html",
        "<strong>Landing:</strong> 10/10/2020,10/10/2020, FAO18, Yes, GBR, IOTC, WIRON 5 (PH1100), PS"
      );
    cy.get('[data-testid="PRD765"]')
      .eq(2)
      .children("td")
      .eq(2)
      .should("contain.html", "<strong>Export weight:</strong> 100");
  });

  it("should attempt to upload a .csv file but fail to upload any rows", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsError,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("form").submit();
    cy.get(".govuk-notification-banner__heading").contains("0 out of 2 rows uploaded successfully");
  });

  it("should attempt to upload a .csv file but fail because of a fobidden response", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsForbidden,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("[data-testid=upload").click({ force: true });
    cy.url().should("include", "/forbidden");
    cy.get("h1").contains("Forbidden");
  });

  it("should not allow access to this page for a landing entry type of direct landing", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsDirectLanding,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
    cy.get("h1").contains("Forbidden");
  });

  it("should not allow access to this page for a landing entry type of unauthorised", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsDirectLanding,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.url().should("include", "/forbidden");
    cy.get("h1").contains("Forbidden");
  });
});

describe("Upload File Page Upload - date errors", () => {
  it("should display an error for a upload with a missing date landed", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadMissingDateLanded,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("Date landed is missing");
    cy.get("#row-1-PRD765-1-upload-file-error").contains("Date landed must be a real date");
    cy.get("#row-1-PRD765-2-upload-file-error").contains("Enter a valid date landed");
    cy.get("#row-1-PRD765-3-upload-file-error").contains("Date landed can be no more than 7 days in the future");
  });
});

describe("Upload File Page Upload - export weight errors", () => {
  it("should display an error for a upload with a missing export weight", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadMissingExportWeight,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("Export weight is missing");
    cy.get("#row-1-PRD765-1-upload-file-error").contains(
      "Enter the export weight as a number with a maximum of 2 decimal places"
    );
    cy.get("#row-1-PRD765-2-upload-file-error").contains("Enter the export weight as a number greater than 0");
  });
});

describe("Upload File Page Upload - High Seas Area errors", () => {
  it("should display an error for a upload with a invalid high seas area", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadInvalidHighSeasArea,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("FAO High seas area invalid");
  });
});

describe("Upload File Page Upload - EEZ errors", () => {
  it("should display an error for a upload with a unknown EEZ", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadUnknownEEZ,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("EEZ does not exist");
  });
  it("should display an error for a upload with a invalid EEZ", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadInvalidEEZ,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("EEZ does not exist");
  });
});

describe("Upload File Page Upload - RFMO errors", () => {
  it("should display an error for a upload with a unknown rfmo", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadUnknownRFMO,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("RFMO does not exist");
  });
});

describe("Upload File Page Upload - vesselPLN errors", () => {
  it("should display an error for a upload with a missing vessel pln", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadMissingVesselPln,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("Vessel PLN is missing");
  });

  it("should display an error for a upload with an unknown vessel pln", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadMissingVesselPln,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-1-upload-file-error").contains("Vessel PLN does not exist");
  });

  it("should display an error for a upload with an invalid vessel pln", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadInvalidVesselPln,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("Date landed must correspond to when the vessel was licensed");
  });

  describe("Welsh translations", () => {
    it("should display an error for a upload with a missing vessel pln", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCUploadMissingVesselPln,
        lng: "cy",
      };

      cy.visit(uploadFileUrl, { qs: { ...testParams } });
      cy.get("[data-testid=upload").click({ force: true });
      cy.get("#row-1-PRD765-0-upload-file-error").contains("Mae PLN y cwch ar goll");
    });

    it("should display an error for a upload with an unknown vessel pln", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCUploadMissingVesselPln,
        lng: "cy",
      };

      cy.visit(uploadFileUrl, { qs: { ...testParams } });
      cy.get("[data-testid=upload").click({ force: true });
      cy.get("#row-1-PRD765-1-upload-file-error").contains("Nid yw PLN y llong neu’r cwch yn bodoli");
    });

    it("should display an error for a upload with an unlicensed vessel pln", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.CCUploadInvalidVesselPln,
        lng: "cy",
      };

      cy.visit(uploadFileUrl, { qs: { ...testParams } });
      cy.get("[data-testid=upload").click({ force: true });
      cy.get("#row-1-PRD765-0-upload-file-error").contains(
        "Rhaid i’r dyddiad glanio gyfateb i’r adeg y cafodd y cwch ei drwyddedu"
      );
    });
  });
});

describe("Upload File Page Upload - product errors", () => {
  it("should display product errors for an upload with product errors", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadProductErrors,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD-UNKNOWN-0-upload-file-error").contains("Product ID is missing");
    cy.get("#row-1-PRD-UNKNOWN-1-upload-file-error").contains("Product ID does not exist");
    cy.get("#row-1-PRD-UNKNOWN-2-upload-file-error").contains(
      "Product ID is no longer valid and has been removed. You will need to create a new product favourite and ID"
    );
    cy.get("#row-1-PRD-UNKNOWN-3-upload-file-error").contains(
      "Atlantic cod (COD) was subject to fishing restrictions on your specified Landing date. Please refer to GOV.UK for further guidance."
    );
  });
});

describe("Upload File Page Upload - gearCode errors", () => {
  it("should display the same error for invalid / missing gear codes", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadGearCodeErrors,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("Gear type does not exist");
    cy.get("#row-1-PRD765-1-upload-file-error").contains("Gear type does not exist");
  });

  it("should display the same error for invalid / missing gear codes in Welsh", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadGearCodeErrors,
      lng: "cy",
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("[data-testid=upload").click({ force: true });
    cy.get("#row-1-PRD765-0-upload-file-error").contains("Nid yw’r Math o gêr yn bodoli");
    cy.get("#row-1-PRD765-1-upload-file-error").contains("Nid yw’r Math o gêr yn bodoli");
  });
});

describe("Upload File Page Upload - AV scan failure error", () => {
  it("should display an error for a upload that has failed AV scan", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadAvScanErrors,
    };
    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("form").submit();
    cy.url().should("include", "/upload-file");
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get("a").contains(
      "There is a problem with the file upload service. Please try again later or enter your products and landings manually."
    );
    cy.get(".govuk-error-message").contains(
      "There is a problem with the file upload service. Please try again later or enter your products and landings manually."
    );
  });
});

describe("Upload File Page Upload - invalid, inaccessible, corrupt error", () => {
  it("should display an error for a upload that contains corrupted data", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadCorruptFileErrors,
    };
    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get("form").submit();
    cy.url().should("include", "/upload-file");
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get("a").contains(
      "The selected file is invalid. For example, the data could be inaccessible, corrupt, or in the wrong structure."
    );
    cy.get(".govuk-error-message").contains(
      "The selected file is invalid. For example, the data could be inaccessible, corrupt, or in the wrong structure."
    );
  });
});

describe("Upload File Page - clear", () => {
  it("should render with not uploaded rows", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCSaveUploadLandingsClear,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("[data-testid=clear").click({ force: true });

    cy.url().should("include", "/upload");
    cy.get(".govuk-table__cell").should("not.exist");
  });

  it("should render the forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCSaveUploadLandingsClearForbidden,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("[data-testid=clear").click({ force: true });

    cy.url().should("include", "/forbidden");
  });
});

describe("Upload File Page - cancel", () => {
  it("should render the exporter details page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCSaveUploadLandingsClear,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("[data-testid=cancel").click({ force: true });

    cy.url().should("include", "/add-exporter-details");
  });

  it("should render the forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCSaveUploadLandingsClearForbidden,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("[data-testid=cancel").click({ force: true });

    cy.url().should("include", "/forbidden");
  });
});

describe("Upload File Page - save and continue with errors", () => {
  it("should render an error island and file error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCSaveUploadLandingsError,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("[data-testid=continue").click({ force: true });

    cy.url().should("include", "/upload-file");
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get("a").contains("The selected file is empty");
    cy.get("#file-error-message").contains("The selected file is empty");
  });
});

describe("Upload File Page - max row error", () => {
  it("should render an error island and file error ", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsMaxRowsError,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("form").submit();

    cy.url().should("include", "/upload-file");
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get("a").contains("The selected file should contain a maximum of 100 rows");
    cy.get("#file-error-message").contains("The selected file should contain a maximum of 100 rows");
  });
});

describe("Upload File Page - file too large", () => {
  it("should render an error island and file error ", () => {
    const fileContent = `PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100
    PRD769,10/10/2020,FAO18,PH1100,100
    PRD765,10/10/2020,FAO18,PH1100,100`;

    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsFileTooLargeError,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("input[type=file]").selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: "file.txt",
      lastModified: Date.now(),
    });

    cy.get("form").submit();

    cy.url().should("include", "/upload-file");
    cy.get("#error-summary-title").contains("There is a problem");
    cy.get("a").contains("The selected file must be smaller than 10KB");
    cy.get("#file-error-message").contains("The selected file must be smaller than 10KB");
  });
});

describe("Upload File Page - save and continue success", () => {
  it("should render the what are you exporting page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCSaveUploadLandingsSuccess,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("[data-testid=continue").click({ force: true });

    cy.url().should("include", "/what-are-you-exporting");
    cy.get("h1").contains("What are you exporting?");
  });
});

describe("Upload File Page - save and continue forbidden", () => {
  it("should render the forbidden page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCSaveUploadLandingsForbidden,
    };

    cy.visit(uploadFileUrl, { qs: { ...testParams } });

    cy.get("[data-testid=continue").click({ force: true });

    cy.url().should("include", "/forbidden");
    cy.get("h1").contains("Forbidden");
  });
});

describe("Upload File Page -form onChange handler ", () => {
  it("should submit when the onChange handler is called", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.CCUploadLandingsSuccess,
    };
    cy.visit(uploadFileUrl, { qs: { ...testParams } });
    cy.get('[data-testid="productCsvFileUploadInput"]').selectFile("tests/cypress/fixtures/fileUpload.csv");
    cy.get("form").submit();

    cy.get(".govuk-notification-banner.govuk-notification-banner--success").should("exist");
    cy.get(".govuk-notification-banner__heading").should("exist");
    cy.get("#govuk-notification-banner-title").should("exist");
  });
});
