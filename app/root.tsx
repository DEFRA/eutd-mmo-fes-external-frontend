import React, { useEffect, useRef } from "react";
import * as GovUKFrontEnd from "govuk-frontend";
import { useTranslation } from "react-i18next";
import { applicationinsights, getApplicationInsights } from "~/applicationInsightsService";
import { serverApplicationinsights } from "./applicationInsightsService.server";
import { type LinksFunction, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type ShouldRevalidateFunction,
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  useLocation,
  useMatches,
  useRevalidator,
} from "@remix-run/react";
import { useChangeLanguage } from "remix-i18next/react";
import { IdleTimerProvider } from "react-idle-timer";
import { shouldRenderGA, isProdEnv } from "./helpers";
import { Header, Footer, Banner, Main, Title } from "./components";
import { getRootData } from "./.server";
import i18next from "~/i18next.server";
import { i18nextCookie, analyticsAcceptedCookie, parseCookie, type IAnalyticsAcceptedCookie } from "./cookies.server";
import { getStyles } from "./styles/styles";
import type { IMainAppProps } from "./types";
import clientLogger from "./logger";
import { allNamespaces, supportedLanguages } from "./i18n";

declare global {
  interface Window {
    gtag: any;
  }
}

export const handle = {
  i18n: [...allNamespaces],
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const { pageTitle } = data ?? {};

  return [
    { charset: "utf-8" },
    { title: pageTitle ?? "Fish Export Service - GOV.UK" },
    {
      property: "viewport",
      content: "width=device-width, initial-scale=1, viewport-fit=cover",
    },
    {
      property: "themeColor",
      content: "#0b0c0c",
    },
  ];
};

export const links: LinksFunction = () => getStyles();

export const shouldRevalidate: ShouldRevalidateFunction = ({ actionResult, defaultShouldRevalidate }) => {
  const errorStr = document.getElementsByTagName("html")[0].getAttribute("lang") === "cy" ? "Gwall: " : "Error: ";
  if (actionResult?.errors) {
    document.title = !document.title.includes(errorStr) ? `${errorStr} ${document.title}` : document.title;
    return defaultShouldRevalidate;
  }

  if (document.title.includes(errorStr)) {
    document.title = document.title.replace(new RegExp(`${errorStr}`, "g"), "");
    return defaultShouldRevalidate;
  }

  return defaultShouldRevalidate;
};

