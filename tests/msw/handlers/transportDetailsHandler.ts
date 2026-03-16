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

// Module-level state store for save-as-draft persistence across handler resets
const statefulDataStore = {
  trainTransportData: null as any,
  lastActivityTime: 0,
  reset() {
    this.trainTransportData = { ...trainTransportAllowedDetails };
    this.lastActivityTime = Date.now();
  },
  getTrainData() {
    // If more than 3 seconds since last activity, assume new test - reset state
    const now = Date.now();
    if (now - this.lastActivityTime > 3000) {
      this.reset();
    }
    this.lastActivityTime = now;
    return this.trainTransportData;
  },
  saveTrainData(data: any) {
    this.trainTransportData = { ...this.trainTransportData, ...data };
    this.lastActivityTime = Date.now();
  },
};
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
import truckSaveAsDraftInitialData from "@/fixtures/transportDetailsApi/truckSaveAsDraftInitial.json";
import truckSaveAsDraftRetainDateInitialData from "@/fixtures/transportDetailsApi/truckSaveAsDraftRetainDateInitial.json";
import truckRetainAllSavedData from "@/fixtures/transportDetailsApi/truckRetainAllSaved.json";
import truckRetainDateSavedData from "@/fixtures/transportDetailsApi/truckRetainDateSaved.json";
import trainRetainAllSavedData from "@/fixtures/transportDetailsApi/trainRetainAllSaved.json";
import trainRetainDateSavedData from "@/fixtures/transportDetailsApi/trainRetainDateSaved.json";
import planeRetainAllSavedData from "@/fixtures/transportDetailsApi/planeRetainAllSaved.json";
import planeRetainDateSavedData from "@/fixtures/transportDetailsApi/planeRetainDateSaved.json";
import arrivalPlaneRetainAllSavedData from "@/fixtures/transportDetailsApi/arrivalPlaneRetainAllSaved.json";
import arrivalPlaneRetainDateSavedData from "@/fixtures/transportDetailsApi/arrivalPlaneRetainDateSaved.json";
import arrivalTruckRetainAllSavedData from "@/fixtures/transportDetailsApi/arrivalTruckRetainAllSaved.json";
import arrivalTruckRetainDateSavedData from "@/fixtures/transportDetailsApi/arrivalTruckRetainDateSaved.json";
import arrivalContainerVesselFutureDateSavedData from "@/fixtures/transportDetailsApi/arrivalContainerVesselFutureDateSaved.json";
import containerVesselSaveAsDraftInitialData from "@/fixtures/transportDetailsApi/containerVesselSaveAsDraftInitial.json";
import containerVesselRetainAllSavedData from "@/fixtures/transportDetailsApi/containerVesselRetainAllSaved.json";
import containerVesselRetainInvalidVesselNameSavedData from "@/fixtures/transportDetailsApi/containerVesselRetainInvalidVesselNameSaved.json";

