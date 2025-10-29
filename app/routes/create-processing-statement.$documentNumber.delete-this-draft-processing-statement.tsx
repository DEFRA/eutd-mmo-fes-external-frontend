import * as React from "react";
import { route } from "routes-gen";
import { type ActionFunction, type LoaderFunction, type TypedResponse } from "@remix-run/node";
import type { ErrorResponse } from "~/types";
import { DeleteDraftForm } from "~/composite-components";
import { deleteDraftFormAction, deleteDraftFormLoader } from "~/.server";

export const loader: LoaderFunction = async ({ request, params }) => await deleteDraftFormLoader({ request, params });

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<Response | TypedResponse<never> | ErrorResponse> =>
  await deleteDraftFormAction({
    request,
    params,
    journey: "processingStatement",
    nextUri: route("/create-processing-statement/processing-statements"),
  });

const DocumentConfirmDeleteDraftPage = () => (
  <DeleteDraftForm
    journey="processingStatement"
    backUrl={route("/create-processing-statement/processing-statements")}
  />
);

export default DocumentConfirmDeleteDraftPage;
