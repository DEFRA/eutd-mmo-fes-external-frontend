import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";
import { FormCheckbox, Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useActionData, useLoaderData } from "@remix-run/react";
import { displayErrorTransformedMessages } from "~/helpers";
import type { CopyCertificateDocument, CopyCertificateOption, IErrorsTransformed, Journey } from "~/types";
import { Main, ErrorSummary, ErrorMessage, SecureForm } from "~/components";
import { useScrollOnPageError, useScrollOnPageLoad } from "~/hooks";

type CopyDocumentLoader = {
  csrf: string;
  backUrl: string;
  copyDocumentLabel: string;
  copyOptions: CopyCertificateOption[];
};

type CopyDocumentType = {
  journey: Journey;
};

export const CopyDocumentComponent = ({ journey }: CopyDocumentType) => {
  const { t } = useTranslation("copycertificate");
  const { documentNumber, csrf, backUrl, copyDocumentLabel, copyOptions } = useLoaderData<
    CopyCertificateDocument & CopyDocumentLoader
  >();
  const { errors } = useActionData<CopyCertificateDocument>() ?? {};
  const title = `${t("commonDashboardCopy", { ns: "common" })} ${documentNumber}`;
  const errorsTransformed = errors as IErrorsTransformed;

  useScrollOnPageLoad();
  useScrollOnPageError(errors);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errorsTransformed)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <div
              className={`govuk-form-group ${
                !isEmpty(errorsTransformed?.voidOriginal) ? "govuk-form-group--error" : ""
              }`}
            >
              <fieldset
                className="govuk-fieldset"
                aria-describedby={isEmpty(errorsTransformed?.voidOriginal) ? undefined : "copyDocument-error"}
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend govuk-!-margin-bottom-0">
                  <h1 className="govuk-heading-xl">{title}</h1>
                </legend>
                {!isEmpty(errorsTransformed?.voidOriginal) && (
                  <ErrorMessage
                    id="copyDocument-error"
                    text={t(errorsTransformed?.voidOriginal.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
                  {copyOptions.map((option: CopyCertificateOption) => (
                    <div key={`copyoption-${option.id}`} className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id={option.id}
                        name={option.name}
                        type="radio"
                        aria-describedby={`hint-${option.id}`}
                        value={option.value}
                      />
                      <label id={`label-${option.id}`} className="govuk-label govuk-radios__label" htmlFor={option.id}>
                        {t(option.label)}
                      </label>
                      <div id={`hint-${option.id}`} className="govuk-hint govuk-radios__hint">
                        {t(option.hint)}
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <h2 data-testid="ackid" className="govuk-heading-l govuk-!-margin-bottom-3">
              {t("commonCopyThisAcknowledgement")}
            </h2>
            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon warningicon" aria-hidden="true">
                !
              </span>
              <strong className="govuk-warning-text__text">
                {t(`${journey === "storageNotes" ? "storageDocument" : journey}CopyThisDocumentWarningMessage`, {
                  journeyText: t(journey, { ns: "common" }),
                  addRemoveLandingText:
                    journey === "catchCertificate" ? t("commonLandingLabel", { ns: "common" }).toLowerCase() : "",
                })}
              </strong>
            </div>
            <div
              className={`govuk-form-group ${
                !isEmpty(errorsTransformed?.copyDocumentAcknowledged) ? "govuk-form-group--error" : ""
              }`}
            >
              {!isEmpty(errorsTransformed?.copyDocumentAcknowledged) && (
                <ErrorMessage
                  text={t(errorsTransformed?.copyDocumentAcknowledged.message, { ns: "errorsText" })}
                  visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                />
              )}
              <FormCheckbox
                id="copyDocumentAcknowledged"
                value="Y"
                label={t(copyDocumentLabel, {
                  journeyText: t(journey, { ns: "common" }),
                  addRemoveLandingText: t("commonLandingLabel", { ns: "common" }).toLowerCase(),
                })}
                labelClassName="govuk-label govuk-checkboxes__label"
                inputClassName="govuk-checkboxes__input"
                itemClassName="govuk-checkboxes__item"
                name="copyDocumentAcknowledged"
              />
            </div>
            <div className="govuk-button-group">
              <Button
                type={BUTTON_TYPE.SUBMIT}
                name="_action"
                label={t("commonSecondaryCancelButton", { ns: "common" })}
                //@ts-ignore
                value="cancel"
                className="govuk-button govuk-button--secondary"
                data-testid="cancel"
              />
              <Button
                type={BUTTON_TYPE.SUBMIT}
                name="_action"
                label={t("commonCopyCreatedraftJourney", {
                  journeyText: t(journey, { ns: "common" }),
                })}
                //@ts-ignore
                value="continue"
                className="govuk-button"
                data-testid="continue"
              />
            </div>
            <input type="hidden" name="journey" value={journey} />
          </SecureForm>
        </div>
      </div>
    </Main>
  );
};
