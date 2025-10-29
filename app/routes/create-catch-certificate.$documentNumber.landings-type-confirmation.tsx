import * as React from "react";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { route } from "routes-gen";
import { useActionData, useLoaderData } from "@remix-run/react";
import { confirmLandingsEntryOptions, displayErrorMessages } from "~/helpers";
import { Main, ErrorSummary, ErrorMessage, SecureForm } from "~/components";
import isEmpty from "lodash/isEmpty";
import type { ConfirmLandingsEntryOptionType, ErrorResponse } from "~/types";
import { useTranslation } from "react-i18next";
import { useScrollOnPageError, useScrollOnPageLoad } from "~/hooks";
import { LandingsTypeConfirmationAction, LandingsTypeConfirmationLoader } from "~/models";

export const loader: LoaderFunction = async ({ request, params }) => LandingsTypeConfirmationLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  LandingsTypeConfirmationAction(request, params);

const LandingsTypeConfirmation = () => {
  const { errors = {} } = useActionData() ?? {};
  const { documentNumber, newLanding, csrf } = useLoaderData();
  const { t } = useTranslation(["landingsTypeConfirmation", "errorsText", "common"]);

  useScrollOnPageLoad();
  useScrollOnPageError(errors);

  return (
    <Main
      backUrl={route("/create-catch-certificate/:documentNumber/landings-entry", {
        documentNumber,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <div className={!isEmpty(errors) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
              <fieldset
                className="govuk-fieldset"
                aria-describedby={isEmpty(errors) ? undefined : "confirmLandingsTypes-error"}
              >
                <legend className="govuk-fieldset_legend govuk-fieldset__legend--xl">
                  <h1 className="govuk-fieldset__heading"> {t("ccLandingsTypeConfirmationHeaderText")} </h1>
                </legend>
                <div className="govuk-warning-text">
                  <span className="govuk-warning-text__icon" aria-hidden="true">
                    !
                  </span>
                  <strong className="govuk-warning-text__text">
                    <span className="govuk-visually-hidden">Warning</span>
                    {t("ccLandingsTypeConfirmationWarningText")}
                  </strong>
                </div>
                {!isEmpty(errors) && (
                  <ErrorMessage
                    id="confirmLandingsTypes-error"
                    text={t(errors?.confirmLandingsTypes?.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                {confirmLandingsEntryOptions.map((confirmOption: ConfirmLandingsEntryOptionType) => (
                  <div key={`confirmlanding-${confirmOption.id}`} className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id={confirmOption.id}
                      name={confirmOption.name}
                      type="radio"
                      value={confirmOption.value}
                    />
                    <label
                      id={`label-${confirmOption.id}`}
                      className="govuk-label govuk-radios__label"
                      htmlFor={confirmOption.id}
                    >
                      {t(confirmOption.label)}
                    </label>
                  </div>
                ))}
              </fieldset>
            </div>
            <br />
            <div className="govuk-button-group">
              <Button
                id="saveAsDraft"
                type={BUTTON_TYPE.SUBMIT}
                name="_action"
                label={t("commonSecondaryCancelButton", { ns: "common" })}
                // @ts-ignore
                value="cancel"
                className="govuk-button govuk-button--secondary"
                data-testid="cancel"
              />
              <Button
                id="continue"
                type={BUTTON_TYPE.SUBMIT}
                name="_action"
                label={t("commonContinueButtonContinueButtonText", { ns: "common" })}
                // @ts-ignore
                value="continue"
                className="govuk-button"
                data-testid="continue"
              />
            </div>
            <input type="hidden" defaultValue={newLanding} name="newLanding" />
          </SecureForm>
        </div>
      </div>
    </Main>
  );
};

export default LandingsTypeConfirmation;
