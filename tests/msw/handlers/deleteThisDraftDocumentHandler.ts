import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  CONFIRM_DOCUMENT_DELETE_URL,
  GET_PROCESSING_STATEMENT,
  GET_STORAGE_DOCUMENT,
  mockGetProgress,
} from "~/urls.server";
import badRequest from "@/fixtures/deleteDocumentApi/badRequest.json";
import optionYes from "@/fixtures/deleteDocumentApi/optionYes.json";
import optionNo from "@/fixtures/deleteDocumentApi/optionNo.json";

const mockDeleteDraftLoaderDependencies = () => [
  // Catch certificate loader checks draft existence via progress endpoint.
  rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json({}))),
  // Processing statement and storage document loaders check via document-specific endpoints.
  rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json({}))),
  rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json({}))),
];

const deleteThisCatchCertificateHandler: ITestHandler = {
  [TestCaseId.DeleteThisDraftDocumentBadRequest]: () => [
    ...mockDeleteDraftLoaderDependencies(),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(badRequest))),
  ],
  [TestCaseId.DeleteThisDraftDocumentOptionYes]: () => [
    ...mockDeleteDraftLoaderDependencies(),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.json(optionYes))),
  ],
  [TestCaseId.DeleteThisDraftDocumentOptionNo]: () => [
    ...mockDeleteDraftLoaderDependencies(),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.json(optionNo))),
  ],
  [TestCaseId.DeleteThisDraftDocument403]: () => [
    ...mockDeleteDraftLoaderDependencies(),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.DeleteThisDraftDocument404]: () => [
    ...mockDeleteDraftLoaderDependencies(),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.status(404))),
  ],
  [TestCaseId.DeleteThisDraftDocumentNoRecord]: () => [
    ...mockDeleteDraftLoaderDependencies(),
    rest.post(CONFIRM_DOCUMENT_DELETE_URL, (req, res, ctx) => res(ctx.status(404))),
  ],
};
export default deleteThisCatchCertificateHandler;
