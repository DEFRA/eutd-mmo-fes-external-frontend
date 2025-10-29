import { type ITestHandler, TestCaseId } from "~/types";
import { rest } from "msw";
import sdProductAddedPageData from "@/fixtures/storageDocumentApi/storageDocumentProductAddedPageData.json";
import sdProductAddedValidData from "@/fixtures/storageDocumentApi/storageDocumentProductAddedValidData.json";
import sdProductAddedInvalidData from "@/fixtures/storageDocumentApi/storageDocumentProductAddedInvalidData.json";
import sdProductAddedNoCatches from "@/fixtures/storageDocumentApi/storageDocumentNoCatches.json";
import species from "@/fixtures/referenceDataApi/species.json";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import sdDocuments from "@/fixtures/dashboardApi/sdDocument.json";

import {
  GET_STORAGE_DOCUMENT,
  mockGetAddStoargaDocumentUrl,
  mockGetAllDocumentsUrl,
  mockSaveAndValidateDocument,
  SPECIES_URL,
} from "~/urls.server";

const storageProductAddedHandler: ITestHandler = {
  [TestCaseId.SDYouHaveAddedAProduct]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(sdProductAddedPageData))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
  ],

  [TestCaseId.SDProductAddedValid]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(sdProductAddedValidData))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(sdProductAddedValidData))),
  ],
  [TestCaseId.SDProductAddedInvalid]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(sdProductAddedInvalidData))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(sdProductAddedInvalidData))
    ),
  ],
  [TestCaseId.SDProductAddedNoCatches]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(sdProductAddedNoCatches))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
};
export default storageProductAddedHandler;
