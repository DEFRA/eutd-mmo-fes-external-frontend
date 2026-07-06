import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  CONSERVATION_URL,
  LANDINGS_TYPE_URL,
  mockGetAllDocumentsUrl,
  EXPORT_LOCATION_URL,
  ADDED_SPECIES_URL,
  SPECIES_URL,
  FAVOURITES_URL,
  SPECIES_STATE_LOOK_UP,
  COMMODITY_CODE_LOOK_UP,
  EXPORT_PAYLOAD_URL,
  mockSearchVesselName,
  VALIDATE_DIRECT_LANDINGS_URL,
  GET_DIRECT_LANDINGS_URL,
  GET_GEAR_CATEGORIES_URL,
  mockGetGearTypesByCategoriesUrl,
  GET_RFMO_AREAS_URL,
} from "~/urls.server";

import empty from "@/fixtures/empty.json";
import nullLandingsType from "@/fixtures/landingsTypeApi/null.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import uploadEntryLandingsType from "@/fixtures/landingsTypeApi/uploadEntry.json";
import directLandingLandingsType from "@/fixtures/landingsTypeApi/directLanding.json";
import whoseWatersSuccess from "@/fixtures/whoseWatersApi/whoseWatersSuccess.json";
import speciesAddedPerUser from "@/fixtures/whatAreYouExportingApi/speciesAddedPerUser.json";
import speciesStateLookup from "@/fixtures/whatAreYouExportingApi/speciesStateLookup.json";
import commodityCode from "@/fixtures/whatAreYouExportingApi/commodityCode.json";
import species from "@/fixtures/referenceDataApi/species.json";
import favourites from "@/fixtures/whatAreYouExportingApi/favourites.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import addLandings from "@/fixtures/addLandings/addLandings.json";
import getVessels from "@/fixtures/directLanding/getVessels.json";
import directLandings from "@/fixtures/directLanding/directLandings.json";
import directLandingvalidationRes from "@/fixtures/directLanding/directLandingvalidationRes.json";
import getGearCategories from "@/fixtures/addLandings/getGearCategories.json";
import getGearTypesByCategory from "@/fixtures/addLandings/getGearTypesByCategory.json";
import getRfmos from "@/fixtures/directLanding/getRfmos.json";

const whoseWaterWereTheyCaughtInHandler: ITestHandler = {
  [TestCaseId.WhoseWatersNull]: () => [
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
  ],
  [TestCaseId.WhoseWatersNoProducts]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json({ species: [] }))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
  ],
  [TestCaseId.WhoseWatersTypePageGuard]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(nullLandingsType))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
  ],
  [TestCaseId.GetWhoseWatersFailsWith403]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.status(403))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
  ],
  [TestCaseId.PostWhoseWatersFailsWith403]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.post(CONSERVATION_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.WhoseWatersFailsWithErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.post(CONSERVATION_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          watersCaughtIn: "error.watersCaughtIn.object.missing",
          otherWaters: "error.otherWaters.string.empty",
        })
      )
    ),
  ],
  [TestCaseId.WhoseWatersSuccess]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingLandingsType))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.post(CONSERVATION_URL, (req, res, ctx) => res(ctx.json({ whoseWatersSuccess }))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandings))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(VALIDATE_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingvalidationRes))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
};

export default whoseWaterWereTheyCaughtInHandler;
