import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import prcessingStatementAddPlantAddress from "@/fixtures/processingStatementApi/processingStatementNoAddress.json";
import processingStatementAddPlantNameError from "@/fixtures/processingStatementApi/processingStatementAddPlantNameError.json";
import processingStatementAddPlantAddressError from "@/fixtures/processingStatementApi/processingStatementAddPlantAddressError.json";
import processingStatementInvalidPlantNameError from "@/fixtures/processingStatementApi/processingStatementPlantNameIncorrectError.json";
import processingStatementComplete from "@/fixtures/processingStatementApi/processingStatementComplete.json";
import psProgressIncomplete from "@/fixtures/progressApi/psIncomplete.json";
import psDocument from "@/fixtures/dashboardApi/psDocument.json";
import {
  mockSaveAndValidateDocument,
  getProgressUrl,
  GET_PROCESSING_STATEMENT,
  mockGetAllDocumentsUrl,
  mockGetProgress,
  mockAddExporterDetails,
  mockFindExporterAddressUrl,
  mockValidateExporterAddressUrl,
} from "~/urls.server";
import addressSearchValid from "@/fixtures/referenceDataApi/addressSearchValid.json";
import manualAddressValid from "@/fixtures/referenceDataApi/manualAddressValid.json";
import postcodeEmptyError from "@/fixtures/exporterApi/postcodeEmptyError.json";
import manualAddressErrors from "@/fixtures/exporterApi/manualAddressErrors.json";

const addProcessingPlantAddressHandler: ITestHandler = {
  [TestCaseId.PSAddProcessingPlantAddress]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(prcessingStatementAddPlantAddress))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(prcessingStatementAddPlantAddress))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.json(addressSearchValid))),
    rest.post(mockValidateExporterAddressUrl, (req, res, ctx) => res(ctx.json(manualAddressValid))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementComplete))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantAddressMissingPlantNameError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementAddPlantNameError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSAddProcessingPlantAddressMissingPlantAddressError]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(prcessingStatementAddPlantAddress))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(prcessingStatementAddPlantAddress))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(postcodeEmptyError))),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementAddPlantAddressError))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantAddressInvalidPlantNameError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementInvalidPlantNameError))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantAddressComplete]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementComplete))
    ),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
  ],
  [TestCaseId.PSAddProcessingPlantAddressForbidden]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res.once(ctx.status(403))),
  ],
  [TestCaseId.PSAddProcessingPlantAddressWithExistingAddress]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(processingStatement))),
  ],
  [TestCaseId.PSPSAddProcessingPlantAddressWithErrors]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(prcessingStatementAddPlantAddress))),
    rest.post(mockValidateExporterAddressUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(manualAddressErrors))),
  ],
};

export default addProcessingPlantAddressHandler;
