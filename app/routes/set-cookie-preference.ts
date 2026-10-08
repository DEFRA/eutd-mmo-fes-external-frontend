import { type ActionFunction, type LoaderFunction } from "react-router";
import { createCSRFToken, getBearerTokenForRequest, saveUserAttribute, validateCSRFToken } from "~/.server";
import { analyticsAcceptedCookie } from "~/cookies.server";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import serverLogger from "~/logger.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import type { UserAttributePayload } from "~/types";

// Route-agnostic CSRF token fetch so the cookie banner works on any page, not just "/"
export const loader: LoaderFunction = async ({ request }) => {
  /* istanbul ignore next */
  setApiMock(request.url);
  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  return new Response(JSON.stringify({ csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
      "Cache-Control": "no-store",
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const form = await request.formData();
    const isValid = await validateCSRFToken(request, form);
    if (!isValid) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const bearerToken = await getBearerTokenForRequest(request);
    const acceptsCookies = form.get("acceptsCookies") === "true";

    const payload: UserAttributePayload = {
      key: "accepts_cookies",
      value: acceptsCookies ? "yes" : "no",
    };

    await saveUserAttribute(bearerToken, payload);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await analyticsAcceptedCookie.serialize({ analyticsAccepted: acceptsCookies }),
      },
    });
  } catch (error) {
    serverLogger.error(
      `[SET-COOKIE-PREFERENCE][ERROR][${error instanceof Error ? error.stack ?? error.message : error}]`
    );
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
