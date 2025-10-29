import * as React from "react";
import { RemixServer } from "@remix-run/react";
import type { EntryContext } from "@remix-run/node";
import { createInstance } from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";
import { renderToString } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { isProdEnv } from "./helpers";
import i18next from "./i18next.server";
import { initLanguages } from "./i18n";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const instance = createInstance();
  const lng = await i18next.getLocale(request);
  const ns = i18next.getRouteNamespaces(remixContext);

  await instance
    .use(initReactI18next)
    .use(Backend)
    .init({
      ...initLanguages(),
      lng,
      ns,
      backend: {
        loadPath: path.resolve("./public/locales-v2/{{lng}}/{{ns}}.json"),
      },
    });

  const markup = renderToString(
    <I18nextProvider i18n={instance}>
      <RemixServer context={remixContext} url={request.url} />
    </I18nextProvider>
  );

  responseHeaders.set("Content-Type", "text/html");
  responseHeaders.set("Referrer-Policy", "strict-origin");
  responseHeaders.set("X-Content-Type-Options", "nosniff");

  if (isProdEnv()) {
    responseHeaders.set(
      "permissions-policy",
      "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), layout-animations=(), legacy-image-formats=*, magnetometer=(), microphone=(), midi=(), oversized-images=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=*, usb=(), vr=(), screen-wake-lock=(), web-share=(), xr-spatial-tracking=()"
    );

    responseHeaders.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' www.googletagmanager.com www.google-analytics.com *.clarity.ms; style-src 'self' 'unsafe-inline'; connect-src 'self' dc.services.visualstudio.com js.monitor.azure.com region1.google-analytics.com www.google-analytics.com *.clarity.ms; img-src 'self' www.googletagmanager.com www.google-analytics.com *.clarity.ms *.bing.com;"
    );
  } else {
    responseHeaders.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:*;"
    );
  }

  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
