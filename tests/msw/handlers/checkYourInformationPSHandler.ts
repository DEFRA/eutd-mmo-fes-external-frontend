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
};

export default checkYourInformationPSHandler;
