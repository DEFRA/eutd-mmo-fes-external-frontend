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
const selectedCommodityCode = "03011100";
const selectedCommodityProductId = "GBR-2023-PS-2305703F5-012345678";
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
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementWithProducts))
    ),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSAddConsignmentDetailsEditModeSubmitSelectedCommodity]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithProducts))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), async (req, res, ctx) => {
      const requestBody = (await req.json()) as {
        products?: Array<{
          id?: string;
          commodityCode?: string;
        }>;
      };

      const updatedProduct = requestBody?.products?.find((product) => product.id === selectedCommodityProductId);

      if (updatedProduct?.commodityCode === selectedCommodityCode) {
        return res(ctx.json(processingStatementWithProducts));
      }

      return res(
        ctx.status(400),
        ctx.json({
          errors: {
            commodityCode: {
              message: "commonCommodityCodeError",
            },
          },
        })
      );
    }),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSAddConsignmentDetailsWithProductsUnauthorized]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatementWithProducts))),
    rest.post(mockGetAddProcessingStatementUrl, (req, res, ctx) => res.once(ctx.status(403))),
  ],
  [TestCaseId.PSAddConsignmentDetailsUnauthorised]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.status(403))),
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
      // First call: loader (return success)
      if (counter === 0) {
        counter++;
        return res(ctx.json(processingStatement));
      }
      // Second call: updateProcessingStatementProducts (return unauthorised)
      if (counter === 1) {
        counter = 0; // Reset for next test
        return res(ctx.status(403));
      }
      // Fallback
      return res(ctx.json(processingStatement));
    }),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
  ],
  [TestCaseId.PSAddConsignmentDetailsSaveAsDraftWithErrors]: () => [
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res.once(ctx.status(400), ctx.json(processingStatementAddProductError))
    ),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocument))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
};

export default addConsignmentDetailsHandler;
