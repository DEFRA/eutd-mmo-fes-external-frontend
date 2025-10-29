import { rest } from "msw";
import { USER_ATTRIBUTES, mockGetAllDocumentsUrl } from "~/urls.server";
import { type ITestHandler, TestCaseId } from "~/types";

import userAttributes from "@/fixtures/userAttributesApi/getUserAttributes.json";
import ccDashboard from "@/fixtures/dashboardApi/catchCertificateDashboard.json";

const journeyPrivacyPageHandler: ITestHandler = {
  [TestCaseId.PrivacyAccepted]: () => [
    rest.get(USER_ATTRIBUTES, (req, res, ctx) => res(ctx.json(userAttributes))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
  ],
  [TestCaseId.PrivacyEmpty]: () => [
    rest.get(USER_ATTRIBUTES, (req, res, ctx) =>
      res(
        ctx.json([
          {
            name: "accepts_cookies",
            value: "yes",
            modifiedAt: "2025-06-04T11:05:00.934Z",
          },
        ])
      )
    ),
    rest.post(USER_ATTRIBUTES, (req, res, ctx) => res(ctx.status(200), ctx.json(userAttributes))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
  ],
  [TestCaseId.CookiePolicyEmpty]: () => [
    rest.get(USER_ATTRIBUTES, (req, res, ctx) =>
      res(
        ctx.json([
          {
            name: "privacy_statement",
            value: true,
            modifiedAt: "2024-03-27T19:12:42.022Z",
          },
        ])
      )
    ),
    rest.post(USER_ATTRIBUTES, (req, res, ctx) => res(ctx.status(200), ctx.json(userAttributes))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
  ],
};

export default journeyPrivacyPageHandler;
