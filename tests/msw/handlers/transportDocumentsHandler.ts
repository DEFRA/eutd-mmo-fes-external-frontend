import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  mockTransportDetailsUrl,
  mockGetTransportByIdUrl,
  mockGetAllDocumentsUrl,
  NOTIFICATION_URL,
  GET_TRANSPORTATIONS_URL,
  mockUpdateTransportDocumentsByIdUrl,
} from "~/urls.server";
import notification from "@/fixtures/dashboardApi/notification.json";
import ccDashboard from "@/fixtures/dashboardApi/catchCertificateDashboard.json";
import catchCertificateTrain from "@/fixtures/transportDetailsApi/catchCertificateTrain.json";
import transportations from "@/fixtures/transportationApi/transportations.json";
import catchCertificateTruckTransportAllowedDetails from "@/fixtures/transportDetailsApi/catchCertificateTruckAllowed.json";
import planeTranportAllowedDetails from "@/fixtures/transportDetailsApi/plane.json";
import catchCertificateContainerVesselTransportAllowedDetails from "@/fixtures/transportDetailsApi/catchCertificateContainerVessel.json";
import catchCertificatePlaneTransportAllowedDetails from "@/fixtures/transportDetailsApi/catchCertificatePlane.json";
import truckTransportAllowedDetails from "@/fixtures/transportDetailsApi/truckAllowed.json";
import planeTransportAllowedDetails from "@/fixtures/transportDetailsApi/planeAllowed.json";
import containerVesselTransportAllowedDetails from "@/fixtures/transportDetailsApi/containerVessel.json";
import catchCertificateDocumentsError from "@/fixtures/transportDetailsApi/catchCertificateDocumentsError.json";
import catchCertificateAdditionalTruckDocument from "@/fixtures/transportDetailsApi/catchCertificateTruckDocument.json";
import catchCertificateAdditionalTrainDocument from "@/fixtures/transportDetailsApi/catchCertificateTrainDocument.json";
import catchCertificateAdditionalPlaneDocument from "@/fixtures/transportDetailsApi/catchCertificatePlaneDocument.json";
import catchCertificateAdditionalContainerVesselDocument from "@/fixtures/transportDetailsApi/catchCertificateContainerVesselDocument.json";

const transportDetailsHandler: ITestHandler = {
  [TestCaseId.TruckTransportDocuments]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.TruckTransportDocumentsFailsWith403]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) => res(ctx.status(403))),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.TruckTransportDocumentsErrors]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.TruckTransportDocumentsOptionalError]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ documents: "error.documents.array.min" }))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(200), ctx.json({ documents: [] }))
    ),
  ],
  [TestCaseId.TruckTransportDocumentsSave]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.ContainerVesselTransportDocuments]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(containerVesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(ctx.json(catchCertificateContainerVesselTransportAllowedDetails))
    ),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.ContainerVesselTransportDocumentsFailsWith403]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) =>
      res(ctx.json(catchCertificateContainerVesselTransportAllowedDetails))
    ),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(ctx.json(catchCertificateContainerVesselTransportAllowedDetails))
    ),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) => res(ctx.status(403))),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.ContainerVesselTransportDocumentsErrors]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(ctx.json(catchCertificateContainerVesselTransportAllowedDetails))
    ),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.ContainerVesselTransportDocumentsOptionalError]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(containerVesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(ctx.json(catchCertificateContainerVesselTransportAllowedDetails))
    ),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ documents: "error.documents.array.min" }))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(200), ctx.json({ documents: [] }))
    ),
  ],
  [TestCaseId.ContainerVesselTransportDocumentsSave]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(containerVesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(ctx.json(catchCertificateContainerVesselTransportAllowedDetails))
    ),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.PlaneTransportDocuments]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTranportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlaneTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.PlaneTransportDocumentsFailsWith403]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlaneTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlaneTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) => res(ctx.status(403))),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.PlaneTransportDocumentsErrors]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlaneTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.PlaneTransportDocumentsOptionalError]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlaneTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ documents: "error.documents.array.min" }))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(200), ctx.json({ documents: [] }))
    ),
  ],
  [TestCaseId.PlaneTransportDocumentsSave]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlaneTransportAllowedDetails))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.TrainTransportDocuments]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.TrainTransportDocumentsFailsWith403]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) => res(ctx.status(403))),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.TrainTransportDocumentsErrors]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.TrainTransportDocumentsOptionalError]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ documents: "error.documents.array.min" }))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.status(200), ctx.json({ documents: [] }))
    ),
  ],
  [TestCaseId.TrainTransportDocumentsSave]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateDocumentsError))
    ),
  ],
  [TestCaseId.TruckTransportDocumentsAddAnotherDocument]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateAdditionalTruckDocument))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalTruckDocument))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalTruckDocument))
    ),
  ],
  [TestCaseId.TrainTransportDocumentsAddAnotherDocument]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateAdditionalTrainDocument))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalTrainDocument))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalTrainDocument))
    ),
  ],
  [TestCaseId.PlaneTransportDocumentsAddAnotherDocument]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateAdditionalPlaneDocument))),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalPlaneDocument))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalPlaneDocument))
    ),
  ],
  [TestCaseId.ContainerVesselTransportDocumentsAddAnotherDocument]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDashboard))),
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.json(notification))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json(transportations))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(containerVesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalContainerVesselDocument))
    ),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalContainerVesselDocument))
    ),
    rest.put(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalContainerVesselDocument))
    ),
    rest.post(mockUpdateTransportDocumentsByIdUrl("0"), (req, res, ctx) =>
      res(ctx.json(catchCertificateAdditionalContainerVesselDocument))
    ),
  ],
};

export default transportDetailsHandler;
