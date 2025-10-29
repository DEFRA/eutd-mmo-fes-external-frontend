import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { useEffect } from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, AutocompleteFormField, SecureForm } from "~/components";
import { displayErrorMessages, scrollToId } from "~/helpers";
import type { IExportLocation, ICountry, LandingEntryType } from "~/types";
import classNames from "classnames/bind";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";
import { ButtonGroup } from "~/composite-components";
import { useScrollOnPageLoad } from "~/hooks";
import { WhatExportJourneyAction, WhatExportJourneyLoader } from "~/models";

type WhatExportJourneyProps = {
  documentNumber: string;
  countries: ICountry[];
  exportLocation: IExportLocation;
  landingsEntryOption: LandingEntryType;
  nextUri: string;
  csrf: string;
};

export const loader: LoaderFunction = async ({ request, params }) => WhatExportJourneyLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  WhatExportJourneyAction(request, params);

const WhatExportJourney = () => {
  const { t } = useTranslation(["common", "whatExportJourney", "errorsText"]);

  const { countries, exportLocation, documentNumber, landingsEntryOption, nextUri, csrf } =
    useLoaderData<WhatExportJourneyProps>();
  const actionData = useActionData() ?? {};
  const { errors = {}, ...formData } = actionData;
  const departureCountries = [
    {
      value: "United Kingdom",
      id: "exportedFromUK",
    },
    {
      value: "Guernsey",
      id: "exportedFromGU",
    },
    {
      value: "Isle Of Man",
      id: "exportedFromIOM",
    },
    {
      value: "Jersey",
      id: "exportedFromJE",
    },
  ];

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main
      backUrl={route("/create-catch-certificate/:documentNumber/whose-waters-were-they-caught-in", {
        documentNumber,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("ccWhatExportJourneyExportJourneyHeader", { ns: "whatExportJourney" })} />
          <SecureForm method="post" csrf={csrf}>
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset" aria-describedby="departure-country-hint">
                <legend className="govuk-fieldset__legend">
                  {t("ccWhatExportJourneyDepartureCountry", { ns: "whatExportJourney" })}
                </legend>
                <div id="departure-country-hint" className="govuk-hint">
                  {t("ccWhatExportJourneyDepartureCountryHint", { ns: "whatExportJourney" })}
                </div>
                {departureCountries.map((country) => (
                  <div key={`departure-${country.id}`} className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id={country.id}
                      name="exportedFrom"
                      type="radio"
                      value={country.value}
                      defaultChecked={
                        formData.exportedFrom === country.value ||
                        "United Kingdom" === country.value ||
                        exportLocation.exportedFrom === country.value
                      }
                    />
                    <label id={`label-${country.id}`} className="govuk-label govuk-radios__label" htmlFor={country.id}>
                      {t(`ccWhatExportJourneyCountry${country.value.replace(/\s/g, "")}`, {
                        ns: "whatExportJourney",
                      })}
                    </label>
                  </div>
                ))}
              </fieldset>
            </div>
            <AutocompleteFormField
              containerClassName={classNames("govuk-form-group govuk-!-width-two-thirds ", {
                "govuk-form-group--error": errors?.exportDestination,
              })}
              options={["", ...countries.map((c) => c.officialCountryName)]}
              optionsId="country-option"
              errorMessageText={t(errors?.exportDestination?.message, { ns: "errorsText" })}
              id="exportDestination"
              name="exportedTo"
              defaultValue={formData.exportedTo === "" ? "" : exportLocation?.exportedTo?.officialCountryName ?? ""}
              labelText={t("commonWhatExportDestinationSelectTheDestinationCountry")}
              hintText={t("commonWhatExportDestinationHintSelectTheDestinationCountry")}
              selectProps={{
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
            <ButtonGroup />
            <input type="hidden" name="landingsEntryOption" defaultValue={landingsEntryOption} />
            <input type="hidden" name="nextUri" defaultValue={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-catch-certificate/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default WhatExportJourney;
