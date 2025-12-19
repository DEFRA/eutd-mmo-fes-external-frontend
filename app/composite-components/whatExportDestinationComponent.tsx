import { useActionData, useLoaderData } from "@remix-run/react";
import classNames from "classnames";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import { ButtonGroup } from "./buttonGroup";
import { AutocompleteFormField, BackToProgressLink, ErrorSummary, Main, SecureForm, Title } from "~/components";
import { displayErrorMessages, scrollToId } from "~/helpers";
import { useScrollOnPageLoad } from "~/hooks";
import type { ICountry, IExportLocation, Journey } from "~/types";

type WhatExportDestinationProps = {
  documentNumber: string;
  countries: ICountry[];
  exportLocation: IExportLocation;
  csrf: string;
  nextUri: string;
};

export const WhatExportDestinationComponent = ({ journey }: { journey: Journey }) => {
  const { countries, documentNumber, exportLocation, nextUri, csrf } = useLoaderData<WhatExportDestinationProps>();
  const { t } = useTranslation(["common"]);
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
      backUrl={route(
        journey === "processingStatement"
          ? "/create-processing-statement/:documentNumber/add-health-certificate"
          : "/create-storage-document/:documentNumber/add-storage-facility-details",
        {
          documentNumber,
        }
      )}
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
              labelText={t("commonWhatExportDestinationSelectTheDestinationCountry")}
              hintText={t("commonWhatExportDestinationHintSelectTheDestinationCountry")}
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
            <div
              className={classNames("govuk-form-group govuk-!-width-two-thirds", {
                "govuk-form-group--error": errors?.pointOfDestination,
              })}
            >
              <label htmlFor="pointOfDestination" className="govuk-label">
                {t("psPointOfDestination", { ns: "whatExportJourney" })}
              </label>
              <div className="govuk-hint" id="pointOfDestination-hint">
                {t("psPointOfDestinationHint", { ns: "whatExportJourney" })}
              </div>
              {errors?.pointOfDestination && (
                <p className="govuk-error-message" id="pointOfDestination-error">
                  <span className="govuk-visually-hidden">Error:</span>{" "}
                  {t(errors?.pointOfDestination?.message, { ns: "errorsText" })}
                </p>
              )}
              <input
                id="pointOfDestination"
                name="pointOfDestination"
                defaultValue={formData.pointOfDestination ?? exportLocation?.pointOfDestination ?? ""}
                aria-describedby={classNames("pointOfDestination-hint", {
                  "pointOfDestination-error": errors?.pointOfDestination,
                })}
                type="text"
                className={classNames("govuk-input", {
                  "govuk-input--error": errors?.pointOfDestination,
                })}
              />
            </div>
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri={
              journey === "processingStatement"
                ? "/create-processing-statement/:documentNumber/progress"
                : "/create-storage-document/:documentNumber/progress"
            }
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};
