import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { CONFIRM_DOCUMENT_DELETE_URL, mockGetAllDocumentsUrl } from "~/urls.server";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import badRequest from "@/fixtures/deleteDocumentApi/badRequest.json";
import optionYes from "@/fixtures/deleteDocumentApi/optionYes.json";
import optionNo from "@/fixtures/deleteDocumentApi/optionNo.json";

const deleteThisDocumentHandler: ITestHandler = {
  [TestCaseId.DeleteThisDraftDocumentBadRequest]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(badRequest))),
  ],
  [TestCaseId.DeleteThisDraftDocumentOptionYes]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.json(optionYes))),
  ],
  [TestCaseId.DeleteThisDraftDocumentOptionNo]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.json(optionNo))),
  ],
  [TestCaseId.DeleteThisDraftDocument403]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.DeleteThisDraftDocument404]: () => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.status(404))),
  ],
};
export default deleteThisDocumentHandler;
