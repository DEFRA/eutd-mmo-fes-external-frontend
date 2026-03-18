import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  SPECIES_URL,
  GET_STORAGE_DOCUMENT,
  mockGetAllDocumentsUrl,
  mockGetProgress,
  mockTransportDetailsUrl,
  mockGetAddStoargaDocumentUrl,
  mockCountriesUrl,
} from "~/urls.server";
import storageDocumentProgress from "@/fixtures/progressApi/sdIncomplete.json";
import sdDrafts from "@/fixtures/dashboardApi/sdDrafts.json";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import storageDocumentWithEmptySupportingDocs from "@/fixtures/storageDocumentApi/storageDocumentWithEmptySupportingDocs.json";
import species from "@/fixtures/referenceDataApi/species.json";
import countries from "@/fixtures/referenceDataApi/countries.json";
import truckDetails from "@/fixtures/transportDetailsApi/truck.json";
import storageDocumentError from "@/fixtures/storageDocumentApi/storageDocumentProductAddedInvalidData.json";
import storageDocumentProductSpeciesError from "@/fixtures/storageDocumentApi/storageDocumentProductSpeciesError.json";
import storageDocumentInvalidEntryDoc from "@/fixtures/storageDocumentApi/storageDocumentProductAddedInvalidEntryDoc.json";
import storageDocumentSpeciesError from "@/fixtures/storageDocumentApi/storageDocumentSpeciesError.json";
import storageDocumentSupportingDocumentsError from "@/fixtures/storageDocumentApi/storageDocumentSupportingDocumentsError.json";
import storageDocumentSpeciesSuggestError from "@/fixtures/storageDocumentApi/storageDocumentSpeciesSuggestError.json";
import sdAddProductConsignmentIssuingCountryRequired from "@/fixtures/saveAndValidateApi/sdAddProductConsignmentIssuingCountryRequired.json";
import sdAddProductConsignmentProductDescriptionRequired from "@/fixtures/saveAndValidateApi/sdAddProductConsignmentProductDescriptionRequired.json";
import sdAddProductConsignmentFisheryWeightExceedsProductWeight from "@/fixtures/saveAndValidateApi/sdAddProductConsignmentFisheryWeightExceedsProductWeight.json";

const addProductConsignementHandler: ITestHandler = {
  [TestCaseId.SDAddProductConsignmentData]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.json(storageDocument))),
  ],
  [TestCaseId.SDAddProductConsignmentDataWithEmptySupportingDocuments]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentWithEmptySupportingDocs))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.json(storageDocumentWithEmptySupportingDocs))),
  ],
  [TestCaseId.SDAddProductConsignmentForbidden]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.status(403), ctx.json(storageDocument))),
  ],
  [TestCaseId.SDAddProductConsignmentDataError]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(storageDocumentError))),
  ],
  [TestCaseId.SDAddProductConsignmentDataSpeicesError]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(storageDocumentSpeciesError))
    ),
  ],
  [TestCaseId.SDAddProductConsignmentDataSupportingDocumentsError]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(storageDocumentSupportingDocumentsError))
    ),
  ],
  [TestCaseId.SDAddProductConsignmentDataSpeicesSuggestError]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(storageDocumentSpeciesSuggestError))
    ),
  ],
  [TestCaseId.SDAddProductConsignmentCommonErrors]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(storageDocumentError))),
  ],
  [TestCaseId.SDAddProductConsignmentInvalidEntryDocError]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(storageDocumentInvalidEntryDoc))
    ),
  ],
  [TestCaseId.SDAddProductConsignmentIssuingCountryRequired]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.get(mockCountriesUrl, (req, res, ctx) => res(ctx.json(countries))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(sdAddProductConsignmentIssuingCountryRequired))
    ),
  ],
  [TestCaseId.SDAddProductConsignmentProductDescriptionRequired]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(sdAddProductConsignmentProductDescriptionRequired))
    ),
  ],
  [TestCaseId.SDAddProductConsignmentFisheryWeightExceedsProductWeight]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(sdAddProductConsignmentFisheryWeightExceedsProductWeight))
    ),
  ],
  [TestCaseId.SDAddProductConsignmentDataProductIndex1]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckDetails))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.json(storageDocument))),
  ],
  [TestCaseId.SDAddProductConsignmentSaveAsDraftWithErrors]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    // persistent 200 handler must come first in the array so that after setApiMock's
    // forEach-prepend it ends up BEHIND the res.once(400) handler in MSW's stack
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) =>
      res.once(ctx.status(400), ctx.json(storageDocumentError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
  ],
  [TestCaseId.SDAddProductConsignmentSaveAsDraftWithSpeciesError]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) =>
      res.once(ctx.status(400), ctx.json(storageDocumentProductSpeciesError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
  ],
  [TestCaseId.SDAddProductConsignmentSaveAsDraftNoErrors]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
  ],
};

export default addProductConsignementHandler;
