import * as React from "react";
import { ServerRouter } from "react-router";
import type { EntryContext } from "@react-router/node";
import { createInstance } from "i18next";
import Backend from "i18next-fs-backend";
import path from "node:path";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { PassThrough } from "node:stream";
import { isProdEnv } from "./helpers";
import i18next from "./i18next.server";
import { initLanguages } from "./i18n";

// Initialize MSW server for test environment
// The server module itself checks NODE_ENV and only initializes in test mode
// Note: The MSW server.ts file patches global.fetch with cross-fetch before MSW loads
/* istanbul ignore next */
import "tests/msw/server";

const ABORT_DELAY = 5000;

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

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <ServerRouter context={remixContext} url={request.url} />
      </I18nextProvider>,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = body as unknown as ReadableStream;

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

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
