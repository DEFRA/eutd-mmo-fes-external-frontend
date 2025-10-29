import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  EXPORT_LOCATION_URL,
  LANDINGS_TYPE_URL,
  COUNTRIES_URL,
  EXPORT_LOCATION_DRAFT_URL,
  mockGetAllDocumentsUrl,
  getProgressUrl,
  getTransportDetailsUrl,
  GET_CERTIFICATE_SUMMARY,
  GET_TRANSPORTATIONS_URL,
} from "~/urls.server";
import badRequest from "@/fixtures/whatExportJourneyApi/badRequest.json";
import countries from "@/fixtures/whatExportJourneyApi/countries.json";
import exportLocation from "@/fixtures/whatExportJourneyApi/exportLocation.json";
import progressNotStarted from "@/fixtures/progressApi/ccNotStarted.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import directLanding from "@/fixtures/landingsTypeApi/directLanding.json";
import manualEntry from "@/fixtures/landingsTypeApi/manualEntry.json";
import nullLandingsType from "@/fixtures/landingsTypeApi/null.json";
import ccDirectLanding from "@/fixtures/ccSummary/ccDirectLanding.json";

const whatExportJourneyHandler: ITestHandler = {
  [TestCaseId.WhatExportJourneyDirectLanding]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
  ],

  [TestCaseId.WhatExportJourneyDestination]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
  ],

  [TestCaseId.WhatExportDirectLandingJourneyBadRequest]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(badRequest))),
  ],
  [TestCaseId.WhatExportDestinationBadRequest]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(badRequest))),
  ],
  [TestCaseId.WhatExportDirectLandingJourney403]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.WhatExportDestination403]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.WhatExportDirectLandingJourneyFailsToRenderWith403]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.WhatExportDestinationFailsToRenderWith403]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.WhatExportManualEntryJourneyFailsToRenderWith403]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntry))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.WhatExportDestinationDraft]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(EXPORT_LOCATION_DRAFT_URL, (req, res, ctx) => res(ctx.json(exportLocation))),
  ],
  [TestCaseId.WhatExportJourneyDirectLandingDraft]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),

    rest.post(EXPORT_LOCATION_DRAFT_URL, (req, res, ctx) => res(ctx.json(exportLocation))),
  ],

  [TestCaseId.WhatExportDirectLandingJourneySaveAndContinue]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json(exportLocation))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressNotStarted))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccDirectLanding))),
  ],
  [TestCaseId.WhatExportJourneyDirectLandingNull]: () => [
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json(exportLocation))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressNotStarted))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(nullLandingsType))),
  ],
  [TestCaseId.WhatExportJourneyManualEntry]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntry))),
  ],
  [TestCaseId.WhatExportManualEntryJourneyBadRequest]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntry))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(badRequest))),
  ],
  [TestCaseId.WhatExportManualEntryJourney403]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntry))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.WhatExportJourneyManualEntryDraft]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntry))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),

    rest.post(EXPORT_LOCATION_DRAFT_URL, (req, res, ctx) => res(ctx.json(exportLocation))),
  ],
  [TestCaseId.WhatExportManualEntryJourneySaveAndContinue]: () => [
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json(exportLocation))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntry))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
  ],
  [TestCaseId.WhatExportJourneyManualEntryNull]: () => [
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json(exportLocation))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(nullLandingsType))),
  ],
};
export default whatExportJourneyHandler;
