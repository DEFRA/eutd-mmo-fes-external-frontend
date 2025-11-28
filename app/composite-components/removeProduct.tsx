import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import type { IErrorsTransformed } from "~/types";
import { ErrorMessage, SecureForm } from "~/components";
import { ButtonGroup } from "~/composite-components";
import { BackToProgressLink } from "~/components";

interface Props {
  errors: IErrorsTransformed;
  csrf: string;
  productDescription: string;
  documentNumber: string;
}

export const RemoveProduct = ({ errors, csrf, productDescription, documentNumber }: Props) => {
  const { t } = useTranslation(["common", "psRemoveProduct"]);
  const hasErrors = !isEmpty(errors);

  return (
    <>
      <SecureForm method="post" csrf={csrf}>
        <div className={`govuk-form-group ${hasErrors ? "govuk-form-group--error" : ""}`}>
          <fieldset className="govuk-fieldset" aria-describedby={hasErrors ? "removeProduct-error" : undefined}>
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
              <h1 className="govuk-heading-xl">{t("psRemoveProductPageTitle", { ns: "psRemoveProduct" })}</h1>
            </legend>

            <h3 className="govuk-heading-l">
              {t("psRemoveProductQuestion", { ns: "psRemoveProduct", productDescription })}
            </h3>

            {hasErrors && (
              <ErrorMessage
                id="removeProduct-error"
                text={t(errors?.removeProduct?.message, { ns: "errorsText" })}
                visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
              />
            )}

            <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="removeProductYes"
                  name="removeProduct"
                  type="radio"
                  value="Yes"
                  data-testid="removeProduct-yes"
                />
                <label className="govuk-label govuk-radios__label" htmlFor="removeProductYes">
                  {t("commonYesLabel", { ns: "common" })}
                </label>
              </div>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="removeProductNo"
                  name="removeProduct"
                  type="radio"
                  value="No"
                  data-testid="removeProduct-no"
                />
                <label className="govuk-label govuk-radios__label" htmlFor="removeProductNo">
                  {t("commonNoLabel", { ns: "common" })}
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        <ButtonGroup />
      </SecureForm>

      <BackToProgressLink
        progressUri="/create-processing-statement/:documentNumber/progress"
        documentNumber={documentNumber}
      />
    </>
  );
};
