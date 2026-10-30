import querystring from "node:querystring";
import type { Establishment } from "~/types";
import { getEnv } from "~/env.server";
import serverLogger from "~/logger.server";
import { buildSearchRequestHeaders, hasApimHeaderConfig } from "~/helpers/approvedFoodEstablishmentsHeaders";
import { APPROVED_FOOD_ESTABLISHMENTS_TOKEN_URL, getApprovedFoodEstablishmentsSearchUrl } from "~/urls.server";

/* istanbul ignore next */
import crossFetch from "cross-fetch";

/* istanbul ignore next */
const fetchImpl = process.env.NODE_ENV === "test" ? crossFetch : fetch;

export type EstablishmentType = "processing" | "storage";

type OAuthTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type?: string;
};

type EstablishmentSearchResponse = {
  content?: Establishment[];
};

type TokenCacheEntry = {
  accessToken: string;
  expiresAtMs: number;
};

let tokenCache: TokenCacheEntry | undefined;
let tokenInFlight: Promise<string> | undefined;
let hasLoggedMissingApimHeaderWarning = false;

const ENV = getEnv();

const warnIfApimHeaderMissing = (): void => {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  if (!hasApimHeaderConfig(ENV.DEFRA_TRADE_API_APIM_HEADER_NAME, ENV.DEFRA_TRADE_API_APIM_HEADER_VALUE)) {
    if (!hasLoggedMissingApimHeaderWarning) {
      serverLogger.warn("[APPROVED-FOOD-ESTABLISHMENTS][CONFIG][APIM-HEADER-MISSING]");
      hasLoggedMissingApimHeaderWarning = true;
    }
  }
};

const trackDependency = async (
  name: string,
  target: string,
  startTime: number,
  statusCode: number,
  success: boolean
): Promise<void> => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  try {
    const imported = await import("applicationinsights");
    const ai = imported.default || imported;
    const client = ai?.defaultClient;
    if (!client?.trackDependency) {
      return;
    }

    client.trackDependency({
      name,
      target,
      dependencyTypeName: "HTTP",
      duration: Date.now() - startTime,
      resultCode: String(statusCode),
      success,
      data: "a",
    });
  } catch {
    // Intentionally swallow telemetry failures.
  }
};

const getNow = () => Date.now();

const getCachedToken = (): string | undefined => {
  if (!tokenCache) {
    return undefined;
  }

  if (
    tokenCache.expiresAtMs <=
    getNow() + Number.parseInt(ENV.APPROVED_ESTABLISHMENT_SEARCH_TOKEN_SAFETY_WINDOW_MS, 10)
  ) {
    tokenCache = undefined;
    return undefined;
  }

  return tokenCache.accessToken;
};

const doFetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchImpl(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs} ms`);
    }
    serverLogger.error(`[APPROVED-FOOD-ESTABLISHMENTS][FETCH][ERROR][${String(error)}]`);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const requestAccessToken = async (): Promise<string> => {
  const startTime = Date.now();
  const formBody = querystring.stringify({
    client_id: ENV.DEFRA_TRADE_API_OAUTH_CLIENT_ID,
    client_secret: ENV.DEFRA_TRADE_API_OAUTH_CLIENT_SECRET,
    scope: ENV.DEFRA_TRADE_API_OAUTH_SCOPE,
    grant_type: "client_credentials",
  });

  const response = await doFetchWithTimeout(
    APPROVED_FOOD_ESTABLISHMENTS_TOKEN_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    },
    Number.parseInt(ENV.APPROVED_ESTABLISHMENT_SEARCH_TOKEN_TIMEOUT_MS, 10)
  );

  await trackDependency(
    "approved-food-establishments-oauth",
    "approved-food-establishments-oauth",
    startTime,
    response.status,
    response.ok
  );

  if (!response.ok) {
    throw new Error(`OAuth token request failed with status ${response.status}`);
  }

  const token = (await response.json()) as OAuthTokenResponse;

  if (!token?.access_token || typeof token.expires_in !== "number") {
    throw new Error("OAuth token response missing access token or expiry");
  }

  tokenCache = {
    accessToken: token.access_token,
    expiresAtMs: getNow() + token.expires_in * 1000,
  };

  return token.access_token;
};

export const invalidateApprovedFoodEstablishmentsToken = (): void => {
  tokenCache = undefined;
};

export const getApprovedFoodEstablishmentsAccessToken = async (): Promise<string> => {
  const cachedToken = getCachedToken();
  if (cachedToken) {
    return cachedToken;
  }

  if (tokenInFlight !== undefined) {
    return tokenInFlight;
  }

  tokenInFlight = requestAccessToken()
    .catch((error: unknown) => {
      serverLogger.error(`[APPROVED-FOOD-ESTABLISHMENTS][OAUTH][ERROR][${String(error)}]`);
      throw error;
    })
    .finally(() => {
      tokenInFlight = undefined;
    });

  return tokenInFlight;
};

const getSearchFilters = (type: EstablishmentType): Record<string, string> => {
  if (type === "processing") {
    return {
      section: "A.VIII",
      capability: "processing",
    };
  }

  return {
    sectionActivity: "A.0:CS",
  };
};

const buildSearchUrl = (type: EstablishmentType, term: string): string => {
  const url = new URL(getApprovedFoodEstablishmentsSearchUrl());
  url.searchParams.set("country", "GB");

  if (term.length) {
    url.searchParams.set("q", term);
  }

  const filters = getSearchFilters(type);
  for (const [key, value] of Object.entries(filters)) {
    url.searchParams.set(key, value);
  }

  url.searchParams.set("limit", ENV.APPROVED_ESTABLISHMENT_SEARCH_LIMIT);
  url.searchParams.set("offset", "0");

  return url.toString();
};

const toEstablishments = async (response: Response): Promise<Establishment[]> => {
  if (!response.ok) {
    throw new Error(`MDM establishment search failed with status ${response.status}`);
  }

  const data = (await response.json()) as EstablishmentSearchResponse | Establishment[];

  if (Array.isArray(data)) {
    return data;
  }
  serverLogger.debug("[APPROVED-FOOD-ESTABLISHMENTS][SEARCH][PARSE-RESPONSE]");

  return data.content ?? [];
};

const callSearchApi = async (type: EstablishmentType, term: string, token: string): Promise<Response> => {
  warnIfApimHeaderMissing();

  const requestUrl = buildSearchUrl(type, term);
  const startTime = Date.now();
  serverLogger.debug(`[APPROVED-FOOD-ESTABLISHMENTS][SEARCH][REQUEST][${requestUrl}]`);

  const response = await doFetchWithTimeout(
    requestUrl,
    {
      method: "GET",
      headers: buildSearchRequestHeaders(
        token,
        ENV.DEFRA_TRADE_API_APIM_HEADER_NAME,
        ENV.DEFRA_TRADE_API_APIM_HEADER_VALUE
      ),
    },
    Number.parseInt(ENV.APPROVED_ESTABLISHMENT_SEARCH_TIMEOUT_MS, 10)
  );

  serverLogger.debug("[APPROVED-FOOD-ESTABLISHMENTS][SEARCH][RESPONSE]");
  await trackDependency(
    "approved-food-establishments-search",
    "approved-food-establishments-search",
    startTime,
    response.status,
    response.ok
  );

  return response;
};

export const searchApprovedFoodEstablishments = async (
  type: EstablishmentType,
  term: string
): Promise<Establishment[]> => {
  const trimmedTerm = term.trim();

  try {
    const initialToken = await getApprovedFoodEstablishmentsAccessToken();
    let response = await callSearchApi(type, trimmedTerm, initialToken);

    if (response.status === 401) {
      invalidateApprovedFoodEstablishmentsToken();
      const retryToken = await getApprovedFoodEstablishmentsAccessToken();
      response = await callSearchApi(type, trimmedTerm, retryToken);
    }

    return await toEstablishments(response);
  } catch (error: unknown) {
    serverLogger.error(`[APPROVED-FOOD-ESTABLISHMENTS][SEARCH][${type.toUpperCase()}][ERROR][${String(error)}]`);
    return [];
  }
};
