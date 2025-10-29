import { rest } from "msw";
import { mockGetAllDocumentsUrl, mockCreateDocumentUrl, mockGetProgress } from "~/urls.server";
import { type ITestHandler, TestCaseId } from "~/types";
import psDraft from "@/fixtures/dashboardApi/psDrafts.json";
import psCompleted from "@/fixtures/dashboardApi/psComplete.json";
import psDocument from "@/fixtures/dashboardApi/psDocument.json";
import psDraftLimitExceeded from "@/fixtures/dashboardApi/psDraftLimitExceeded.json";
import psProgressIncomplete from "@/fixtures/progressApi/psIncomplete.json";

const processingStatementDashboardHandler: ITestHandler = {
  [TestCaseId.PSLoadDasboardWithCompletedAndInProgress]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
  ],
  [TestCaseId.PSLoadDasboardWithInProgressAndEmptyCompleted]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDraft))),
  ],
  [TestCaseId.PSLoadDasboardWithCompletedAndEmptyInProgress]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psCompleted))),
  ],
  [TestCaseId.PSLoadDashboardMaxDraftLimitReached]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDraftLimitExceeded))),
  ],
  [TestCaseId.PSCreateProcessingStatementSuccess]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.post(mockCreateDocumentUrl, (req, res, ctx) => res(ctx.text("GBR-2022-PS-0123456789"))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSCreateProcessingStatementFailure]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.post(mockCreateDocumentUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
};

export default processingStatementDashboardHandler;
