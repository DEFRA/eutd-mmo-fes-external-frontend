import { rest } from "msw";
import { type Establishment, type ITestHandler, TestCaseId } from "~/types";
import storageDocumentNoFacilities from "@/fixtures/storageDocumentApi/storageDocumentNoFacilities.json";
import storageDocuments from "@/fixtures/dashboardApi/sdDrafts.json";
import {
  GET_STORAGE_DOCUMENT,
  STORAGE_FACILITIES_URL,
  mockApprovedFoodEstablishmentsSearchUrl,
  mockApprovedFoodEstablishmentsTokenUrl,
  mockStorageFacilitiesUrl,
  mockGetAllDocumentsUrl,
  mockSaveAndValidateDocument,
} from "~/urls.server";

const storageFacilities = [
  {
    tradingName: "DFDS Logistics Scotland Aberdeen",
    approvalNumber: { content: "AA 220" },
    address: {
      line1: "Unit 8 Peterseat Drive",
      line2: "Altens",
      line3: "Aberdeen",
      cityName: "",
      postCode: { code: "AB12 3HT" },
    },
  },
  {
    id: "duplicate-storage-facility-id",
    tradingName: "MDM Duplicate Storage A",
    approvalNumber: { content: "UK/7777/CS" },
    address: { postCode: { code: "HU2 3CD" } },
  },
  {
    id: "duplicate-storage-facility-id",
    tradingName: "MDM Duplicate Storage B",
    approvalNumber: { content: "UK/8888/CS" },
  },
  {
    tradingName: "Test Cold Store",
    approvalNumber: {
      content: "UK/5555/CS",
    },
    address: {
      line1: "1 Dock Road",
      line2: "Altens",
      line3: "Aberdeen",
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
  {
    tradingName: "Gourdie Farm Associates",
    approvalNumber: {
      content: "DB 022",
    },
    address: {
      line1: "Gourdie Farm",
      cityName: "Dundee",
      postCode: {
        code: "DD2 1XD",
      },
    },
  },
  {
    tradingName: "Storage Without Town",
    approvalNumber: {
      content: "UK/9999/CS",
    },
    address: {
      line1: "8 Harbour Road",
      postCode: {
        code: "HU3 4AB",
      },
    },
  },
];

// Matched establishment already saved on the document.
const storageDocumentWithSavedFacility = {
  ...storageDocumentNoFacilities,
  facilityName: "Test Cold Store",
  facilityApprovalNumber: "UK/5555/CS",
  facilityAddressOne: "1 Dock Road, Altens, Aberdeen",
  facilityTownCity: "Hull",
  facilityPostcode: "HU1 2AB",
};
// A manual address saved before the facility name is captured (on add-storage-facility-details) -
// the summary must still display, falling back to the address as its bold heading.
const { facilityName: _facilityName, ...storageDocumentNoFacilitiesWithoutName } =
  storageDocumentNoFacilities as Record<string, unknown>;
const storageDocumentWithSavedManualAddressNoName = {
  ...storageDocumentNoFacilitiesWithoutName,
  facilityAddressOne: "12 Manual Street",
  facilityTownCity: "Manualville",
  facilityPostcode: "MN1 1AA",
};

const filterFacilitiesBySearch = (facilities: Establishment[], searchTerm: string): Establishment[] => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  if (!normalizedSearchTerm) {
    return facilities;
  }

  return facilities.filter((facility) => {
    const tradingName = facility.tradingName?.toLowerCase() ?? "";
    const approvalNumber = facility.approvalNumber?.content?.toLowerCase() ?? "";
    return tradingName.includes(normalizedSearchTerm) || approvalNumber.includes(normalizedSearchTerm);
  });
};

const getStorageFacilitiesHandlers = (facilities: Establishment[]) => [
  rest.get(STORAGE_FACILITIES_URL, (req, res, ctx) => res(ctx.json(facilities))),
  rest.get(mockStorageFacilitiesUrl, (req, res, ctx) => res(ctx.json(facilities))),
  rest.post(mockApprovedFoodEstablishmentsTokenUrl, (req, res, ctx) =>
    res(ctx.json({ access_token: "approved-food-establishments-token", token_type: "Bearer", expires_in: 3600 }))
  ),
  rest.get(mockApprovedFoodEstablishmentsSearchUrl, (req, res, ctx) => {
    const searchTerm = req.url.searchParams.get("q") ?? "";
    return res(ctx.json({ content: filterFacilitiesBySearch(facilities, searchTerm) }));
  }),
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
    rest.post(mockSaveAndValidateDocument("storageNotes"), async (req, res, ctx) => {
      const body = await req.json();
      return res(ctx.json({ ...storageDocumentWithSavedFacility, ...body }));
    }),
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
