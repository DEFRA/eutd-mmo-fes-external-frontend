import { rest } from "msw";
import { TestCaseId, type ITestHandler } from "~/types";
import {
  ADDED_SPECIES_URL,
  CLEAR_LANDINGS_URL,
  COMMODITY_CODE_LOOK_UP,
  FAVOURITES_URL,
  LANDINGS_TYPE_URL,
  SAVE_LANDINGS_URL,
  SPECIES_STATE_LOOK_UP,
  SPECIES_URL,
  UPLOAD_LANDINGS_URL,
} from "~/urls.server";

import uploadLandingsSuccess from "@/fixtures/uploadLandingsApi/ccUploadLandingSuccess.json";
import uploadLandingsError from "@/fixtures/uploadLandingsApi/ccUploadLandingUnsuccessful.json";
import uploadLandingsMissingDateLanded from "@/fixtures/uploadLandingsApi/ccUploadLandingMissingDateLanded.json";
import uploadLandingsMissingExportWeight from "@/fixtures/uploadLandingsApi/ccUploadLandingMissingExportWeight.json";
import ccUploadLandingInvalidHighSeasArea from "@/fixtures/uploadLandingsApi/ccUploadLandingInvalidHighSeasArea.json";
import ccUploadLandingUnknownEEZ from "@/fixtures/uploadLandingsApi/ccUploadLandingUnknownEEZ.json";
import ccUploadLandingInvalidEEZ from "@/fixtures/uploadLandingsApi/ccUploadLandingInvalidEEZ.json";
import ccUploadLandingUnknownRFMO from "@/fixtures/uploadLandingsApi/ccUploadLandingUnknownRFMO.json";
import uploadLandingsMissingVesselPln from "@/fixtures/uploadLandingsApi/ccUploadLandingMissingVesselPln.json";
import uploadLandingsInvalidVesselPln from "@/fixtures/uploadLandingsApi/ccUploadLandingInvalidVesselPln.json";
import uploadLandingsProductErrors from "@/fixtures/uploadLandingsApi/ccUploadLandingProductErrors.json";
import uploadLandingsGearCodeErrors from "@/fixtures/uploadLandingsApi/ccUploadLandingGearCodeErrors.json";
import species from "@/fixtures/referenceDataApi/species.json";
import favourites from "@/fixtures/whatAreYouExportingApi/favourites.json";
import commodityCode from "@/fixtures/whatAreYouExportingApi/commodityCode.json";
import speciesStateLookup from "@/fixtures/whatAreYouExportingApi/speciesStateLookup.json";
import speciesAddedPerUser from "@/fixtures/whatAreYouExportingApi/speciesAddedPerUser.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import directLandingEntryType from "@/fixtures/landingsTypeApi/directLanding.json";

const uploadLandingsHandler: ITestHandler = {
  [TestCaseId.CCUploadLandingsSuccess]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsSuccess))),
  ],
  [TestCaseId.CCUploadAvScanErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ file: "error.upload.av-failed" }))
    ),
  ],
  [TestCaseId.CCUploadCorruptFileErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ file: "error.upload.invalid-columns" }))
    ),
  ],
  [TestCaseId.CCUploadLandingsError]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsError))),
  ],
  [TestCaseId.CCUploadLandingsFileError]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(400), ctx.json({ file: "error.file.array.min" }))),
  ],
  [TestCaseId.CCUploadLandingsEmptyRows]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json([]))),
  ],
  [TestCaseId.CCUploadLandingsUndefined]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(null))),
  ],
  [TestCaseId.CCUploadLandingsForbidden]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(403))),
    rest.post(SAVE_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsSuccess))),
  ],
  [TestCaseId.CCUploadLandingsDirectLanding]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingEntryType))),
  ],
  [TestCaseId.CCUploadLandingsLandingEntryForbidden]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.CCUploadMissingDateLanded]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsMissingDateLanded))),
  ],
  [TestCaseId.CCUploadMissingExportWeight]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(uploadLandingsMissingExportWeight))
    ),
  ],
  [TestCaseId.CCUploadInvalidHighSeasArea]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) =>
      res(ctx.status(200), ctx.json(ccUploadLandingInvalidHighSeasArea))
    ),
  ],
  [TestCaseId.CCUploadUnknownEEZ]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(ccUploadLandingInvalidEEZ))),
  ],
  [TestCaseId.CCUploadInvalidEEZ]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(ccUploadLandingUnknownEEZ))),
  ],
  [TestCaseId.CCUploadUnknownRFMO]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(ccUploadLandingUnknownRFMO))),
  ],
  [TestCaseId.CCUploadMissingVesselPln]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsMissingVesselPln))),
  ],
  [TestCaseId.CCUploadInvalidVesselPln]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsInvalidVesselPln))),
  ],
  [TestCaseId.CCUploadProductErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsProductErrors))),
  ],
  [TestCaseId.CCUploadGearCodeErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsGearCodeErrors))),
  ],
  [TestCaseId.CCUploadLandingsMaxRowsError]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) =>
      res(ctx.status(400), ctx.json({ file: { key: "error.upload.max-landings", params: { limit: 100 } } }))
    ),
  ],
  [TestCaseId.CCUploadLandingsFileTooLargeError]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
  ],
  [TestCaseId.CCSaveUploadLandingsError]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsSuccess))),
    rest.post(SAVE_LANDINGS_URL, (req, res, ctx) => res(ctx.status(400), ctx.json({ file: "error.file.array.min" }))),
  ],
  [TestCaseId.CCUploadLandingsFileGenericError]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsSuccess))),
    rest.post(SAVE_LANDINGS_URL, (req, res, ctx) => res(ctx.status(400), ctx.json({ file: "error.generic" }))),
  ],
  [TestCaseId.CCSaveUploadLandingsForbidden]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsSuccess))),
    rest.post(SAVE_LANDINGS_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.CCSaveUploadLandingsSuccess]: () => [
    rest.post(UPLOAD_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsSuccess))),
    rest.post(SAVE_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsSuccess))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
  ],
  [TestCaseId.CCSaveUploadLandingsClear]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(SAVE_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json(uploadLandingsSuccess))),
    rest.post(CLEAR_LANDINGS_URL, (req, res, ctx) => res(ctx.status(200), ctx.json([]))),
  ],
  [TestCaseId.CCSaveUploadLandingsClearForbidden]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.post(CLEAR_LANDINGS_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
};

export default uploadLandingsHandler;
