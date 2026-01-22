import { redirect, type Params } from "react-router";

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

  const userReferenceValue = form.get("userReference") as string;
  const isSaveAsDraft = form.get("_action") === "saveAsDraft";

  // First validate by calling the API
  const userReference: UserReference = await addUserReference(
    bearerToken,
    documentNumber,
    userReferenceValue
  );

  const errorResponse = validateResponseData(userReference, form);

  if (isSaveAsDraft) {
    // For saveAsDraft, if there are errors, don't save the invalid value
    // The API already saved it, so we need to save an empty value or the previous valid value
    if (
      errorResponse &&
      Array.isArray(userReference.errors) &&
      userReference.errors.length > 0
    ) {
      // Clear the invalid value by saving empty string
      await addUserReference(bearerToken, documentNumber, "");
    }
    return redirect(route(saveAsDraftLink));
  }

  if (errorResponse) {
    return errorResponse as Response;
  }

  return redirect(route(successLink, { documentNumber }));
};
