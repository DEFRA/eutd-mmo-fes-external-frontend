import { type ActionFunction } from "react-router";
import { getBearerTokenForRequest, saveUserAttribute } from "~/.server";
import type { UserAttributePayload } from "~/types";

export const action: ActionFunction = async ({ request }) => {
  try {
    const bearerToken = await getBearerTokenForRequest(request);
    const body = await request.json();
    const acceptsCookies = body.acceptsCookies; // true or false

    const payload: UserAttributePayload = {
      key: "accepts_cookies",
      value: acceptsCookies ? "yes" : "no",
    };

    await saveUserAttribute(bearerToken, payload);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
