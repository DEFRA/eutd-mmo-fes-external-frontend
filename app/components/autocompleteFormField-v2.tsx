import { Autocomplete, type AutoCompleteErrorPosition } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import type { Species } from "~/types";
import React, { type ReactElement } from "react";
import { getAutocompleteStatusText, getResolvedAutocompleteProps } from "~/components/autocompleteFormField-v2.helpers";

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
  errorVisuallyHiddenText?: { text: string; className?: string };
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

export { getAutocompleteStatusText, getResolvedAutocompleteProps } from "~/components/autocompleteFormField-v2.helpers";

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
  errorVisuallyHiddenText,
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
  const resolvedProps = getResolvedAutocompleteProps({
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
  });
  const change = (length: number, property: string, position: number) => {
    setStatus(getAutocompleteStatusText({ length, property, position, notFoundText, t }));
  };

  return (
    <Autocomplete
      minCharsBeforeSearch={minCharsBeforeSearch}
      minCharsMessage={minCharsMessage}
      promptClassName="autocomplete__prompt"
      id={id}
      name={name}
      options={options}
      notFoundText={resolvedProps.notFoundText}
      containerClassName={resolvedProps.containerClassName}
      errorId={errorId}
      errorPosition={resolvedProps.errorPosition}
      errorMessageText={errorMessageText}
      errorMessageClassName={resolvedProps.errorMessageClassName}
      errorVisuallyHiddenText={
        errorVisuallyHiddenText ?? {
          text: t("commonErrorText", { ns: "errorsText" }),
          className: "govuk-visually-hidden",
        }
      }
      defaultValue={defaultValue}
      labelText={labelText}
      labelClassName={resolvedProps.labelClassName}
      labelProps={{ id: `${id}-label` }}
      hintText={hintText}
      hintClass={resolvedProps.hintClass}
      hintId={`${id}-hint`}
      selectProps={selectProps}
      resultId={resolvedProps.listboxId}
      inputProps={resolvedProps.inputProps}
      resultUlClass={resolvedProps.resultUlClass}
      resultlLiClass={resolvedProps.resultlLiClass}
      resultNoOptionClass={resolvedProps.resultNoOptionClass}
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
      useDefaultStyles={false}
    />
  );
};
