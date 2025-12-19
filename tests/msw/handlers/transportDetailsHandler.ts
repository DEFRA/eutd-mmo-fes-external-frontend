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
import twoValidFacility from "@/fixtures/storageDocumentApi/storageDocumentTwoFacility.json";
import noValidFacility from "@/fixtures/storageDocumentApi/storageDocumentNoFacilities.json";
import saveAddArrivalContainerVesselDetails from "@/fixtures/transportDetailsApi/saveAddArrivalContainerVesselDetails.json";
import addArrivalContainerVesselDisallowedDetails from "@/fixtures/transportDetailsApi/addArrivalContainerVesselDisallowedDetails.json";
import saveContainerNumber from "@/fixtures/transportDetailsApi/saveContainerNumber.json";

const transportDetailsHandler: ITestHandler = {
  [TestCaseId.TrainTransportAllowed]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("train"), async (req, res, ctx) => {
      const requestBody = await req.json();
      const errors: Record<string, string> = {};

      // Validate required fields for FI0-10289
      if (!requestBody.departureCountry) {
        errors.departureCountry = "error.departureCountry.any.required";
      }
      if (!requestBody.departurePort) {
        errors.departurePort = "error.departurePort.any.required";
      }
      if (!requestBody.departureDate) {
        errors.departureDate = "error.departureDate.any.required";
      }
      if (!requestBody.railwayBillNumber) {
        errors.railwayBillNumber = "error.railwayBillNumber.any.required";
      }
      if (!requestBody.placeOfUnloading) {
        errors.placeOfUnloading = "error.placeOfUnloading.any.required";
      }

      if (Object.keys(errors).length > 0) {
        return res(ctx.status(400), ctx.json(errors));
      }

      return res(ctx.json(saveTrainDetails));
    }),
  ],
  [TestCaseId.TrainTransportDisAllowed]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainNotAllowed))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportAllowed]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportAllowedNoFacilityArrivalDate]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(noValidFacility))),
  ],
  [TestCaseId.TruckTransportAllowedOneFacilityArrivalDate]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(twoValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckSaveInvalidFormatContainerNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "error.containerNumbers.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckSaveMaxCharsContainerIdentificationNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "error.containerNumbers.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckSaveContainerNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainSaveInvalidFormatContainerNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "error.containerNumbers.string.alphanum",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainSaveMaxCharsContainerIdentificationNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "error.containerNumbers.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainSaveContainerNumber]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) => res(ctx.json(saveTrainDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.VesselContainerTransportDisAllowed]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainNotAllowed))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.VesselContainerTransportAllowed]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerVesselTransportAllowed]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) => res(ctx.json(empty))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportErrors]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
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
    rest.post(addTransportationDetailsUrl("truck", true), (req, res, ctx) =>
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.TruckTransportInvalidNationality]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          nationalityOfVehicle: "error.nationalityOfVehicle.any.invalid",
        })
      )
    ),
    rest.post(addTransportationDetailsUrl("truck", true), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          nationalityOfVehicle: "error.nationalityOfVehicle.any.invalid",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          nationalityOfVehicle: "error.nationalityOfVehicle.any.invalid",
        })
      )
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TransportSaveRailwayBillNumberEmpty]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          railwayBillNumber: "error.railwayBillNumber.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          railwayBillNumber: "error.railwayBillNumber.any.required",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveMaxCharsTrainPlaceOfUnloadingEmpty]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          placeOfUnloading: "error.placeOfUnloading.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          placeOfUnloading: "error.placeOfUnloading.any.required",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveMaxCharsTrainPlaceOfUnloadingExceedString]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          placeOfUnloading: "error.placeOfUnloading.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          placeOfUnloading: "error.placeOfUnloading.string.max",
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.SaveTransportDetailsFailsWith403]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) => res(ctx.status(403))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.SaveTruckTransportDetailsFailsWith403]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) => res(ctx.status(403))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.SaveVesselTransportDetailsFailsWith403]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) => res(ctx.status(403))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TransportSaveMaxCharsTruckRegNumberEmpty]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          registrationNumber: "error.registrationNumber.string.empty",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          registrationNumber: "error.registrationNumber.string.empty",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveMaxCharsTruckPlaceOfUnloadingEmpty]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          placeOfUnloading: "error.placeOfUnloading.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          placeOfUnloading: "error.placeOfUnloading.any.required",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveMaxCharsTruckPlaceOfUnloadingExceedString]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          placeOfUnloading: "error.placeOfUnloading.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          placeOfUnloading: "error.placeOfUnloading.string.max",
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.post(addTransportationDetailsUrl("containerVessel"), async (req, res, ctx) => {
      const body = await req.json();
      const errors: Record<string, string> = {};

      // Validate required fields for arrival transport
      if (body.arrival) {
        if (!body.flagState || body.flagState === "") {
          errors.flagState = "error.flagState.any.required";
        }
        if (!body.containerNumbers || body.containerNumbers.length === 0 || body.containerNumbers[0] === "") {
          errors["containerNumbers.0"] = "error.containerNumbers.array.min";
        }
        if (!body.departureCountry || body.departureCountry === "") {
          errors.departureCountry = "error.departureCountry.any.required";
        }
        if (!body.departurePort || body.departurePort === "") {
          errors.departurePort = "error.departurePort.any.required";
        }
        if (!body.departureDate || body.departureDate === "") {
          errors.departureDate = "error.departureDate.any.required";
        }
      }

      if (Object.keys(errors).length > 0) {
        return res(ctx.status(400), ctx.json(errors));
      }

      return res(ctx.json(empty));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.AddArrivalContainerVesselTransportDisAllowed]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(addArrivalContainerVesselDisallowedDetails))),
  ],
  [TestCaseId.ContainerVesselTransportSaveEmpty]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.any.required",
        })
      )
    ),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerVesselSaveContainerNumber]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveAddArrivalContainerVesselDetails))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(ctx.json(saveAddArrivalContainerVesselDetails))
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerNumberSaveValidation]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(saveContainerNumber))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(ctx.json(saveAddArrivalContainerVesselDetails))
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.SavePlaneTransportDetailsFailsWith403]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) => res(ctx.status(403))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TransportSavePlaneFlightNumberEmpty]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.flightNumber.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.flightNumber.any.required",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveMaxCharsPlanePlaceOfUnloadingEmpty]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.placeOfUnloading.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.placeOfUnloading.any.required",
        })
      )
    ),
  ],
  [TestCaseId.TransportSaveMaxCharsPlanePlaceOfUnloadingExceedString]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.placeOfUnloading.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.placeOfUnloading.string.max",
        })
      )
    ),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportSave]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportSaveAsDraft]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane", true), (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportNotAllowed]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportNotAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportAllowed]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.AddTransportationDetailsContainerIdentificationNumberManagement]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ArrivalPlaneTransportContainerNumberEmpty]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "error.containerNumber.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "error.containerNumber.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ArrivalPlaneTransportDepartureCountryEmpty]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureCountry: "error.departureCountry.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureCountry: "error.departureCountry.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ArrivalPlaneTransportDeparturePortEmpty]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePort: "error.departurePort.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePort: "error.departurePort.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ArrivalPlaneTransportDepartureDateEmpty]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureDate: "error.departureDate.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureDate: "error.departureDate.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TransportAllowedUnauthorised]: () => [
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(403))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportSaveEmptyNationality]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          nationalityOfVehicle: "error.nationalityOfVehicle.any.required",
        })
      )
    ),
    rest.post(addTransportationDetailsUrl("truck", true), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          nationalityOfVehicle: "error.nationalityOfVehicle.any.invalid",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          nationalityOfVehicle: "error.nationalityOfVehicle.any.invalid",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.TruckTransportSaveEmptyDepartureCountry]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureCountry: "error.departureCountry.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureCountry: "error.departureCountry.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.TruckTransportSaveEmptyConsignmentOrigin]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePort: "error.departurePort.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePort: "error.departurePort.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.TruckTransportSaveEmptyDepartureDate]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureDate: "error.departureDate.any.required",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departureDate: "error.departureDate.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.TruckTransportContainerIdentificationNumberMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerIdentificationNumber: "error.containerIdentificationNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerIdentificationNumber: "error.containerIdentificationNumber.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportContainerIdentificationNumberInvalidCharacters]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerIdentificationNumber: "error.containerIdentificationNumber.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerIdentificationNumber: "error.containerIdentificationNumber.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportContainerIdentificationNumberMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerIdentificationNumber: "error.containerIdentificationNumber.string.max",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerIdentificationNumber: "error.containerIdentificationNumber.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportContainerIdentificationNumberInvalidCharacters]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerIdentificationNumber: "error.containerIdentificationNumber.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerIdentificationNumber: "error.containerIdentificationNumber.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportPointOfDestinationRequired]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportPointOfDestinationMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportPointOfDestinationInvalidCharacters]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportPointOfDestinationRequired]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportPointOfDestinationMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportPointOfDestinationInvalidCharacters]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(addTransportationDetailsUrl("train"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportPointOfDestinationRequired]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportPointOfDestinationMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportPointOfDestinationInvalidCharacters]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.post(addTransportationDetailsUrl("plane"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.VesselContainerTransportPointOfDestinationRequired]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.VesselContainerTransportPointOfDestinationMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.VesselContainerTransportPointOfDestinationInvalidCharacters]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
};

export default transportDetailsHandler;
