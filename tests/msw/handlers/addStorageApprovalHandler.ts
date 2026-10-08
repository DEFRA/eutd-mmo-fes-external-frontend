import { rest } from "msw";
import isEmpty from "lodash/isEmpty";
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
import storageDocumentFacilityApprovalInvalidCharError from "@/fixtures/storageDocumentApi/storageDocumentFacilityApprovalInvalidCharError.json";
import storageDocumentFacilityStorageError from "@/fixtures/storageDocumentApi/storageDocumentFacilityProductStorageNull.json";
import storageDocumentFacilityOne from "@/fixtures/storageDocumentApi/storageDocumentOneFacility.json";
import storageDocumentFacilityOneNoArrival from "@/fixtures/storageDocumentApi/storageDocumentOneFacilityNoArrival.json";
import storageDocuments from "@/fixtures/dashboardApi/sdDrafts.json";
import storageDocumentProgress from "@/fixtures/progressApi/sdIncomplete.json";
import truckDetails from "@/fixtures/transportDetailsApi/truck.json";
import exporterDetails from "@/fixtures/addExporterDetails/exporterDetails.json";

const addStorageApprovalHandler: ITestHandler = {
  [TestCaseId.SDAddStorageApproval]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentFacilityOneNoArrival))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    // The arrival-date check no longer short-circuits before the backend call (so both errors can
    // show together) - this must therefore respond to save-and-continue too, not just GET requests.
    rest.post(mockSaveAndValidateDocument("storageNotes"), async (req, res, ctx) => {
      const body = await req.json();

      if (isEmpty(body.facilityStorage)) {
        return res(ctx.status(400), ctx.json(storageDocumentFacilityStorageError));
      }

      return res(ctx.json({ ...storageDocumentFacilityOneNoArrival, ...body }));
    }),
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
  [TestCaseId.SDAddStorageProductStorageError]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(storageDocumentFacilityStorageError))
    ),
  ],
  [TestCaseId.SDAddStorageApprovalInvalidCharactersError]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(storageDocumentFacilityApprovalInvalidCharError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(storageDocuments))),
  ],
  [TestCaseId.SDAddStorageApprovalInvalidCharactersSaveAsDraft]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(200), ctx.json(storageDocument))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(storageDocuments))),
  ],
  [TestCaseId.SDAddStorageApprovalMaxLengthSaveAsDraft]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(200), ctx.json(storageDocument))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(storageDocuments))),
  ],
  [TestCaseId.SDAddStorageApprovalNoJs]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentFacilityOneNoArrival))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.json(storageDocumentFacilityOne))
    ),
  ],
};

export default addStorageApprovalHandler;
