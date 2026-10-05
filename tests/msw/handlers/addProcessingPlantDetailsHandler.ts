import { rest } from "msw";
import isEmpty from "lodash/isEmpty";
import { type ITestHandler, TestCaseId } from "~/types";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import processingStatementError from "@/fixtures/processingStatementApi/processingStatementError.json";
import processingStatementAddPlantAddressError from "@/fixtures/processingStatementApi/processingStatementAddPlantAddressError.json";
import psDocuments from "@/fixtures/dashboardApi/psDocument.json";
import psProgressIncomplete from "@/fixtures/progressApi/psIncomplete.json";
import {
  mockSaveAndValidateDocument,
  GET_PROCESSING_STATEMENT,
  mockGetAllDocumentsUrl,
  mockGetProgress,
} from "~/urls.server";
let isUnauthorised = false;

// Base fixture ships with a saved plantName; strip it to simulate a free-text/no-match plant
// that still needs a processing plant name entered on this page.
const { plantName: _plantName, ...processingStatementWithoutPlantName } = processingStatement;

const processingPlantNameErrorResponse = {
  errors: {
    plantName: "psAddProcessingPlantAddressErrorNullPlantName",
  },
};

const addProcessingPlantDetailsHandler: ITestHandler = {
  [TestCaseId.PSAddProcessingPlantDetails]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsUnauthorised]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res.once(ctx.status(403))),
  ],
  [TestCaseId.PSPostAddProcessingPlantDetails]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsMatchByApproval]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementAddPlantAddressError))
    ),
  ],
  [TestCaseId.PSPostAddConsignmentDetailsError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementError))
    ),
  ],
  [TestCaseId.PSPostAddConsignmentDetailsUnauthorised]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) => res.once(ctx.status(403))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSGetPostAddConsignmentDetailsUnauthorised]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
      if (!isUnauthorised) {
        isUnauthorised = true;
        return res(ctx.json(processingStatement));
      }

      isUnauthorised = false;
      return res.once(ctx.status(403));
    }),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsSaveAsDraftWithErrors]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    // persistent 200 handler must come first so that after setApiMock's forEach-prepend
    // it ends up BEHIND the res.once(400) handler in MSW's stack
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res.once(ctx.status(400), ctx.json(processingStatementError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsSaveAsDraftNoErrors]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsNoPlantName]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithoutPlantName))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), async (req, res, ctx) => {
      const body = await req.json();

      if (isEmpty(body.plantName)) {
        return res(ctx.status(400), ctx.json(processingPlantNameErrorResponse));
      }

      return res(ctx.json({ ...processingStatementWithoutPlantName, ...body }));
    }),
  ],
};

export default addProcessingPlantDetailsHandler;
