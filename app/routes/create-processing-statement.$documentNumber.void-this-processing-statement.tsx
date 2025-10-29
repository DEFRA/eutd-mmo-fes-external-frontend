import * as React from "react";
import { useActionData } from "@remix-run/react";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { route } from "routes-gen";
import { VoidthisDocumentComponent } from "~/composite-components";
import type { ErrorResponse } from "~/types";
import { voidThisDocumentAction, voidThisDocumentLoader } from "~/.server";

export const loader: LoaderFunction = async ({ request, params }) => voidThisDocumentLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const nextUri = route("/create-processing-statement/processing-statements");
  return await voidThisDocumentAction(request, params, nextUri);
};

const VoidProcessingStatement = () => {
  const actionData = useActionData() ?? {};

  return (
    <VoidthisDocumentComponent
      journey="processingStatement"
      actionData={actionData}
      backUrl={route("/create-processing-statement/processing-statements")}
    />
  );
};

export default VoidProcessingStatement;
