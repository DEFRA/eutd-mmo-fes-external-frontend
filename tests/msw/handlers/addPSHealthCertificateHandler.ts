import { rest } from "msw";
import {
  GET_PROCESSING_STATEMENT,
  mockGetAllDocumentsUrl,
  mockSaveAndValidateDocument,
  EXPORT_LOCATION_URL,
} from "~/urls.server";
import empty from "@/fixtures/empty.json";
import { type ITestHandler, TestCaseId } from "~/types";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import psDraft from "@/fixtures/dashboardApi/psDrafts.json";
import PSAddHealthCertificateError from "@/fixtures/processingStatementApi/processingStatementAddHealthCertificateError.json";
import processingStatementNoCertificateDate from "@/fixtures/processingStatementApi/processingStatementCatchWithMultipleUkType.json";

const addPSHealthCertificateHandler: ITestHandler = {
  [TestCaseId.PSAddHealthCertificate]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
  ],
  [TestCaseId.PSAddHealthCertificateHappyPath]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDraft))),
  ],
  [TestCaseId.PSAddHealthCertificateNoCertificateDate]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(empty))),
    rest.get(EXPORT_LOCATION_URL, (req, res, ctx) => res(ctx.json({}))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatementNoCertificateDate))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDraft))),
  ],
  [TestCaseId.PSAddHealthCertificateError]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(PSAddHealthCertificateError))
    ),
  ],
  [TestCaseId.PSAddHealthCertificateHappyPathForbidden]: () => [
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res.once(ctx.status(403))),
  ],
};

export default addPSHealthCertificateHandler;
