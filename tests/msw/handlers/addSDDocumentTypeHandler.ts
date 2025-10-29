import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { GET_STORAGE_DOCUMENT, mockGetAllDocumentsUrl, mockSaveAndValidateDocument, SPECIES_URL } from "~/urls.server";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import storageDocumentTypeUndefined from "@/fixtures/storageDocumentApi/storageDocumentCertificateTypeUndefined.json";
import storageDocumentAddDocumentType from "@/fixtures/storageDocumentApi/storageDocumentAddDocumentType.json";
import storageDocumentError from "@/fixtures/storageDocumentApi/storageDocumentError.json";
import sdDocuments from "@/fixtures/dashboardApi/sdDocument.json";
import storageDocumentNoCatches from "@/fixtures/storageDocumentApi/storageDocumentNoCatches.json";
import species from "@/fixtures/referenceDataApi/species.json";

const addSDDocumentTypeHandler: ITestHandler = {
  [TestCaseId.SDAddDocumentTypeUnauthorised]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res.once(ctx.status(403))),
  ],

  [TestCaseId.SDAddDocumentTypePost]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.json(storageDocumentAddDocumentType))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
  ],

  [TestCaseId.sdDocumentTypeUndefined]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentTypeUndefined))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.json(storageDocumentTypeUndefined))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
  ],

  [TestCaseId.SDAddDocumentTypeError]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(storageDocumentError))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
  ],

  [TestCaseId.SDAddDocumentTypeNoCatches]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentNoCatches))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
};

export default addSDDocumentTypeHandler;
