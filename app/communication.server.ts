import isEmpty from "lodash/isEmpty";
import type { ErrorResponse, IError } from "~/types";
import { getTransformedError } from "~/helpers";
import { getEnv } from "~/env.server";
import { commitSession } from "~/sessions.server";
import { type Session, type SessionData } from "@remix-run/node";

const commonRequestHeaders = (bearerToken: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${bearerToken}`,
});

const ENV = getEnv();

type Get = (bearerToken: string, url: string, requestHeaders?: HeadersInit) => Promise<Response>;
type Post = (bearerToken: string, url: string, requestHeaders?: HeadersInit, requestBody?: any) => Promise<Response>;
type Put = (bearerToken: string, url: string, requestHeaders?: HeadersInit, requestBody?: any) => Promise<Response>;
type Delete = (bearerToken: string, url: string, requestHeaders?: HeadersInit) => Promise<Response>;

export const getReferenceData = async (url: string, requestHeaders: HeadersInit = {}): Promise<Response> => {
  const credentials = btoa(`${ENV.REF_SERVICE_BASIC_AUTH_USER}:${ENV.REF_SERVICE_BASIC_AUTH_PASSWORD}`);

  const response = await fetch(url, {
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
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...requestHeaders,
      ...commonRequestHeaders(bearerToken),
    },
  });

  if (!response.ok && ![400, 403, 404].includes(response.status)) {
    throw new Response(response.statusText, response);
  }

  return response;
};

export const post: Post = async (
  bearerToken: string,
  url: string,
  requestHeaders: HeadersInit = {},
  requestBody: any = {}
): Promise<Response> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...requestHeaders,
      ...commonRequestHeaders(bearerToken),
    },
    body: !isEmpty(requestBody) ? JSON.stringify({ ...requestBody }) : undefined,
  });

  if (!response.ok && ![400, 403, 404].includes(response.status)) {
    throw new Response(response.statusText, response);
  }

  return response;
};

export const put: Put = async (
  bearerToken: string,
  url: string,
  requestHeaders: HeadersInit = {},
  requestBody: any = {}
): Promise<Response> => {
  const response = await fetch(url, {
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
  const response = await fetch(url, {
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
