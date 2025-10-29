import { rest } from "msw";
import {
  CHECK_ADDITIONAL_TYPES_URL,
  GET_TRANSPORTATIONS_URL,
  getProgressUrl,
  getTransportDetailsUrl,
  LANDINGS_TYPE_URL,
  mockGetAllDocumentsUrl,
  mockGetTransportByIdUrl,
  mockTransportDetailsUrl,
  NOTIFICATION_URL,
} from "~/urls.server";
import { type ITestHandler, TestCaseId } from "~/types";
import notification from "@/fixtures/dashboardApi/notification.json";
import ccDashboard from "@/fixtures/dashboardApi/catchCertificateDashboard.json";
import transportCheck from "@/fixtures/transportationApi/transportCheck.json";
import transportCheckError from "@/fixtures/transportationApi/transportCheckError.json";
import empty from "@/fixtures/empty.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import uploadEntryLandingsType from "@/fixtures/landingsTypeApi/uploadEntry.json";
import progressIncomplete from "@/fixtures/progressApi/ccIncomplete.json";
import truckTransportDetails from "@/fixtures/transportDetailsApi/truck.json";
import transportations from "@/fixtures/transportationApi/transportations.json";

const addTransportationAdditionalTypesCheckHandler: ITestHandler = {
  [TestCaseId.DoYouHaveAdditionalTransportTypes]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.json(transportCheck))),
    rest.post(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.json(transportCheck))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(transportations))),
    rest.delete(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
  ],
  [TestCaseId.DoYouHaveAdditionalTransportTypesEmpty]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
  ],
  [TestCaseId.DoYouHaveAdditionalTransportTypesEmptyTransport]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([{ vehicle: "truck" }]))),
    rest.get(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.json(transportCheck))),
  ],
  [TestCaseId.DoYouHaveAdditionalTransportTypesYes]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.json(transportCheck))),
    rest.post(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.json(transportCheck))),
  ],
  [TestCaseId.DoYouHaveAdditionalTransportTypesNo]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressIncomplete))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.json(transportCheck))),
    rest.post(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.json({ addTransportation: "no" }))),
  ],
  [TestCaseId.DoYouHaveAdditionalTransportTypesSaveFailsWithError]: () => [
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.json(transportCheck))),
    rest.post(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(transportCheckError))),
  ],
  [TestCaseId.DoYouHaveAdditionalTransportTypesSaveFailsWith403]: () => [
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.json(transportCheck))),
    rest.post(CHECK_ADDITIONAL_TYPES_URL, (req, res, ctx) => res(ctx.status(403), ctx.json({}))),
  ],
};

export default addTransportationAdditionalTypesCheckHandler;
