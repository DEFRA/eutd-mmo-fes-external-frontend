import * as React from "react";
import { useActionData, type ActionFunction, type LoaderFunction } from "react-router";

import { route } from "routes-gen";
import { VoidthisDocumentComponent } from "~/composite-components";
import type { ErrorResponse } from "~/types";
import { voidThisDocumentLoader, voidThisDocumentAction } from "~/.server";

export const loader: LoaderFunction = async ({ request, params }) => voidThisDocumentLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const nextUri = route("/create-non-manipulation-document/non-manipulation-documents");
  return await voidThisDocumentAction(request, params, nextUri);
};

const VoidStorageDocument = () => {
  const actionData = useActionData() ?? {};

  return (
    <VoidthisDocumentComponent
      journey="storageNotes"
      actionData={actionData}
      backUrl={route("/create-non-manipulation-document/non-manipulation-documents")}
    />
  );
};

export default VoidStorageDocument;
