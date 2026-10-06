import { type Session, type SessionData, createCookie, createCookieSessionStorage } from "@remix-run/node";
import { getEnv } from "./env.server";
import type { URI } from "./types";

const ENV = getEnv();
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  // a Cookie from `createCookie` or the CookieOptions to create one
  cookie: {
    name: "fesSession",
    httpOnly: true,
    maxAge: 86400,
    sameSite: "lax",
    secrets: [ENV.SESSION_SECRET],
    secure: ENV.APP_USES_HTTP,
  },
});

// Refresh tokens live in their own cookie (not the session) so the signed session
// cookie stays well under the ~4096 byte browser cookie size limit.
const refreshTokenCookie = createCookie("fesRefreshToken", {
  httpOnly: true,
  maxAge: 86400,
  sameSite: "lax",
  secrets: [ENV.SESSION_SECRET],
  secure: ENV.APP_USES_HTTP,
});

const getRefreshTokenFromRequest = async (request: Request): Promise<string | undefined> => {
  const value = await refreshTokenCookie.parse(request.headers.get("Cookie"));
  return typeof value === "string" ? value : undefined;
};

const serializeRefreshTokenCookie = async (refreshToken: string): Promise<string> =>
  await refreshTokenCookie.serialize(refreshToken);

const clearRefreshTokenCookie = async (): Promise<string> => await refreshTokenCookie.serialize("", { maxAge: 0 });

const getSessionFromRequest = async (request: Request) => await getSession(request.headers.get("Cookie"));

function clearSession(session: Session<SessionData, SessionData>, uri?: URI) {
  switch (uri) {
    case "what-are-you-exporting":
      session.unset("species");
      session.unset("state");
      session.unset("presentation");
      session.unset("productId");
      session.unset("commodityCode");
      session.unset("isEdit");
      break;
    case "add-landings":
      session.unset("selectedStartDate");
      session.unset("selectedDate");
      session.unset("selectedProduct");
      session.unset("selectedFaoArea");
      session.unset("selectedWeight");
      session.unset("selectedVessel");
      session.unset("landingId");
      session.unset("editLanding");
      session.unset("selectedHighSeasArea");
      session.unset("gearCategory");
      session.unset("gearType");
      session.unset("selectedRfmo");
      session.unset("selectedExclusiveEconomicZones");
      break;

    default:
      session.unset("species");
      session.unset("state");
      session.unset("presentation");
      session.unset("productId");
      session.unset("commodityCode");
      session.unset("isEdit");
      session.unset("selectedStartDate");
      session.unset("selectedDate");
      session.unset("selectedProduct");
      session.unset("selectedFaoArea");
      session.unset("selectedWeight");
      session.unset("selectedVessel");
      session.unset("landingId");
      session.unset("editLanding");
      session.unset("selectedHighSeasArea");
      session.unset("gearCategory");
      session.unset("gearType");
      session.unset("selectedRfmo");
      session.unset("selectedExclusiveEconomicZones");
      session.unset("addAnotherDocument");
  }
}

export {
  getSessionFromRequest,
  commitSession,
  destroySession,
  clearSession,
  getRefreshTokenFromRequest,
  serializeRefreshTokenCookie,
  clearRefreshTokenCookie,
};
