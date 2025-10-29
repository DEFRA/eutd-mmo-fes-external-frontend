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
} from "~/urls.server";

const addProcessingPlantAddressHandler: ITestHandler = {
  [TestCaseId.PSAddProcessingPlantAddress]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(prcessingStatementAddPlantAddress))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
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
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(processingStatementAddPlantAddressError))
    ),
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
};

export default addProcessingPlantAddressHandler;
