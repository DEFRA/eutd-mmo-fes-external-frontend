import { pages, getPageNameFromUrl, isProdEnv } from "../helpers";
import { getBearerTokenForRequest, getClient, REDIRECT_URL } from "./";
import i18next from "~/i18next.server";
import jwt from "jsonwebtoken";
import type { IMainAppProps } from "../types";
import { getEnv } from "../env.server";
import { route } from "routes-gen";

const ENV = getEnv();

export const getRootData = async (request: Request): Promise<IMainAppProps> => {
  const pageName = getPageNameFromUrl(request.url);
  const currentPageData = pages[pageName];

  const homeLink = currentPageData?.homeLink ?? "catch-certificate";
  const headerTitleKey = `${homeLink === "/" ? "journeyTitle_catch-certificate" : `journeyTitle_${homeLink}`}`;
  const headerTitleTo = homeLink === "/" ? "/" : `/create-${homeLink}/${homeLink}s`;

  const disableScripts = !isProdEnv() ? new URL(request.url).searchParams.get("disableScripts") : false;
  const idleTimeoutInMilliseconds: number = parseInt(ENV.IDLE_TIME_OUT_IN_MILLISECONDS);
  const gtmId: string = ENV.GOOGLE_TAG_MANAGER_ID;
  const gaId: string = ENV.GA_TRACKING_ID;
  const clarityProjectId: string = ENV.CLARITY_PROJECT_ID;
  const bearerToken = await getBearerTokenForRequest(request);
  const { enrolmentCount }: any = jwt.decode(bearerToken);
  const showChangeOrganisationLink = enrolmentCount > 1;

  let redirectTo = null;
  if (showChangeOrganisationLink) {
    const cl = await getClient(ENV.IDM_CLIENTID, ENV.IDM_CLIENTSECRET);
    redirectTo = cl.authorizationUrl({
      serviceId: ENV.IDENTITY_SERVICEID,
      redirect_uri: REDIRECT_URL,
      scope: "openid offline_access",
      response_mode: "form_post",
      response_type: "code",
      forceReselection: true,
    });
  }

  return {
    pageName,
    pageTitle: currentPageData?.title,
    headerTitleKey,
    headerTitleTo,
    hideHomeLink: !!currentPageData?.hideHomeLink,
    hideFavouritesLink: !!currentPageData?.hideFavouritesLink,
    changeOrganisationUrl: ENV.DISABLE_IDM ? "/redirectTo" : redirectTo,
    idmLink: ENV.IDENTITY_APP_MGT_URL ?? "",
    idmLogoutLink: route("/logout"),
    idmLogoutPage: route("/sign-out"),
    idleTimeoutInMilliseconds,
    locale: await i18next.getLocale(request),
    disableScripts: !!disableScripts,
    applicationInsightInstrumentationKey: ENV.APPLICATION_INSIGHTS_INSTRUMENTATION_KEY,
    applicationInsightCloudRoleName: ENV.APPLICATION_INSIGHTS_INSTRUMENTATION_CLOUD_ROLE,
    gtmId,
    gaId,
    clarityProjectId,
  };
};
