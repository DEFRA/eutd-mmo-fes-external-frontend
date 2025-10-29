import * as React from "react";
import { copyVoidConfirmationLoader, copyVoidConfirmationAction } from "~/.server";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import type { ErrorResponse } from "~/types";
import { CopyVoidDocumentComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) =>
  copyVoidConfirmationLoader(request, params, "create catch certificate");

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  copyVoidConfirmationAction(request, params);

const CopyVoidConfirmation = () => <CopyVoidDocumentComponent journey="catchCertificate" />;

export default CopyVoidConfirmation;
