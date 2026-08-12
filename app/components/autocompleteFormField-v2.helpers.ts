import { AutoCompleteErrorPosition } from "@capgeminiuk/dcx-react-library";
import type React from "react";

type AutocompleteStatusTextArgs = {
  length: number;
  property: string;
  position: number;
  notFoundText?: string;
  t: (key: string, options?: any) => string;
};

type ResolvedAutocompletePropsArgs = {
  id: string;
  notFoundText?: string;
  containerClassName?: string;
  errorPosition?: AutoCompleteErrorPosition;
  errorMessageClassName?: string;
  labelClassName?: string;
  hintClass?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  defaultValue: string;
  resultUlClass?: string;
  resultlLiClass?: string;
  resultNoOptionClass?: string;
  t: (key: string, options?: any) => string;
};

export const getAutocompleteStatusText = ({
  length,
  property,
  position,
  notFoundText,
  t,
}: AutocompleteStatusTextArgs) => {
  if (length === 0) {
    return notFoundText ?? t("commonNoResultsFound");
  }

  if (length === 1) {
    return t("autocompleteSingleResult", { length, property, position, ns: "accessibility" });
  }

  if (length > 0) {
    return t("autocompleteMultipleResults", { length, property, position, ns: "accessibility" });
  }

  return "";
};

export const getResolvedAutocompleteProps = ({
  id,
  notFoundText,
  containerClassName,
  errorPosition,
  errorMessageClassName,
  labelClassName,
  hintClass,
  inputProps,
  defaultValue,
  resultUlClass,
  resultlLiClass,
  resultNoOptionClass,
  t,
}: ResolvedAutocompletePropsArgs) => {
  const listboxId = `${id}__listbox`;

  return {
    listboxId,
    notFoundText: notFoundText ?? t("commonNoResultsFound"),
    containerClassName: containerClassName ?? "govuk-form-group",
    errorPosition: errorPosition ?? AutoCompleteErrorPosition.AFTER_HINT,
    errorMessageClassName: errorMessageClassName ?? "govuk-error-message",
    labelClassName: labelClassName ?? "govuk-label",
    hintClass: hintClass ?? "govuk-hint",
    inputProps: {
      defaultValue: inputProps?.defaultValue ?? inputProps?.value ?? defaultValue ?? "",
      ...inputProps,
      "aria-controls": listboxId,
    },
    resultUlClass: resultUlClass ?? "autocomplete__menu",
    resultlLiClass: resultlLiClass ?? "autocomplete__option",
    resultNoOptionClass: resultNoOptionClass ?? "autocomplete__option--no-results",
  };
};
