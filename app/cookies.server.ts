import { type Cookie, createCookie } from "@remix-run/node";

export const i18nextCookie = createCookie("i18next", { path: "/", sameSite: "strict" });
export const analyticsAcceptedCookie = createCookie("analytics_cookies_accepted", { path: "/", sameSite: "strict" });

export type II18nextCookie = string;

export interface IAnalyticsAcceptedCookie {
  analyticsAccepted: boolean;
}

export const parseCookie = async (
  cookie: Cookie,
  request: Request
): Promise<II18nextCookie | IAnalyticsAcceptedCookie> => {
  const cookieHeader = request.headers.get("Cookie");
  const parsedCookie = await cookie.parse(cookieHeader);
  return parsedCookie;
};
