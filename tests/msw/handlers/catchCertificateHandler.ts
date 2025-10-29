import { rest } from "msw";
import { getCreatedCertificateUrl, getProgressUrl, LANDINGS_TYPE_URL, mockGetAllDocumentsUrl } from "~/urls.server";
import { type ITestHandler, TestCaseId } from "~/types";

import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import ccCreatedDetails from "@/fixtures/documentsApi/catchCertificate.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import emptyDetails from "@/fixtures/empty.json";
import progressComplete from "@/fixtures/progressApi/ccComplete.json";

const ccCreatedHandler: ITestHandler = {
  [TestCaseId.CatchCertificateCreated]: (documentNumber: string) => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(getCreatedCertificateUrl(documentNumber), (req, res, ctx) => res(ctx.json(ccCreatedDetails))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressComplete))),
  ],
  [TestCaseId.CatchCertificatePageGuard]: (documentNumber: string) => [
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(getCreatedCertificateUrl(documentNumber), (req, res, ctx) => res(ctx.json(emptyDetails))),
  ],
};

export default ccCreatedHandler;
