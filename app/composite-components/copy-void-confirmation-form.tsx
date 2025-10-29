import { useTranslation } from "react-i18next";
import { ErrorMessage } from "~/components";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import type { IErrorsTransformed, Journey } from "~/types";
import isEmpty from "lodash/isEmpty";
interface Props {
  errors: IErrorsTransformed;
  journey: Journey;
}

export const CopyVoidConfirmationForm = ({ errors, journey }: Props) => {
  const { t } = useTranslation("common");
  return (
    <>
      <div className={`govuk-form-group ${!isEmpty(errors?.voidOriginal) ? "govuk-form-group--error" : ""}`}>
        <fieldset
          className="govuk-fieldset"
          aria-describedby={isEmpty(errors?.voidOriginal) ? undefined : "voidOriginal-error"}
        >
          <legend className="govuk-fieldset__legend govuk-fieldset__legend govuk-!-margin-bottom-0">
            <h1 className="govuk-heading-xl">{t("commonCopyVoidConfirmationHeader", { journeyText: t(journey) })}</h1>
          </legend>
          {!isEmpty(errors?.voidOriginal) && (
            <ErrorMessage
              id="voidOriginal-error"
              text={t(errors?.voidOriginal.message, { ns: "errorsText" })}
              visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
            />
          )}
          <div className="govuk-radios__item">
            <input className="govuk-radios__input" id="voidOriginal" name="voidOriginal" type="radio" value="Yes" />
            <label id="label-voidOriginal" className="govuk-label govuk-radios__label" htmlFor="voidOriginal">
              {t(`${journey}CopyVoidConfirmationDocumentVoidOriginalYes`, {
                journeyText: t(journey).toLowerCase(),
              })}
            </label>
          </div>
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="documentVoidOriginalNo"
              name="voidOriginal"
              type="radio"
              value="No"
            />
            <label id="label-voidOriginal" className="govuk-label govuk-radios__label" htmlFor="voidOriginal">
              {t(`${journey}CopyVoidConfirmationDocumentVoidOriginalNo`, {
                journeyText: t(journey).toLowerCase(),
              })}
            </label>
          </div>
        </fieldset>
      </div>
      <br />
      <div className="govuk-button-group">
        <Button
          label={t("commonCancelButtonCancelButtonText", {
            ns: "common",
          })}
          name="_action"
          //@ts-ignore
          value="cancel"
          className="govuk-button govuk-button--secondary"
          type={BUTTON_TYPE.SUBMIT}
          data-module="govuk-button"
          data-testid="cancel"
        />
        <Button
          label={t("commonContinueButtonContinueButtonText", {
            ns: "common",
          })}
          className="govuk-button"
          type={BUTTON_TYPE.SUBMIT}
          data-module="govuk-button"
          data-testid="continue"
        />
      </div>
      <input type="hidden" name="journey" value={journey} />
    </>
  );
};
