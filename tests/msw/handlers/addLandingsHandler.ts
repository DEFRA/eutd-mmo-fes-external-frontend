import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  LANDINGS_TYPE_URL,
  EXPORT_PAYLOAD_URL,
  SPECIES_URL,
  FAVOURITES_URL,
  ADDED_SPECIES_URL,
  mockGetAllDocumentsUrl,
  SAVE_AND_VALIDATE_EXPORT_URL,
  mockSearchVesselName,
  CONSERVATION_URL,
  VALIDATE_LANDINGS_URL,
  mockDeleteLandingUrl,
  mockDeleteProductUrl,
  GET_GEAR_CATEGORIES_URL,
  mockGetGearTypesByCategoriesUrl,
  GET_RFMO_AREAS_URL,
} from "~/urls.server";
import speciesAddedPerUser from "@/fixtures/whatAreYouExportingApi/speciesAddedPerUser.json";
import addLandings from "@/fixtures/addLandings/addLandings.json";
import addLandingsMaxExceeded from "@/fixtures/addLandings/addLandingsMaxExceeded.json";
import species from "@/fixtures/referenceDataApi/species.json";
import favourites from "@/fixtures/whatAreYouExportingApi/favourites.json";
import mannualLandingType from "@/fixtures/landingsTypeApi/manualEntry.json";
import directLamdingType from "@/fixtures/landingsTypeApi/directLanding.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import addOrUpdateResponse from "@/fixtures/addLandings/addOrUpdateResponse.json";
import getVessels from "@/fixtures/directLanding/getVessels.json";
import empty from "@/fixtures/empty.json";
import addLandingsErrors from "@/fixtures/addLandings/addLandingErrors.json";
import getGearCategories from "@/fixtures/addLandings/getGearCategories.json";
import getGearTypesByCategory from "@/fixtures/addLandings/getGearTypesByCategory.json";
import getRfmos from "@/fixtures/addLandings/getRfmos.json";
let isUnauthorised = false;
const addLandingsHandler: ITestHandler = {
  [TestCaseId.AddLandingPageGuard]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(SAVE_AND_VALIDATE_EXPORT_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.post(VALIDATE_LANDINGS_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.AddLandingSubmitUnauthorised]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(SAVE_AND_VALIDATE_EXPORT_URL, (req, res, ctx) => res.once(ctx.status(403))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.post(VALIDATE_LANDINGS_URL, (req, res, ctx) => res.once(ctx.status(403))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.AddLandingSubmitUnauthorisedAndSupportId]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(SAVE_AND_VALIDATE_EXPORT_URL, (req, res, ctx) => res.once(ctx.status(403))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.post(VALIDATE_LANDINGS_URL, (req, res, ctx) =>
      res(ctx.json({ unauthorised: true, supportId: "supportId123" }))
    ),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.AddLandingNoPageGuard]: () => [
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(directLamdingType))),

    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
  ],
  [TestCaseId.AddLandingPageFailsWithErrors]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.post(VALIDATE_LANDINGS_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(addLandingsErrors))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.status(500))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.AddLandingPageFailsWithMaxLandingExceededError]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandingsMaxExceeded))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.AddLandingPageFailsWithErrorsOnSaveAndContinue]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(SAVE_AND_VALIDATE_EXPORT_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          errors: {
            "product_GBR-2022-CC-6F6F6B670-466934c7-0b15-43ec-a3db-e1719a36d5f2": {
              key: "error.product.landing.missing",
              params: { species: "Albacore (ALB)", state: "Fresh", presentation: "Gutted", commodityCode: "03023190" },
            },
          },
          items: [
            {
              product: {
                id: "GBR-2023-CC-2323EC498-81368201-50c5-4347-bf1f-5802be97b58b",
                commodityCode: "03045690",
                commodityCodeDescription:
                  'Fresh or chilled meat, whether or not minced, of dogfish and other sharks (excl. fillets, picked dogfish "Squalus acanthias", catsharks "Scyliorhinus spp.", porbeagle shark "Lamna nasus" and blue shark "Prionace glauca")',
                presentation: {
                  code: "OTH",
                  label: "Other presentations",
                },
                scientificName: "Centroscymnus crepidater",
                state: {
                  code: "FRE",
                  label: "Fresh",
                },
                species: {
                  code: "CYP",
                  label: "Longnose velvet dogfish (CYP)",
                },
              },
            },
          ],
        })
      )
    ),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.AddLandingPageFailsWithForbiddenOnSaveAndContinue]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(SAVE_AND_VALIDATE_EXPORT_URL, (req, res, ctx) => res(ctx.status(403), ctx.json({}))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.MannualLandingDeleteProduct]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.delete(mockDeleteLandingUrl, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.MannualLandingDeleteLandingProduct]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.delete(mockDeleteProductUrl, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.MannualLandingEmpty]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(SAVE_AND_VALIDATE_EXPORT_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.MannualEditLanding]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.post(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.status(403))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.MannuaLandingPageGuardForbidden]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.json(getVessels))),
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => {
      if (!isUnauthorised) {
        isUnauthorised = true;
        return res(ctx.json(addLandings));
      }

      isUnauthorised = false;
      return res.once(ctx.status(403));
    }),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.json(getGearTypesByCategory))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
  [TestCaseId.LandingPageErrors]: () => [
    rest.get(EXPORT_PAYLOAD_URL, (req, res, ctx) => res(ctx.json(addLandings))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(mannualLandingType))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockSearchVesselName, (req, res, ctx) => res(ctx.status(500))),
    rest.get(FAVOURITES_URL, (req, res, ctx) => res(ctx.json(favourites))),
    rest.get(ADDED_SPECIES_URL, (req, res, ctx) => res(ctx.json(speciesAddedPerUser))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(SAVE_AND_VALIDATE_EXPORT_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(CONSERVATION_URL, (req, res, ctx) => res(ctx.json(empty))),
    rest.post(VALIDATE_LANDINGS_URL, (req, res, ctx) => res(ctx.json(addOrUpdateResponse))),
    rest.get(GET_GEAR_CATEGORIES_URL, (req, res, ctx) => res(ctx.json(getGearCategories))),
    rest.get(mockGetGearTypesByCategoriesUrl, (req, res, ctx) => res(ctx.status(500))),
    rest.get(GET_RFMO_AREAS_URL, (req, res, ctx) => res(ctx.json(getRfmos))),
  ],
};

export default addLandingsHandler;
