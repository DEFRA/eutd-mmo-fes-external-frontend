import { rest } from "msw";
import { TestCaseId, type ITestHandler } from "~/types";
import { GET_PROCESSING_STATEMENT, mockGetAddProcessingStatementUrl } from "~/urls.server";
import multipleProducts from "@/fixtures/removeProduct/removeProductScenarios.json";

const removeProductHandler: ITestHandler = {
  [TestCaseId.RemoveProductPageLoads]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
  ],

  [TestCaseId.RemoveProductYesSaveAndContinueWithProducts]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
    rest.post(mockGetAddProcessingStatementUrl, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementAfterRemoval))
    ),
    // Mock the catch-added page loader
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementAfterRemoval))
    ),
  ],

  [TestCaseId.RemoveProductYesSaveAndContinueNoProducts]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementSingleProduct))
    ),
    rest.post(mockGetAddProcessingStatementUrl, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementNoProducts))
    ),
    // Mock the add-consignment-details page loader
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementNoProducts))
    ),
  ],

  [TestCaseId.RemoveProductYesSaveAsDraft]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
    // Mock the progress page loader
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
  ],

  [TestCaseId.RemoveProductNoSaveAndContinue]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
    // Mock the catch-added page loader
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
  ],

  [TestCaseId.RemoveProductNoSaveAsDraft]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
    // Mock the progress page loader
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
  ],

  [TestCaseId.RemoveProductNoSelection]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
  ],

  [TestCaseId.RemoveProductWelsh]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
  ],

  [TestCaseId.RemoveProductNonJS]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
    rest.post(mockGetAddProcessingStatementUrl, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementAfterRemoval))
    ),
    // Mock the catch-added page loader
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementAfterRemoval))
    ),
  ],

  [TestCaseId.RemoveProductAccessibility]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
  ],

  [TestCaseId.RemoveProductFromAdmin]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
  ],
};

export default removeProductHandler;
