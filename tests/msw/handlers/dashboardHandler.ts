import { rest } from "msw";
import {
  createDocumentUrl,
  mockGetAllDocumentsUrl,
  LANDINGS_TYPE_URL,
  NOTIFICATION_URL,
  mockGetIdmUserDetails,
} from "~/urls.server";
import { type ITestHandler, TestCaseId, type Journey } from "~/types";

import ccDashboard from "@/fixtures/dashboardApi/catchCertificateDashboard.json";
import ccCopyDashboard from "@/fixtures/dashboardApi/catchCertificateCopyDashboard.json";
import ccDashboardNoCompleted from "@/fixtures/dashboardApi/catchCertificateNoCompleted.json";
import directLandingLandingsType from "@/fixtures/landingsTypeApi/directLanding.json";
import notification from "@/fixtures/dashboardApi/notification.json";

const dashboardHandler: ITestHandler = {
  [TestCaseId.CCDashboard]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
  ],
  [TestCaseId.CCCopyDashboard]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccCopyDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
  ],
  [TestCaseId.CCDashboardNoCompleted]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboardNoCompleted))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
  ],
  [TestCaseId.CCDashboardUserDetails]: (journey: Journey) => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json({ inProgress: [], completed: [] }))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.post(createDocumentUrl(journey), (req, res, ctx) =>
      res(ctx.json({ documentNumber: "GBR-2022-CC-0123456789" }))
    ),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
  ],
  [TestCaseId.CCDashboardAdminLogin]: (journey: Journey) => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json({ inProgress: [], completed: [] }))),
    rest.get(mockGetIdmUserDetails, (req, res, ctx) => res(ctx.json({}))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.post(createDocumentUrl(journey), (req, res, ctx) => res(ctx.status(403))),
  ],
};

export default dashboardHandler;
