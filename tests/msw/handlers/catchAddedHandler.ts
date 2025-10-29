import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  getProgressUrl,
  GET_PROCESSING_STATEMENT,
  mockSaveAndValidateDocument,
  mockGetAllDocumentsUrl,
  SPECIES_URL,
} from "~/urls.server";

import psIncomplete from "@/fixtures/progressApi/psIncomplete.json";
import noCatches from "@/fixtures/processingStatementApi/processingStatementNoCatches.json";
import noCatchDetails from "@/fixtures/processingStatementApi/processingStatementNoCatchDetails.json";
import noCatchDetails1 from "@/fixtures/processingStatementApi/processingStatementNoCatchDetails1.json";
import noCatchWeights from "@/fixtures/processingStatementApi/processingStatementNoCatchWeights.json";
import oneValidCatch from "@/fixtures/processingStatementApi/processingStatementBlankOneCatchWithWeights.json";
import twoValidCatches from "@/fixtures/processingStatementApi/processingStatement.json";
import twoValidCatchesSameSpecies from "@/fixtures/processingStatementApi/processingStatementSameSpecies.json";
import oneValidCatchOneSpecies from "@/fixtures/processingStatementApi/processingStatementOneSpecies.json";
import oneValidTwoInvalidCatches from "@/fixtures/processingStatementApi/processingStatementOneValidTwoInvalidCatches.json";
import postOneValidTwoInvalidCatches from "@/fixtures/saveAndValidateApi/processingStatementOneValidTwoInvalidCatches.json";
import psDocuments from "@/fixtures/dashboardApi/psDocument.json";
import species from "@/fixtures/referenceDataApi/species.json";

const catchAddedHandler: ITestHandler = {
  [TestCaseId.PSCatchAddedFromProgress]: () => [
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psIncomplete))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(noCatches))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.PSCatchAddedFromProgressNoCatchDetails]: () => [
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psIncomplete))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(noCatchDetails))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.PSCatchAddedFromProgressNoCatchDetails1]: () => [
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psIncomplete))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(noCatchDetails1))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.PSCatchAddedFromProgressNoCatchWeights]: () => [
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psIncomplete))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(noCatchWeights))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.PSCatchAddedBlankOneCatch]: () => [
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psIncomplete))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(oneValidCatch))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) => res(ctx.json(oneValidCatch))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.PSCatchAddedTwoCatches]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(twoValidCatches))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) => res(ctx.json(oneValidCatch))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.PSCatchAddedNoCatches]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(noCatches))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.PSCatchEdit]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(twoValidCatches))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) => res(ctx.json(oneValidCatch))),
    rest.get("/create-processing-statement/:documentId/add-catch-details/:catchIndex", () => {}),
  ],
  [TestCaseId.PSCatchAddedTwoCatchesSameSpecies]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(twoValidCatchesSameSpecies))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(oneValidCatchOneSpecies))
    ),
  ],
  [TestCaseId.PSCatchAddedOneValidTwoInvalidCatches]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(oneValidTwoInvalidCatches))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(postOneValidTwoInvalidCatches))
    ),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psIncomplete))),
  ],
  [TestCaseId.PSCatchRestoreRemovedLines]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(oneValidTwoInvalidCatches))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(postOneValidTwoInvalidCatches))
    ),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psIncomplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
  ],
  [TestCaseId.PSRemoveAllLines]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(oneValidTwoInvalidCatches))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(postOneValidTwoInvalidCatches))
    ),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psIncomplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
  ],
};

export default catchAddedHandler;
