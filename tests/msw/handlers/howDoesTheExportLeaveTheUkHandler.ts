import { rest } from "msw";
import {
  mockTransportDetailsUrl,
  LANDINGS_TYPE_URL,
  ADD_TRANSPORT_DETAILS_URL,
  mockGetAllDocumentsUrl,
  getProgressUrl,
  SAVE_TRANSPORT_DETAILS_URL,
  mockGetTransportByIdUrl,
  GET_TRANSPORTATIONS_URL,
  GET_STORAGE_DOCUMENT,
} from "~/urls.server";
import { TestCaseId, type ITestHandler } from "~/types";

import empty from "@/fixtures/empty.json";
import truck from "@/fixtures/transportDetailsApi/truck.json";
import plane from "@/fixtures/transportDetailsApi/plane.json";
import train from "@/fixtures/transportDetailsApi/train.json";
import catchCertificateTruck from "@/fixtures/transportDetailsApi/catchCertificateTruck.json";
import catchCertificatePlane from "@/fixtures/transportDetailsApi/catchCertificatePlane.json";
import catchCertificateTrain from "@/fixtures/transportDetailsApi/catchCertificateTrain.json";
import catchCertificateContainerVessel from "@/fixtures/transportDetailsApi/catchCertificateContainerVessel.json";
import containerVessel from "@/fixtures/transportDetailsApi/containerVessel.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import directLandingLandingsType from "@/fixtures/landingsTypeApi/directLanding.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import progressIncomplete from "@/fixtures/progressApi/ccIncomplete.json";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import sdDrafts from "@/fixtures/dashboardApi/sdDrafts.json";

const howDoesTheExportLeaveTheUkHandler: ITestHandler = {
  [TestCaseId.HowDoesTheExportLeaveNoTransportDetails]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(empty))),
    rest.post(SAVE_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.status(204))),
    rest.post(ADD_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
  ],
  [TestCaseId.HowDoesTheExportLeaveTruck]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truck))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruck))),
    rest.post(SAVE_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.status(204))),
    rest.post(ADD_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.json(catchCertificateTruck))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruck))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
  ],
  [TestCaseId.HowDoesTheExportLeavePlane]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(plane))),
    rest.post(SAVE_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.status(204))),
    rest.post(ADD_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
  ],
  [TestCaseId.HowDoesTheExportLeaveTrain]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(train))),
    rest.post(SAVE_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.status(204))),
    rest.post(ADD_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
  ],
  [TestCaseId.HowDoesTheExportLeaveContainerVessel]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(containerVessel))),
    rest.post(SAVE_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.status(204))),
    rest.post(ADD_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.json(catchCertificateContainerVessel))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateContainerVessel))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
  ],
  [TestCaseId.HowDoesTheExportLeaveDirectLanding]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressIncomplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
  ],
  [TestCaseId.HowDoesTheExportLeaveNoLandingsType]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(empty))),
  ],
  [TestCaseId.SaveTransportFailsWith403]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(empty))),
    rest.post(SAVE_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.status(403))),
    rest.post(ADD_TRANSPORT_DETAILS_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.SaveTransportFailsWithErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(empty))),
    rest.post(SAVE_TRANSPORT_DETAILS_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vehicle: "commonTransportSelectionTypeOfTransportErrorNull",
        })
      )
    ),
    rest.post(ADD_TRANSPORT_DETAILS_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vehicle: "commonTransportSelectionTypeOfTransportErrorNull",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
  ],
};

export default howDoesTheExportLeaveTheUkHandler;
