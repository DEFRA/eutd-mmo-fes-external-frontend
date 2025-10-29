import isEmpty from "lodash/isEmpty";
import React from "react";
import type { IError } from "~/types";

type DateInputMonthProps = {
  id: string;
  isHydrated: boolean;
  errors: IError;
  monthSelected: string;
  handleMonthChange: React.ChangeEventHandler;
  month: string;
  label: string;
};

export const DateInputMonth = ({
  id,
  isHydrated,
  errors,
  monthSelected,
  handleMonthChange,
  month,
  label,
}: DateInputMonthProps) => (
  <div className="govuk-form-group">
    <label className="govuk-label govuk-date-input__label" htmlFor={`${id}-month`}>
      {label}
    </label>
    {!isHydrated ? (
      <input
        className={
          isEmpty(errors)
            ? "govuk-input govuk-date-input__input govuk-input--width-2"
            : "govuk-input govuk-date-input__input govuk-input--width-2 govuk-input--error"
        }
        id={`${id}-month`}
        name={`${id}Month`}
        type="number"
        defaultValue={monthSelected}
      />
    ) : (
      <input
        className={
          isEmpty(errors)
            ? "govuk-input govuk-date-input__input govuk-input--width-2"
            : "govuk-input govuk-date-input__input govuk-input--width-2 govuk-input--error"
        }
        id={`${id}-month`}
        name={`${id}Month`}
        type="number"
        onChange={handleMonthChange}
        inputMode="numeric"
        value={month}
      />
    )}
  </div>
);
