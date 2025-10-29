import jwt from "jsonwebtoken";
import querystring from "querystring";
import * as https from "https";
import crypto from "crypto";
import { type TypedResponse, redirect, type Session } from "@remix-run/node";
import { getEnv } from "~/env.server";
import { type CallbackParamsType, Issuer, type TokenSet, type BaseClient, custom } from "openid-client";
import { commitSession, destroySession, getSessionFromRequest } from "~/sessions.server";
import { createEnrolment, enrolmentStatus, getDynamicsToken, getEnrolmentRequests } from "~/.server";

import logger from "~/logger.server";
import type { IExporter } from "~/types";
import isEmpty from "lodash/isEmpty";
const ENV = getEnv();
const redirectUri = "/login/return";

export const REDIRECT_URL = `${ENV.IDENTITY_APPDOMAIN}${redirectUri}`;

custom.setHttpOptionsDefaults({
  agent: new https.Agent({
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
  }),
  timeout: 15000,
});

export const getClient = async (clientId: string, clientSecret: string, discoveryUri?: string): Promise<BaseClient> => {
  const uri = discoveryUri ?? `${ENV.IDENTITY_APP_URL}/.well-known/openid-configuration`;
  const issuer = await Issuer.discover(uri);
  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
  });

  return client;
};

export const getBearerTokenForRequest = async (request: Request): Promise<string> => {
  if (ENV.DISABLE_IDM) {
    return ENV.IDM_FALLBACK_TOKEN;
  }

  const session = await getSessionFromRequest(request);
  const id_token = session.get("token_id");

  if (id_token) {
    return id_token;
  }

  const cl = await getClient(ENV.IDM_CLIENTID, ENV.IDM_CLIENTSECRET);
  const redirectTo = cl.authorizationUrl({
    serviceId: ENV.IDENTITY_SERVICEID,
    redirect_uri: REDIRECT_URL,
    scope: "openid offline_access",
    response_mode: "form_post",
    response_type: "code",
  });

  throw redirect(redirectTo);
};

export const isAdminUser = (bearerToken: string): boolean => {
  if (ENV.DISABLE_IDM) {
    return false;
  }

  const claims: any = jwt.decode(bearerToken);
  const roles: string[] = claims?.roles ?? [];
  const requestByAdmin: boolean = roles
    ? roles.includes("MMO-ECC-Service-Management") ||
      roles.includes("MMO-ECC-Support-User") ||
      roles.includes("MMO-ECC-IUU-Single-Liaison-Officer") ||
      roles.includes("MMO-ECC-Regulatory-User")
    : false;

  return requestByAdmin;
};

export const shouldLoadFromIdm = (bearerToken: string, exporter: IExporter): boolean =>
  (isEmpty(exporter.model) || exporter.model?.contactId === undefined) && !isAdminUser(bearerToken);

export const autoEnrollUserForService = async (contactId: string, tokenSet: TokenSet): Promise<TokenSet> => {
  if (!contactId) {
    throw new Error("No contactId");
  }

  const dynamicsToken = await getDynamicsToken();

  // Get all unspent EnrolmentRequests
  const enrolmentRequests: any[] = await getEnrolmentRequests(ENV.IDENTITY_SERVICEID, contactId, dynamicsToken);
  // Create enrolments for all our unspent EnrolmentRequests
  await Promise.all(
    enrolmentRequests.map((enrolmentRequest: any) =>
      createEnrolment(
        contactId,
        dynamicsToken,
        enrolmentRequest.connectionDetailsId,
        enrolmentStatus.completeApproved,
        enrolmentRequest.accountId,
        ENV.IDENTITY_SERVICEID,
        ENV.IDENTITY_SERVICEROLEID
      )
    )
  );

  return await refreshToken(tokenSet);
};

export const onLoginReturnAuth = async (request: Request): Promise<CallbackParamsType> => {
  const data = await request.text();

  if (!data?.includes("code")) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const res = data.split("&");

  return res.reduce((acc: CallbackParamsType, param: string) => {
    const params = param.split("=");
    return {
      ...acc,
      [params[0]]: params[1],
    };
  }, {});
};

const setTokenId: (id: string, session: Session) => void = (id: string, session: Session) => {
  // a different user has signed in successfully so clear the previous users session
  session.unset("token_id");

  // store the token in a cookie
  session.set("token_id", id);
};

