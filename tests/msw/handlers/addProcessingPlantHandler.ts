import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import {
  GET_PROCESSING_STATEMENT,
  mockApprovedFoodEstablishmentsSearchUrl,
  mockApprovedFoodEstablishmentsTokenUrl,
  mockSaveAndValidateDocument,
} from "~/urls.server";

const processingPlants = [
  {
    id: "duplicate-processing-plant-id",
    tradingName: "MDM Duplicate Processing A",
    approvalNumber: { content: "UK/5555/EC" },
    address: { postCode: { code: "DN1 2AB" } },
  },
  {
    id: "duplicate-processing-plant-id",
    tradingName: "MDM Duplicate Processing B",
    approvalNumber: { content: "UK/6666/EC" },
  },
  {
    tradingName: "Test Fish Plant",
    approvalNumber: {
      content: "UK/1234/EC",
    },
    address: {
      line1: "Harbour House",
      cityName: "Hull",
      postCode: {
        code: "HU1 2AB",
      },
    },
  },
  {
    tradingName: "Ocean Prime Processing Ltd",
    approvalNumber: {
      content: "UK/1111/EC",
    },
  },
  {
    tradingName: "Harbour Seafood Processors",
    approvalNumber: {
      content: "UK/2222/EC",
    },
    address: {
      line1: "Gate 1",
      line2: "Dock Estate",
      line3: "North Pier",
      line4: "Shed 8",
    },
  },
  {
    tradingName: "Coastal Fish Exports Ltd",
    approvalNumber: {
      content: "UK/4444/EC",
    },
    address: {
      line1: "Unit 4",
      line2: "Fish Quay",
      cityName: "Grimsby",
      postCode: {
        code: "DN31 1SR",
      },
      country: {
        countryName: "United Kingdom",
      },
    },
  },
];

const processingPlantsNoMatch = [
  {
    tradingName: "Harbour Seafood Processors",
    approvalNumber: {
      content: "UK/2222/EC",
    },
  },
  {
    tradingName: "Northern Fish Works",
    approvalNumber: {
      content: "UK/3333/EC",
    },
  },
];

const processingStatementWithSavedPlant = {
  ...processingStatement,
  plantName: "Test Fish Plant",
  plantApprovalNumber: "UK/1234/EC",
};

// Matched establishment, no manual address override — summary should fall back to the reference establishment's address.
const {
  plantAddressOne: _plantAddressOne,
  plantBuildingName: _plantBuildingName,
  plantBuildingNumber: _plantBuildingNumber,
  plantSubBuildingName: _plantSubBuildingName,
  plantStreetName: _plantStreetName,
  plantCounty: _plantCounty,
  plantCountry: _plantCountry,
  plantTownCity: _plantTownCity,
  plantPostcode: _plantPostcode,
  ...processingStatementWithoutManualAddress
} = processingStatement;

const processingStatementWithSavedPlantNoManualAddress = {
  ...processingStatementWithoutManualAddress,
  plantName: "Test Fish Plant",
  plantApprovalNumber: "UK/1234/EC",
  plantTownCity: "Hull",
  plantPostcode: "HU1 2AB",
};

// The base fixture ships with a pre-set plantName/plantApprovalNumber (used by other specs),
// which would pre-populate the autocomplete's default value for this "no saved plant" scenario.
const {
  plantName: _plantName,
  plantApprovalNumber: _plantApprovalNumber,
  ...processingStatementWithoutSavedPlant
} = processingStatement;

const processingPlantSelectionErrorResponse = () => ({
  errors: {
    processingPlant: "psAddProcessingPlantErrorSelectPlant",
  },
});

const filterPlantsBySearch = (plants: any[], searchTerm: string) => {
  const normalized = searchTerm.trim().toLowerCase();
  if (!normalized) {
    return plants;
  }

  return plants.filter((plant) => {
    const tradingName = plant.tradingName?.toLowerCase?.() ?? "";
    const approval = plant.approvalNumber?.content?.toLowerCase?.() ?? "";
    if (tradingName.includes(normalized)) {
      return true;
    }
    return approval.includes(normalized);
  });
};

