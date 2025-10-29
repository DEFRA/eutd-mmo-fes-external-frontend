import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import type { IError } from "~/types";
import { CalendarDateButton, DateInputDay, DateInputMonth, DateInputYear, ErrorMessage } from "~/components";
import { useState, useEffect } from "react";
import { isValidDate } from "~/helpers/utilities";
import moment from "moment";
import DatePicker from "react-datepicker";
import { useHydrated } from "remix-utils/use-hydrated";
import { errorMessageText } from "~/helpers/errorUtilities";

type DatePickerProps = {
  id: string;
  errors: IError;
  hintText?: string;
  label: string;
  labelStyle?: string;
  translationNs: string;
  dateSelected: string;
  hideAddDateButton?: boolean;
  getDateSelected: (date: string) => void;
};

export const CommonDatePicker = ({
  id,
  errors,
  hintText,
  label,
  labelStyle,
  translationNs,
  dateSelected,
  hideAddDateButton,
  getDateSelected,
}: DatePickerProps) => {
  const { t } = useTranslation(["errorsText", "common"]);
  const dateFormat = "YYYY-MM-DD";
  const isHydrated = useHydrated();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    isValidDate(dateSelected) ? new Date(dateSelected) : new Date()
  );
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [yearSelected = "", monthSelected = "", daySelected = ""] = dateSelected.split("-");

  const handleOnChange = (date: Date | null) => {
    const checkDate = moment(date);
    setSelectedDate(date);
    setDay(checkDate.format("DD"));
    setMonth(checkDate.format("MM"));
    setYear(checkDate.format("YYYY"));
    getDateSelected(moment(date).format(dateFormat));
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
    const dateString = `${year}-${month}-${day}`;
    if (isValidDate(dateString)) {
      setSelectedDate(new Date(dateString));
    }
  }, [day, month, year]);

  return (
    <div id={id} className={isEmpty(errors) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"}>
      <fieldset className="govuk-fieldset" role="group" aria-describedby={errorMessageText(hintText, errors)}>
        <legend className="govuk-fieldset__legend govuk-fieldset__legend">
          {labelStyle === "bold" ? (
            <b>{t(label, { ns: translationNs })}</b>
          ) : (
            <label>{t(label, { ns: translationNs })}</label>
          )}
        </legend>
        {hintText && (
          <div id="date-hint" className="govuk-hint">
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
              isHydrated={isHydrated}
              errors={errors}
              yearSelected={yearSelected}
              handleYearChange={handleYearChange}
              year={year}
              label={t("commonDatePickerLabelYear", { ns: "common" })}
            />
          </div>
          {!hideAddDateButton && !isHydrated ? (
            <Button
              label={t("commonAddDateText", { ns: "common" })}
              type={BUTTON_TYPE.SUBMIT}
              className="govuk-button govuk-button--primary govuk-!-margin-top-6 govuk-!-margin-bottom-0"
              data-module="govuk-button"
              name="_action"
              // @ts-ignore
              value={`add-${id}`}
              data-testid={`add-${id}`}
            />
          ) : (
            isHydrated && (
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
