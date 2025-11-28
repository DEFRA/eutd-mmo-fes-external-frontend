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
  setHighSeasArea: (value: React.SetStateAction<HighSeasAreaType>) => void;
  getHSAOptionLabel: (option: HSAOptionType) => string;
  errors?: IError;
};

export const HighSeasAreasDetails = ({
  HSALabel,
  HSAHint,
  confirmHSATypeOptions,
  highSeasArea,
  setHighSeasArea,
  getHSAOptionLabel,
  errors,
}: HighSeasAreaDetailsProps) => {
  const { t } = useTranslation("errorsText");

  return (
    <>
      <div className={isEmpty(errors) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"}>
        <fieldset
          className="govuk-fieldset"
          aria-describedby={errors ? "highSeasArea-error highSeasArea-hint" : "highSeasArea-hint"}
        >
          <legend className="govuk-fieldset__heading">
            <b>{HSALabel}</b>
          </legend>
          <div id="highSeasArea-hint" className="govuk-hint">
            {HSAHint}
          </div>
          {!isEmpty(errors) && (
            <ErrorMessage
              id="highSeasArea-error"
              text={t(errors?.message, { ns: "errorsText", ...(errors?.value ?? {}) })}
              visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
            />
          )}
          <div className="govuk-radios govuk-radios--inline">
            {confirmHSATypeOptions.map((option: HSAOptionType) => (
              <div key={option.id} className="govuk-radios__item">
                <input
                  id={option.id}
                  type="radio"
                  name="highSeasArea"
                  className="govuk-radios__input"
                  value={option.value}
                  defaultChecked={option.value === highSeasArea}
                  onChange={(e) => setHighSeasArea(e.target.value as HighSeasAreaType)}
                  aria-describedby="highSeasArea-hint"
                />
                <label htmlFor={option.id} className="govuk-label govuk-radios__label">
                  {getHSAOptionLabel(option)}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      <HighSeasAreasGuidance />
    </>
  );
};
