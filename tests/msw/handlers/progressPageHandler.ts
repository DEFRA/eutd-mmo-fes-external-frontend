import { rest } from "msw";
import { TestCaseId, type ITestHandler } from "~/types";
import {
  getProgressUrl,
  getTransportDetailsUrl,
  LANDINGS_TYPE_URL,
  checkProgressUrl,
  mockGetAllDocumentsUrl,
  GET_CERTIFICATE_SUMMARY,
  mockCheckProgressUrl,
  GET_PROCESSING_STATEMENT,
  mockAddExporterDetails,
  GET_STORAGE_DOCUMENT,
  GET_TRANSPORTATIONS_URL,
} from "~/urls.server";

import uploadEntryLandingsType from "@/fixtures/landingsTypeApi/uploadEntry.json";
import directLandingLandingsType from "@/fixtures/landingsTypeApi/directLanding.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import nullLandingsType from "@/fixtures/landingsTypeApi/null.json";
import progressIncomplete from "@/fixtures/progressApi/ccIncomplete.json";
import psProgressIncomplete from "@/fixtures/progressApi/psIncomplete.json";
import psProgressComplete from "@/fixtures/progressApi/psCompleted.json";
import progressComplete from "@/fixtures/progressApi/ccComplete.json";
import truckTransportDetails from "@/fixtures/transportDetailsApi/truck.json";
import trainTransportDetails from "@/fixtures/transportDetailsApi/train.json";
import containerVesselTransportDetails from "@/fixtures/transportDetailsApi/containerVessel.json";
import planeTransportDetails from "@/fixtures/transportDetailsApi/plane.json";
import checkProgressError from "@/fixtures/progressApi/ccCheckProgressError.json";
import psCheckProgessError from "@/fixtures/progressApi/psCheckProgessError.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import ccDirectLanding from "@/fixtures/ccSummary/ccDirectLanding.json";
import sdProgressIncomplete from "@/fixtures/progressApi/sdIncomplete.json";
import sdProgressComplete from "@/fixtures/progressApi/sdCompleted.json";
import sdCheckProgressError from "@/fixtures/progressApi/sdCheckProgessError.json";
import psDocument from "@/fixtures/dashboardApi/psDocument.json";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import processingStatementNoProducts from "@/fixtures/processingStatementApi/processingStatementNoProducts.json";
import exporterDetails from "@/fixtures/addExporterDetails/exporterDetails.json";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import sdDocuments from "@/fixtures/dashboardApi/sdDocument.json";
import transportations from "@/fixtures/transportationApi/transportations.json";

const progressPageHandler: ITestHandler = {
  [TestCaseId.CCUploadEntryIncompleteProgress]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressIncomplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
    rest.get(checkProgressUrl("catchCertificate"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(checkProgressError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
  ],
  [TestCaseId.PSIncompleteProgress]: () => [
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementNoProducts))),
    rest.get(mockCheckProgressUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(psCheckProgessError))),
  ],
  [TestCaseId.PSCompleteProgress]: () => [
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgressComplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockCheckProgressUrl, (req, res, ctx) => res(ctx.json({}))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.PSCompleteProgressUnauthorised]: () => [
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgressComplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockCheckProgressUrl, (req, res, ctx) => res(ctx.status(403), ctx.json({ unauthorised: true }))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.CCUploadEntryCompleteProgress]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
    rest.get(checkProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.CCDirectLandingCompleteProgress]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
    rest.get(checkProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccDirectLanding))),
  ],
  [TestCaseId.CCManualEntryCompleteProgress]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(planeTransportDetails))),
  ],
  [TestCaseId.CCLandingsTypeNull]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(nullLandingsType))),
  ],
  [TestCaseId.CCLandingsTypeUnauthorised]: () => [rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.status(403)))],
  [TestCaseId.SDIncompleteProgress]: () => [
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(checkProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.status(400), ctx.json(sdCheckProgressError))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
  ],
  [TestCaseId.SDCompleteProgress]: () => [
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressComplete))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
    rest.get(checkProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.status(200), ctx.json({}))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.SDCompleteUnauthorisedProgress]: () => [
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressComplete))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(planeTransportDetails))),
    rest.get(checkProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.status(403), ctx.json({}))),
  ],
  [TestCaseId.SDCompleteTruckProgress]: () => [
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressComplete))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
  ],
  [TestCaseId.SDCompleteTruckCMRProgress]: () => [
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressComplete))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) =>
      res(
        ctx.json({
          cmr: "true",
          vehicle: "truck",
        })
      )
    ),
  ],
  [TestCaseId.SDCompleteTrainProgress]: () => [
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressComplete))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(trainTransportDetails))),
  ],
  [TestCaseId.SDCompleteContainerVesselProgress]: () => [
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressComplete))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(containerVesselTransportDetails))),
  ],
};

export default progressPageHandler;
