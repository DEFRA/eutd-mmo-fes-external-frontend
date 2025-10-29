import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  mockTransportDetailsUrl,
  mockGetProgress,
  mockGetAllDocumentsUrl,
  addTransportationDetailsUrl,
  LANDINGS_TYPE_URL,
  mockGetTransportByIdUrl,
  mockPutTransportDetailsByIdUrl,
  GET_TRANSPORTATIONS_URL,
  GET_STORAGE_DOCUMENT,
  mockCountriesUrl,
} from "~/urls.server";
import catchCertificateTruckTransportAllowedDetails from "@/fixtures/transportDetailsApi/catchCertificateTruckAllowed.json";
import catchCertificateTruckTransportDisallowedDetails from "@/fixtures/transportDetailsApi/catchCertificateTruckDisallowed.json";
import trainTransportAllowedDetails from "@/fixtures/transportDetailsApi/trainAllowed.json";
import truckTransportAllowedDetails from "@/fixtures/transportDetailsApi/truckAllowed.json";
import vesselTransportAllowedDetails from "@/fixtures/transportDetailsApi/vesselAllowedDetails.json";
import catchCertificateVessel from "@/fixtures/transportDetailsApi/catchCertificateContainerVessel.json";
import truckTransportDisAllowedDetails from "@/fixtures/transportDetailsApi/truckNotAllowed.json";
import saveVesselContainerDetails from "@/fixtures/transportDetailsApi/saveVesselContainerDetails.json";
import trainNotAllowed from "@/fixtures/transportDetailsApi/trainNotAllowed.json";
import catchCertificateTrain from "@/fixtures/transportDetailsApi/catchCertificateTrain.json";
import saveTrainDetails from "@/fixtures/transportDetailsApi/saveTrainDetails.json";
import saveTruckDetails from "@/fixtures/transportDetailsApi/saveTruckDetails.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import progressComplete from "@/fixtures/progressApi/ccComplete.json";
import countries from "@/fixtures/referenceDataApi/countries.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import sdDrafts from "@/fixtures/dashboardApi/sdDrafts.json";
import empty from "@/fixtures/empty.json";
import planeTransportAllowedDetails from "@/fixtures/transportDetailsApi/planeAllowed.json";
import planeTransportNotAllowedDetails from "@/fixtures/transportDetailsApi/planeNotAllowed.json";
import catchCertificatePlane from "@/fixtures/transportDetailsApi/catchCertificatePlane.json";
import savePlaneDetails from "@/fixtures/transportDetailsApi/savePlaneDetails.json";
import oneValidFacility from "@/fixtures/storageDocumentApi/storageDocumentOneFacility.json";
import saveAddArrivalContainerVesselDetails from "@/fixtures/transportDetailsApi/saveAddArrivalContainerVesselDetails.json";
import addArrivalContainerVesselDisallowedDetails from "@/fixtures/transportDetailsApi/addArrivalContainerVesselDisallowedDetails.json";
import saveContainerNumber from "@/fixtures/transportDetailsApi/saveContainerNumber.json";

