import * as React from "react";
import { route } from "routes-gen";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { DeleteDraftForm } from "~/composite-components";
import { deleteDraftFormAction, deleteDraftFormLoader } from "~/.server";

export const loader: LoaderFunction = async ({ request, params }) => deleteDraftFormLoader({ request, params });

export const action: ActionFunction = async ({ request, params }) =>
  await deleteDraftFormAction({
    request,
    params,
    journey: "storageNotes",
    nextUri: route("/create-storage-document/storage-documents"),
  });

const DocumentConfirmDeleteDraftPage = () => (
  <DeleteDraftForm backUrl={route("/create-storage-document/storage-documents")} journey="storageNotes" />
);

export default DocumentConfirmDeleteDraftPage;
