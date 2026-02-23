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
import directLandingsCoverage from "@/fixtures/directLandingCoverage/directLandingsCoverage.json";
import directLandingValidationRes from "@/fixtures/directLanding/directLandingvalidationRes.json";
import getVessels from "@/fixtures/directLanding/getVessels.json";
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

// This handler is used exclusively by directLanding.coverage.spec.ts to expose
// the client-side error branches (lines 150, 182-184, 187, 253-257) and the
// string-weight parse context (line 223).
//
// All server-side (SSR) reference-data calls return success responses so the
// initial page load never returns HTTP 500.  The client-side fetch failures
// (/get-vessels, /get-gear-types) are forced by cy.intercept in the spec itself.
const directLandingCoverageHandler: ITestHandler = {
  [TestCaseId.DirectLandingCoverageBranches]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLandingType))),
    // Fixture has exportWeight: "3.5" (string) for second species to exercise string-weight context
    rest.get(GET_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingsCoverage))),
    // Return a successful vessel list so SSR (getVesselsNoJs) does not throw
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(VALIDATE_DIRECT_LANDINGS_URL, (req, res, ctx) => res(ctx.json(directLandingValidationRes))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(SPECIES_STATE_LOOK_UP, (req, res, ctx) => res(ctx.json(speciesStateLookup))),
    rest.get(COMMODITY_CODE_LOOK_UP, (req, res, ctx) => res(ctx.json(commodityCode))),
    rest.post(ADD_SPECIES_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    // Return success so SSR (getAllGearTypesByCategory in loader) does not throw
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
};

export default directLandingCoverageHandler;
