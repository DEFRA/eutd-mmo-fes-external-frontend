import * as React from "react";
import type { ErrorResponse } from "~/types";
import { CopyVoidDocumentComponent } from "~/composite-components";
import { copyVoidConfirmationLoader, copyVoidConfirmationAction } from "~/.server";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request, params }) =>
  copyVoidConfirmationLoader(request, params, "processing statement");

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  copyVoidConfirmationAction(request, params);

const CopyVoidConfirmation = () => <CopyVoidDocumentComponent journey="processingStatement" />;

export default CopyVoidConfirmation;