const transportDetailsHandler: ITestHandler = {
  [TestCaseId.TrainTransportAllowed]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
  ],
  [TestCaseId.TrainTransportDisAllowed]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainNotAllowed))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
  ],
  [TestCaseId.TruckTransportAllowed]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
  ],
  [TestCaseId.TruckTransportSaveAsDraft]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("truck", true), (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.TruckTransportSave]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportDisAllowed]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportDisAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(ctx.json(catchCertificateTruckTransportDisallowedDetails))
    ),
  ],
  [TestCaseId.VesselContainerTransportDisAllowed]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainNotAllowed))),
  ],
  [TestCaseId.VesselContainerTransportAllowed]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
  ],
  [TestCaseId.ContainerVesselTransportAllowed]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) => res(ctx.json(empty))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
  ],
  [TestCaseId.TrainTransportErrors]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePlace: "error.departurePlace.any.required",
          railwayBillNumber: "error.railwayBillNumber.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePlace: "error.departurePlace.any.required",
          railwayBillNumber: "error.railwayBillNumber.any.required",
        })
      )
    ),
  ],
  [TestCaseId.TruckTransportErrors]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePlace: "error.departurePlace.any.required",
          nationalityOfVehicle: "error.nationalityOfVehicle.any.required",
          registrationNumber: "error.registrationNumber.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePlace: "error.departurePlace.any.required",
          nationalityOfVehicle: "error.nationalityOfVehicle.any.required",
          registrationNumber: "error.registrationNumber.any.required",
        })
      )
    ),
  ],
  [TestCaseId.TrainTransportSave]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) => res(ctx.json(saveTrainDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTrainDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportSaveAsDraft]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train", true), (req, res, ctx) => res(ctx.json(saveTrainDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTrainDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.TrainTransportVehicleChanged]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) => {
      const requestBody = req.body as any;
      if (requestBody.railwayBillNumber && requestBody.departurePlace) {
        return res(ctx.json(saveTrainDetails));
      }

      return res(
        ctx.status(400),
        ctx.json({
          error: "Invalid request format",
        })
      );
    }),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTrainDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.TrainTransportVehicleUnchanged]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) => {
      const requestBody = req.body as any;
      if (requestBody.railwayBillNumber && requestBody.departurePlace) {
        return res(ctx.json(saveTrainDetails));
      }

      return res(
        ctx.status(400),
        ctx.json({
          railwayBillNumber: "error.railwayBillNumber.any.required",
          departurePlace: "error.departurePlace.any.required",
        })
      );
    }),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTrainDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.VesselContainerTransportSaveAsDraft]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel", true), (req, res, ctx) =>
      res(ctx.json(saveVesselContainerDetails))
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveVesselContainerDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateVessel]))),
  ],
  [TestCaseId.TransportSaveMaxCharsRailwayBillNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          railwayBillNumber: "error.railwayBillNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          railwayBillNumber: "error.railwayBillNumber.string.max",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveMaxCharsFreightBillNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.max",
        })
      )
    ),
  ],
  [TestCaseId.TruckTransportSaveMaxCharsFreightBillNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.max",
        })
      )
    ),
  ],
  [TestCaseId.TruckTransportSaveAlphanumericsFreightBillNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.pattern.base",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveAlphanumericsRailwayBillNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          railwayBillNumber: "error.railwayBillNumber.string.alphanum",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          railwayBillNumber: "error.railwayBillNumber.string.alphanum",
        })
      )
    ),
  ],
  [TestCaseId.SaveTransportDetailsFailsWith403]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) => res(ctx.status(403))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.SaveTruckTransportDetailsFailsWith403]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.SaveVesselTransportDetailsFailsWith403]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) => res(ctx.status(403))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.TransportSaveMaxCharsTruckRegNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          registrationNumber: "error.registrationNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          registrationNumber: "error.registrationNumber.string.max",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveAlphanumericTruckRegNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          registrationNumber: "error.registrationNumber.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          registrationNumber: "error.registrationNumber.string.pattern.base",
        })
      )
    ),
  ],
  [TestCaseId.VesselContainerTransportErrors]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerNumber: "error.containerNumber.any.required",
          departurePlace: "error.departurePlace.any.required",
          flagState: "error.flagState.any.required",
          vesselName: "error.vesselName.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerNumber: "error.containerNumber.any.required",
          departurePlace: "error.departurePlace.any.required",
          flagState: "error.flagState.any.required",
          vesselName: "error.vesselName.any.required",
        })
      )
    ),
  ],
  [TestCaseId.VesselContainerTransportSave]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(ctx.json(saveVesselContainerDetails))
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.AddArrivalContainerVesselTransportSave]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(ctx.json(saveAddArrivalContainerVesselDetails))
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.AddArrivalContainerVesselTransportAllowed]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) => res(ctx.json(empty))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
  ],
  [TestCaseId.AddArrivalContainerVesselTransportDisAllowed]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(addArrivalContainerVesselDisallowedDetails))),
  ],
  [TestCaseId.ContainerVesselSaveMaxCharsVesselName]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.string.max",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveInvalidCharsVesselName]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.string.pattern.base",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveMaxCharsFlagState]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flagState: "error.flagState.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flagState: "error.flagState.string.max",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveInvalidCharsFlagState]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flagState: "error.flagState.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flagState: "error.flagState.string.pattern.base",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveMaxCharsContainerIdentificationNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerNumbers: "error.containerNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerNumbers: "error.containerNumber.string.max",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveInvalidFormatContainerNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerNumber: "error.containerIdentificationNumber.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerNumber: "error.containerIdentificationNumber.string.pattern.base",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveContainerNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(ctx.json(saveAddArrivalContainerVesselDetails))
    ),
  ],
  [TestCaseId.ContainerNumberSaveValidation]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveContainerNumber))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(ctx.json(saveAddArrivalContainerVesselDetails))
    ),
  ],
  [TestCaseId.ContainerVesselSaveMaxCharsFreightBillNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.max",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveInvalidCharsFreightBillNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.pattern.base",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveInvalidDepartureCountry]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          getDepartureCountry: "error.departureCountry.any.invalid",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          getDepartureCountry: "error.departureCountry.any.invalid",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveMaxCharsDeparturePort]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePort: "error.departurePort.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePort: "error.departurePort.string.max",
        })
      )
    ),
  ],

  [TestCaseId.ContainerVesselSaveInvalidCharsDeparturePort]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePort: "error.departurePort.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePort: "error.departurePort.string.pattern.base",
        })
      )
    ),
  ],
  [TestCaseId.ContainerVesselSaveInvalidDepartureDate]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureDate: "error.departureDate.date.format",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureDate: "error.departureDate.date.format",
        })
      )
    ),
  ],
  [TestCaseId.PlaneTransportErrors]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePlace: "error.departurePlace.any.required",
          flightNumber: "error.flightNumber.any.required",
          containerNumber: "error.containerNumber.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePlace: "error.departurePlace.any.required",
          flightNumber: "error.flightNumber.any.required",
          containerNumber: "error.containerNumber.any.required",
        })
      )
    ),
  ],
  [TestCaseId.SavePlaneTransportDetailsFailsWith403]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) => res(ctx.status(403))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.TransportSaveMaxCharsPlaneFlightNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.flightNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.flightNumber.string.max",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveAlphanumericPlaneFlightNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.flightNumber.string.alphanum",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.flightNumber.string.alphanum",
        })
      )
    ),
  ],
  [TestCaseId.PlaneTransportSave]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
  ],
  [TestCaseId.PlaneTransportSaveAsDraft]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane", true), (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
  ],
  [TestCaseId.PlaneTransportNotAllowed]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportNotAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
  ],
  [TestCaseId.PlaneTransportAllowed]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
  ],
  [TestCaseId.AddTransportationDetailsContainerIdentificationNumberManagement]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportSaveMaxCharsFreightBillNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.max",
        })
      )
    ),
  ],
  [TestCaseId.PlaneTransportSaveAlphanumericsFreightBillNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          freightBillNumber: "error.freightBillNumber.string.pattern.base",
        })
      )
    ),
  ],
  [TestCaseId.PlaneTransportSaveMaxCharsAirwayBillNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          airwayBillNumber: "error.airwayBillNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          airwayBillNumber: "error.airwayBillNumber.string.max",
        })
      )
    ),
  ],
  [TestCaseId.TransportAllowedUnauthorised]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(403))),
  ],
};

export default transportDetailsHandler;