const Template = ({
  headerTitleKey,
  headerTitleTo,
  hideHomeLink,
  hideFavouritesLink,
  changeOrganisationUrl,
  locale,
  idmLink,
  idmLogoutLink,
  disableScripts,
  gtmId,
  gaId,
  clarityProjectId,
  children,
  analyticsCookieAccepted,
}: React.PropsWithChildren<IMainAppProps>) => {
  const ref = useRef<HTMLSpanElement>(null);
  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  useChangeLanguage(locale);

  useEffect(() => {
    const gtmScript = document.createElement("script");
    const gtagScript = document.createElement("script");
    const gtagExternal = document.createElement("script");
    const clarity = document.createElement("script");

    if (shouldRenderGA(analyticsCookieAccepted)) {
      document.getElementById("gtm-script")?.remove();
      document.getElementById("gtm-external")?.remove();
      document.getElementById("gtag-script")?.remove();
      document.getElementById("clarity-script")?.remove();
    }

    if (clarityProjectId?.length && shouldRenderGA(analyticsCookieAccepted)) {
      clarity.id = "clarity-script";
      clarity.innerHTML = `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${clarityProjectId}");`;
      document.head.appendChild(clarity);
    }

    if (gtmId?.length && shouldRenderGA(analyticsCookieAccepted)) {
      gtagExternal.async = true;
      gtagExternal.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      gtagExternal.id = "gtag-external";

      gtmScript.id = "gtm-script";
      gtmScript.innerHTML = `
        (function(w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({
              'gtm.start': new Date().getTime(),
              event: 'gtm.js'
          });
          var f = d.getElementsByTagName(s)[0],
              j = d.createElement(s),
              dl = l != 'dataLayer' ? '&l=' + l : '';
          j.async = true;
          j.src =
              'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
          f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', '${gtmId}');`;

      gtagScript.id = "gtag-script";
      gtagScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

        gtag('config', '${gaId}');`;

      document.head.appendChild(gtmScript);
      document.head.appendChild(gtagScript);
      document.head.appendChild(gtagExternal);

      return () => {
        if (document.head.contains(clarity)) document.head.removeChild(clarity);
        if (document.head.contains(gtmScript)) document.head.removeChild(gtmScript);
        if (document.head.contains(gtagScript)) document.head.removeChild(gtagScript);
        if (document.head.contains(gtagExternal)) document.head.removeChild(gtagExternal);
      };
    }
  }, [analyticsCookieAccepted]);

  useEffect(() => {
    ref.current?.focus();
  }, [pathname]);

  const location = useLocation();

  return (
    <html className="govuk-template" lang={locale} dir={i18n.dir()}>
      <head>
        <Meta />
        <Links />
      </head>
      <body className="govuk-template__body govuk-body">
        {shouldRenderGA(analyticsCookieAccepted) && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          ></noscript>
        )}
        <span ref={ref} tabIndex={-1} />
        <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
          Skip to main content
        </a>
        <Header
          title={headerTitleKey}
          titleTo={headerTitleTo}
          hideHomeLink={hideHomeLink}
          hideFavouritesLink={hideFavouritesLink}
          changeOrganisationUrl={changeOrganisationUrl}
          identityAppMgtURL={idmLink}
          identityAppLogoutURL={idmLogoutLink}
        />
        <div className="govuk-width-container">
          <Banner locale={locale} languages={supportedLanguages} params={location.search} />
          {children}
        </div>
        <Footer />
        <ScrollRestoration />
        {!disableScripts && <Scripts />}
      </body>
    </html>
  );
};

export function ErrorBoundary() {
  const [rootData] = useMatches() || [];
  const error = useRouteError();
  const { t } = useTranslation(["common", "forbidden"]);
  useChangeLanguage(rootData?.data?.locale ?? "en");
  const templateProps = (rootData?.data as IMainAppProps) || {};

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <Template {...templateProps} disableScripts>
        <>
          <h1>{t("commonErrorPageTitle")}</h1>
          {(error.status || error.statusText) && (
            <p>
              {error.status}: {error.statusText}
            </p>
          )}
          {error.data && <p>{JSON.stringify(error.data, null, 2)}</p>}
        </>
      </Template>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";
  const isError = error instanceof Error;
  if (isError) {
    errorMessage = error.message;
    clientLogger.error(error);
  }

  const substring = "The request is blocked.";
  const isWAFError = isError && error?.message.includes(substring);

  return (
    <Template {...templateProps} disableScripts>
      {isWAFError ? (
        <Main showHelpLink={false}>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <Title title={t("forbiddenH1Text", { ns: "forbidden" })} />
              <p data-testid="no-permission">{t("forbiddenPageP1Text", { ns: "forbidden" })}</p>
              <p data-testid="navigate-back">{t("forbiddenPageP2Text", { ns: "forbidden" })}</p>
            </div>
          </div>
        </Main>
      ) : (
        <Main showHelpLink={false}>
          <h1>{t("commonErrorPageTitle")}</h1>
          <p>{t("commonErrorPageTryagainText")}</p>
          <p>{t("commonErrorPagesaveText")}</p>
          {!isProdEnv() && (
            <>
              <p>{errorMessage}</p>
              {isError && <pre style={{ overflowY: "scroll" }}>{error.stack}</pre>}
            </>
          )}
        </Main>
      )}
    </Template>
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const data = await getRootData(request);
  serverApplicationinsights.initialize(data.applicationInsightInstrumentationKey, data.applicationInsightCloudRoleName);

  const t = await i18next.getFixedT(request, "title");
  const { documentNumber } = params;
  const analyticsCookie = (await parseCookie(analyticsAcceptedCookie, request)) as IAnalyticsAcceptedCookie;

  return new Response(
    JSON.stringify({
      ...data,
      pageTitle: t(data.pageTitle, { documentNumber }),
      analyticsCookieAccepted: analyticsCookie?.analyticsAccepted,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await i18nextCookie.serialize(data.locale),
      },
    }
  );
};

export default function App() {
  const data = useLoaderData<IMainAppProps>();
  useChangeLanguage(data.locale);

  const { revalidate } = useRevalidator();

  // invoke the loader function to revalidate page data
  useEffect(() => revalidate(), [revalidate]);

  useEffect(() => {
    const htmlScriptPrototype = "noModule" in HTMLScriptElement.prototype ? "govuk-frontend-supported" : "";
    document.body.className = document.body.className
      ? `${document.body.className} js-enabled ${htmlScriptPrototype}`
      : `js-enabled ${htmlScriptPrototype}`;

    if (GovUKFrontEnd) {
      const header = document.querySelector('[data-module="govuk-header"]');
      if (header) {
        const govuk = new GovUKFrontEnd.Header(header);
        if (govuk) {
          clientLogger.info(`using GOVUKFrontend, ${JSON.stringify(GovUKFrontEnd)}`);
        }
      }
    } else {
      clientLogger.info("GOVUKFrontend or GOVUKFrontend.Header is not defined");
    }
  }, []);

  // ensures app insights is initialized once
  if (getApplicationInsights() === undefined) {
    applicationinsights.initialize(data.applicationInsightInstrumentationKey, data.applicationInsightCloudRoleName);
  }

  return (
    <IdleTimerProvider
      timeout={data.idleTimeoutInMilliseconds}
      onIdle={() => {
        window.location.assign(data.idmLogoutPage);
      }}
    >
      <Template {...data}>
        <Outlet />
      </Template>
    </IdleTimerProvider>
  );
}
