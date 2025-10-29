import { rest } from "msw";
import { mockGetAllDocumentsUrl, getCreatedCertificateUrl, getProgressUrl } from "~/urls.server";
import { type ITestHandler, TestCaseId } from "~/types";

import psDrafts from "@/fixtures/dashboardApi/psDrafts.json";
import psCreated from "@/fixtures/documentsApi/psCreated.json";
import psCompleted from "@/fixtures/dashboardApi/psComplete.json";
import empty from "@/fixtures/empty.json";

const psCreatedHandler: ITestHandler = {
  [TestCaseId.ProcessingStatementCreated]: (documentNumber: string) => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDrafts))),
    rest.get(getCreatedCertificateUrl(documentNumber), (req, res, ctx) => res(ctx.json(psCreated))),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psCompleted))),
  ],
  [TestCaseId.ProcessingStatementPageGuard]: (documentNumber: string) => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDrafts))),
    rest.get(getCreatedCertificateUrl(documentNumber), (req, res, ctx) => res(ctx.json(empty))),
  ],
};

export default psCreatedHandler;
