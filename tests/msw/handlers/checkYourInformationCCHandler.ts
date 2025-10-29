import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  LANDINGS_TYPE_URL,
  getProgressUrl,
  getTransportDetailsUrl,
  GET_CERTIFICATE_SUMMARY,
  CREATE_EXPORT_CERTIFICATE,
  GET_CLIENT_IP_URL,
  ADDED_SPECIES_URL,
  ADD_SPECIES_URL,
  COMMODITY_CODE_LOOK_UP,
  CONSERVATION_URL,
  COUNTRIES_URL,
  EXPORT_LOCATION_URL,
  FAVOURITES_URL,
  SPECIES_STATE_LOOK_UP,
  SPECIES_URL,
  mockDocumentUrl,
  EXPORT_PAYLOAD_URL,
  mockSearchVesselName,
  mockGetAllDocumentsUrl,
  GET_DIRECT_LANDINGS_URL,
  GET_TRANSPORTATIONS_URL,
  mockGetTransportByIdUrl,
  GET_GEAR_CATEGORIES_URL,
  mockGetGearTypesByCategoriesUrl,
  GET_RFMO_AREAS_URL,
} from "~/urls.server";

import ccCreatedDetails from "@/fixtures/documentsApi/catchCertificate.json";
import nullLandingsType from "@/fixtures/landingsTypeApi/null.json";
import uploadEntryLandingsType from "@/fixtures/landingsTypeApi/uploadEntry.json";
import directLandingLandingsType from "@/fixtures/landingsTypeApi/directLanding.json";
import truckTransportDetails from "@/fixtures/transportDetailsApi/truck.json";
import progressIncomplete from "@/fixtures/progressApi/ccIncomplete.json";
import progressComplete from "@/fixtures/progressApi/ccComplete.json";
import ccTruck from "@/fixtures/ccSummary/ccTruck.json";
import ccLocked from "@/fixtures/ccSummary/ccLocked.json";
import ccDirectLanding from "@/fixtures/ccSummary/ccDirectLanding.json";
import ccDirectLandingGearInfo from "@/fixtures/ccSummary/ccDirectLandingGearInfo.json";
import ccManualLanding from "@/fixtures/ccSummary/ccManualLanding.json";
import ccManualLandingGearInfo from "@/fixtures/ccSummary/ccManualLandingGearInfo.json";
import ccVesselNotFound from "@/fixtures/ccSummary/ccVesselNotFound.json";
import ccVesselOverriddenByAdminDirectLanding from "@/fixtures/ccSummary/ccVesselOverriddenByAdminDirectLanding.json";
import ccVesselOverriddenByAdmin from "@/fixtures/ccSummary/ccVesselOverriddenByAdmin.json";
import ccExporterUpdated from "@/fixtures/ccSummary/ccExporterUpdated.json";
import ccValidationError from "@/fixtures/ccSummary/ccValidationErrors.json";
import ccOnLoadValidationError from "@/fixtures/ccSummary/ccOnLoadValidationErrors.json";
import ccNoLandingType from "@/fixtures/ccSummary/ccNoLandingType.json";
import ccNoExporter from "@/fixtures/ccSummary/ccNoExporter.json";
import countries from "@/fixtures/whatExportJourneyApi/countries.json";
import whoseWatersSuccess from "@/fixtures/whoseWatersApi/whoseWatersSuccess.json";
import species from "@/fixtures/referenceDataApi/species.json";
import favourites from "@/fixtures/whatAreYouExportingApi/favourites.json";
import commodityCode from "@/fixtures/whatAreYouExportingApi/commodityCode.json";
import speciesStateLookup from "@/fixtures/whatAreYouExportingApi/speciesStateLookup.json";
import speciesAddedPerUser from "@/fixtures/whatAreYouExportingApi/speciesAddedPerUser.json";
import addOrUpdateResponse from "@/fixtures/whatAreYouExportingApi/addOrUpdateResponse.json";
import ccSpeciesError from "@/fixtures/ccSummary/ccSpeciesError.json";
import mannualLandingType from "@/fixtures/landingsTypeApi/manualEntry.json";
import addLandingsSavedData from "@/fixtures/ccSummary/addLandingsWithProductIdLandingId.json";
import getVessels from "@/fixtures/directLanding/getVessels.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import directLandings from "@/fixtures/directLanding/directLandings.json";
import getGearCategories from "@/fixtures/addLandings/getGearCategories.json";
import getGearTypesByCategory from "@/fixtures/addLandings/getGearTypesByCategory.json";
import getRfmos from "@/fixtures/directLanding/getRfmos.json";

const documentNumber = "GBR-2022-CC-D1630FF88";

