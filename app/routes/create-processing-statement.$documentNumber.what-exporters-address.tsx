import * as React from "react";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { exportersAddressLoader, exportersAddressAction } from "~/.server";
import { WhatExportersAddress } from "~/composite-components";
import { useTranslation } from "react-i18next";

export const loader: LoaderFunction = async ({ request, params }) =>
  await exportersAddressLoader(request, params, "processingStatement");

export const action: ActionFunction = async ({ request, params }) =>
  await exportersAddressAction(request, params, "processingStatement");

const LookupAddressPage = () => {
  const { t } = useTranslation("common");
  return (
    <WhatExportersAddress journey="processingStatement" title={t("commonWhatExportersAddressWhatIsExportersAddress")} />
  );
};

export default LookupAddressPage;
