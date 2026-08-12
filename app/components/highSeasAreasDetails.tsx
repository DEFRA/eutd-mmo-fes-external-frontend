import { HighSeasAreasGuidance } from "~/composite-components/highSeasAreasGuidance";
import type { HighSeasAreaType, HSAOptionType, IError } from "~/types";
import { ErrorMessage } from "~/components";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";

type HighSeasAreaDetailsProps = {
  HSALabel: string;
  HSAHint: string;
  confirmHSATypeOptions: HSAOptionType[];
  highSeasArea: HighSeasAreaType;
  getHSAOptionLabel: (option: HSAOptionType) => string;
  errors?: IError;
};

export const HighSeasAreasDetails = ({
  HSALabel,
  HSAHint,
  confirmHSATypeOptions,
  highSeasArea,
  getHSAOptionLabel,
  errors,
}: HighSeasAreaDetailsProps) => {
  const { t } = useTranslation("errorsText");
  /* istanbul ignore next */
  const hasErrors = !isEmpty(errors);
  /* istanbul ignore next */
  const describedBy = hasErrors ? "highSeasArea-error highSeasArea-hint" : "highSeasArea-hint";

  const renderOption = (option: HSAOptionType) => (
    <div key={option.id} className="govuk-radios__item">
      <input
        id={option.id}
        type="radio"
        name="highSeasArea"
        className="govuk-radios__input"
        value={option.value}
        defaultChecked={option.value === highSeasArea}
        aria-describedby="highSeasArea-hint"
      />
      <label htmlFor={option.id} className="govuk-label govuk-radios__label">
        {getHSAOptionLabel(option)}
      </label>
    </div>
  );

  const optionItems = confirmHSATypeOptions.map(renderOption);

  return (
    <>
      <div
        className={
          /* istanbul ignore next */ hasErrors ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"
        }
      >
        <fieldset className="govuk-fieldset" aria-describedby={describedBy}>
          <legend className="govuk-fieldset__heading">
            <b>{HSALabel}</b>
          </legend>
          <div id="highSeasArea-hint" className="govuk-hint">
            {HSAHint}
          </div>
          {hasErrors && (
            <ErrorMessage
              id="highSeasArea-error"
              text={t(errors?.message, { ns: "errorsText", ...errors?.value })}
              visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
            />
          )}
          <div className="govuk-radios govuk-radios--inline">{optionItems}</div>
        </fieldset>
      </div>
      <HighSeasAreasGuidance />
    </>
  );
};
