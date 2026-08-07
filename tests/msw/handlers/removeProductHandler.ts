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
    // catch-added loader — lowest MSW priority (added first, prepended to back)
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementAfterRemoval))
    ),
    rest.post(mockGetAddProcessingStatementUrl, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementAfterRemoval))
    ),
    // initial page load — highest MSW priority (added last, prepended to front), consumed once
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res.once(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
    ),
  ],

  [TestCaseId.RemoveProductYesSaveAndContinueNoProducts]: () => [
    // add-consignment-details loader — lowest MSW priority
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementNoProducts))
    ),
    rest.post(mockGetAddProcessingStatementUrl, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementNoProducts))
    ),
    // initial page load — highest MSW priority, consumed once
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res.once(ctx.json(multipleProducts.processingStatementSingleProduct))
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
    // catch-added loader — lowest MSW priority
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementAfterRemoval))
    ),
    rest.post(mockGetAddProcessingStatementUrl, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementAfterRemoval))
    ),
    // initial page load — highest MSW priority, consumed once
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res.once(ctx.json(multipleProducts.processingStatementWithMultipleProducts))
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

  [TestCaseId.RemoveProductAlreadyDeleted]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) =>
      res(ctx.json(multipleProducts.processingStatementAfterRemoval))
    ),
  ],
};

export default removeProductHandler;
