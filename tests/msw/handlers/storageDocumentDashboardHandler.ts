import { rest } from "msw";
import {
  mockGetAllDocumentsUrl,
  mockCreateDocumentUrl,
  mockGetProgress,
  mockTransportDetailsUrl,
  CHECK_COPY_URL,
  NOTIFICATION_URL,
  mockGetIdmUserDetails,
} from "~/urls.server";
import { type ITestHandler, TestCaseId } from "~/types";
import sdDraft from "@/fixtures/dashboardApi/sdDrafts.json";
import sdCompleted from "@/fixtures/dashboardApi/sdComplete.json";
import sdDocument from "@/fixtures/dashboardApi/sdDocument.json";
import sdDraftLimitExceeded from "@/fixtures/dashboardApi/sdDraftLimitExceeded.json";
import sdProgressIncomplete from "@/fixtures/progressApi/sdIncomplete.json";
import truckDetails from "@/fixtures/transportDetailsApi/truck.json";
import notification from "@/fixtures/dashboardApi/notification.json";
import userDetails from "@/fixtures/dynamixApi/userDetails.json";

const storageDocumentDashboardHandler: ITestHandler = {
  [TestCaseId.SDLoadDasboardWithCompletedAndInProgress]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json({ canCopy: true }))),
  ],
  [TestCaseId.SDLoadDasboardWithInProgressAndEmptyCompleted]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDraft))),
  ],
  [TestCaseId.SDLoadDasboardWithCompletedAndEmptyInProgress]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdCompleted))),
  ],
  [TestCaseId.SDLoadDashboardMaxDraftLimitReached]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDraftLimitExceeded))),
  ],
  [TestCaseId.SDCreateProcessingStatementSuccess]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocument))),
    rest.post(mockCreateDocumentUrl, (req, res, ctx) => res(ctx.text("GBR-2022-SD-0123456789"))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
  ],
  [TestCaseId.SDCreateProcessingStatementFailure]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocument))),
    rest.post(mockCreateDocumentUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
  ],
  [TestCaseId.SDDashboardUserDetails]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocument))),
    rest.post(mockCreateDocumentUrl, (req, res, ctx) => res(ctx.text("GBR-2022-SD-0123456789"))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.get(mockGetIdmUserDetails, (req, res, ctx) => res(ctx.json(userDetails))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
  ],
  [TestCaseId.SDDashboardAccountDetails]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocument))),
    rest.post(mockCreateDocumentUrl, (req, res, ctx) => res(ctx.text("GBR-2022-SD-0123456789"))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
  ],
};

export default storageDocumentDashboardHandler;
