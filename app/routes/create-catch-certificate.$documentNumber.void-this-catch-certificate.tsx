import * as React from "react";
import { useActionData } from "@remix-run/react";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { route } from "routes-gen";
import { VoidthisDocumentComponent } from "~/composite-components";
import { voidThisDocumentLoader, voidThisDocumentAction } from "~/.server";
import type { ErrorResponse } from "~/types";
import { useScrollOnPageLoad } from "~/hooks";

export const loader: LoaderFunction = async ({ request, params }) => voidThisDocumentLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const nextUri = route("/create-catch-certificate/catch-certificates");
  return await voidThisDocumentAction(request, params, nextUri);
};

const VoidCatchCertificate = () => {
  const actionData = useActionData() ?? {};

  useScrollOnPageLoad();

  return (
    <VoidthisDocumentComponent
      journey="catchCertificate"
      actionData={actionData}
      backUrl={route("/create-catch-certificate/catch-certificates")}
    />
  );
};
export default VoidCatchCertificate;
