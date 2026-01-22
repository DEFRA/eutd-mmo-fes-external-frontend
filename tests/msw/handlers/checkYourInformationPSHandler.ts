import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  generatePdf,
  getProgressUrl,
  GET_CLIENT_IP_URL,
  GET_PROCESSING_STATEMENT,
  mockAddExporterDetails,
  mockDocumentUrl,
  mockGetAllDocumentsUrl,
  mockSaveAndValidateDocument,
  SPECIES_URL,
  COUNTRIES_URL,
  MANUAL_EXPORTER_ADDRESS_URL,
} from "~/urls.server";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import processingStatementProductDescriptions from "@/fixtures/processingStatementApi/processingStatementProductDescription.json";
import processingStatementNoProductDescriptions from "@/fixtures/processingStatementApi/processingStatementNoProductDescription.json";
import processingStatementwithCatchType from "@/fixtures/processingStatementApi/processingStatementwithCatchType.json";
import processingStatementBlankOneCatch from "@/fixtures/processingStatementApi/processingStatementBlankOneCatch.json";
import processingStatementHealthCertificateError from "@/fixtures/processingStatementApi/processingStatementwithHealthCertificateError.json";
import processingStatementSummary from "@/fixtures/processingStatementApi/processingStatementSummary.json";
import exporterDetails from "@/fixtures/addExporterDetails/exporterDetails.json";
import exporterDetailsUpdated from "@/fixtures/addExporterDetails/exporterDetailsUpdated.json";
import psDashboard from "@/fixtures/dashboardApi/psDocument.json";
import species from "@/fixtures/referenceDataApi/species.json";
import countries from "@/fixtures/referenceDataApi/countries.json";
import psCreated from "@/fixtures/documentsApi/psCreated.json";
import psProgress from "@/fixtures/progressApi/psIncomplete.json";

const documentNumber = "GBR-2023-PS-DE53D6E7C";

const checkYourInformationPSHandler: ITestHandler = {
  [TestCaseId.PSCheckYourInformation]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.PSCheckYourInformationUpdatedExporter]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetailsUpdated))),
  ],
  [TestCaseId.PSCheckYourInformationPageGuardCase]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatch))),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgress))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.PSCheckYourInformationPageGuardCaseNoExporter]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgress))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json({}))),
  ],
  [TestCaseId.PSCheckYourInformationProductDescriptions]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementProductDescriptions))),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgress))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.PSCheckYourInformationPageGuardProductDescriptions]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementNoProductDescriptions))),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgress))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.PSCheckYourInformationValidationError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(generatePdf("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(processingStatementwithCatchType))
    ),
  ],
  [TestCaseId.PSCheckYourInformationHealthCertificateValidationError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(generatePdf("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(processingStatementHealthCertificateError))
    ),
  ],
  [TestCaseId.PSCheckYourInformationValidationSuccess]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDashboard))),
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json(psCreated))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(generatePdf("processingStatement"), (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          documentNumber,
          uri: "_382462d9-ea63-4125-9e11-bb1bc474d8a1.pdf",
        })
      )
    ),
  ],
  [TestCaseId.PSCheckYourInformationCCUK]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementSummary))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.PSCheckYourInformationUnauthorised]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res.once(ctx.status(403))),
  ],
  [TestCaseId.PSCheckYourInformationChangeProductDetails]: () => {
    let postCallCount = 0;

    const productBeforeChange = {
      ...processingStatement,
      products: [
        {
          id: "GBR-2023-PS-DE53D6E7C-1",
          commodityCode: "03044410",
          description: "Frozen fish fillets - COD",
        },
      ],
      catches: [
        {
          _id: "catch-1",
          productId: "GBR-2023-PS-DE53D6E7C-1",
          species: "Atlantic cod",
          speciesCode: "COD",
          catchCertificateNumber: "GBR-2023-CC-123",
          totalWeightLanded: "100",
          exportWeightBeforeProcessing: "90",
          exportWeightAfterProcessing: "80",
          catchCertificateType: "uk",
        },
      ],
      addAnotherCatch: "No",
    };

    const productAfterChange = {
      ...processingStatement,
      products: [
        {
          id: "GBR-2023-PS-DE53D6E7C-1",
          commodityCode: "03044410",
          description: "Frozen fish fillets - COD Updated",
        },
      ],
      catches: [
        {
          _id: "catch-1",
          productId: "GBR-2023-PS-DE53D6E7C-1",
          species: "Atlantic cod",
          speciesCode: "COD",
          catchCertificateNumber: "GBR-2023-CC-123",
          totalWeightLanded: "100",
          exportWeightBeforeProcessing: "90",
          exportWeightAfterProcessing: "80",
          catchCertificateType: "uk",
        },
      ],
      addAnotherCatch: "No",
    };

    return [
      rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
      rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
      rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
        const response = postCallCount > 0 ? productAfterChange : productBeforeChange;
        return res(ctx.json(response));
      }),
      rest.post(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
        postCallCount++;
        return res(ctx.json(productAfterChange));
      }),
      rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
        res(ctx.json({ validationErrors: [] }))
      ),
      rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    ];
  },
  [TestCaseId.PSCheckYourInformationChangePlantAddress]: () => {
    let postCallCount = 0;

    // Base fixture with all sections complete (including health certificate)
    const addressBeforeChange = {
      ...processingStatement,
      plantAddressOne: "123 Old Street",
      plantTownCity: "London",
      plantPostcode: "SW1A 1AA",
    };

    // Updated address while keeping all other sections complete
    const addressAfterChange = {
      ...processingStatement,
      plantAddressOne: "456",
      plantStreetName: "New Avenue",
      plantTownCity: "Manchester",
      plantPostcode: "M1 1AA",
      plantCountry: "United Kingdom",
    };

    return [
      rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
        const response = postCallCount > 0 ? addressAfterChange : addressBeforeChange;
        return res(ctx.json(response));
      }),
      rest.post(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
        postCallCount++;
        return res(ctx.json(addressAfterChange));
      }),
      rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
        res(ctx.json({ validationErrors: [] }))
      ),
      rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
      rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
      rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.json({}))),
    ];
  },
};

export default checkYourInformationPSHandler;
