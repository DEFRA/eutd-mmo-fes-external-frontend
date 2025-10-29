import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { addYourReferenceLoader, addYourReferenceAction } from "~/.server";
import { AddYourReferenceCommon } from "~/composite-components";
import { useTranslation } from "react-i18next";

export const loader: LoaderFunction = async ({ request, params }) =>
  addYourReferenceLoader(request, params, "processingStatement");

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  addYourReferenceAction(
    request,
    params,
    "/create-processing-statement/processing-statements",
    "/create-processing-statement/:documentNumber/add-exporter-details"
  );

const AddYourReference = () => {
  const { t } = useTranslation(["common"]);

  return (
    <AddYourReferenceCommon
      backUrl="/create-processing-statement/:documentNumber/progress"
      hintText={t("commonAddYourReferenceHint", { journeyText: t("processingStatement") })}
      progressLink="/create-processing-statement/:documentNumber/progress"
    />
  );
};

export default AddYourReference;
