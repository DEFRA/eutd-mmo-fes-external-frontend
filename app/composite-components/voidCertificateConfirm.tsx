import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import type { IErrorsTransformed, Journey } from "~/types";
import { ErrorMessage } from "~/components";

interface DocumentVoid {
  documentVoid: string;
}

interface Props {
  errors?: IErrorsTransformed;
  confirmDocumentVoid?: DocumentVoid;
  journey: Journey;
}

export const VoidCertificateConfirm = ({ errors, confirmDocumentVoid, journey }: Props) => {
  const { t } = useTranslation(["common"]);
  return (
    <div className="govuk-grid-row govuk-!-margin-bottom-6">
      <div className="govuk-grid-column-full">
        <div className={!isEmpty(errors) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
          <fieldset className="govuk-fieldset" aria-describedby={isEmpty(errors) ? undefined : "documentVoid-error"}>
            <legend className="govuk-fieldset__legend govuk-fieldset__legend govuk-!-margin-bottom-0">
              <h1 className="govuk-heading-xl" data-testid="void-certificate-confirm">
                {t("commonConfirmDocumentVoidPageHeader", { journeyText: t(journey), ns: "common" })}
              </h1>
            </legend>
            {!isEmpty(errors) && (
              <ErrorMessage
                id="documentVoid-error"
                text={t(errors.documentVoid?.message, { ns: "errorsText" })}
                visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
              />
            )}
            <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="documentVoid"
                  name="documentVoid"
                  type="radio"
                  value="Yes"
                  defaultChecked={confirmDocumentVoid?.documentVoid === "Yes"}
                />
                <label id="label-documentDeleteYes" className="govuk-label govuk-radios__label" htmlFor="documentVoid">
                  {t("commonYesLabel")}
                </label>
              </div>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="documentVoidNo"
                  name="documentVoid"
                  type="radio"
                  value="No"
                  defaultChecked={confirmDocumentVoid?.documentVoid === "No"}
                />
                <label id="label-documentDeleteNo" className="govuk-label govuk-radios__label" htmlFor="documentVoidNo">
                  {t("commonNoLabel")}
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};
