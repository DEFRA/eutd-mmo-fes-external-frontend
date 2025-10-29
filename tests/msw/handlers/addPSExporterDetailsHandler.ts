import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { getAddExporterDetailsUrl, mockGetAllDocumentsUrl, GET_PROCESSING_STATEMENT } from "~/urls.server";
import empty from "@/fixtures/empty.json";
import psAddExporterDetailsFull from "@/fixtures/addExporterDetails/psAddExporterDetailsFull.json";
import psDrafts from "@/fixtures/dashboardApi/psDrafts.json";
import psExporterMissingNameErrorResponse from "@/fixtures/addExporterDetails/psExporterMissingNameErrorResponse.json";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";

const addPSExporterDetailsHandler: ITestHandler = {
  [TestCaseId.PSAddExporterDetailsEmpty]: () => [
    rest.get(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) => res(ctx.json(empty))),
  ],
  [TestCaseId.PSAddExporterDetailsFull]: () => [
    rest.get(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) => res(ctx.json(empty))),
    rest.post(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) =>
      res(ctx.json(psAddExporterDetailsFull))
    ),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psAddExporterDetailsFull))),
  ],
  [TestCaseId.PSAddExporterDetailsSaveAsDraft]: () => [
    rest.get(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) =>
      res(ctx.json(psAddExporterDetailsFull))
    ),
    rest.post(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) =>
      res(ctx.json(psAddExporterDetailsFull))
    ),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDrafts))),
  ],
  [TestCaseId.PSAddExporterDetailsFailsWith403]: () => [
    rest.get(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) => res(ctx.json(empty))),
    rest.post(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) =>
      res(ctx.status(403), ctx.json(psAddExporterDetailsFull))
    ),
  ],
  [TestCaseId.PSAddExporterDetails403]: () => [
    rest.get(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) =>
      res(ctx.status(403), ctx.json(psAddExporterDetailsFull))
    ),
  ],
  [TestCaseId.PSAddExporterDetailsFailsWithErrors]: () => [
    rest.get(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) => res(ctx.json(empty))),
    rest.post(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(psExporterMissingNameErrorResponse))
    ),
  ],
};

export default addPSExporterDetailsHandler;
