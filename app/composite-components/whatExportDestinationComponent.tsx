import { useActionData, useLoaderData } from "react-router";
import classNames from "classnames";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import { ButtonGroup } from "./buttonGroup";
import { PointOfDestinationField } from "./pointOfDestinationField";
import { AutocompleteFormField, BackToProgressLink, ErrorSummary, Main, SecureForm, Title } from "~/components";
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
            <AutocompleteFormField
              containerClassName={classNames("govuk-form-group govuk-!-width-two-thirds ", {
                "govuk-form-group--error": errors?.exportDestination,
              })}
              options={["", ...countries.map((c: ICountry) => c.officialCountryName)]}
              optionsId="country-option"
              errorMessageText={t(errors?.exportDestination?.message, { ns: "errorsText" })}
              id="exportDestination"
              name="exportedTo"
              defaultValue={formData.exportedTo === "" ? "" : exportLocation?.exportedTo?.officialCountryName ?? ""}
              labelText={t("psDestinationCountry", { ns: "whatExportJourney" })}
              hintText={t("psDestinationCountryHint", { ns: "whatExportJourney" })}
              selectProps={{
                id: "exportDestination",
                selectClassName: classNames("govuk-select", {
                  "govuk-select--error": errors?.exportDestination,
                }),
              }}
              inputProps={{
                className: classNames("govuk-input", {
                  "govuk-input--error": errors?.exportDestination,
                }),
                "aria-describedby": "exportDestination-hint",
              }}
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
