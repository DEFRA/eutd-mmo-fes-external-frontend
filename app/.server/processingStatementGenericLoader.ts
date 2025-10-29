import { redirect } from "@remix-run/node";
import type { IUnauthorised, ProcessingStatement } from "~/types";
import setApiMock from "tests/msw/helpers/setApiMock";
import type { Params } from "@remix-run/react";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import {
  getBearerTokenForRequest,
  getProcessingStatement,
  validateResponseData,
  instanceOfUnauthorised,
  createCSRFToken,
} from "~/.server";

export const processingStatemenGenericLoader = async (request: Request, params: Params, returnData: string[]) => {
  /* istanbul ignore next */
  setApiMock(request.url);
  // Get bearer token for API requests
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  const session = await getSessionFromRequest(request);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);

  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  if (instanceOfUnauthorised(processingStatement)) {
    return redirect("/forbidden");
  }

  validateResponseData(processingStatement);

  let returnObj = {
    documentNumber,
    nextUri,
    csrf,
  };

  returnData.forEach((dataName) => {
    //@ts-ignore
    returnObj[dataName] = processingStatement[dataName];
  });

  return new Response(JSON.stringify(returnObj), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};
