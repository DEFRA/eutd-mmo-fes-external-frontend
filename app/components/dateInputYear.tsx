import isEmpty from "lodash/isEmpty";
import React from "react";
import type { IError } from "~/types";

type DateInputYearProps = {
  id: string;
  name: string;
  isHydrated: boolean;
  errors: IError;
  yearSelected: string;
  handleYearChange: React.ChangeEventHandler;
  year: string;
  label: string;
};

export const DateInputYear = ({
  id,
  name,
  isHydrated,
  errors,
  yearSelected,
  handleYearChange,
  year,
  label,
}: DateInputYearProps) => (
  <div className="govuk-form-group">
    <label className="govuk-label govuk-date-input__label" htmlFor={`${id}-year`}>
      {label}
    </label>
    {!isHydrated ? (
      <input
        className={
          isEmpty(errors)
            ? "govuk-input govuk-date-input__input govuk-input--width-4"
            : "govuk-input govuk-date-input__input govuk-input--width-4 govuk-input--error"
        }
        id={`${id}-year`}
        name={`${name}Year`}
        type="number"
        defaultValue={yearSelected}
      />
    ) : (
      <input
        className={
          isEmpty(errors)
            ? "govuk-input govuk-date-input__input govuk-input--width-4"
            : "govuk-input govuk-date-input__input govuk-input--width-4 govuk-input--error"
        }
        id={`${id}-year`}
        name={`${name}Year`}
        type="number"
        onChange={handleYearChange}
        inputMode="numeric"
        value={year}
      />
    )}
  </div>
);
