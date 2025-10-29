import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { addYourReferenceLoader, addYourReferenceAction } from "~/.server";
import { AddYourReferenceCommon } from "~/composite-components";
import { useTranslation } from "react-i18next";

export const loader: LoaderFunction = async ({ request, params }) =>
  addYourReferenceLoader(request, params, "storageNotes");

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  addYourReferenceAction(
    request,
    params,
    "/create-storage-document/storage-documents",
    "/create-storage-document/:documentNumber/add-exporter-details"
  );

const AddYourReference = () => {
  const { t } = useTranslation(["common"]);

  return (
    <AddYourReferenceCommon
      backUrl="/create-storage-document/:documentNumber/progress"
      hintText={t("commonAddYourReferenceHint", { journeyText: t("storageNotes") })}
      progressLink="/create-storage-document/:documentNumber/progress"
    />
  );
};

export default AddYourReference;
