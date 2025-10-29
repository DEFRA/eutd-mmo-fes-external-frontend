import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  CHECK_COPY_URL,
  CONFIRM_COPY_URL,
  GET_PROCESSING_STATEMENT,
  getProgressUrl,
  getTransportDetailsUrl,
  mockGetAllDocumentsUrl,
  mockGetProgress,
} from "~/urls.server";

import copyAllowed from "@/fixtures/documentsApi/canCopy.json";
import copyDisallowed from "@/fixtures/documentsApi/cannotCopy.json";
import copyAllCatchCertificate from "@/fixtures/documentsApi/psCatchAllData.json";
import psDrafts from "@/fixtures/dashboardApi/psDrafts.json";
import psCatchVoid from "@/fixtures/documentsApi/psCatchVoid.json";
import psProgressIncomplete from "@/fixtures/progressApi/psIncomplete.json";
import sdProgressIncomplete from "@/fixtures/progressApi/sdIncomplete.json";
import truckTransportDetails from "@/fixtures/transportDetailsApi/truck.json";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";

const copyPSSDPageHandler: ITestHandler = {
  [TestCaseId.PSSDCopyAllowed]: () => [
    rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json(copyAllowed))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDrafts))),
    rest.get(CONFIRM_COPY_URL, (req, res, ctx) => res(ctx.json(psCatchVoid))),
    rest.post(CONFIRM_COPY_URL, (req, res, ctx) => res(ctx.json(psCatchVoid))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
  ],
  [TestCaseId.PSSDCopyDisallowed]: () => [rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json(copyDisallowed)))],
  [TestCaseId.PSSDCopySave]: () => [
    rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json(copyAllowed))),
    rest.post(CONFIRM_COPY_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          copyDocumentAcknowledged: "commonCopyAcknowledgementError",
          voidOriginal: "commonCopyVoidConfirmationError",
        })
      )
    ),
  ],
  [TestCaseId.PSSDCopyAllData]: () => [
    rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json(copyAllowed))),
    rest.post(CONFIRM_COPY_URL, (req, res, ctx) => res(ctx.json(copyAllCatchCertificate))),
    rest.get(getProgressUrl("processingStatement"), (req, res, ctx) => res(ctx.json(psProgressIncomplete))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
  ],
};

export default copyPSSDPageHandler;
