import { rest } from "msw";
import { type Journey, type ITestHandler, TestCaseId } from "~/types";

import ccJourney from "@/fixtures/saveAndValidateApi/catchCertificate.json";
import sdJourney from "@/fixtures/saveAndValidateApi/storageNotes.json";
import psJourney from "@/fixtures/saveAndValidateApi/processingStatement.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";
import psDocuments from "@/fixtures/dashboardApi/psDocument.json";
import sdDocuments from "@/fixtures/dashboardApi/sdDocument.json";
import userAttributes from "@/fixtures/userAttributesApi/getUserAttributes.json";
import { mockGetAllDocumentsUrl, SAVE_AND_VALIDATE_URL, USER_ATTRIBUTES } from "~/urls.server";

const indexPageHandler: ITestHandler = {
  [TestCaseId.StartJourney]: (journey: Journey) => {
    if (journey === "catchCertificate") {
      return [
        rest.post(SAVE_AND_VALIDATE_URL, (req, res, ctx) => res(ctx.json(ccJourney))),
        rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
      ];
    }

    if (journey === "storageNotes") {
      return [
        rest.post(SAVE_AND_VALIDATE_URL, (req, res, ctx) => res(ctx.json(sdJourney))),
        rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
      ];
    }

    if (journey === "processingStatement") {
      return [
        rest.post(SAVE_AND_VALIDATE_URL, (req, res, ctx) => res(ctx.json(psJourney))),
        rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(psDocuments))),
      ];
    }

    return [];
  },
  [TestCaseId.StartJourneyFailed]: () => [
    rest.post(SAVE_AND_VALIDATE_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          errors: [{ key: "errorKey", message: "errorMessage" }],
        })
      )
    ),
  ],
  [TestCaseId.StartJourneyFailedNoErrors]: () => [
    rest.post(SAVE_AND_VALIDATE_URL, (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          errors: "errorMessage",
        })
      )
    ),
  ],
  [TestCaseId.UserAttributes]: () => [
    rest.get(USER_ATTRIBUTES, (req, res, ctx) => res(ctx.json(userAttributes))),
    rest.post(USER_ATTRIBUTES, (req, res, ctx) => res(ctx.json(userAttributes))),
  ],
};

export default indexPageHandler;
