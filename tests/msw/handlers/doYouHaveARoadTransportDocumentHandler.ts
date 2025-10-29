import { rest } from "msw";
import {
  getProgressUrl,
  mockTransportDetailsUrl,
  LANDINGS_TYPE_URL,
  SAVE_TRUCK_CMR_URL,
  mockGetAllDocumentsUrl,
  mockGetTransportByIdUrl,
  GET_TRANSPORTATIONS_URL,
} from "~/urls.server";
import { TestCaseId, type ITestHandler, type Journey } from "~/types";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import truck from "@/fixtures/transportDetailsApi/truck.json";
import plane from "@/fixtures/transportDetailsApi/plane.json";
import cmrFalse from "@/fixtures/transportDetailsApi/cmrFalse.json";
import directLandingLandingsType from "@/fixtures/landingsTypeApi/directLanding.json";
import progressIncomplete from "@/fixtures/progressApi/ccIncomplete.json";
import empty from "@/fixtures/empty.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import transportations from "@/fixtures/transportationApi/transportations.json";
import catchCertificateTruckTransportAllowedDetails from "@/fixtures/transportDetailsApi/catchCertificateTruckAllowed.json";

const doYouHaveARoadTransportDocumentHandler: ITestHandler = {
  [TestCaseId.DoYouHaveARoadTransportDocument]: (journey: Journey) => [
    // common APIs
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(getProgressUrl(journey), (req, res, ctx) => res(ctx.json(progressIncomplete))),
    // CC-specific journey API calls
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.put(`${mockGetTransportByIdUrl}/cmr`, (_, res, ctx) =>
      res(ctx.json({ ...catchCertificateTruckTransportAllowedDetails, cmr: "true" }))
    ),
    // SD-specific journey API calls
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truck))),
    rest.post(SAVE_TRUCK_CMR_URL, (req, res, ctx) => res(ctx.status(204))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
  ],
  [TestCaseId.DoYouHaveARoadTransportDocumentFalse]: () => [
    // common API calls
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    // CC-specific journey API calls
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.put(`${mockGetTransportByIdUrl}/cmr`, (_, res, ctx) =>
      res(ctx.json({ ...catchCertificateTruckTransportAllowedDetails, cmr: "false" }))
    ),
    // CC-specific journey API calls
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(cmrFalse))),
    rest.post(SAVE_TRUCK_CMR_URL, (req, res, ctx) => res(ctx.status(204))),
  ],
  [TestCaseId.DoYouHaveARoadTransportDocumentNoLandingsType]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
  ],
  [TestCaseId.DoYouHaveARoadTransportDocumentDirectLanding]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressIncomplete))),
  ],
  [TestCaseId.DoYouHaveARoadTransportDocumentPlane]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(plane))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(plane))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressIncomplete))),
  ],
  [TestCaseId.DoYouHaveARoadTransportDocumentSaveFailsWith403]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truck))),
    rest.post(SAVE_TRUCK_CMR_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.DoYouHaveARoadTransportDocumentSaveFailsWithError]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truck))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.put(`${mockGetTransportByIdUrl}/cmr`, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          cmr: "commonRoadTransportDocumentError",
        })
      )
    ),
    rest.post(SAVE_TRUCK_CMR_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          cmr: "commonRoadTransportDocumentError",
        })
      )
    ),
  ],
};

export default doYouHaveARoadTransportDocumentHandler;
