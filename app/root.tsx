import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { applicationinsights, getApplicationInsights } from "~/applicationInsightsService";
import { serverApplicationinsights } from "./applicationInsightsService.server";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  useLocation,
  useMatches,
  useRevalidator,
  type LinksFunction,
  type LoaderFunction,
  type MetaFunction,
  type ShouldRevalidateFunction,
} from "react-router";

import { useChangeLanguage } from "remix-i18next/react";
import { IdleTimerProvider } from "react-idle-timer";
import { shouldRenderGA, isProdEnv } from "./helpers";
import { Header, Footer, Banner, Main, Title, CookieBanner } from "./components";
import { getRootData } from "./.server";
import i18next from "~/i18next.server";
import { i18nextCookie, analyticsAcceptedCookie, parseCookie, type IAnalyticsAcceptedCookie } from "./cookies.server";
import { getStyles } from "./styles/styles";
import type { IMainAppProps } from "./types";
import clientLogger from "./logger";
import { allNamespaces, supportedLanguages } from "./i18n";
import { useNonce } from "./nonce";

declare global {
  // Injected by Vite define config for cache-busting
  const __BUILD_ID__: string;

  interface Window {
    gtag: any;
    clarity: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export const handle = {
  i18n: [...allNamespaces],
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const rootData = (data ?? {}) as Partial<IMainAppProps> & { pageTitle?: string };
  const { pageTitle } = rootData;

  return [
    { charset: "utf-8" },
    { title: pageTitle ?? "Fish Export Service - GOV.UK" },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1, viewport-fit=cover",
    },
    {
      name: "theme-color",
      content: "#0b0c0c",
    },
    {
      name: "support-contact-number",
      content: rootData.supportContactNumber ?? "0330 159 1989",
    },
  ];
};

export const links: LinksFunction = () => getStyles();

export const shouldRevalidate: ShouldRevalidateFunction = ({ actionResult, defaultShouldRevalidate }) => {
  const errorStr = document.getElementsByTagName("html")[0].getAttribute("lang") === "cy" ? "Gwall: " : "Error: ";
  if (actionResult?.errors) {
    document.title = document.title.includes(errorStr) ? document.title : `${errorStr} ${document.title}`;
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
  const nonce = useNonce();

  useChangeLanguage(locale);

  useEffect(() => {
    const analyticsAllowed = shouldRenderGA(analyticsCookieAccepted);
    if (!analyticsAllowed) {
      return;
    }

    const injectedScripts: HTMLScriptElement[] = [];

    const appendScript = (id: string, src: string): HTMLScriptElement => {
      const script = document.createElement("script");
      script.id = id;
      script.async = true;
      script.src = src;
      script.nonce = nonce;
      document.head.appendChild(script);
      injectedScripts.push(script);
      return script;
    };

    if (clarityProjectId?.length) {
      if (typeof globalThis.window.clarity !== "function") {
        globalThis.window.clarity = (...args: unknown[]) => {
          const clarityFn = globalThis.window.clarity as ((...params: unknown[]) => void) & { q?: unknown[][] };
          clarityFn.q = clarityFn.q ?? [];
          clarityFn.q.push(args);
        };
      }

      appendScript("clarity-script", `https://www.clarity.ms/tag/${clarityProjectId}`);
      globalThis.window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
    }

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method: string, url: string | URL): any {
      if (typeof url === "string" && url.includes("google-analytics.com/j/collect")) {
        (this as any)._uaBlocked = true;
      }
      return originalOpen.apply(this, arguments as any);
    };

    XMLHttpRequest.prototype.send = function (): any {
      if ((this as any)._uaBlocked) {
        return;
      }
      return originalSend.apply(this, arguments as any);
    };

    if (gtmId?.length) {
      const disableKey = `ga-disable-${gaId}`;
      (globalThis as any)[disableKey] = true;

      globalThis.window.dataLayer = globalThis.window.dataLayer || [];
      globalThis.window.dataLayer.push({
        "gtm.start": Date.now(),
        event: "gtm.js",
      });

      appendScript("gtm-external", `https://www.googletagmanager.com/gtm.js?id=${gtmId}`);
    }

    if (gaId?.length) {
      appendScript("gtag-external", `https://www.googletagmanager.com/gtag/js?id=${gaId}`);

      globalThis.window.dataLayer = globalThis.window.dataLayer || [];
      globalThis.window.gtag = (...args: unknown[]) => {
        globalThis.window.dataLayer.push(args);
      };

      globalThis.window.gtag("js", new Date());
      globalThis.window.gtag("config", gaId, {
        cookie_flags: "SameSite=None;Secure",
        cookie_domain: globalThis.window.location.hostname,
        cookie_path: "/",
        cookie_expires: 63072000,
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_update: true,
        send_page_view: true,
        transport_type: "beacon",
      });
    }

    return () => {
      if (typeof globalThis.window.clarity === "function") {
        globalThis.window.clarity("consent", false);
      }

      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;

      injectedScripts.forEach((script) => {
        if (document.head.contains(script)) {
          script.remove();
        }
      });
    };
  }, [analyticsCookieAccepted, clarityProjectId, gaId, gtmId, nonce]);

  useEffect(() => {
    ref.current?.focus();
  }, [pathname]);

  const location = useLocation();

  return (
    <html className="govuk-template govuk-template--rebranded" lang={locale} dir={i18n.dir()}>
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
        <CookieBanner />
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
        <ScrollRestoration nonce={nonce} />
        {!disableScripts && <Scripts nonce={nonce} />}
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
    const substring = "The request is blocked.";
    const isWAFError = typeof error?.data === "string" && error.data.includes(substring);

    return isWAFError ? (
      <Template {...templateProps} disableScripts>
        <Main showHelpLink={false}>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <Title title={t("forbiddenH1Text", { ns: "forbidden" })} />
              <p data-testid="no-permission">{t("forbiddenPageP1Text", { ns: "forbidden" })}</p>
              <p data-testid="navigate-back">{t("forbiddenPageP2Text", { ns: "forbidden" })}</p>
            </div>
          </div>
        </Main>
      </Template>
    ) : (
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

  return (
    <Template {...templateProps} disableScripts>
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
    </Template>
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const data = await getRootData(request);
  serverApplicationinsights.initialize(data.applicationInsightInstrumentationKey, data.applicationInsightCloudRoleName);

  const t = await i18next.getFixedT(request, "title");
  const { documentNumber } = params;
  const analyticsCookie = (await parseCookie(analyticsAcceptedCookie, request)) as IAnalyticsAcceptedCookie;

  // Response objects with Set-Cookie headers work with v3_singleFetch
  // Single fetch will unwrap the response and preserve headers
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
  const { pathname } = useLocation();
  const exclusionPaths = new Set(["/", "/cookies"]);
  const exclusionPathPatterns = [
    /^\/create-catch-certificate\/[^/]+\/progress$/,
    /^\/create-processing-statement\/[^/]+\/progress$/,
    /^\/create-non-manipulation-document\/[^/]+\/progress$/,
    /^\/create-catch-certificate\/[^/]+\/landings-entry$/,
    /^\/create-processing-statement\/[^/]+\/add-catch-details$/,
    /^\/create-processing-statement\/[^/]+\/add-catch-details\/[^/]+$/,
    /^\/create-non-manipulation-document\/[^/]+\/add-product-to-this-consignment$/,
    /^\/create-non-manipulation-document\/[^/]+\/add-product-to-this-consignment\/[^/]+$/,
  ];

  const isExcludedPath = (path: string) =>
    exclusionPaths.has(path) || exclusionPathPatterns.some((pattern) => pattern.test(path));

  // invoke the loader function to revalidate page data, except on the root route
  // to avoid triple-loading caused by revalidation on hydration
  useEffect(() => {
    if (!isExcludedPath(pathname)) {
      revalidate();
    }
  }, [revalidate, pathname]);

  useEffect(() => {
    const htmlScriptPrototype = "noModule" in HTMLScriptElement.prototype ? "govuk-frontend-supported" : "";
    document.body.className = document.body.className
      ? `${document.body.className} js-enabled ${htmlScriptPrototype}`
      : `js-enabled ${htmlScriptPrototype}`;

    // Dynamic import to avoid SSR issues with govuk-frontend
    import("govuk-frontend")
      .then((GovUKFrontEnd) => {
        if (GovUKFrontEnd) {
          const header = document.querySelector('[data-module="govuk-header"]');
          if (header) {
            const govuk = new GovUKFrontEnd.Header(header);
            if (govuk) {
              clientLogger.info(`using GOVUKFrontend, ${JSON.stringify(GovUKFrontEnd)}`);
            }
          }
        }
      })
      .catch((error) => {
        clientLogger.info("GOVUKFrontend or GOVUKFrontend.Header is not defined", error);
      });
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
