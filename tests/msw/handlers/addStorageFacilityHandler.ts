import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  GET_STORAGE_DOCUMENT,
  mockGetAllDocumentsUrl,
  mockGetProgress,
  mockSaveAndValidateDocument,
  mockTransportDetailsUrl,
  mockAddExporterDetails,
} from "~/urls.server";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import storageDocumentFacilityNameError from "@/fixtures/storageDocumentApi/storageDocumentFacilityNameError.json";
import storageDocumentFacilityOne from "@/fixtures/storageDocumentApi/storageDocumentOneFacility.json";
import storageDocumentNoFacilities from "@/fixtures/storageDocumentApi/storageDocumentNoFacilities.json";
import storageDocuments from "@/fixtures/dashboardApi/sdDrafts.json";
import storageDocumentProgress from "@/fixtures/progressApi/sdIncomplete.json";
import truckDetails from "@/fixtures/transportDetailsApi/truck.json";
import exporterDetails from "@/fixtures/addExporterDetails/exporterDetails.json";

const addStorageFacilityHandler: ITestHandler = {
  [TestCaseId.SDAddStorageFacilityAddress]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentNoFacilities))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
  ],
  [TestCaseId.SDAddStorageFacilityAddressComplete]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.json(storageDocumentFacilityOne))
    ),
  ],
  [TestCaseId.SDAddStorageFacilityAddressError]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(storageDocumentFacilityNameError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(storageDocuments))),
  ],
  [TestCaseId.SDAddStorageFacilityAddressForbidden]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.status(403), ctx.json(storageDocument))),
  ],
};

export default addStorageFacilityHandler;
