import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  getProgressUrl,
  getTransportDetailsUrl,
  CONFIRM_CHANGE_LANDINGS_TYPE_URL,
  LANDINGS_TYPE_URL,
  mockGetAllDocumentsUrl,
  GET_TRANSPORTATIONS_URL,
} from "~/urls.server";

import nullLandingsType from "@/fixtures/landingsTypeApi/null.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import directLandingLandingsType from "@/fixtures/landingsTypeApi/directLanding.json";
import empty from "@/fixtures/empty.json";
import progressNotStarted from "@/fixtures/progressApi/ccNotStarted.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";

const landingsTypeConfirmationHandler: ITestHandler = {
  [TestCaseId.LandingsTypeConfirmationCaseOne]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(CONFIRM_CHANGE_LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.LandingsTypeConfirmationCaseTwo]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(CONFIRM_CHANGE_LANDINGS_TYPE_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          landingsEntryConfirmation: "error.landingsEntryConfirmation.string.empty",
        })
      )
    ),
  ],
  [TestCaseId.LandingsTypeConfirmation]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(CONFIRM_CHANGE_LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressNotStarted))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(empty))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
  ],
  [TestCaseId.LandingsTypeConfirmationPageGuard]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(nullLandingsType))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
  ],
};

export default landingsTypeConfirmationHandler;
