import * as React from "react";
import { useActionData } from "@remix-run/react";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { route } from "routes-gen";
import { VoidthisDocumentComponent } from "~/composite-components";
import type { ErrorResponse } from "~/types";
import { voidThisDocumentLoader, voidThisDocumentAction } from "~/.server";

export const loader: LoaderFunction = async ({ request, params }) => voidThisDocumentLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const nextUri = route("/create-storage-document/storage-documents");
  return await voidThisDocumentAction(request, params, nextUri);
};

const VoidStorageDocument = () => {
  const actionData = useActionData() ?? {};

  return (
    <VoidthisDocumentComponent
      journey="storageNotes"
      actionData={actionData}
      backUrl={route("/create-storage-document/storage-documents")}
    />
  );
};

export default VoidStorageDocument;