const getProcessingPlantsHandlers = (plants: any[]) => [
  rest.post(mockApprovedFoodEstablishmentsTokenUrl, (req, res, ctx) =>
    res(
      ctx.json({
        access_token: "approved-food-establishments-token",
        token_type: "Bearer",
        expires_in: 3600,
      })
    )
  ),
  rest.get(mockApprovedFoodEstablishmentsSearchUrl, (req, res, ctx) => {
    const searchTerm = req.url.searchParams.get("q") ?? "";
    return res(
      ctx.json({
        content: filterPlantsBySearch(plants, searchTerm),
      })
    );
  }),
];

const addProcessingPlantHandler: ITestHandler = {
  [TestCaseId.PSAddProcessingPlantContinue]: () => [
    // react-router issues both a document GET and a parallel .data revalidation GET for the
    // same navigation; a once()/fallback split here races between them, so keep this consistent.
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithoutSavedPlant))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantWithSavedSelection]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(processingStatementWithSavedPlantNoManualAddress))
    ),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementWithSavedPlantNoManualAddress))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantWithSavedSelectionManualAddress]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithSavedPlant))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementWithSavedPlant))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantNoMatchContinue]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithoutSavedPlant))),
    ...getProcessingPlantsHandlers(processingPlantsNoMatch),
    rest.post(mockSaveAndValidateDocument("processingStatement"), async (req, res, ctx) =>
      res(ctx.status(400), ctx.json(processingPlantSelectionErrorResponse()))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantEmptyContinue]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithoutSavedPlant))),
    ...getProcessingPlantsHandlers(processingPlantsNoMatch),
    rest.post(mockSaveAndValidateDocument("processingStatement"), async (req, res, ctx) =>
      res(ctx.status(400), ctx.json(processingPlantSelectionErrorResponse()))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantManualEntry]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    ...getProcessingPlantsHandlers(processingPlants),
  ],
  [TestCaseId.PSAddProcessingPlantSaveAsDraft]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithoutSavedPlant))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantSaveAsDraftWithErrors]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithoutSavedPlant))),
    ...getProcessingPlantsHandlers(processingPlants),
    // First probe validates and returns field errors, second forced save must still persist draft.
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res.once(
        ctx.status(400),
        ctx.json({ errors: { plantApprovalNumber: "psAddProcessingPDErrorPlantApprovalNumber" } })
      )
    ),
  ],
  // Base fixture ships with stale manual plantSubBuildingName/plantBuildingName/plantStreetName/plantCounty values;
  // matching an establishment with a full address must map plantAddressOne/plantTownCity/plantPostcode/plantCountry
  // and clear the stale manual sub-fields rather than leaving them in place (shallow-merge persistence).
  [TestCaseId.PSAddProcessingPlantMatchedAddressMapped]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithoutSavedPlant))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), async (req, res, ctx) => {
      const body = await req.json();
      const hasMappedAddress =
        body.plantName === "Coastal Fish Exports Ltd" &&
        body.plantApprovalNumber === "UK/4444/EC" &&
        body.plantAddressOne === "Unit 4, Fish Quay" &&
        body.plantTownCity === "Grimsby" &&
        body.plantPostcode === "DN31 1SR" &&
        body.plantCountry === "United Kingdom";
      const hasClearedSubFields =
        body.plantSubBuildingName === "" &&
        body.plantBuildingName === "" &&
        body.plantStreetName === "" &&
        body.plantCounty === "";

      if (!hasMappedAddress || !hasClearedSubFields) {
        return res(ctx.status(400), ctx.json(processingPlantSelectionErrorResponse()));
      }

      return res(ctx.json({ ...processingStatementWithoutSavedPlant, ...body }));
    }),
  ],
};

export default addProcessingPlantHandler;
