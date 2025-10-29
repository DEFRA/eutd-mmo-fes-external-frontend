import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  LANDINGS_TYPE_URL,
  ADDED_SPECIES_URL,
  COMMODITY_CODE_LOOK_UP,
  FAVOURITES_URL,
  SPECIES_STATE_LOOK_UP,
  SPECIES_URL,
  ADD_SPECIES_URL,
  EXPORT_PAYLOAD_URL,
  mockGetAllDocumentsUrl,
  mockUpdateFishUrl,
  GET_DIRECT_LANDINGS_URL,
  mockSearchVesselName,
  mockEditProductUrl,
  GET_GEAR_CATEGORIES_URL,
  mockGetGearTypesByCategoriesUrl,
  GET_RFMO_AREAS_URL,
} from "~/urls.server";
import nullLandingsType from "@/fixtures/landingsTypeApi/null.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import directLandings from "@/fixtures/directLanding/directLandings.json";
import directLandingType from "@/fixtures/landingsTypeApi/directLanding.json";
import species from "@/fixtures/referenceDataApi/species.json";
import favourites from "@/fixtures/whatAreYouExportingApi/favourites.json";
import commodityCode from "@/fixtures/whatAreYouExportingApi/commodityCode.json";
import speciesStateLookup from "@/fixtures/whatAreYouExportingApi/speciesStateLookup.json";
import speciesAddedPerUser from "@/fixtures/whatAreYouExportingApi/speciesAddedPerUser.json";
import speciesAddedPerUserWith100Products from "@/fixtures/whatAreYouExportingApi/speciesAddedPerUserWith100Products.json";
import addOrUpdateResponse from "@/fixtures/whatAreYouExportingApi/addOrUpdateResponse.json";
import addOrUpdateResponseNoFavourites from "@/fixtures/whatAreYouExportingApi/addOrUpdateResponseNoFavourite.json";
import emptySpeciesAddedPerUser from "@/fixtures/whatAreYouExportingApi/emptySpeciesAddedPerUser.json";
import addSpecies from "@/fixtures/whatAreYouExportingApi/addSpeciesToFavourite.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import getVessels from "@/fixtures/directLanding/getVessels.json";
import getGearCategories from "@/fixtures/addLandings/getGearCategories.json";
import getGearTypesByCategory from "@/fixtures/addLandings/getGearTypesByCategory.json";
import getRfmos from "@/fixtures/directLanding/getRfmos.json";

const whatAreYouExportingHandler: ITestHandler = {
  [TestCaseId.WhatAreYouExporting]: () => [
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.post(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.put(mockUpdateFishUrl, (req, res, ctx) => res(ctx.status(200), ctx.json({}))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
  ],
  [TestCaseId.WhatAreYouExportingNoFavourite]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponseNoFavourites))),
    rest.post(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.put(mockUpdateFishUrl, (req, res, ctx) => res(ctx.status(200), ctx.json({}))),
  ],
  [TestCaseId.WhatAreYouExportingDirectLanding]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandings))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.post(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.put(mockUpdateFishUrl, (req, res, ctx) => res(ctx.status(200), ctx.json({}))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.WhatAreYouExportingErrorsOnSave]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(emptySpeciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADDED_SPECIES_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          message: "ccWhatExportingFromAtleastOneProductError",
        })
      )
    ),
  ],
  [TestCaseId.WhatAreYouExportingEditErrorsOnSave]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.put(mockEditProductUrl, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          message: "ccProductFavouritesPageErrorCommodityCode",
        })
      )
    ),
  ],
  [TestCaseId.WhatAreYouExportingErrorsOnSaveFromFavourites]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(emptySpeciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json([]))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          message: "ccWhatExportingFromSelectProductFavouriteListError",
        })
      )
    ),
  ],
  [TestCaseId.WhatAreYouExportingErrorsOnSaveFromEmptyFavourites]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(emptySpeciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          message: "ccWhatExportingFromSelectProductFavouriteListError",
        })
      )
    ),
  ],
  [TestCaseId.WhatAreYouExportingErrorsOnProductSave]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          species: "error.species.string.empty",
          state: "error.state.string.empty",
          presentation: "error.presentation.string.empty",
          commodity_code: "error.commodity_code.any.invalid",
        })
      )
    ),
  ],

  [TestCaseId.WhatAreYouExportingPageGuard]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(nullLandingsType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
  ],
  [TestCaseId.WhatAreYouExportingFailsWith403]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.status(403))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
  ],
  [TestCaseId.WhatAreYouExportingWith100Products]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUserWith100Products))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
  ],
  [TestCaseId.WhatAreYouExportingProductAddedToFavourites]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addSpecies))),
    rest.post(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.status(403), ctx.json({ errors: [], unauthorised: true }))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json({}))),
  ],
};

export default whatAreYouExportingHandler;
