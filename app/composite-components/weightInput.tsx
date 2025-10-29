import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { WeightDetails, WeightInputProps } from "~/types";
import { ErrorMessage } from "~/components";

const getWeightFieldValue = (
  formValue: string | undefined,
  landingsWeightInputValue: string,
  exportWeight: string | undefined
) => {
  if (formValue) {
    return formValue;
  } else if (landingsWeightInputValue) {
    return landingsWeightInputValue;
  } else {
    return exportWeight;
  }
};

export const WeightInput = ({
  unit,
  exportWeight,
  totalWeight,
  index,
  errors,
  formValue,
  speciesId,
  readOnly,
  errorID,
  inputWidth,
  weightKey,
  inputType,
}: WeightInputProps) => {
  const { t } = useTranslation("directLandings");
  const [landingsWeightInputValue, setLandingsWeightInputValue] = useState("");
  const handleLandingWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weightDetails: WeightDetails = {
      id: e.target.id,
      value: parseFloat(e.target.value),
    };

    setLandingsWeightInputValue(e.target.value);
    totalWeight(weightDetails);
  };

  const inputId = errorID ?? `weights.${index}.exportWeight`;
  const inputWidthClass = inputWidth ? `govuk-input--width-${inputWidth}` : "govuk-input--width-4";
  return (
    <div
      className={
        errors && !isEmpty(errors[inputId])
          ? "govuk-form-group govuk-!-static-margin-top-0 govuk-!-static-margin-bottom-3 govuk-form-group--error"
          : "govuk-form-group govuk-!-static-margin-top-0 govuk-!-static-margin-bottom-3"
      }
    >
      <div className="govuk-input__wrapper">
        {!errorID && errors && !isEmpty(errors[inputId]) && (
          <ErrorMessage text={t(errors[inputId]?.message, { ns: "errorsText" })} />
        )}

        <input
          className={
            !isEmpty(errors?.[inputId])
              ? `govuk-input  ${inputWidthClass} govuk-input--error`
              : `govuk-input  ${inputWidthClass}`
          }
          id={inputId}
          name={`weight-${speciesId}`}
          type={inputType ?? "number"}
          step="0.01"
          defaultValue={getWeightFieldValue(formValue, landingsWeightInputValue, exportWeight)}
          onChange={handleLandingWeightChange}
          minLength={0}
          maxLength={16}
          size={16}
          aria-label="weight"
          disabled={readOnly}
          key={errorID ?? weightKey}
        />
        <div className="govuk-input__suffix" style={{ lineHeight: 1.4 }} aria-hidden="true">
          {unit}
        </div>
      </div>
    </div>
  );
};
