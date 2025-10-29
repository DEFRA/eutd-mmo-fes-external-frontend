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
import storageDocumentFacilityApprovalError from "@/fixtures/storageDocumentApi/storageDocumentFacilityApprovalError.json";
import storageDocumentFacilityOne from "@/fixtures/storageDocumentApi/storageDocumentOneFacility.json";
import storageDocuments from "@/fixtures/dashboardApi/sdDrafts.json";
import storageDocumentProgress from "@/fixtures/progressApi/sdIncomplete.json";
import truckDetails from "@/fixtures/transportDetailsApi/truck.json";
import exporterDetails from "@/fixtures/addExporterDetails/exporterDetails.json";

const addStorageApprovalHandler: ITestHandler = {
  [TestCaseId.SDAddStorageApproval]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentFacilityOne))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
  ],
  [TestCaseId.SDAddStorageApprovalComplete]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.json(storageDocumentFacilityOne))
    ),
  ],
  [TestCaseId.SDAddStorageApprovalError]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(storageDocumentFacilityApprovalError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(storageDocuments))),
  ],
  [TestCaseId.SDAddStorageApprovalForbidden]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.status(403), ctx.json(storageDocument))),
  ],
  [TestCaseId.SDAddStorageSaveAsDraft]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(200), ctx.json(storageDocument))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(storageDocuments))),
  ],
};

export default addStorageApprovalHandler;
