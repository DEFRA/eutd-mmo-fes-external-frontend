/**
 * Custom production server — replaces `react-router-serve` to add
 * `trust proxy` support.
 *
 * Problem: When the app runs behind an Azure reverse proxy (Application Gateway
 * / Kubernetes ingress), the proxy changes the `Host` header to the internal
 * pod service name before forwarding the request to Node.js. React Router
 * 7.12+ has a CSRF check that compares `new URL(request.url).host` against the
 * browser-supplied `Origin` header. Without `trust proxy`, Express uses the
 * internal host when constructing `request.url`, so for every form submission:
 *
 *   request.url.host → "internal-pod-hostname"   (from Host: header)
 *   Origin           → "https://public.defra.gov.uk"
 *   → mismatch → 400 Bad Request
 *
 * Fix: `app.set("trust proxy", 1)` makes Express read `X-Forwarded-Host` and
 * `X-Forwarded-Proto` (set by the proxy) so `req.hostname` and `req.protocol`
 * reflect the public-facing URL, and the CSRF check passes.
 *
 * Everything else mirrors the behaviour of `@react-router/serve`.
 */

import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import os from "node:os";
import path from "node:path";
import url from "node:url";

const PORT = Number(process.env.PORT) || 3000;
const BUILD_PATH = path.resolve("./build/server/index.js");

// Load the production build (compiled by `npm run build` / `react-router build`)
const buildModule = await import(url.pathToFileURL(BUILD_PATH).href);

const app = express();

// ─── Trust the first reverse proxy ────────────────────────────────────────────
// Tells Express to use X-Forwarded-Proto and X-Forwarded-Host headers sent by
// the Azure Application Gateway / Kubernetes ingress controller.
// @react-router/express reads req.hostname and req.protocol to construct the
// Web API Request.url — with trust proxy enabled these reflect the public URL.
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(compression());

const { assetsBuildDirectory, publicPath = "/" } = buildModule;

// Serve immutable hashed JS/CSS bundles with a 1-year max-age
app.use(
  path.posix.join(publicPath, "assets"),
  express.static(path.join(assetsBuildDirectory, "assets"), {
    immutable: true,
    maxAge: "1y",
  })
);
// Serve the rest of the client build directory
app.use(publicPath, express.static(assetsBuildDirectory));
// Serve files from /public (favicons, robots.txt, etc.)
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  createRequestHandler({
    build: buildModule,
    mode: process.env.NODE_ENV,
  })
);

const server = process.env.HOST
  ? app.listen(PORT, process.env.HOST, onListen)
  : app.listen(PORT, onListen);

function onListen() {
  const address =
    Object.values(os.networkInterfaces())
      .flat()
      .find((ip) => String(ip?.family).includes("4") && !ip?.internal)
      ?.address ?? "localhost";
  console.log(`[server] http://localhost:${PORT} (http://${address}:${PORT})`);
}

["SIGTERM", "SIGINT"].forEach((signal) => {
  process.once(signal, () => server?.close(console.error));
});
