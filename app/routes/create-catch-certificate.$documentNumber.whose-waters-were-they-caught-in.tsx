import { FormCheckbox } from "@capgeminiuk/dcx-react-library";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { Main, BackToProgressLink, ErrorSummary, ErrorMessage, SecureForm } from "~/components";
import React, { useState, useEffect } from "react";
import { ButtonGroup, WhoseWaters } from "~/composite-components";
import { useTranslation } from "react-i18next";
import { ClientOnly } from "remix-utils/client-only";
import { displayErrorMessages, WatersWhereFishCaught, scrollToId } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import type { IWaterWhereFishCaught, ErrorResponse } from "~/types";
import { useScrollOnPageLoad } from "~/hooks";
import classNames from "classnames/bind";
import { WhoseWatersWereTheyCaughtInAction, WhoseWatersWereTheyCaughtInLoader } from "~/models";

type WhoseWatersWereTheyCaughtInProps = {
  documentNumber: string;
  otherWaters?: string;
  caughtInUKWaters?: string;
  caughtInEUWaters?: string;
  caughtInOtherWaters?: string;
  nextUri: string;
  backUri: string;
  csrf: string;
};

export const loader: LoaderFunction = async ({ request, params }) => WhoseWatersWereTheyCaughtInLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  WhoseWatersWereTheyCaughtInAction(request, params);

const WhoseWatersWereTheyCaughtIn = () => {
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const {
    documentNumber,
    otherWaters,
    caughtInUKWaters,
    caughtInEUWaters,
    caughtInOtherWaters,
    nextUri,
    backUri,
    csrf,
  } = useLoaderData<WhoseWatersWereTheyCaughtInProps>();
  const [checked, setChecked] = useState<boolean>(
    actionData?.caughtInOtherWaters === "Y" || caughtInOtherWaters === "Y"
  );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.currentTarget.checked);
  };
  const { t } = useTranslation(["whoseWatersWereTheyCaughtIn", "common", "errorsText"]);

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  useScrollOnPageLoad();

  return (
    <Main backUrl={backUri}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <div
              className={
                !isEmpty(errors?.watersCaughtIn) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"
              }
            >
              <fieldset
                className="govuk-fieldset"
                aria-describedby={
                  isEmpty(errors?.watersCaughtIn) ? "watersCaughtIn-hint" : "watersCaughtIn-hint watersCaughtIn-error"
                }
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                  <h1 className="govuk-fieldset__heading">{t("ccWhoseWatersWereTheyCaughtInHeaderText")}</h1>
                </legend>
                <div id="watersCaughtIn-hint" className="govuk-hint">
                  {t("ccWhoseWatersWereTheyCaughtInSelectText")}
                </div>
                {!isEmpty(errors?.watersCaughtIn) && (
                  <ErrorMessage
                    id="watersCaughtIn-error"
                    text={t(errors?.watersCaughtIn?.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <ClientOnly
                  fallback={
                    <WhoseWaters
                      error={errors?.otherWaters?.message}
                      caughtInUKWaters={!isEmpty(errors) ? actionData?.caughtInUKWaters : caughtInUKWaters}
                      caughtInEUWaters={!isEmpty(errors) ? actionData?.caughtInEUWaters : caughtInEUWaters}
                      caughtInOtherWaters={!isEmpty(errors) ? actionData?.caughtInOtherWaters : caughtInOtherWaters}
                      otherWaters={!isEmpty(errors) ? actionData?.otherWaters : otherWaters}
                    />
                  }
                >
                  {() => (
                    <>
                      {WatersWhereFishCaught.map((waterWereFishCaught: IWaterWhereFishCaught) => (
                        <FormCheckbox
                          key={waterWereFishCaught.label}
                          id={waterWereFishCaught.id}
                          value="Y"
                          label={t(waterWereFishCaught.label)}
                          labelClassName="govuk-label govuk-checkboxes__label"
                          inputClassName="govuk-checkboxes__input"
                          itemClassName="govuk-checkboxes__item"
                          name={waterWereFishCaught.name}
                          inputProps={{
                            defaultChecked:
                              (waterWereFishCaught.name === "caughtInUKWaters" &&
                                (actionData?.caughtInUKWaters === "Y" || caughtInUKWaters === "Y")) ||
                              (waterWereFishCaught.name === "caughtInEUWaters" &&
                                (actionData?.caughtInEUWaters === "Y" || caughtInEUWaters === "Y")),
                          }}
                        />
                      ))}
                      <div className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id="caughtInOtherWaters"
                          name="caughtInOtherWaters"
                          type="checkbox"
                          value="Y"
                          onChange={handleChange}
                          checked={checked}
                        />
                        <label className="govuk-label govuk-checkboxes__label" htmlFor="caughtInOtherWaters">
                          {t("ccWhoseWatersWereTheyCaughtInCheckBox3Text")}
                        </label>
                      </div>
                      {checked && (
                        <div className="govuk-checkboxes__conditional">
                          <div
                            className={
                              !isEmpty(errors?.otherWaters)
                                ? "govuk-form-group govuk-form-group--error"
                                : "govuk-form-group"
                            }
                          >
                            <label className="govuk-label" htmlFor="otherWaters">
                              {t("ccWhoseWatersWereTheyCaughtInInputText")}
                            </label>
                            {!isEmpty(errors?.otherWaters) && (
                              <ErrorMessage
                                text={t(errors?.otherWaters?.message, { ns: "errorsText" })}
                                visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                              />
                            )}
                            <input
                              className={classNames("govuk-input govuk-!-width-one-third", {
                                "govuk-input--error": errors?.otherWaters,
                              })}
                              id="otherWaters"
                              name="otherWaters"
                              type="text"
                              defaultValue={actionData?.otherWaters ?? otherWaters}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </ClientOnly>
              </fieldset>
            </div>
            <br />
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
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

export default WhoseWatersWereTheyCaughtIn;
