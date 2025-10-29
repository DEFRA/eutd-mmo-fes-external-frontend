import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  LANDINGS_TYPE_URL,
  GET_DIRECT_LANDINGS_URL,
  mockSearchVesselName,
  VALIDATE_DIRECT_LANDINGS_URL,
  CONSERVATION_URL,
  mockGetAllDocumentsUrl,
  ADDED_SPECIES_URL,
  SPECIES_URL,
  FAVOURITES_URL,
  SPECIES_STATE_LOOK_UP,
  COMMODITY_CODE_LOOK_UP,
  ADD_SPECIES_URL,
  GET_GEAR_CATEGORIES_URL,
  mockGetGearTypesByCategoriesUrl,
  GET_RFMO_AREAS_URL,
} from "~/urls.server";
import directLandingType from "@/fixtures/landingsTypeApi/directLanding.json";
import manualLandingType from "@/fixtures/landingsTypeApi/manualEntry.json";
import directLandings from "@/fixtures/directLanding/directLandings.json";
import directLandingsIncorrectWeights from "@/fixtures/directLanding/directLandingsIncorrectWeights.json";
import emptyDirectLanding from "@/fixtures/directLanding/directLandingEmpty.json";
import getVessels from "@/fixtures/directLanding/getVessels.json";
import directLandingvalidationRes from "@/fixtures/directLanding/directLandingvalidationRes.json";
import directLandingvalidationGearTypeRes from "@/fixtures/directLanding/directLandingvalidationGearTypeError.json";
import errorDirectLandingvalidationRes from "@/fixtures/directLanding/errorDirectLandingsRes.json";
import directLandingsWithErrors from "@/fixtures/directLanding/directLandingsWithErrors.json";
import species from "@/fixtures/referenceDataApi/species.json";
import favourites from "@/fixtures/whatAreYouExportingApi/favourites.json";
import commodityCode from "@/fixtures/whatAreYouExportingApi/commodityCode.json";
import speciesStateLookup from "@/fixtures/whatAreYouExportingApi/speciesStateLookup.json";
import speciesAddedPerUser from "@/fixtures/whatAreYouExportingApi/speciesAddedPerUser.json";
import addOrUpdateResponse from "@/fixtures/whatAreYouExportingApi/addOrUpdateResponse.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import empty from "@/fixtures/empty.json";
import getGearCategories from "@/fixtures/addLandings/getGearCategories.json";
import getGearTypesByCategory from "@/fixtures/addLandings/getGearTypesByCategory.json";
import getRfmos from "@/fixtures/directLanding/getRfmos.json";

let unauthorised = false;

const directLandingHandler: ITestHandler = {
  [TestCaseId.DirectLanding]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
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
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.DirectLandingNoVessels]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandings))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json([]))),
    rest.post(VALIDATE_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingvalidationRes))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.DirectLandingUnauthorised]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(VALIDATE_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingvalidationRes))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => {
      if (!unauthorised) {
        unauthorised = true;
        return res(ctx.json(directLandings));
      }
      unauthorised = false;
      return res(ctx.status(403));
    }),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.DirectLandingEmpty]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(emptyDirectLanding))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(VALIDATE_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingvalidationRes))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.DirectLandingErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingsWithErrors))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(VALIDATE_DIRECT_LANDINGS_URL, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(errorDirectLandingvalidationRes))
    ),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.DirectLandingPageGuard]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualLandingType))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandings))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.DirectLandingPageAllowed]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
  ],
  [TestCaseId.DirectLandingIncorrectWeights]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingsIncorrectWeights))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json([]))),
    rest.post(VALIDATE_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingvalidationRes))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.DirectLandingPageErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandings))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.status(500))),
    rest.post(VALIDATE_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingvalidationRes))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.DirectLandingPageGearTypeErrors]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandings))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(VALIDATE_DIRECT_LANDINGS_URL, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(directLandingvalidationGearTypeRes))
    ),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
};

export default directLandingHandler;
