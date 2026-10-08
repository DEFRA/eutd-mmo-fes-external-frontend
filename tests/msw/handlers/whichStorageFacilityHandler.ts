import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import storageDocumentNoFacilities from "@/fixtures/storageDocumentApi/storageDocumentNoFacilities.json";
import storageDocuments from "@/fixtures/dashboardApi/sdDrafts.json";
import {
  GET_STORAGE_DOCUMENT,
  STORAGE_FACILITIES_URL,
  mockStorageFacilitiesUrl,
  mockGetAllDocumentsUrl,
  mockSaveAndValidateDocument,
} from "~/urls.server";

const storageFacilities = [
  {
    tradingName: "Test Cold Store",
    approvalNumber: {
      content: "UK/5555/CS",
    },
    address: {
      line1: "1 Dock Road",
      cityName: "Hull",
      postCode: {
        code: "HU1 2AB",
      },
    },
  },
  {
    tradingName: "Harbour Frozen Storage",
    approvalNumber: {
      content: "UK/6666/CS",
    },
  },
];

// Matched establishment already saved on the document.
const storageDocumentWithSavedFacility = {
  ...storageDocumentNoFacilities,
  facilityName: "Test Cold Store",
  facilityApprovalNumber: "UK/5555/CS",
};

// A manual address saved before the facility name is captured (on add-storage-facility-approval) -
// the summary must still display, falling back to the address as its bold heading.
const { facilityName: _facilityName, ...storageDocumentNoFacilitiesWithoutName } =
  storageDocumentNoFacilities as Record<string, unknown>;
const storageDocumentWithSavedManualAddressNoName = {
  ...storageDocumentNoFacilitiesWithoutName,
  facilityAddressOne: "12 Manual Street",
  facilityTownCity: "Manualville",
  facilityPostcode: "MN1 1AA",
};

const getStorageFacilitiesHandlers = (facilities: unknown[]) => [
  rest.get(STORAGE_FACILITIES_URL, (req, res, ctx) => res(ctx.json(facilities))),
  rest.get(mockStorageFacilitiesUrl, (req, res, ctx) => res(ctx.json(facilities))),
];

const whichStorageFacilityHandler: ITestHandler = {
  [TestCaseId.SDWhichStorageFacilityContinue]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentNoFacilities))),
    ...getStorageFacilitiesHandlers(storageFacilities),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.json(storageDocumentWithSavedFacility))
    ),
  ],
  [TestCaseId.SDWhichStorageFacilityWithSavedSelection]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentWithSavedFacility))),
    ...getStorageFacilitiesHandlers(storageFacilities),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.json(storageDocumentWithSavedFacility))
    ),
  ],
  [TestCaseId.SDWhichStorageFacilitySavedManualEntry]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentWithSavedManualAddressNoName))),
    ...getStorageFacilitiesHandlers(storageFacilities),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.json(storageDocumentWithSavedManualAddressNoName))
    ),
  ],
  [TestCaseId.SDWhichStorageFacilityEmptyContinue]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentNoFacilities))),
    ...getStorageFacilitiesHandlers(storageFacilities),
  ],
  [TestCaseId.SDWhichStorageFacilityManualEntry]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentNoFacilities))),
    ...getStorageFacilitiesHandlers(storageFacilities),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(storageDocuments))),
  ],
};

export default whichStorageFacilityHandler;
