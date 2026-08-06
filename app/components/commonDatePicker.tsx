import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import type { IError } from "~/types";
import { CalendarDateButton, DateInputDay, DateInputMonth, DateInputYear, ErrorMessage } from "~/components";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useIsHydrated } from "~/hooks";
import { errorMessageText } from "~/helpers/errorUtilities";
import {
  getDateParts,
  getInitialSelectedDate,
  getPickerChangeState,
  getSynchronizedSelectedDate,
  shouldRenderAddDateButton,
  shouldRenderCalendarDatePicker,
} from "~/components/commonDatePicker.helpers";

type DatePickerProps = {
  id: string;
  name: string;
  errors: IError;
  hintText?: string;
  label: string;
  labelStyle?: string;
  translationNs: string;
  dateSelected: string;
  hideAddDateButton?: boolean;
  isHydratedOverride?: boolean;
  getDateSelected: (date: string) => void;
};

export {
  getDateParts,
  getInitialSelectedDate,
  getPickerChangeState,
  getSynchronizedSelectedDate,
  shouldRenderAddDateButton,
  shouldRenderCalendarDatePicker,
} from "~/components/commonDatePicker.helpers";

export const CommonDatePicker = ({
  id,
  name,
  errors,
  hintText,
  label,
  labelStyle,
  translationNs,
  dateSelected,
  hideAddDateButton,
  isHydratedOverride,
  getDateSelected,
}: DatePickerProps) => {
  const { t } = useTranslation(["errorsText", "common"]);
  const dateFormat = "YYYY-MM-DD";
  const hydratedFromHook = useIsHydrated();
  const isHydrated = isHydratedOverride ?? hydratedFromHook;
  const [selectedDate, setSelectedDate] = useState<Date | null>(getInitialSelectedDate(dateSelected));
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const { yearSelected, monthSelected, daySelected } = getDateParts(dateSelected);

  const handleOnChange = (date: Date | null) => {
    const nextState = getPickerChangeState(date, dateFormat);
    setSelectedDate(nextState.selectedDate);
    setDay(nextState.day);
    setMonth(nextState.month);
    setYear(nextState.year);
    getDateSelected(nextState.formattedDate);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDay(e.target.value);
    getDateSelected(`${year}-${month}-${e.target.value}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(e.target.value);
    getDateSelected(`${year}-${e.target.value}-${day}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(e.target.value);
    getDateSelected(`${e.target.value}-${month}-${day}`);
  };

  useEffect(() => {
    setDay(daySelected);
    setMonth(monthSelected);
    setYear(yearSelected);
  }, []);

  useEffect(() => {
    const nextSelectedDate = getSynchronizedSelectedDate(year, month, day);
    if (nextSelectedDate) {
      setSelectedDate(nextSelectedDate);
    }
  }, [day, month, year]);

  return (
    <div
      id={`${id}-container`}
      className={isEmpty(errors) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"}
    >
      <fieldset
        className="govuk-fieldset"
        role="group"
        aria-describedby={errorMessageText(hintText, errors, `${id}-date-hint`)}
      >
        <legend className="govuk-fieldset__legend govuk-fieldset__legend">
          {labelStyle === "bold" ? (
            <label className="govuk-label govuk-!-font-weight-bold">{t(label, { ns: translationNs })}</label>
          ) : (
            <label className="govuk-label">{t(label, { ns: translationNs })}</label>
          )}
        </legend>
        {hintText && (
          <div id={`${id}-date-hint`} className="govuk-hint">
            {t(hintText, { ns: translationNs })}
          </div>
        )}
        {!isEmpty(errors) && (
          <ErrorMessage
            id="error-message"
            text={t(errors?.message, { ...errors?.value })}
            visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
          />
        )}
        <div className="govuk-date-input">
          <div className="govuk-date-input__item">
            <DateInputDay
              id={id}
              name={name}
              isHydrated={isHydrated}
              errors={errors}
              daySelected={daySelected}
              handleDayChange={handleDayChange}
              day={day}
              label={t("commonDatePickerLabelDay", { ns: "common" })}
            />
          </div>
          <div className="govuk-date-input__item">
            <DateInputMonth
              id={id}
              name={name}
              isHydrated={isHydrated}
              errors={errors}
              monthSelected={monthSelected}
              handleMonthChange={handleMonthChange}
              month={month}
              label={t("commonDatePickerLabelMonth", { ns: "common" })}
            />
          </div>
          <div className="govuk-date-input__item">
            <DateInputYear
              id={id}
              name={name}
              isHydrated={isHydrated}
              errors={errors}
              yearSelected={yearSelected}
              handleYearChange={handleYearChange}
              year={year}
              label={t("commonDatePickerLabelYear", { ns: "common" })}
            />
          </div>
          {shouldRenderAddDateButton(hideAddDateButton, isHydrated) ? (
            <Button
              label={t("commonAddDateText", { ns: "common" })}
              type={BUTTON_TYPE.SUBMIT}
              className="govuk-button govuk-button--primary govuk-!-margin-top-6 govuk-!-margin-bottom-0"
              data-module="govuk-button"
              name="_action"
              // @ts-ignore
              value={`add-${name}`}
              data-testid={`add-${id}`}
            />
          ) : (
            shouldRenderCalendarDatePicker(hideAddDateButton, isHydrated) && (
              <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => handleOnChange(date)}
                    dateFormat={dateFormat}
                    customInput={<CalendarDateButton />}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </fieldset>
    </div>
  );
};
