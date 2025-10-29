import { type Session, type SessionData, createCookieSessionStorage } from "@remix-run/node";
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
      session.unset("addAnotherDocument");
  }
}

export { getSessionFromRequest, commitSession, destroySession, clearSession };
