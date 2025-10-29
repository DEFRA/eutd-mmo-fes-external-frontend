import isEmpty from "lodash/isEmpty";
import React from "react";
import type { IError } from "~/types";

type DateInputDayProps = {
  id: string;
  isHydrated: boolean;
  errors: IError;
  daySelected: string;
  handleDayChange: React.ChangeEventHandler;
  day: string;
  label: string;
};

export const DateInputDay = ({
  id,
  isHydrated,
  errors,
  daySelected,
  handleDayChange,
  day,
  label,
}: DateInputDayProps) => (
  <div className="govuk-form-group">
    <label className="govuk-label govuk-date-input__label" htmlFor={`${id}-day`}>
      {label}
    </label>
    {!isHydrated ? (
      <input
        className={
          isEmpty(errors)
            ? "govuk-input govuk-date-input__input govuk-input--width-2"
            : "govuk-input govuk-date-input__input govuk-input--width-2 govuk-input--error"
        }
        id={`${id}-day`}
        name={`${id}Day`}
        type="number"
        defaultValue={daySelected}
      />
    ) : (
      <input
        className={
          isEmpty(errors)
            ? "govuk-input govuk-date-input__input govuk-input--width-2"
            : "govuk-input govuk-date-input__input govuk-input--width-2 govuk-input--error"
        }
        id={`${id}-day`}
        name={`${id}Day`}
        type="number"
        onChange={handleDayChange}
        inputMode="numeric"
        value={day}
      />
    )}
  </div>
);
