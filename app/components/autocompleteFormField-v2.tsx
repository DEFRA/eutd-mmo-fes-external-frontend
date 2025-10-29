import { Autocomplete, AutoCompleteErrorPosition } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import type { Species } from "~/types";
import React, { type ReactElement } from "react";

type AutocompleteFormFieldProps = {
  id: string;
  name: string;
  options: Species[] | string[];
  optionsId: string;
  notFoundText?: string;
  containerClassName?: string;
  errorId?: string;
  errorPosition?: AutoCompleteErrorPosition;
  errorMessageText: string;
  errorMessageClassName?: string;
  defaultValue: string;
  labelText?: string;
  labelClassName?: string;
  hintText?: string;
  hintClass?: string;
  selectProps: {
    selectClassName: string;
    id?: string;
  };
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  resultUlClass?: string;
  resultlLiClass?: string;
  resultNoOptionClass?: string;
  onSelected?: (selectedValue: string) => void;
  minCharsBeforeSearch?: number;
  minCharsMessage?: string;
  promptId?: string;
  promptMessage?: string;
  promptCondition?: () => boolean;
  searchHandler?: (query: string, options: any[]) => string[];
  onChange?: (value: string) => void;
  customNonJSComp?: ReactElement;
};

export const AutocompleteFormField = ({
  id,
  name,
  options,
  optionsId,
  notFoundText,
  containerClassName,
  errorId,
  errorPosition,
  errorMessageText,
  errorMessageClassName,
  defaultValue,
  labelText,
  labelClassName,
  hintText,
  hintClass,
  selectProps,
  inputProps,
  resultUlClass,
  resultlLiClass,
  resultNoOptionClass,
  minCharsBeforeSearch,
  minCharsMessage,
  promptId,
  promptMessage,
  promptCondition,
  onSelected,
  searchHandler,
  onChange,
  customNonJSComp,
}: AutocompleteFormFieldProps) => {
  const { t } = useTranslation("common");
  const [status, setStatus] = React.useState("");
  const change = (length: number, property: string, position: number) => {
    let newText = "";
    if (length === 0) {
      newText = notFoundText ?? t("commonNoResultsFound");
    } else if (length === 1) {
      newText = t("autocompleteSingleResult", { length, property, position, ns: "accessibility" });
    } else if (length > 0) {
      newText = t("autocompleteMultipleResults", { length, property, position, ns: "accessibility" });
    }
    setStatus(newText);
  };

  return (
    <Autocomplete
      minCharsBeforeSearch={minCharsBeforeSearch}
      minCharsMessage={minCharsMessage}
      promptClassName="autocomplete__prompt"
      id={id}
      name={name}
      options={options}
      notFoundText={notFoundText ?? t("commonNoResultsFound")}
      containerClassName={containerClassName ?? "govuk-form-group"}
      errorId={errorId}
      errorPosition={errorPosition ?? AutoCompleteErrorPosition.AFTER_HINT}
      errorMessageText={errorMessageText}
      errorMessageClassName={errorMessageClassName ?? "govuk-error-message"}
      defaultValue={defaultValue}
      labelText={labelText}
      labelClassName={labelClassName ?? "govuk-label"}
      labelProps={{ id: `${id}-label` }}
      hintText={hintText}
      hintClass={hintClass ?? "govuk-hint"}
      hintId={`${id}-hint`}
      selectProps={selectProps}
      inputProps={inputProps}
      resultUlClass={resultUlClass ?? "autocomplete__menu"}
      resultlLiClass={resultlLiClass ?? "autocomplete__option"}
      resultNoOptionClass={resultNoOptionClass ?? "autocomplete__option--no-results"}
      onSelected={onSelected}
      promptId={promptId}
      promptMessage={promptMessage}
      promptCondition={promptCondition}
      search={searchHandler}
      resultActiveClass="autocomplete__option--focused"
      onChange={onChange}
      statusUpdate={(length, property, position) => change(length, property, position)}
      accessibilityStatus={status}
      accessibilityHintText={t("autocompleteAccessibilityHintText", { ns: "accessibility" })}
      optionsId={optionsId}
      customNonJSComp={customNonJSComp}
    />
  );
};
