import moment from "moment";
import { isValidDate } from "~/helpers/utilities";

export const getInitialSelectedDate = (dateSelected: string) =>
  isValidDate(dateSelected) ? new Date(dateSelected) : new Date();

export const getDateParts = (dateSelected: string) => {
  const [yearSelected = "", monthSelected = "", daySelected = ""] = dateSelected.split("-");

  return { yearSelected, monthSelected, daySelected };
};

export const getPickerChangeState = (date: Date | null, dateFormat = "YYYY-MM-DD") => {
  const checkDate = moment(date);

  return {
    selectedDate: date,
    day: checkDate.format("DD"),
    month: checkDate.format("MM"),
    year: checkDate.format("YYYY"),
    formattedDate: moment(date).format(dateFormat),
  };
};

export const getSynchronizedSelectedDate = (year: string, month: string, day: string) => {
  const dateString = `${year}-${month}-${day}`;
  return isValidDate(dateString) ? new Date(dateString) : null;
};

export const shouldRenderAddDateButton = (hideAddDateButton?: boolean, isHydrated?: boolean) =>
  !hideAddDateButton && !isHydrated;

export const shouldRenderCalendarDatePicker = (hideAddDateButton?: boolean, isHydrated?: boolean) =>
  !shouldRenderAddDateButton(hideAddDateButton, isHydrated) && Boolean(isHydrated);
