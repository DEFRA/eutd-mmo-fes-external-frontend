import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { ADD_YOUR_REFERENCE_URL, getAddExporterDetailsUrl, mockGetAllDocumentsUrl } from "~/urls.server";

import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import psDocuments from "@/fixtures/dashboardApi/psDocument.json";
import sdDocuments from "@/fixtures/dashboardApi/sdDocument.json";
import exporterDetails from "@/fixtures/exporterApi/exporterDetails.json";

const addReferenceHandler: ITestHandler = {
  [TestCaseId.CCAddReference]: () => [
    rest.get(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text(""))),
    rest.post(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text("qwerty"))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.CCAddReferenceForbidden]: () => [
    rest.get(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.CCAddReferenceFailsWithErrors]: () => [
    rest.get(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text(""))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(ADD_YOUR_REFERENCE_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          userReference: "error.userReference.string.max",
        })
      )
    ),
  ],
  [TestCaseId.CCAddReferenceFailsWith403]: () => [
    rest.get(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text(""))),
    rest.post(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.PSAddReference]: () => [
    rest.get(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text(""))),
    rest.post(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text("qwerty"))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
    rest.get(getAddExporterDetailsUrl("processingStatement"), (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.PSAddReferenceFailsWithErrors]: () => [
    rest.get(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text(""))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
    rest.post(ADD_YOUR_REFERENCE_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          userReference: "error.userReference.string.max",
        })
      )
    ),
  ],
  [TestCaseId.SDAddReference]: () => [
    rest.get(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text(""))),
    rest.post(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text("qwerty"))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
    rest.get(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.SDAddReferenceFailsWithErrors]: () => [
    rest.get(ADD_YOUR_REFERENCE_URL, (req, res, ctx) => res(ctx.text(""))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
    rest.post(ADD_YOUR_REFERENCE_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          userReference: "error.userReference.string.max",
        })
      )
    ),
  ],
};

export default addReferenceHandler;
