import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "react-router";
import { copyDocumentLoader, copyDocumentAction } from "~/.server";
import type { ErrorResponse } from "~/types";
import { CopyDocumentComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) => copyDocumentLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  copyDocumentAction(request, params);

const CopyConfirmCatchCertificate = () => <CopyDocumentComponent journey="catchCertificate" />;

export default CopyConfirmCatchCertificate;
