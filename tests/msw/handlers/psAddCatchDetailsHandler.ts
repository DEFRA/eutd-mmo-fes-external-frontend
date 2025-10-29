import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  SPECIES_URL,
  GET_PROCESSING_STATEMENT,
  mockSaveAndValidateDocument,
  mockGetAllDocumentsUrl,
} from "~/urls.server";

import species from "@/fixtures/referenceDataApi/species.json";
import processingStatementNoCatches from "@/fixtures/processingStatementApi/processingStatementNoCatches.json";
import processingStatementMultipleCatches from "@/fixtures/processingStatementApi/processingStatementCatchWithMultipleUkType.json";
import processingStatementNoCatchCertificateNumber from "@/fixtures/processingStatementApi/processingStatementNoCatchCertificateNumber.json";
import processingStatementBlankOneCatch from "@/fixtures/processingStatementApi/processingStatementBlankOneCatch.json";
import processingStatementUpdateOneCatch from "@/fixtures/processingStatementApi/processingStatementUpdateOneCatch.json";
import processingStatementTwoCatches from "@/fixtures/processingStatementApi/processingStatementTwoCatches.json";
import processingStatementBlankOneCatchNoWeights from "@/fixtures/processingStatementApi/processingStatementOneCatchNoWeights.json";
import addCatchDetailWithErrors from "@/fixtures/saveAndValidateApi/addCatchDetailWithErrors.json";
import addCatchDetailsWithErrors from "@/fixtures/saveAndValidateApi/addCatchDetailsWithErrors.json";
import postProcessingStatementWithInvalidCCError from "@/fixtures/saveAndValidateApi/processingStatementWithInvalidCCError.json";
import processingStatementWithIncorrectFormatCCError from "@/fixtures/saveAndValidateApi/processingStatementWithIncorrectFormatCCError.json";
import processingStatementBlankOneCatchWithUkType from "@/fixtures/processingStatementApi/processingStatementBlankOneCatchWithUkType.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import psDocument from "@/fixtures/dashboardApi/psDocument.json";
let actionCalled = false;
let removeCatchCalled = false;
const psAddCatchDetailsHandler: ITestHandler = {
  [TestCaseId.PSAddCatchDetailsNoCatches]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementNoCatches))),
  ],
  [TestCaseId.PSAddCatchDetailsMultipleCatches]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementMultipleCatches))),
  ],
  [TestCaseId.PSAddCatchDetailsSingleCatch]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatch))),
  ],
  [TestCaseId.PSAddCatchDetailsRemoveCatch]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
      if (!removeCatchCalled) {
        removeCatchCalled = true;
        return res(ctx.json(processingStatementTwoCatches));
      }
      removeCatchCalled = false;
      return res(ctx.json(processingStatementBlankOneCatch));
    }),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementBlankOneCatch))
    ),
  ],
  [TestCaseId.PSAddCatchDetailsRemoveCatchUnauthorised]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementTwoCatches))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) => res.once(ctx.status(403))),
  ],
  [TestCaseId.PSAddCatchDetailsUpdateCatch]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatch))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementUpdateOneCatch))
    ),
  ],
  [TestCaseId.PSAddCatchDetailsUpdateCatchError]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatchWithUkType))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(addCatchDetailWithErrors))
    ),
  ],
  [TestCaseId.PSAddCatchDetailsContinueCatchError]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementNoCatchCertificateNumber))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(addCatchDetailsWithErrors))
    ),
  ],
  [TestCaseId.PSAddCatchDetailsFirstCatch]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatch))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementBlankOneCatch))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
  ],
  [TestCaseId.PSAddCatchDetailsFirstCatchNoScientificNames]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json([]))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatch))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementBlankOneCatch))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
  ],
  [TestCaseId.PSAddCatchDetailsFirstCatchEmptyScientificNames]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(null))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatch))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementBlankOneCatch))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
  ],
  [TestCaseId.PSAddCatchDetailsCatchIndexInvalid]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatchNoWeights))),
  ],
  [TestCaseId.PSAddCatchDetailsGetPsForbidden]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.PSAddCatchDetailsGetPsForbiddenAction]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementMultipleCatches))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
      if (!actionCalled) {
        actionCalled = true;
        return res(ctx.json(processingStatementMultipleCatches));
      }
      actionCalled = false;
      return res(ctx.status(403));
    }),
  ],
  [TestCaseId.PSAddCatchDetailsPostPsForbidden]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatch))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.PSAddCatchDetailsWithBlankInput]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatchWithUkType))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(addCatchDetailWithErrors))
    ),
  ],
  [TestCaseId.PSAddCatchDetailsWithInvalidCCFormat]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatch))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(processingStatementWithIncorrectFormatCCError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
  ],
  [TestCaseId.PSAddCatchDetailsWithIncorrectFormatCCFormat]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatch))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(postProcessingStatementWithInvalidCCError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
  ],
  [TestCaseId.PSAddCatchDetailsUkCatchType]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementBlankOneCatchWithUkType))),
  ],
};

export default psAddCatchDetailsHandler;
