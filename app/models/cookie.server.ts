import isEmpty from "lodash/isEmpty";
import { redirect } from "react-router";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  createCSRFToken,
  getAllUserAttributes,
  getBearerTokenForRequest,
  isAcceptedCookies,
  saveUserAttribute,
  validateCSRFToken,
} from "~/.server";
import { analyticsAcceptedCookie, type IAnalyticsAcceptedCookie, parseCookie } from "~/cookies.server";
import { getTransformedError } from "~/helpers";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import type { UserAttribute, UserAttributePayload } from "~/types";
const cookiePreferenceField = "saveCookiePreference";

export const CookieLoader = async (request: Request): Promise<Response> => {
  /* istanbul ignore next */
  setApiMock(request.url);

  await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  const errors = session.get("errors") ?? {};
  const analyticsCookie = (await parseCookie(analyticsAcceptedCookie, request)) as IAnalyticsAcceptedCookie;
  const bearerToken = await getBearerTokenForRequest(request);
  const userAttributes: UserAttribute[] = await getAllUserAttributes(bearerToken);
  const hasAcceptedCookies = isAcceptedCookies(userAttributes);
  const csrf = await createCSRFToken(request);
  const hasActionExecuted = session.get("actionExecuted");
  session.set("csrf", csrf);
  session.unset("actionExecuted");

  return new Response(
    JSON.stringify({
      analyticsAccepted: analyticsCookie?.analyticsAccepted || hasAcceptedCookies,
      showSuccessBanner: hasActionExecuted,
      csrf,
      errors,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const CookieAction = async (request: Request): Promise<Response> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const session = await getSessionFromRequest(request);

  session.set("actionExecuted", true);

  const payload: UserAttributePayload = {
    key: "accepts_cookies",
    value: (form.get(cookiePreferenceField) as string)?.toLowerCase(),
  };

  if (isEmpty(form.get(cookiePreferenceField))) {
    const session = await getSessionFromRequest(request);
    session.flash(
      "errors",
      getTransformedError([
        {
          key: "cookieAnalyticsAccept",
          message: "ccLandingTypeSelectOption",
        },
      ])
    );
    return redirect(route("/cookies"), {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  await saveUserAttribute(bearerToken, payload);

  return redirect(route("/cookies"), {
    headers: [
      [
        "Set-Cookie",
        await analyticsAcceptedCookie.serialize({ analyticsAccepted: form.get(cookiePreferenceField) === "Yes" }),
      ],
      ["Set-Cookie", await commitSession(session)],
    ],
  });
};
