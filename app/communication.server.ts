import isEmpty from "lodash/isEmpty";
import type { ErrorResponse, IError } from "~/types";
import { getTransformedError } from "~/helpers";
import { getEnv } from "~/env.server";
import { commitSession } from "~/sessions.server";
import { type Session, type SessionData } from "react-router";

// Import cross-fetch for test mode (MSW v1.3.1 cannot intercept Node 18+ native fetch)
/* istanbul ignore next */
import crossFetch from "cross-fetch";

// Use cross-fetch in test mode, native fetch otherwise
/* istanbul ignore next */
const fetchImpl = process.env.NODE_ENV === "test" ? crossFetch : fetch;

const commonRequestHeaders = (bearerToken: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${bearerToken}`,
});

const ENV = getEnv();

const FETCH_TIMEOUT_MS = 10000;

type Get = (bearerToken: string, url: string, requestHeaders?: HeadersInit) => Promise<Response>;
type Post = (bearerToken: string, url: string, requestHeaders?: HeadersInit, requestBody?: any) => Promise<Response>;
type Put = (bearerToken: string, url: string, requestHeaders?: HeadersInit, requestBody?: any) => Promise<Response>;
type Delete = (bearerToken: string, url: string, requestHeaders?: HeadersInit) => Promise<Response>;

export const getReferenceData = async (url: string, requestHeaders: HeadersInit = {}): Promise<Response> => {
  const credentials = btoa(`${ENV.REF_SERVICE_BASIC_AUTH_USER}:${ENV.REF_SERVICE_BASIC_AUTH_PASSWORD}`);

  const response = await fetchImpl(url, {
    method: "GET",
    headers: {
      ...requestHeaders,
      Authorization: `Basic ${credentials}`,
    },
  });

  return response;
};

export const get: Get = async (
  bearerToken: string,
  url: string,
  requestHeaders: HeadersInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: {
        ...requestHeaders,
        ...commonRequestHeaders(bearerToken),
      },
      signal: controller.signal,
    });

    if (!response.ok && ![400, 403, 404].includes(response.status)) {
      throw new Response(response.statusText, response);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const post: Post = async (
  bearerToken: string,
  url: string,
  requestHeaders: HeadersInit = {},
  requestBody: any = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        ...requestHeaders,
        ...commonRequestHeaders(bearerToken),
      },
      body: !isEmpty(requestBody) ? JSON.stringify({ ...requestBody }) : undefined,
      signal: controller.signal,
    });

    if (!response.ok && ![400, 403, 404].includes(response.status)) {
      throw new Response(response.statusText, response);
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const put: Put = async (
  bearerToken: string,
  url: string,
  requestHeaders: HeadersInit = {},
  requestBody: any = {}
): Promise<Response> => {
  const response = await fetchImpl(url, {
    method: "PUT",
    headers: {
      ...requestHeaders,
      ...commonRequestHeaders(bearerToken),
    },
    body: !isEmpty(requestBody) ? JSON.stringify({ ...requestBody }) : undefined,
  });

  if (!response.ok && ![400, 403].includes(response.status)) {
    throw new Response(response.statusText, response);
  }

  return response;
};

export const deleteRequest: Delete = async (
  bearerToken: string,
  url: string,
  requestHeaders: HeadersInit = {}
): Promise<Response> => {
  const response = await fetchImpl(url, {
    method: "DELETE",
    headers: {
      ...requestHeaders,
      ...commonRequestHeaders(bearerToken),
    },
  });

  if (!response.ok && ![400, 403].includes(response.status)) {
    throw new Response(response.statusText, response);
  }

  return response;
};

export const apiCallFailed: (
  errors: IError[],
  payload?: any,
  returnDataOnly?: boolean,
  session?: Session<SessionData, SessionData>
) => Promise<Response | ErrorResponse> = async (
  errors: IError[],
  payload: any = {},
  returnDataOnly = false,
  session
) => {
  const responseData = {
    errors: getTransformedError(errors),
    ...payload,
  };

  if (returnDataOnly) {
    return responseData as ErrorResponse;
  }

  let options: any = {
    status: 400,
  };
  if (session) {
    options["headers"] = {
      "Set-Cookie": await commitSession(session),
    };
  }
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": options,
    },
  });
};

/**
 * Custom json() helper that returns Response with session cookie.
 * Compatible with v3_singleFetch - Single Fetch unwraps Response objects
 * and preserves Set-Cookie headers automatically.
 *
 * Note: While raw objects can be returned with single fetch, Response objects
 * with headers (especially Set-Cookie) are still the recommended approach
 * for managing sessions until full Remix v3 migration.
 */
export const json: (payload: any, session: Session<SessionData, SessionData>) => Promise<Response> = async (
  payload,
  session
) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
