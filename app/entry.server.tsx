import * as React from "react";
import { ServerRouter } from "react-router";
import type { EntryContext } from "@react-router/node";
import { createInstance } from "i18next";
import Backend from "i18next-fs-backend";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { PassThrough } from "node:stream";
import { isProdEnv } from "./helpers";
import i18next from "./i18next.server";
import { initLanguages } from "./i18n";
import { getEnv } from "./env.server";
import { NonceProvider } from "./nonce";

// Initialize MSW server for test environment
// The server module itself checks NODE_ENV and only initializes in test mode
// Note: The MSW server.ts file patches global.fetch with cross-fetch before MSW loads
/* istanbul ignore next */
import "tests/msw/server";

const ABORT_DELAY = 5000;

const SCRIPT_HASH_ALLOWLIST = [
  "'sha256-pD1IvxrgXgKrAhNJmdMwtplCR1BZCy9ekf7LyKljrWI='",
  "'sha256-L7viC3kUpXu9uCOi97VqCR2bLlMwSQlmLmSuuQ93ngU='",
  "'sha256-p7GE78bbMHDrE4IWzpiMSttAsTpUu7wwi5/wvnH54Os='",
].join(" ");

const STYLE_HASH_ALLOWLIST = [
  "'sha256-KpSV7LuPYEu58+3u9LJr9v5Drm0uIKEv0h3u/+NVNm8='",
  "'sha256-Nu2RxE/9Zt9hH6ikBf5LpcS5TLaEV4FbdBNuKALa0ZA='",
  "'sha256-aqNNdDLnnrDOnTNdkJpYlAxKVJtLt9CtFLklmInuUAE='",
].join(" ");

const buildCspHeader = (nonce: string, isProduction: boolean): string => {
  if (isProduction) {
    return [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' ${SCRIPT_HASH_ALLOWLIST} www.googletagmanager.com www.google-analytics.com *.clarity.ms`,
      `style-src 'self' 'unsafe-hashes' ${STYLE_HASH_ALLOWLIST}`,
      "connect-src 'self' dc.services.visualstudio.com js.monitor.azure.com region1.google-analytics.com www.google-analytics.com *.clarity.ms",
      "img-src 'self' www.googletagmanager.com www.google-analytics.com *.clarity.ms *.bing.com",
      "frame-src 'self' www.googletagmanager.com",
    ].join("; ");
  }

  // In development the Vite dev server injects inline scripts (the React Refresh
  // preamble and HMR client) that do not carry our CSP nonce. A nonce and
  // 'unsafe-inline' are mutually exclusive (the nonce makes browsers ignore
  // 'unsafe-inline'), so dev relaxes to 'unsafe-inline'/'unsafe-eval' instead of
  // using a nonce. Production keeps the strict nonce-based policy above.
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    `style-src 'self' 'unsafe-hashes' ${STYLE_HASH_ALLOWLIST}`,
    "connect-src 'self' ws://localhost:*",
  ].join("; ");
};

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const cspNonce = randomBytes(16).toString("base64");
  const instance = createInstance();
  const lng = await i18next.getLocale(request);
  const ns = i18next.getRouteNamespaces(remixContext);
  const ENV = getEnv();

  await instance
    .use(initReactI18next)
    .use(Backend)
    .init({
      ...initLanguages(),
      lng,
      ns,
      interpolation: {
        defaultVariables: {
          contactNumber: ENV.SUPPORT_CONTACT_NUMBER ?? "0330 159 1989",
        },
      },
      backend: {
        loadPath: path.resolve("./public/locales-v2/{{lng}}/{{ns}}.json"),
      },
    });

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <NonceProvider value={cspNonce}>
          <ServerRouter context={remixContext} url={request.url} nonce={cspNonce} />
        </NonceProvider>
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
            responseHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

            responseHeaders.set(
              "permissions-policy",
              "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), layout-animations=(), legacy-image-formats=*, magnetometer=(), microphone=(), midi=(), oversized-images=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=*, usb=(), vr=(), screen-wake-lock=(), web-share=(), xr-spatial-tracking=()"
            );

            responseHeaders.set("Content-Security-Policy", buildCspHeader(cspNonce, true));
          } else {
            responseHeaders.set("Content-Security-Policy", buildCspHeader(cspNonce, false));
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
