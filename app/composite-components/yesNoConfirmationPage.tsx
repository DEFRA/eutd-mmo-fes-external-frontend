import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import type { ReactNode } from "react";
import type { IErrorsTransformed } from "~/types";
import { displayErrorMessages } from "~/helpers";
import { ErrorMessage, ErrorSummary, Main, SecureForm } from "~/components";

type YesNoConfirmationPageProps = {
  csrf: string;
  backUrl: string;
  title: string;
  hint?: string;
  radioName: string;
  yesLabel: string;
  noLabel: string;
  continueLabel?: string;
  errors?: IErrorsTransformed;
  children?: ReactNode;
  gridColumnClassName?: string;
  titleTestId?: string;
};

// Shared "are you sure?" template for confirmation-style pages (e.g. delete draft, void document, remove product)
export const YesNoConfirmationPage = ({
  csrf,
  backUrl,
  title,
  hint,
  radioName,
  yesLabel,
  noLabel,
  continueLabel,
  errors = {},
  children,
  gridColumnClassName,
  titleTestId,
}: YesNoConfirmationPageProps) => {
  const { t } = useTranslation(["common", "errorsText"]);
  const fieldError = errors?.[radioName];
  const hasErrors = !isEmpty(fieldError);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className={gridColumnClassName}>
          <SecureForm method="post" csrf={csrf}>
            <div className={`govuk-form-group ${hasErrors ? "govuk-form-group--error" : ""}`}>
              <fieldset className="govuk-fieldset" aria-describedby={hasErrors ? `${radioName}-error` : undefined}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                  <h1 className="govuk-heading-xl" data-testid={titleTestId}>
                    {title}
                  </h1>
                </legend>
                {hint && <p className="govuk-body">{hint}</p>}
                {hasErrors && (
                  <ErrorMessage
                    id={`${radioName}-error`}
                    text={t(fieldError.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input className="govuk-radios__input" id={radioName} name={radioName} type="radio" value="Yes" />
                    <label className="govuk-label govuk-radios__label" htmlFor={radioName}>
                      {yesLabel}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id={`${radioName}No`}
                      name={radioName}
                      type="radio"
                      value="No"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor={`${radioName}No`}>
                      {noLabel}
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            <br />
            <Button
              id="continue"
              label={continueLabel ?? t("commonContinueButtonSaveAndContinueButton")}
              type={BUTTON_TYPE.SUBMIT}
              className="govuk-button"
              data-module="govuk-button"
              data-testid="continue"
            />
            {children}
          </SecureForm>
        </div>
      </div>
    </Main>
  );
};
