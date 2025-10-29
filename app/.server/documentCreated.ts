import type { Params } from "@remix-run/react";
import type { Journey, CompletedDocument } from "~/types";
import { redirect } from "@remix-run/node";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getBearerTokenForRequest, getCompletedDocument } from "~/.server";
import { getEnv } from "~/env.server";
import { getSessionFromRequest } from "~/sessions.server";
import { analyticsAcceptedCookie, parseCookie, type IAnalyticsAcceptedCookie } from "~/cookies.server";

export const documentCreatedLoader = async (request: Request, params: Params, journey: Journey) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);

  const session = await getSessionFromRequest(request);
  const { documentNumber } = params;
  const completedDocument: CompletedDocument | null = await getCompletedDocument(bearerToken, documentNumber);
  const analyticsCookie = (await parseCookie(analyticsAcceptedCookie, request)) as IAnalyticsAcceptedCookie;

  let hasIncorrectDataRoute = "";
  let documentNumberInclude = "";
  let objectToReturn: any = {
    completedDocument: completedDocument,
    feedbackURL: getEnv().CREATED_PAGE_FEEDBACK_URL,
    analyticsCookieAccepted: analyticsCookie?.analyticsAccepted,
  };

  switch (journey) {
    case "catchCertificate":
      hasIncorrectDataRoute = route("/create-catch-certificate/catch-certificates");
      documentNumberInclude = "-CC-";
      objectToReturn = {
        ...objectToReturn,
        noOfVessels: session.get("noOfVessels"),
      };
      break;
    case "processingStatement":
      hasIncorrectDataRoute = route("/create-processing-statement/processing-statements");
      documentNumberInclude = "-PS-";
      break;
    case "storageNotes":
      hasIncorrectDataRoute = route("/create-storage-document/storage-documents");
      documentNumberInclude = "-SD-";
      break;
  }

  const hasRequiredData = () =>
    completedDocument?.documentNumber &&
    completedDocument.documentUri &&
    completedDocument.documentNumber.includes(documentNumberInclude);

  if (!hasRequiredData()) {
    return redirect(hasIncorrectDataRoute);
  }
  return new Response(JSON.stringify(objectToReturn), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
