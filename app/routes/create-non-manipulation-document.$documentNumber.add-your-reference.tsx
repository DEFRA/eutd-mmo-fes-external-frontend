import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "react-router";
import { addYourReferenceLoader, addYourReferenceAction } from "~/.server";
import { AddYourReferenceCommon } from "~/composite-components";
import { useTranslation } from "react-i18next";

export const loader: LoaderFunction = async ({ request, params }) =>
  addYourReferenceLoader(request, params, "storageNotes");

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  addYourReferenceAction(
    request,
    params,
    "/create-non-manipulation-document/non-manipulation-documents",
    "/create-non-manipulation-document/:documentNumber/add-exporter-details",
    "/create-non-manipulation-document/:documentNumber/check-your-information"
  );

const AddYourReference = () => {
  const { t } = useTranslation(["common"]);

  return (
    <AddYourReferenceCommon
      backUrl="/create-non-manipulation-document/:documentNumber/progress"
      hintText={t("storageAddYourReferenceHint")}
      progressLink="/create-non-manipulation-document/:documentNumber/progress"
      showInfoNotice={true}
    />
  );
};

export default AddYourReference;