const checkYourInformationCCHandler: ITestHandler = {
  [TestCaseId.CCCheckYourInformation]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccTruck))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(whoseWatersSuccess))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(truckTransportDetails))),
  ],
  [TestCaseId.CCCheckYourInformationPageGuardCaseOne]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccNoLandingType))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(nullLandingsType))),
  ],
  [TestCaseId.CCCheckYourInformationPageGuardCaseTwo]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressIncomplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccTruck))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
  ],
  [TestCaseId.CCCheckYourInformationPageGuardCaseThree]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccNoExporter))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
  ],
  [TestCaseId.CCCheckYourInformationLocked]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccLocked))),
  ],
  [TestCaseId.CCCheckYourInformationDirectLanding]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccDirectLanding))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
  ],
  [TestCaseId.CCCheckYourInformationDirectLandingGearInfo]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (_, res, ctx) => res(ctx.json(ccDirectLandingGearInfo))),
  ],
  [TestCaseId.CCCheckYourInformationDirectLandingRFMO]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(GET_TRANSPORTATIONS_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (_, res, ctx) => res(ctx.json(ccDirectLandingGearInfo))),
  ],
  [TestCaseId.CCCheckYourInformationManualLanding]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccManualLanding))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandingsSavedData))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.CCCheckYourInformationManualLandingGearInfo]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (_, res, ctx) => res(ctx.json(ccManualLandingGearInfo))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandingsSavedData))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
  ],
  [TestCaseId.CCCheckYourInformationVesselNotFound]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccVesselNotFound))),
  ],
  [TestCaseId.CCCheckYourInformationVesselOverridenDirectLanding]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccVesselOverriddenByAdminDirectLanding))),
  ],
  [TestCaseId.CCCheckYourInformationVesselOverriden]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccVesselOverriddenByAdmin))),
  ],
  [TestCaseId.CCCheckYourInformationExporterUpdated]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccExporterUpdated))),
  ],
  [TestCaseId.CCCheckYourInformationValidationError]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccValidationError))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(CREATE_EXPORT_CERTIFICATE, (req, res, ctx) =>
      res(
        ctx.status(500),
        ctx.json([
          {
            error: "SYSTEM_ERROR",
          },
        ])
      )
    ),
  ],
  [TestCaseId.CCCheckYourInformationRuleValidationErrors]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccValidationError))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(CREATE_EXPORT_CERTIFICATE, (req, res, ctx) => res(ctx.status(400), ctx.json(ccSpeciesError))),
  ],
  [TestCaseId.CCCheckYourInformationOnLoadValidationErrors]: () => [
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccOnLoadValidationError))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(CREATE_EXPORT_CERTIFICATE, (req, res, ctx) => res(ctx.status(400), ctx.json(ccSpeciesError))),
  ],
  [TestCaseId.CCCheckYourInformationValidationSuccess]: () => [
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json(ccCreatedDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccValidationError))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(CREATE_EXPORT_CERTIFICATE, (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          offlineValidation: false,
          documentNumber,
          uri: "_382462d9-ea63-4125-9e11-bb1bc474d8a1.pdf",
        })
      )
    ),
  ],
  [TestCaseId.CCCheckYourInformationOfflineValidation]: () => [
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json(ccCreatedDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccExporterUpdated))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(CREATE_EXPORT_CERTIFICATE, (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          offlineValidation: true,
          documentNumber,
          uri: "_382462d9-ea63-4125-9e11-bb1bc474d8a1.pdf",
        })
      )
    ),
  ],
  [TestCaseId.CCCheckYourInformationInvalidCatchCert]: () => [
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json(ccCreatedDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccExporterUpdated))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandingsSavedData))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(CREATE_EXPORT_CERTIFICATE, (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          offlineValidation: false,
          documentNumber,
          status: "invalid catch certificate",
          uri: "_382462d9-ea63-4125-9e11-bb1bc474d8a1.pdf",
        })
      )
    ),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.CCCheckYourInformationInvalidCatchCertDirectLanding]: () => [
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json(ccCreatedDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccExporterUpdated))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandingsSavedData))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandings))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(CREATE_EXPORT_CERTIFICATE, (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          offlineValidation: false,
          documentNumber,
          status: "invalid catch certificate",
          uri: "_382462d9-ea63-4125-9e11-bb1bc474d8a1.pdf",
        })
      )
    ),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.CCCheckYourInformationLockedCatchCert]: () => [
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json(ccCreatedDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
    rest.get(GET_CERTIFICATE_SUMMARY, (req, res, ctx) => res(ctx.json(ccExporterUpdated))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(CREATE_EXPORT_CERTIFICATE, (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          offlineValidation: false,
          documentNumber,
          status: "catch certificate is LOCKED",
          uri: "_382462d9-ea63-4125-9e11-bb1bc474d8a1.pdf",
        })
      )
    ),
  ],
};

export default checkYourInformationCCHandler;
