import { useActionData, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import { PointOfDestinationField } from "./pointOfDestinationField";
import { ExportDestinationField } from "./exportDestinationField";
import { ExportJourneyPageLayout } from "./exportJourneyPageLayout";
import type { ICountry, IExportLocation } from "~/types";

type WhatExportDestinationProps = {
  documentNumber: string;
  countries: ICountry[];
  exportLocation: IExportLocation;
  csrf: string;
  nextUri: string;
};

export const WhatExportDestinationComponent = () => {
  const { countries, documentNumber, exportLocation, nextUri, csrf } = useLoaderData<WhatExportDestinationProps>();
  const { t } = useTranslation(["common", "whatExportJourney"]);
  const actionData = useActionData() ?? {};
  const { errors = {}, ...formData } = actionData;

  return (
    <ExportJourneyPageLayout
      title={t("psWhatExportDestination", { ns: "whatExportJourney" })}
      backUrl={route("/create-processing-statement/:documentNumber/add-health-certificate", {
        documentNumber,
      })}
      progressUri="/create-processing-statement/:documentNumber/progress"
      documentNumber={documentNumber}
      csrf={csrf}
      errors={errors}
      nextUri={nextUri}
    >
      <ExportDestinationField
        countries={countries}
        errors={errors}
        formData={formData}
        exportLocation={exportLocation}
        labelKey="psDestinationCountry"
        hintKey="psDestinationCountryHint"
        namespace="whatExportJourney"
      />
      <PointOfDestinationField
        errors={errors}
        formData={formData}
        exportLocation={exportLocation}
        labelKey="psPointOfDestination"
        hintKey="psPointOfDestinationHint"
        namespace="whatExportJourney"
      />
    </ExportJourneyPageLayout>
  );
};
