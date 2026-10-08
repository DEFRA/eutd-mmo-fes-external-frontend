import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import {
  GET_PROCESSING_STATEMENT,
  PROCESSING_PLANTS_URL,
  mockProcessingPlantsUrl,
  mockSaveAndValidateDocument,
} from "~/urls.server";

const processingPlants = [
  {
    tradingName: "Test Fish Plant",
    approvalNumber: {
      content: "UK/1234/EC",
    },
    address: {
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
};

// The base fixture ships with a pre-set plantName/plantApprovalNumber (used by other specs),
// which would pre-populate the autocomplete's default value for this "no saved plant" scenario.
const {
  plantName: _plantName,
  plantApprovalNumber: _plantApprovalNumber,
  ...processingStatementWithoutSavedPlant
} = processingStatement;

const processingPlantSelectionErrorResponse = (isNonJs: boolean) =>
  isNonJs
    ? {
        errors: {
          plantName: "psAddProcessingPlantAddressErrorNullPlantName",
          plantApprovalNumber: "psAddProcessingPDErrorPlantApprovalNumber",
        },
      }
    : {
        errors: {
          processingPlant: "psAddProcessingPlantErrorSelectPlant",
        },
      };

const getProcessingPlantsHandlers = (plants: unknown[]) => [
  rest.get(PROCESSING_PLANTS_URL, (req, res, ctx) => res(ctx.json(plants))),
  rest.get(mockProcessingPlantsUrl, (req, res, ctx) => res(ctx.json(plants))),
];

const addProcessingPlantHandler: ITestHandler = {
  [TestCaseId.PSAddProcessingPlantContinue]: () => [
    // subsequent loads (e.g. details page after saving) — lowest MSW priority
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithSavedPlant))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    // initial page load — highest MSW priority, consumed once
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res.once(ctx.json(processingStatementWithoutSavedPlant))),
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
    rest.post(mockSaveAndValidateDocument("processingStatement"), async (req, res, ctx) => {
      const body = await req.json();
      const isNonJs = body?.isNonJs === true || body?.isNonJs === "true";
      return res(ctx.status(400), ctx.json(processingPlantSelectionErrorResponse(isNonJs)));
    }),
  ],
  [TestCaseId.PSAddProcessingPlantEmptyContinue]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithoutSavedPlant))),
    ...getProcessingPlantsHandlers(processingPlantsNoMatch),
    rest.post(mockSaveAndValidateDocument("processingStatement"), async (req, res, ctx) => {
      const body = await req.json();
      const isNonJs = body?.isNonJs === true || body?.isNonJs === "true";
      return res(ctx.status(400), ctx.json(processingPlantSelectionErrorResponse(isNonJs)));
    }),
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
        const isNonJs = body?.isNonJs === true || body?.isNonJs === "true";
        return res(ctx.status(400), ctx.json(processingPlantSelectionErrorResponse(isNonJs)));
      }

      return res(ctx.json({ ...processingStatementWithoutSavedPlant, ...body }));
    }),
  ],
};

export default addProcessingPlantHandler;
