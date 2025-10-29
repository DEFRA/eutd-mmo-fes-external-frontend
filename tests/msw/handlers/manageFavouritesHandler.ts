import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  COMMODITY_CODE_LOOK_UP,
  FAVOURITES_URL,
  SPECIES_STATE_LOOK_UP,
  SPECIES_URL,
  mockGetAllDocumentsUrl,
  LANDINGS_TYPE_URL,
  ADDED_SPECIES_URL,
  ADD_SPECIES_URL,
  mockFavouriteUrl,
} from "~/urls.server";
import commodityCode from "@/fixtures/whatAreYouExportingApi/commodityCode.json";
import favourites from "@/fixtures/whatAreYouExportingApi/favourites.json";
import species from "@/fixtures/referenceDataApi/species.json";
import speciesUndefined from "@/fixtures/referenceDataApi/speciesUndefined.json";
import speciesStateLookup from "@/fixtures/whatAreYouExportingApi/speciesStateLookup.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import speciesAddedPerUser from "@/fixtures/whatAreYouExportingApi/speciesAddedPerUser.json";
import addOrUpdateResponse from "@/fixtures/whatAreYouExportingApi/addOrUpdateResponse.json";

const manageFavouritesHandler: ITestHandler = {
  [TestCaseId.ManageFavourites]: () => [
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.post(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.delete(mockFavouriteUrl, (req, res, ctx) => res(ctx.json([]))),
  ],
  [TestCaseId.ManageFavouritesUndefinedSpecies]: () => [
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.post(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesUndefined))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.delete(mockFavouriteUrl, (req, res, ctx) => res(ctx.json([]))),
  ],
  [TestCaseId.ManageFavouritesForbidden]: () => [
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.post(FAVOURITES_URL, (req, res, ctx) => res.once(ctx.status(403))),
  ],
  [TestCaseId.ManageFavouritesWithErrors]: () => [
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.post(FAVOURITES_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          errors: {
            species: {
              key: "species",
              message: "ccProductFavouritesPageErrorSpeciesName",
            },
            state: {
              key: "state",
              message: "ccProductFavouritesPageErrorState",
            },
            presentation: {
              key: "presentation",
              message: "ccProductFavouritesPageErrorPresentation",
            },
            commodity_code: {
              key: "commodity_code",
              message: "ccProductFavouritesPageErrorCommodityCode",
            },
          },
        })
      )
    ),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.delete(mockFavouriteUrl, (req, res, ctx) => res(ctx.json([]))),
  ],
};

export default manageFavouritesHandler;
