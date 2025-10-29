import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { NOTIFICATION_URL, mockGetAllDocumentsUrl } from "~/urls.server";

import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import notification from "@/fixtures/dashboardApi/notification.json";

const pageNotFoundHandler: ITestHandler = {
  [TestCaseId.CatchBoundary]: () => [
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(notification))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
  ],
  [TestCaseId.ErrorBoundary]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.status(400))),
  ],
};

export default pageNotFoundHandler;
