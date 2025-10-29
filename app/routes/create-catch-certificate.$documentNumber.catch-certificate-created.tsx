import * as React from "react";
import type { LoaderFunction } from "@remix-run/node";
import { DocumentCreatedComponent } from "~/composite-components";
import { documentCreatedLoader } from "~/.server";

export const loader: LoaderFunction = async ({ request, params }) =>
  documentCreatedLoader(request, params, "catchCertificate");

const CatchCertificateCreated = () => <DocumentCreatedComponent journey="catchCertificate" />;

export default CatchCertificateCreated;
