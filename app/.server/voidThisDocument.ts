import setApiMock from "tests/msw/helpers/setApiMock";
import type { Params } from "@remix-run/react";
import { route } from "routes-gen";
import type { ErrorResponse, Journey } from "~/types";
import { apiCallFailed } from "~/communication.server";
import {
  getBearerTokenForRequest,
  addVoidCertificateConfirmation,
  createCSRFToken,
  validateCSRFToken,
} from "~/.server";
import { redirect } from "@remix-run/node";
import { commitSession, getSessionFromRequest } from "~/sessions.server";

export const voidThisDocumentLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);
  const csrf = createCSRFToken();
  const { documentNumber } = params;
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  return new Response(JSON.stringify({ documentNumber, csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const voidThisDocumentAction = async (
  request: Request,
  params: Params,
  nextUri: any
): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const { documentNumber } = params;
  const journey = form.get("journey") as Journey;
  const response = await addVoidCertificateConfirmation(
    bearerToken,
    documentNumber,
    journey,
    nextUri,
    form.get("documentVoid") as string
  );
  const errors = response.errors ?? [];
  const unauthorised = response.unauthorised as boolean;

  if (unauthorised) {
    return redirect("/forbidden");
  }

  if (Array.isArray(errors) && errors.length > 0) {
    return apiCallFailed(errors);
  }

  return redirect(route(nextUri));
};
