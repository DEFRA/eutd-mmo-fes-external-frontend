import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { GET_TRANSPORTATIONS_URL, getProgressUrl, getTransportDetailsUrl, LANDINGS_TYPE_URL } from "~/urls.server";

import empty from "@/fixtures/empty.json";
import nullLandingsType from "@/fixtures/landingsTypeApi/null.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import uploadEntryLandingsType from "@/fixtures/landingsTypeApi/uploadEntry.json";
import directLandingLandingsType from "@/fixtures/landingsTypeApi/directLanding.json";
import progressNotStarted from "@/fixtures/progressApi/ccNotStarted.json";
import generatedByContentTrue from "@/fixtures/landingsTypeApi/generatedByContentTrue.json";

const landingsEntryHandler: ITestHandler = {
  [TestCaseId.LandingsTypeNull]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(nullLandingsType))),
  ],
  [TestCaseId.LandingsTypeManualEntry]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressNotStarted))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(empty))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
  ],
  [TestCaseId.LandingsTypeFailsWithErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(nullLandingsType))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          landingsEntryOption: "error.landingsEntryOption.string.base",
        })
      )
    ),
  ],
  [TestCaseId.PostLandingsTypeFailsWith403]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.GetLandingsTypeFailsWith403]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.status(403))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
  ],
  [TestCaseId.LandingsTypeConfirmationCaseOne]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
  ],
  [TestCaseId.LandingsTypeConfirmationCaseTwo]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
  ],
  [TestCaseId.LandingsTypeNoConfirmation]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressNotStarted))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(empty))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
  ],
  [TestCaseId.LandingsTypeNotification]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(generatedByContentTrue))),
    rest.post(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(generatedByContentTrue))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressNotStarted))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(empty))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
  ],
};

export default landingsEntryHandler;
