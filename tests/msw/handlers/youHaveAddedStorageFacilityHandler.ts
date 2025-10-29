import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import noFacilities from "@/fixtures/storageDocumentApi/storageDocumentNoFacilities.json";
import {
  GET_STORAGE_DOCUMENT,
  getProgressUrl,
  mockGetAllDocumentsUrl,
  mockSaveAndValidateDocument,
  mockGetAddStoargaDocumentUrl,
  EXPORT_LOCATION_URL,
} from "~/urls.server";
import oneValidFacility from "@/fixtures/storageDocumentApi/storageDocumentOneFacility.json";
import twoValidFacilities from "@/fixtures/storageDocumentApi/storageDocumentTwoFacility.json";
import threeValidFacilities from "@/fixtures/storageDocumentApi/storageDocumentThreeFacility.json";
import sdProgressIncomplete from "@/fixtures/progressApi/sdIncomplete.json";
import sdDocuments from "@/fixtures/dashboardApi/sdDocument.json";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import storageDocumentFacilityNameError from "@/fixtures/storageDocumentApi/storageDocumentFacilityNameError.json";

const youHaveAddedStorageFacilityHandler: ITestHandler = {
  [TestCaseId.SDFacilityWithNoFacilities]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(noFacilities))),
  ],
  [TestCaseId.SDFacilityWithNoResponse]: () => [rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json({})))],
  [TestCaseId.SDFacilityAddedBlankOneFacility]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneValidFacility))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(oneValidFacility))),
  ],
  [TestCaseId.SDFacilityAddedBlankTwoFacilities]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(twoValidFacilities))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(twoValidFacilities))),
  ],
  [TestCaseId.SDFacilityAddedBlankThreeFacilities]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(threeValidFacilities))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))), //is this correct
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(threeValidFacilities))),
  ],
  [TestCaseId.SDFacilityTwoFacilities]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(twoValidFacilities))),
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(storageDocumentFacilityNameError))
    ),
  ],
  [TestCaseId.SDFacilityTwoFacilitiesDetails]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(twoValidFacilities))),
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(twoValidFacilities))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(twoValidFacilities))),
  ],
  [TestCaseId.SDFacilityTwoFacilitiesSaveAsDraft]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(twoValidFacilities))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(twoValidFacilities))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
  ],
  [TestCaseId.SDFacilityNoFacilitiesSaveAsDraft]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(twoValidFacilities))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(noFacilities))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
  ],
  [TestCaseId.SDFacilityNoFacilitiesSaveAsDraftGetErrors]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(twoValidFacilities))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.json(storageDocumentFacilityNameError))
    ),
  ],
};

export default youHaveAddedStorageFacilityHandler;
