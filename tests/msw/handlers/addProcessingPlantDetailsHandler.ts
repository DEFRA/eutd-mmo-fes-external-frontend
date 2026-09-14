import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import processingStatementError from "@/fixtures/processingStatementApi/processingStatementError.json";
import processingStatementAddPlantAddressError from "@/fixtures/processingStatementApi/processingStatementAddPlantAddressError.json";
import psDocuments from "@/fixtures/dashboardApi/psDocument.json";
import psProgressIncomplete from "@/fixtures/progressApi/psIncomplete.json";
import {
  mockSaveAndValidateDocument,
  GET_PROCESSING_STATEMENT,
  mockGetAllDocumentsUrl,
  mockGetProgress,
  PROCESSING_PLANTS_URL,
  mockProcessingPlantsUrl,
} from "~/urls.server";

const processingPlants = [
  {
    tradingName: "Test Fish Plant",
    approvalNumber: {
      content: "UK/1234/EC",
    },
    address: {
      line1: "1 Harbour Way",
      cityName: "Grimsby",
      postCode: {
        code: "DN31 1AB",
      },
      country: {
        countryName: "United Kingdom",
      },
    },
  },
  {
    tradingName: "Ocean Prime Processing Ltd",
    approvalNumber: {
      content: "UK/1111/EC",
    },
    address: {
      line1: "Unit 1 Dock Road",
      line2: "Industrial Estate",
      cityName: "Grimsby",
      postCode: {
        code: "DN31 1AB",
      },
      country: {
        countryName: "United Kingdom",
      },
    },
  },
  {
    tradingName: "Harbour Seafood Processors",
    approvalNumber: {
      content: "UK/2222/EC",
    },
    address: {
      line1: "Pier House",
      line2: "Quayside",
      line3: "Docklands",
      cityName: "Hull",
      postCode: {
        code: "HU1 2CD",
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
    address: {
      line1: "Pier House",
      cityName: "Hull",
      postCode: {
        code: "HU1 2CD",
      },
      country: {
        countryName: "United Kingdom",
      },
    },
  },
  {
    tradingName: "Northern Fish Works",
    approvalNumber: {
      content: "UK/3333/EC",
    },
    address: {
      line1: "4 Market Road",
      cityName: "Whitby",
      postCode: {
        code: "YO21 3AB",
      },
      country: {
        countryName: "United Kingdom",
      },
    },
  },
];

const getProcessingPlantsHandlers = (plants: unknown[]) => [
  rest.get(PROCESSING_PLANTS_URL, (req, res, ctx) => res(ctx.json(plants))),
  rest.get(mockProcessingPlantsUrl, (req, res, ctx) => res(ctx.json(plants))),
];
let isUnauthorised = false;

const addProcessingPlantDetailsHandler: ITestHandler = {
  [TestCaseId.PSAddProcessingPlantDetails]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    ...getProcessingPlantsHandlers(processingPlants),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsUnauthorised]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res.once(ctx.status(403))),
  ],
  [TestCaseId.PSPostAddProcessingPlantDetails]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsMatchByApproval]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsMatchByName]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsNoMatch]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    ...getProcessingPlantsHandlers(processingPlantsNoMatch),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementAddPlantAddressError))
    ),
  ],
  [TestCaseId.PSPostAddConsignmentDetailsError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementError))
    ),
  ],
  [TestCaseId.PSPostAddConsignmentDetailsUnauthorised]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) => res.once(ctx.status(403))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSGetPostAddConsignmentDetailsUnauthorised]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
      if (!isUnauthorised) {
        isUnauthorised = true;
        return res(ctx.json(processingStatement));
      }

      isUnauthorised = false;
      return res.once(ctx.status(403));
    }),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsSaveAsDraftWithErrors]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    ...getProcessingPlantsHandlers(processingPlants),
    // persistent 200 handler must come first so that after setApiMock's forEach-prepend
    // it ends up BEHIND the res.once(400) handler in MSW's stack
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res.once(ctx.status(400), ctx.json(processingStatementError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
  ],
  [TestCaseId.PSAddProcessingPlantDetailsSaveAsDraftNoErrors]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    ...getProcessingPlantsHandlers(processingPlants),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
  ],
};

export default addProcessingPlantDetailsHandler;
