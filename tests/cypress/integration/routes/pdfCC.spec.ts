// @ts-nocheck
import { type ITestParams, TestCaseId } from "~/types";

describe("CC: PDF", () => {
  const documentUrlFragment = `export-certificates/_2d89e0c5-58f8-4f34-b96e-806135faa7f7.pdf`;

  it("should throw 404 if the document mode is invalid", () => {
    const invalidDocumentMode = "text";

    cy.request({ url: `/${invalidDocumentMode}/${documentUrlFragment}`, failOnStatusCode: false }).as(
      "url-with-invalid-mode"
    );

    cy.get("@url-with-invalid-mode").should((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it("should return a VOID message if the user is authenticated but the document(mode=pdf) has been voided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PdfCCVoided,
    };

    cy.request({ url: `/pdf/${documentUrlFragment}`, qs: { ...testParams }, failOnStatusCode: false }).as("voided-pdf");

    cy.get("@voided-pdf").should((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain("VOID");
    });
  });

  it("should return a VOID message if the user is authenticated but the document(mode=qr) has been voided", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.PdfCCVoided,
    };

    cy.request({ url: `/qr/${documentUrlFragment}`, qs: { ...testParams }, failOnStatusCode: false }).as("voided-qr");

    cy.get("@voided-qr").should((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain("VOID");
    });
  });

  it("should throw 404 when mode=pdf and journey type is unknown", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.PdfCCFromDifferentCreator };

    cy.request({
      url: `/pdf/${documentUrlFragment}`,
      qs: { ...testParams },
      followRedirect: false,
      failOnStatusCode: false,
    }).as("invalid-pdf");

    cy.get("@invalid-pdf").should((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it("should throw 404 when mode=qr and journey type is unknown", () => {
    const testParams: ITestParams = { testCaseId: TestCaseId.PdfCCFromDifferentCreator };

    cy.request({
      url: `/qr/${documentUrlFragment}`,
      qs: { ...testParams },
      followRedirect: false,
      failOnStatusCode: false,
    }).as("invalid-qr");

    cy.get("@invalid-qr").should((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
