import type { Params } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import type { Journey, UserReference } from "~/types";
import {
  addUserReference,
  getUserReference,
  getBearerTokenForRequest,
  validateResponseData,
  createCSRFToken,
  validateCSRFToken,
} from "~/.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import { route } from "routes-gen";

export const addYourReferenceLoader = async (request: Request, params: Params, journey: Journey) => {
  /* istanbul ignore next */
  setApiMock(request.url);
  const csrf = await createCSRFToken(request);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);

  const { documentNumber } = params;
  const userReference: UserReference = await getUserReference(bearerToken, documentNumber);

  validateResponseData(userReference);

  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  switch (journey) {
    case "catchCertificate":
      session.unset("exporterFullName");
      session.unset("exporterCompanyName");
      break;
    case "processingStatement":
    case "storageNotes":
      session.unset(`documentNumber-${documentNumber}`);
      session.unset(`copyDocumentAcknowledged-${documentNumber}`);
      session.unset(`copyDocument-${documentNumber}`);
      session.unset("exporterCompanyName");
      break;
  }

  return new Response(JSON.stringify({ ...userReference, documentNumber, csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const addYourReferenceAction = async (
  request: Request,
  params: Params,
  saveAsDraftLink: any,
  successLink: any
) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const userReference: UserReference = await addUserReference(
    bearerToken,
    documentNumber,
    form.get("userReference") as string
  );

  const errorResponse = validateResponseData(userReference, form);

  if (form.get("_action") === "saveAsDraft") return redirect(route(saveAsDraftLink));

  if (errorResponse) {
    return errorResponse as Response;
  }

  return redirect(route(successLink, { documentNumber }));
};
