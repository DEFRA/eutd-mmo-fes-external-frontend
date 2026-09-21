import * as React from "react";
import { type ActionFunction, type LoaderFunction, type TypedResponse } from "react-router";
import { route } from "routes-gen";
import { deleteDraftFormAction, deleteDraftFormLoader } from "~/.server";
import type { ErrorResponse } from "~/types";
import { DeleteDraftForm } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) => await deleteDraftFormLoader({ request, params });

export const headers = () => ({
  "Cache-Control": "no-store",
});

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<Response | TypedResponse<never> | ErrorResponse> =>
  await deleteDraftFormAction({
    request,
    params,
    journey: "catchCertificate",
    nextUri: route("/create-catch-certificate/catch-certificates"),
  });

const DocumentConfirmDeleteDraftPage = () => (
  <DeleteDraftForm backUrl={route("/create-catch-certificate/catch-certificates")} journey="catchCertificate" />
);

export default DocumentConfirmDeleteDraftPage;
