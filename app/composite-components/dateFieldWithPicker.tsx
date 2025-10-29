import type { IError } from "~/types";
import { CommonDatePicker } from "../components/commonDatePicker";

type Props = {
  id: string;
  getDateSelected: (date: string) => void;
  dateSelected: string | undefined;
  errors: IError;
  hideAddDateButton?: boolean;
  label: string;
  labelStyle?: string;
  translationNs: string;
  hintText?: string;
};

export const DateFieldWithPicker = ({
  id,
  getDateSelected,
  dateSelected = "",
  errors,
  hideAddDateButton = false,
  label,
  labelStyle = "bold",
  translationNs,
  hintText,
}: Props) => (
  <CommonDatePicker
    id={id}
    errors={errors}
    hintText={hintText}
    label={label}
    translationNs={translationNs}
    hideAddDateButton={hideAddDateButton}
    labelStyle={labelStyle}
    dateSelected={dateSelected}
    getDateSelected={getDateSelected}
  />
);
