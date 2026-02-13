import { useActionData, useLoaderData } from "react-router";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import { ButtonGroup } from "./buttonGroup";
import { PointOfDestinationField } from "./pointOfDestinationField";
import { ExportDestinationField } from "./exportDestinationField";
import { BackToProgressLink, ErrorSummary, Main, SecureForm, Title } from "~/components";
import { displayErrorMessages, scrollToId } from "~/helpers";
import { useScrollOnPageLoad } from "~/hooks";
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

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main
      backUrl={route("/create-processing-statement/:documentNumber/add-health-certificate", {
        documentNumber,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("psWhatExportDestination", { ns: "whatExportJourney" })} />
          <SecureForm method="post" csrf={csrf}>
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
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-processing-statement/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};
