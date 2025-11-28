import { type Params } from "@remix-run/react";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  createCSRFToken,
  getAllUserAttributes,
  getBearerTokenForRequest,
  isPrivacyAccepted,
  saveUserAttribute,
  validateCSRFToken,
} from "~/.server";
import { getDashboardName } from "~/helpers";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import type { UserAttributePayload } from "~/types";
import { redirect } from "@remix-run/node";

export const PrivacyNoticeLoader = async (request: Request, params: Params): Promise<Response> => {
  const { journey } = params;
  /* istanbul ignore next */
  setApiMock(request.url);
  const bearerToken = await getBearerTokenForRequest(request);
  const userAttributes = await getAllUserAttributes(bearerToken);

  const csrf = await createCSRFToken(request);
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  if (isPrivacyAccepted(userAttributes)) {
    return redirect(`/${journey}/${getDashboardName(journey)}`);
  }

  return new Response(JSON.stringify({ csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const PrivacyNoticeAction = async (request: Request, params: Params): Promise<Response> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { journey } = params;
  const form = await request.formData();
  const { ...values } = Object.fromEntries(form);

  const payload: UserAttributePayload = {
    key: "privacy_statement",
    value: true,
  };
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  await saveUserAttribute(bearerToken, payload);
  if (values["jsenable"] === "true") {
    return new Response(`/${journey}/${getDashboardName(journey)}`, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } else {
    return redirect(`/${journey}/${getDashboardName(journey)}`);
  }
};
