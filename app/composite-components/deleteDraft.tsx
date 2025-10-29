import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import type { IErrorsTransformed, Journey } from "~/types";
import { ErrorMessage, SecureForm } from "~/components";

interface Props {
  errors: IErrorsTransformed;
  journey: Journey;
  csrf: string;
}

export const DeleteDraft = ({ errors, journey, csrf }: Props) => {
  const { t } = useTranslation(["common"]);
  const hasErrors = !isEmpty(errors);
  return (
    <SecureForm method="post" csrf={csrf}>
      <div className={`govuk-form-group ${hasErrors ? "govuk-form-group--error" : ""}`}>
        <fieldset className="govuk-fieldset" aria-describedby={hasErrors ? "documentDelete" : undefined}>
          <legend className="govuk-fieldset__legend govuk-fieldset__legend">
            <h1 className="govuk-heading-xl">
              {t("commonDeleteDocumentDraftDeleteConfirmationText", { journeyText: t(journey) })}
            </h1>
          </legend>
          {hasErrors && (
            <ErrorMessage
              id="documentDelete-error"
              text={t(errors?.documentDelete?.message, { ns: "errorsText" })}
              visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
            />
          )}
          <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
            <div className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id="documentDelete"
                name="documentDelete"
                type="radio"
                value="Yes"
              />
              <label id="label-documentDeleteYes" className="govuk-label govuk-radios__label" htmlFor="documentDelete">
                {t("commonYesLabel")}
              </label>
            </div>
            <div className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id="documentDeleteNo"
                name="documentDelete"
                type="radio"
                value="No"
              />
              <label id="label-documentDeleteNo" className="govuk-label govuk-radios__label" htmlFor="documentDeleteNo">
                {t("commonNoLabel")}
              </label>
            </div>
          </div>
        </fieldset>
      </div>
      <br />
      <Button
        id="continue"
        label={t("commonContinueButtonSaveAndContinueButton", { ns: "common" })}
        type={BUTTON_TYPE.SUBMIT}
        className="govuk-button"
        data-module="govuk-button"
        data-testid="continue"
      />
      <input type="hidden" name="journey" value={journey} />
    </SecureForm>
  );
};
