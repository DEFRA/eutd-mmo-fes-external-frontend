import { rest } from "msw";
import { mockGetAllDocumentsUrl, getCreatedCertificateUrl, getProgressUrl } from "~/urls.server";
import { type ITestHandler, TestCaseId } from "~/types";

import sdDrafts from "@/fixtures/dashboardApi/sdDrafts.json";
import sdCreated from "@/fixtures/documentsApi/sdCreated.json";
import sdCompleted from "@/fixtures/dashboardApi/sdComplete.json";
import empty from "@/fixtures/empty.json";

const sdCreatedHandler: ITestHandler = {
  [TestCaseId.StorageDocumentCreated]: (documentNumber: string) => [
    rest.get(getCreatedCertificateUrl(documentNumber), (req, res, ctx) => res(ctx.json(sdCreated))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdCompleted))),
  ],
  [TestCaseId.StorageDocumentPageGuard]: (documentNumber: string) => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(getCreatedCertificateUrl(documentNumber), (req, res, ctx) => res(ctx.json(empty))),
  ],
};

export default sdCreatedHandler;
