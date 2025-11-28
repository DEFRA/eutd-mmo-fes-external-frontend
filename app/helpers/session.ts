export function ensureCSRFInSession(session: any, shouldUpdate: boolean, csrf: string) {
  if (shouldUpdate && !session.has("csrf")) {
    session.set("csrf", csrf);
  }
  return session;
}

export function clearAddressSession(session: any) {
  session.unset("currentStep");
  session.unset("postcode");
  session.unset("addressOne");
}
