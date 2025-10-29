import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { copyDocumentLoader, copyDocumentAction } from "~/.server";
import type { ErrorResponse } from "~/types";
import { CopyDocumentComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) => copyDocumentLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  copyDocumentAction(request, params);

const CopyConfirmStorageDocument = () => <CopyDocumentComponent journey="storageNotes" />;

export default CopyConfirmStorageDocument;
