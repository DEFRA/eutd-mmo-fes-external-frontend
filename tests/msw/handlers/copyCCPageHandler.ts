import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { CHECK_COPY_URL, CONFIRM_COPY_URL, LANDINGS_TYPE_URL, mockGetAllDocumentsUrl } from "~/urls.server";

import copyAllowed from "@/fixtures/documentsApi/canCopy.json";
import copyDisallowed from "@/fixtures/documentsApi/cannotCopy.json";
import copyAllCatchCertificate from "@/fixtures/documentsApi/ccCatchAllData.json";
import ccCatchVoid from "@/fixtures/documentsApi/ccCatchVoid.json";
import manualEntryLandingsType from "@/fixtures/landingsTypeApi/manualEntry.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";

const copyCCPageHandler: ITestHandler = {
  [TestCaseId.CCCopyAllowed]: () => [
    rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json(copyAllowed))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.get(CONFIRM_COPY_URL, (req, res, ctx) => res(ctx.json(ccCatchVoid))),
    rest.post(CONFIRM_COPY_URL, (req, res, ctx) => res(ctx.json(ccCatchVoid))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
  ],
  [TestCaseId.CCCopyDisallowed]: () => [rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json(copyDisallowed)))],
  [TestCaseId.CCCopyThisCatchCertfifcateSave]: () => [
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
  [TestCaseId.CCCopyThisCatchCertAllData]: () => [
    rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json(copyAllowed))),
    rest.post(CONFIRM_COPY_URL, (req, res, ctx) => res(ctx.json(copyAllCatchCertificate))),
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(manualEntryLandingsType))),
  ],
  [TestCaseId.CCCatchVoid]: () => [
    rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json(copyAllowed))),
    rest.post(CONFIRM_COPY_URL, (req, res, ctx) => res(ctx.json(ccCatchVoid))),
  ],
  [TestCaseId.CCCopyVoidSave]: () => [
    rest.get(CHECK_COPY_URL, (req, res, ctx) => res(ctx.json(copyAllowed))),
    rest.post(CONFIRM_COPY_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          voidOriginal: "commonCopyVoidConfirmationError",
        })
      )
    ),
  ],
};

export default copyCCPageHandler;