// Isolated store for stateful save-as-draft tests.
// savedData is null until the first POST save; once set it keeps returning saved data
// so Cypress retries (which re-run the whole `it` block) always see the correct state.
// Each test uses its own store instance to prevent cross-test contamination.
const makeRetainAllStore = (initialData: any) => ({
  savedData: null as any,
  getData() {
    // Return saved data if available; fall back to initial fixture
    return this.savedData !== null ? { ...this.savedData } : { ...initialData };
  },
  save(body: any) {
    this.savedData = { ...initialData, ...body };
  },
});
// RetainAllValues: starts with Belgium nationality pre-populated
const truckRetainAllStore = makeRetainAllStore(truckSaveAsDraftInitialData);
// RetainDate: starts with NO nationality so the test's .type("Netherlands") is clean
const truckRetainDateStore = makeRetainAllStore(truckSaveAsDraftRetainDateInitialData);
// Container vessel departure: stateful stores for save-as-draft retain tests
const containerVesselRetainAllStore = makeRetainAllStore(containerVesselSaveAsDraftInitialData);
const containerVesselRetainInvalidVesselNameStore = makeRetainAllStore(containerVesselSaveAsDraftInitialData);

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
    // Simple static handler: used by "navigate to dashboard" test only (no revisit)
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckSaveAsDraftInitialData))),
    rest.post(addTransportationDetailsUrl("truck", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("truck", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Isolated stateful handler: retain all field values including nationality & export date
  [TestCaseId.TruckTransportSaveAsDraftRetainAllValues]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckRetainAllStore.getData()))),
    rest.post(addTransportationDetailsUrl("truck", false), async (req, res, ctx) => {
      const body = await req.json();
      truckRetainAllStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("truck", true), async (req, res, ctx) => {
      const body = await req.json();
      truckRetainAllStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      const body = await req.json();
      truckRetainAllStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Isolated stateful handler: retain export date and accept invalid container format
  [TestCaseId.TruckTransportSaveAsDraftRetainDate]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckRetainDateStore.getData()))),
    rest.post(addTransportationDetailsUrl("truck", false), async (req, res, ctx) => {
      const body = await req.json();
      truckRetainDateStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("truck", true), async (req, res, ctx) => {
      const body = await req.json();
      truckRetainDateStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      const body = await req.json();
      truckRetainDateStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Static CHECK handlers: return hardcoded saved-state fixture — no server state, immune to double-GET / retry issues
  [TestCaseId.TruckTransportSaveAsDraftRetainAllValuesCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckRetainAllSavedData))),
    rest.post(addTransportationDetailsUrl("truck", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("truck", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportSaveAsDraftRetainDateCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckRetainDateSavedData))),
    rest.post(addTransportationDetailsUrl("truck", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("truck", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Static CHECK handlers for arrival truck: return hardcoded saved-state fixture via mockTransportDetailsUrl
  [TestCaseId.ArrivalTruckTransportSaveAsDraftRetainAllValuesCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(arrivalTruckRetainAllSavedData))),
    rest.post(addTransportationDetailsUrl("truck", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("truck", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ArrivalTruckTransportSaveAsDraftRetainDateCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(arrivalTruckRetainDateSavedData))),
    rest.post(addTransportationDetailsUrl("truck", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("truck", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
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
          "containerNumbers.0": "error.containerNumbers.string.pattern.base",
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
          "containerNumbers.0": "error.containerNumbers.string.pattern.base",
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
    rest.get(mockTransportDetailsUrl, (req, res, ctx) =>
      // Module-level store handles reset logic based on time elapsed
      res(ctx.json(statefulDataStore.getTrainData()))
    ),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(statefulDataStore.getTrainData()))),
    rest.post(addTransportationDetailsUrl("train"), async (req, res, ctx) => {
      const body = await req.json();
      statefulDataStore.saveTrainData(body);
      return res(ctx.json({ ...saveTrainDetails, ...body }));
    }),
    rest.post(addTransportationDetailsUrl("train", false), async (req, res, ctx) => {
      const body = await req.json();
      statefulDataStore.saveTrainData(body);
      return res(ctx.json({ ...saveTrainDetails, ...body }));
    }),
    rest.post(addTransportationDetailsUrl("train", true), async (req, res, ctx) => {
      const body = await req.json();
      statefulDataStore.saveTrainData(body);
      return res(ctx.json({ ...saveTrainDetails, ...body }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      const body = await req.json();
      statefulDataStore.saveTrainData(body);
      return res(ctx.json({ ...saveTrainDetails, ...body }));
    }),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Static CHECK handlers: return hardcoded saved-state fixture — immune to double-GET and retry state issues
  [TestCaseId.TrainTransportSaveAsDraftRetainAllValuesCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainRetainAllSavedData))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(trainRetainAllSavedData))),
    rest.post(addTransportationDetailsUrl("train"), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("train", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("train", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportSaveAsDraftRetainDateCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainRetainDateSavedData))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(trainRetainDateSavedData))),
    rest.post(addTransportationDetailsUrl("train"), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("train", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("train", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
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
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    // Validation endpoint - returns success for all valid fields
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(ctx.json(saveVesselContainerDetails))
    ),
    // Draft endpoint - saves to draft
    rest.post(addTransportationDetailsUrl("containerVessel", true), (req, res, ctx) =>
      res(ctx.json(saveVesselContainerDetails))
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveVesselContainerDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateVessel]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Isolated stateful handler: retain all valid vessel/flagState fields on save-as-draft
  [TestCaseId.ContainerVesselTransportSaveAsDraftRetainAllValues]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(containerVesselRetainAllStore.getData()))),
    rest.post(addTransportationDetailsUrl("containerVessel", false), async (req, res, ctx) => {
      const body = await req.json();
      containerVesselRetainAllStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("containerVessel", true), async (req, res, ctx) => {
      const body = await req.json();
      containerVesselRetainAllStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      const body = await req.json();
      containerVesselRetainAllStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateVessel]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Static CHECK handler: returns hardcoded saved fixture — all valid fields retained
  [TestCaseId.ContainerVesselTransportSaveAsDraftRetainAllValuesCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(containerVesselRetainAllSavedData))),
    rest.post(addTransportationDetailsUrl("containerVessel", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("containerVessel", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateVessel]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Isolated stateful handler: invalid vesselName (::::) cleared, valid flagState (Greece) retained
  [TestCaseId.ContainerVesselTransportSaveAsDraftInvalidVesselName]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) =>
      res(ctx.json(containerVesselRetainInvalidVesselNameStore.getData()))
    ),
    rest.post(addTransportationDetailsUrl("containerVessel", false), async (req, res, ctx) => {
      const body = await req.json();
      containerVesselRetainInvalidVesselNameStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("containerVessel", true), async (req, res, ctx) => {
      const body = await req.json();
      containerVesselRetainInvalidVesselNameStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      const body = await req.json();
      containerVesselRetainInvalidVesselNameStore.save(body);
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateVessel]))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Static CHECK handler: returns hardcoded saved fixture — vesselName cleared, flagState retained
  [TestCaseId.ContainerVesselTransportSaveAsDraftInvalidVesselNameCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) =>
      res(ctx.json(containerVesselRetainInvalidVesselNameSavedData))
    ),
    rest.post(addTransportationDetailsUrl("containerVessel", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("containerVessel", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
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
        if (!body.placeOfUnloading || body.placeOfUnloading === "") {
          errors.placeOfUnloading = "error.placeOfUnloading.any.required";
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
  // Static CHECK handler for arrival container vessel: returns fixture with empty departureDate
  // (represents state after a future departure date was stripped during save-as-draft)
  [TestCaseId.ArrivalContainerVesselTransportSaveAsDraftFutureDateCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(arrivalContainerVesselFutureDateSavedData))),
    rest.post(addTransportationDetailsUrl("containerVessel", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("containerVessel", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
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
          containerNumbers: "error.containerNumber.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          containerNumbers: "error.containerNumber.string.pattern.base",
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
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      // Return saved data with dates and container numbers if they exist
      res(
        ctx.json({
          ...catchCertificatePlane,
          airwayBillNumber: "456-78901234",
          flightNumber: "BA101",
          freightBillNumber: "FR123456",
          departureCountry: "Germany",
          departurePort: "Frankfurt Airport",
          placeOfUnloading: "Heathrow Airport",
          departureDate: "20/01/2026",
          containerNumber: ["DEFG2345678"],
          vehicle: "plane",
          arrival: true,
        })
      )
    ),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.post(addTransportationDetailsUrl("plane", false), async (req, res, ctx) => {
      // Accept and return whatever was sent in save-as-draft mode
      const body = await req.json();
      return res(ctx.json({ ...body, ...savePlaneDetails }));
    }),
    rest.post(addTransportationDetailsUrl("plane", true), async (req, res, ctx) => {
      // Accept and return whatever was sent in save-as-draft mode (arrival)
      const body = await req.json();
      return res(ctx.json({ ...body, ...savePlaneDetails }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      const body = await req.json();
      return res(ctx.json({ ...body, ...savePlaneDetails }));
    }),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Static CHECK handlers for plane: return hardcoded saved-state fixture
  [TestCaseId.PlaneTransportSaveAsDraftRetainAllValuesCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeRetainAllSavedData))),
    rest.post(addTransportationDetailsUrl("plane", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("plane", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportSaveAsDraftRetainDateCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeRetainDateSavedData))),
    rest.post(addTransportationDetailsUrl("plane", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("plane", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
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
  // Static CHECK handlers for arrival plane: return hardcoded saved-state fixture via mockTransportDetailsUrl
  [TestCaseId.ArrivalPlaneTransportSaveAsDraftRetainAllValuesCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(arrivalPlaneRetainAllSavedData))),
    rest.post(addTransportationDetailsUrl("plane", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("plane", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ArrivalPlaneTransportSaveAsDraftRetainDateCheck]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(arrivalPlaneRetainDateSavedData))),
    rest.post(addTransportationDetailsUrl("plane", false), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.post(addTransportationDetailsUrl("plane", true), async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      await req.json();
      return res(ctx.json({ errors: [] }));
    }),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
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
  [TestCaseId.TruckTransportMultipleContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportContainerValidationErrors]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers[0]": "Container identification number must only contain letters and numbers",
          containerIdentificationNumber: "Container identification number must only contain letters and numbers",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportContainerMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers[0]": "Container identification number must only contain letters and numbers",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportEmptyContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportContainerPersistence]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          registrationNumber: "error.registrationNumber.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportMixedContainerValidation]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers[1]": "Container identification number must only contain letters and numbers",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportEditWithContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(
        ctx.json({
          ...catchCertificateTruckTransportAllowedDetails,
          containerNumbers: ["EXISTING001", "EXISTING002", "EXISTING003"],
        })
      )
    ),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportMultipleContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTrainDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportContainerValidationErrors]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "Container identification number must only contain letters and numbers",
          containerIdentificationNumber: "Container identification number must only contain letters and numbers",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportContainerMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "Container identification number must only contain letters and numbers",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportEmptyContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTrainDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportContainerPersistence]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          railwayBillNumber: "error.railwayBillNumber.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportMixedContainerValidation]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.1": "Container identification number must only contain letters and numbers",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TrainTransportEditWithContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(
        ctx.json({
          ...catchCertificateTrain,
          containerNumbers: ["EXISTING001", "EXISTING002", "EXISTING003"],
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
          "containerNumbers.0": "error.containerNumbers.0.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "error.containerNumbers.0.string.pattern.base",
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
          "containerNumbers.0": "error.containerNumbers.0.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "error.containerNumbers.0.string.pattern.base",
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
  // FI0-10061: Welsh error messages for departure port field
  [TestCaseId.TruckTransportSaveMaxCharsDeparturePort]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePlace: "error.departurePort.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportSaveInvalidCharsDeparturePort]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          departurePlace: "error.departurePort.string.pattern.base",
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
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    // Validation endpoint - returns 400 with pointOfDestination error
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          pointOfDestination: "error.pointOfDestination.string.max",
        })
      )
    ),

    rest.post(addTransportationDetailsUrl("containerVessel", true), (req, res, ctx) =>
      res(ctx.json(saveVesselContainerDetails))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
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
  // Plane transport container validation handlers
  [TestCaseId.PlaneTransportAirwaybillMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
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
  [TestCaseId.PlaneTransportAirwaybillInvalidCharacters]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          airwayBillNumber: "error.airwayBillNumber.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportContainerMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumber.0": "error.containerNumber.0.string.max",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportContainerInvalidCharacters]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumber.0": "error.containerNumber.0.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportMultipleContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportEmptyContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(savePlaneDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportContainerPersistence]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          flightNumber: "error.flightNumber.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportEditWithContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(
        ctx.json({
          ...catchCertificatePlane,
          containerNumber: ["EXISTING001", "EXISTING002", "EXISTING003"],
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.PlaneTransportContainerValidationErrors]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumbers.0": "error.containerNumbers.0.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // Container vessel transport container validation handlers
  [TestCaseId.ContainerVesselTransportContainerMaxLength]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumber.0": "error.containerNumber.0.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerVesselTransportContainerInvalidCharacters]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumber.0": "error.containerNumber.0.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // UAT-499: Test case for all required fields empty with invalid container - error ordering
  [TestCaseId.ContainerVesselAllFieldsEmptyWithInvalidContainer]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.any.required",
          flagState: "error.flagState.any.required",
          departurePlace: "error.departurePlace.any.required",
          "containerNumbers.0": "error.containerNumbers.0.string.pattern.base",
        })
      )
    ),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.any.required",
          flagState: "error.flagState.any.required",
          departurePlace: "error.departurePlace.any.required",
          "containerNumbers.0": "error.containerNumbers.0.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // UAT-499: Handler for testing error order - all required fields missing + invalid container format
  [TestCaseId.ContainerVesselRequiredFieldsAndInvalidContainer]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.any.required",
          flagState: "error.flagState.any.required",
          departurePlace: "error.departurePlace.any.required",
          "containerNumbers.0": "error.containerNumbers.0.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerVesselRequiredFieldsAndMaxLengthContainer]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.any.required",
          flagState: "error.flagState.any.required",
          departurePlace: "error.departurePlace.any.required",
          "containerNumbers.0": "error.containerNumbers.0.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerVesselTransportMultipleContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveVesselContainerDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerVesselTransportEmptyContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveVesselContainerDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerVesselTransportContainerPersistence]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.any.required",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerVesselTransportEditWithContainers]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) =>
      res(
        ctx.json({
          ...catchCertificateVessel,
          containerNumber: ["EXISTING001", "EXISTING002", "EXISTING003"],
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.ContainerVesselTransportContainerValidationErrors]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          "containerNumber.0": "error.containerNumber.0.string.pattern.base",
        })
      )
    ),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  // UAT-499: Handler for testing error ordering with multiple field errors including container
  [TestCaseId.ContainerVesselMultipleErrors]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(vesselTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateVessel))),
    rest.post(addTransportationDetailsUrl("containerVessel"), async (req, res, ctx) => {
      const body = await req.json();
      const errors: Record<string, string> = {};

      // Only return required field errors if fields are actually missing
      if (!body.vesselName || body.vesselName.trim() === "") {
        errors.vesselName = "error.vesselName.any.required";
      }

      if (!body.flagState || body.flagState.trim() === "") {
        errors.flagState = "error.flagState.any.required";
      }

      if (!body.departurePlace || body.departurePlace.trim() === "") {
        errors.departurePlace = "error.departurePlace.any.required";
      }

      if (body.containerNumbers) {
        if (body.containerNumbers[0] && !/^[A-Z]{3}[UJZR]\d{7}$/.test(body.containerNumbers[0])) {
          errors["containerNumbers.0"] = "error.containerNumbers.0.string.pattern.base";
        }

        if (body.containerNumbers[1] && !/^[A-Z]{3}[UJZR]\d{7}$/.test(body.containerNumbers[1])) {
          errors["containerNumbers.1"] = "error.containerNumbers.1.string.pattern.base";
        }
      }

      if (Object.keys(errors).length > 0) {
        return res(ctx.status(400), ctx.json(errors));
      }

      return res(ctx.json(saveVesselContainerDetails));
    }),
    rest.put(mockPutTransportDetailsByIdUrl, async (req, res, ctx) => {
      const body = await req.json();
      const errors: Record<string, string> = {};

      // Only return required field errors if fields are actually missing
      if (!body.vesselName || body.vesselName.trim() === "") {
        errors.vesselName = "error.vesselName.any.required";
      }

      if (!body.flagState || body.flagState.trim() === "") {
        errors.flagState = "error.flagState.any.required";
      }

      if (!body.departurePlace || body.departurePlace.trim() === "") {
        errors.departurePlace = "error.departurePlace.any.required";
      }

      if (body.containerNumber) {
        if (body.containerNumber[0] && !/^[A-Z]{3}[UJZR]\d{7}$/.test(body.containerNumber[0])) {
          errors["containerNumber.0"] = "error.containerNumber.0.string.pattern.base";
        }

        if (body.containerNumber[1] && !/^[A-Z]{3}[UJZR]\d{7}$/.test(body.containerNumber[1])) {
          errors["containerNumber.1"] = "error.containerNumber.1.string.pattern.base";
        }
      }

      if (Object.keys(errors).length > 0) {
        return res(ctx.status(400), ctx.json(errors));
      }

      return res(ctx.json(saveVesselContainerDetails));
    }),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.TruckTransportSaveInvalidYearExportDate]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
  [TestCaseId.ArrivalTruckTransportSaveInvalidYearDepartureDate]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTruckTransportAllowedDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(addTransportationDetailsUrl("truck"), (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.put(mockPutTransportDetailsByIdUrl, (req, res, ctx) => res(ctx.json(saveTruckDetails))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([catchCertificateTruckTransportAllowedDetails]))),
  ],
};

export default transportDetailsHandler;
