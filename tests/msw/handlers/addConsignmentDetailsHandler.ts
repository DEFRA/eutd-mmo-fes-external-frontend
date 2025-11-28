import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import processingStatementError from "@/fixtures/processingStatementApi/processingStatementError.json";
import processingStatementAddProductError from "@/fixtures/processingStatementApi/processingStatementAddProductError.json";
import processingStatementWithProducts from "@/fixtures/processingStatementApi/processingStatementWithProducts.json";
import psProgressIncomplete from "@/fixtures/progressApi/psIncomplete.json";
import psDocument from "@/fixtures/dashboardApi/psDocument.json";
import species from "@/fixtures/referenceDataApi/species.json";
import {
  getProgressUrl,
  GET_PROCESSING_STATEMENT,
  mockGetAddProcessingStatementUrl,
  mockGetAllDocumentsUrl,
  mockGetProgress,
  mockSaveAndValidateDocument,
  SPECIES_URL,
} from "~/urls.server";
let counter = 0;
const addConsignmentDetailsHandler: ITestHandler = {
  [TestCaseId.PSAddConsignmentDetails]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementAddProductError))
    ),
  ],
  [TestCaseId.PSAddConsignmentDetailsWithProducts]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithProducts))),
    rest.post(mockGetAddProcessingStatementUrl, (req, res, ctx) => res(ctx.json(processingStatement))),
  ],
  [TestCaseId.PSAddConsignmentDetailsEditMode]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithProducts))),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSAddConsignmentDetailsWithProductsUnauthorized]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithProducts))),
    rest.post(mockGetAddProcessingStatementUrl, (req, res, ctx) => res.once(ctx.status(403))),
  ],
  [TestCaseId.PSAddConsignmentDetailsUnauthorised]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res.once(ctx.status(403))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSPostAddConsignmentDetails]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSPostAddConsignmentDetailsError]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementError))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSAddConsignmentDetailsSaveAndContinueUnauthorised]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
      if (counter < 2) {
        counter++;
        return res(ctx.json(processingStatement));
      }
    }),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => {
      // returning unauthorised when API is hit third time
      if (counter === 2) {
        counter = 0;
        return res.once(ctx.status(403));
      }
    }),
  ],
};

export default addConsignmentDetailsHandler;