const getDecodedPayload: (id_token: string) => jwt.JwtPayload = (id_token: string) => {
  const decoded: string | jwt.JwtPayload | null = jwt.decode(id_token);

  if (!decoded || typeof decoded === "string" || decoded instanceof String) {
    throw new Error("Claim in wrong format");
  }

  return decoded;
};

export const onLoginReturnHandler = async (request: Request): Promise<Response> => {
  try {
    const payload: CallbackParamsType = await onLoginReturnAuth(request);

    // retrieve the user details
    const cl: BaseClient = await getClient(ENV.IDM_CLIENTID, ENV.IDM_CLIENTSECRET);
    const tokenSet: TokenSet = await cl.callback(REDIRECT_URL, { code: payload.code });

    const session = await getSessionFromRequest(request);

    if (tokenSet?.id_token) {
      // Authentication
      // Authorisation, new user, returning

      // 1. Organisation picker? Answer: need picker
      // 2. We need to return here if I do not have the right role / relationship. Response: work for further down the line
      // 3. present the "Sorry there is problem with the service" page in the event of an error. Response: Done

      const { contactId, enrolmentRequestCount, enrolmentCount } = getDecodedPayload(tokenSet?.id_token);

      if (enrolmentRequestCount > 0) {
        const { id_token }: TokenSet = await autoEnrollUserForService(contactId, tokenSet);

        if (id_token) {
          // check enrolment count
          const { enrolmentCount } = getDecodedPayload(id_token);

          if (enrolmentCount === 0) {
            throw new Error("User has no enrolments");
          }

          setTokenId(id_token, session);
        }
      } else if (enrolmentCount > 0) {
        setTokenId(tokenSet?.id_token, session);
      } else {
        throw new Error("User has no enrolments");
      }
    } else {
      throw new Error("No token provided");
    }

    const params = {
      loggedIn: "yes",
    };

    // render the home page for logged in user URL=‘/’
    return redirect("/?" + querystring.stringify(params), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`[IDM-V2][AUTHENTICATION][ERROR][${e.stack ?? e}]`);
    }

    throw e;
  }
};

export const onLoginAdminReturnHandler = async (request: Request): Promise<Response> => {
  const adminRedirectUri = "/auth/openid/returnUri";
  const ADMIN_REDIRECT_URL = `${ENV.IDENTITY_APPDOMAIN}${adminRedirectUri}`;

  const payload: CallbackParamsType = await onLoginReturnAuth(request);

  const clientId = ENV.AAD_CLIENTID;
  const clientSecret = ENV.AAD_CLIENTSECRET;
  const tenantId = ENV.AAD_TENANTID;
  const discoveryUri = `https://login.microsoftonline.com/${tenantId}/.well-known/openid-configuration`;

  const cl = await getClient(clientId, clientSecret, discoveryUri);
  const tokenSet: TokenSet = await cl.callback(ADMIN_REDIRECT_URL, payload);

  if (tokenSet?.id_token) {
    // a different user has signed in successfully so clear the previous users session
    const session = await getSessionFromRequest(request);
    session.unset("token_id");

    // store the token in a cookie
    session.set("token_id", tokenSet.id_token);

    const params = {
      loggedIn: "yes",
    };

    // render the home page for logged in user URL=‘/’
    return redirect("/?" + querystring.stringify(params), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  throw new Response("Unable to obtain token", { status: 401 });
};

export const refreshToken = async (refreshToken: TokenSet): Promise<TokenSet> => {
  const cl = await getClient(ENV.IDM_CLIENTID, ENV.IDM_CLIENTSECRET);
  return await cl.refresh(refreshToken);
};

export const logout = async (request: Request): Promise<TypedResponse<never>> => {
  if (ENV.DISABLE_IDM) {
    return redirect("/server-logout");
  }

  const session = await getSessionFromRequest(request);
  const adminUser = isAdminUser(session.get("token_id"));

  if (adminUser) {
    const redirectUri = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${ENV.IDENTITY_APPDOMAIN}/`;

    throw redirect(redirectUri, {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  const clientId = ENV.IDM_CLIENTID;
  const clientSecret = ENV.IDM_CLIENTSECRET;

  const cl = await getClient(clientId, clientSecret);
  const redirectTo = cl.endSessionUrl({ client_id: clientId });

  throw redirect(redirectTo, {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};
