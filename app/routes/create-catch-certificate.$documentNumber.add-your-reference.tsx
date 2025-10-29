import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { AddYourReferenceCommon } from "~/composite-components";
import { addYourReferenceLoader, addYourReferenceAction } from "~/.server";
import { useTranslation } from "react-i18next";

export const loader: LoaderFunction = async ({ request, params }) =>
  addYourReferenceLoader(request, params, "catchCertificate");

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  addYourReferenceAction(
    request,
    params,
    "/create-catch-certificate/catch-certificates",
    "/create-catch-certificate/:documentNumber/add-exporter-details"
  );

const AddYourReference = () => {
  const { t } = useTranslation(["common"]);

  return (
    <AddYourReferenceCommon
      backUrl="/create-catch-certificate/:documentNumber/progress"
      hintText={t("commonAddYourReferenceHint", { journeyText: t("catchCertificate") })}
      progressLink="/create-catch-certificate/:documentNumber/progress"
    />
  );
};

export default AddYourReference;
