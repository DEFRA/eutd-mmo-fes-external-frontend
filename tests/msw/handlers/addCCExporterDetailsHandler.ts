import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  LANDINGS_TYPE_URL,
  getAddExporterDetailsUrl,
  ADDED_SPECIES_URL,
  COMMODITY_CODE_LOOK_UP,
  FAVOURITES_URL,
  SPECIES_STATE_LOOK_UP,
  SPECIES_URL,
  mockGetAllDocumentsUrl,
  mockGetIdmUserDetails,
  mockGetIdmAddressDetails,
} from "~/urls.server";
import exporterDetails from "@/fixtures/addExporterDetails/exporterDetails.json";
import exporterResponse from "@/fixtures/addExporterDetails/exporterResponse.json";
import exporterErrorResponse from "@/fixtures/addExporterDetails/exporterErrorResponse.json";
import addedSpecies from "@/fixtures/addExporterDetails/addedSpecies.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import uploadEntry from "@/fixtures/landingsTypeApi/uploadEntry.json";
import directLanding from "@/fixtures/landingsTypeApi/directLanding.json";
import species from "@/fixtures/referenceDataApi/species.json";
import speciesStateLookup from "@/fixtures/whatAreYouExportingApi/speciesStateLookup.json";
import commodityCode from "@/fixtures/whatAreYouExportingApi/commodityCode.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";

const addCCExporterDetailsHandler: ITestHandler = {
  [TestCaseId.CCAddExporterDetails]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
  ],
  [TestCaseId.CCAddExporterDetailsFromIdm]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterResponse))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(addedSpecies))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
  ],
  [TestCaseId.CCAddExporterDetailsFromAdmin]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(mockGetIdmUserDetails, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetIdmAddressDetails, (req, res, ctx) => res(ctx.json({}))),
    rest.post(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(addedSpecies))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
  ],
  [TestCaseId.CCAddExporterDetailsSaveManualEntry]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterResponse))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(addedSpecies))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
  ],
  [TestCaseId.CCAddExporterDetailsSaveUploadEntry]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntry))),
    rest.post(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterResponse))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(addedSpecies))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
  ],
  [TestCaseId.CCAddExporterDetailsSaveDirectLanding]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
    rest.post(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterResponse))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(addedSpecies))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
  ],
  [TestCaseId.CCAddExporterDetailsSaveAsDraft]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterResponse))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
  ],
  [TestCaseId.CCAddExporterDetailsFailsWith403]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
    rest.post(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) =>
      res(ctx.status(403), ctx.json(exporterResponse))
    ),
  ],
  [TestCaseId.CCAddExporterDetailsFailsWithErrors]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLanding))),
    rest.post(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(exporterErrorResponse))
    ),
  ],
  [TestCaseId.CCAddExporterDetails403]: () => [
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) =>
      res(ctx.status(403), ctx.json(exporterResponse))
    ),
  ],
};

export default addCCExporterDetailsHandler;
