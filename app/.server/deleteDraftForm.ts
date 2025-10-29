import { redirect } from "@remix-run/node";
import setApiMock from "tests/msw/helpers/setApiMock";
import type { Journey } from "~/types";
import type { reduxRequestParams } from "~/types/reduxRequestParam";
import { getBearerTokenForRequest } from "./auth";
import { deleteDocument } from "./documentDelete";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { createCSRFToken, validateCSRFToken } from "./csrfToken";

export const deleteDraftFormLoader = async ({ request, params }: reduxRequestParams) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const session = await getSessionFromRequest(request);
  const csrf = createCSRFToken();
  session.set("csrf", csrf);
  return new Response(JSON.stringify({ documentNumber, csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const deleteDraftFormAction = async ({
  journey,
  request,
  params,
  nextUri,
}: reduxRequestParams & { journey: Journey; nextUri: string }) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  return deleteDocument(journey, bearerToken, documentNumber as string, form, nextUri);
};
