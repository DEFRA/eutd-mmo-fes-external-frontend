import * as React from "react";
import { type JSXElementConstructor, type ReactElement, useEffect, useState } from "react";
import {
  useLoaderData,
  useActionData,
  type ShouldRevalidateFunction,
  type MetaFunction,
  type LoaderFunction,
  type ActionFunction,
} from "react-router";

import { useTranslation } from "react-i18next";
import { FormInput, ErrorPosition, Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames";
import isEmpty from "lodash/isEmpty";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm, AutocompleteFormField } from "~/components";
import {
  ButtonGroup,
  CatchDetailsTable,
  ProductArrivalSpeciesDetails,
  CatchCertificateDetails,
  WeightInput,
} from "~/composite-components";
import type { Catch, pageLinks, ErrorResponse, Species, ICountry } from "~/types";
import { getMeta, scrollToId, querySpecies, displayErrorMessagesInOrder } from "~/helpers";
import { useIsHydrated } from "~/hooks";
import { AddCatchDetailsAction, AddCatchDetailsLoader } from "~/models";

interface ILoaderData {
  catchId: string;
  catchCertificateNumber: string;
  catchCertificateType: string;
  totalWeightLanded: string;
  exportWeightBeforeProcessing: string;
  exportWeightAfterProcessing: string;
  documentNumber: string;
  speciesExemptLink: string;
  species?: Catch;
  productId: string;
  catchIndex: number;
  productIndex: number;
  nextUri?: string;
  speciesSelected: string;
  speciesCode: string;
  catches: Catch[];
  prevLink: number;
  nextLink: number;
  isLastPage: boolean;
  isFirstPage: boolean;
  isEditing?: boolean;
  lang?: string;
  totalPages: number;
  pageNo: number;
  csrf: string;
  productDescription: string;
  currentProductDescription: string;
  currentProductCommodityCode: string;
  speciesCountByCode: number;
  documentCountByCertificateNumber: number;
  countries: ICountry[];
  issuingCountry: string;
}

export const meta: MetaFunction = (args) => getMeta(args);

export const loader: LoaderFunction = async ({ request, params }) => AddCatchDetailsLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  AddCatchDetailsAction(request, params);

export const shouldRevalidate: ShouldRevalidateFunction = ({ actionResult, defaultShouldRevalidate }) => {
  if (actionResult) return isEmpty(actionResult.errors);

  return defaultShouldRevalidate;
};

// Helper to get weight value for display - state is already initialized with correct value from getFormValue
const getWeightValue = (isHydrated: boolean, currentValue: string, loaderValue: string) =>
  isHydrated ? currentValue : currentValue ?? loaderValue;

const getAddProductDetailsConfig = (isEditing: boolean | undefined) => ({
  value: isEditing ? "updateCatch" : "addCatch",
  label: isEditing ? "psUpdateSpeciesButtonLabel" : "psAddSpeciesButtonLabel",
});

const getAddProductDetailsValue = (isEditing: boolean | undefined) => (isEditing ? "updateCatch" : "addCatch");
const getActionUrl = (documentNumber: string, productId: string) =>
  `/create-processing-statement/${documentNumber}/add-catch-details/${productId}?pageNo=1`;
const getDefaultCatchCertificateType = (catchCertificateType?: string) => catchCertificateType ?? "non_uk";
const getDefaultIssuingCountry = (loaderIssuingCountry: string, catches: any, catchId: string) => {
  // First priority: use the issuing country from loader data (for editing mode)
  if (loaderIssuingCountry) {
    return loaderIssuingCountry;
  }

  // Second priority: find it from the current catch being edited
  const currentCatch = catches?.find((c: any) => c._id === catchId);
  return currentCatch?.issuingCountry?.officialCountryName ?? "";
};
const getSpeciesOptions = (species?: any) => (Array.isArray(species) ? species : []);
const getNonJsSpeciesOptions = (species?: any) => [
  "",
  ...((Array.isArray(species) ? species : []) as Species[]).map((s: Species) => `${s.faoName} (${s.faoCode})`),
];
const getActionData = (actionData: unknown) => actionData ?? {};
const getPreviousLinkHref = (documentNumber: string, productId: string, prevLink: number) =>
  `/create-processing-statement/${documentNumber}/add-catch-details/${productId}&pageNo=${prevLink}`;
const getNextLinkHref = (documentNumber: string, productId: string, nextLink: number) =>
  `/create-processing-statement/${documentNumber}/add-catch-details/${productId}&pageNo=${nextLink}`;
const getDefaultSelectedSpeciesCode = (speciesCode: string) => speciesCode ?? "";

// Helper function to determine if issuing country field should be shown
const shouldShowIssuingCountry = (isHydrated: boolean, currentCatchCertificateType: string): boolean =>
  !isHydrated || currentCatchCertificateType === "non_uk";

// Helper function to get error message for a field
const getErrorMessage = (errors: any, fieldKey: string, t: any): string =>
  errors?.[fieldKey]?.message ? t(errors[fieldKey].message, { ns: "errorsText" }) : "";

// Helper function to check if field has error
const hasError = (errors: any, fieldKey: string): boolean => !!errors?.[fieldKey]?.message;

// Helper component to reduce complexity
const CatchCertificateTypeRadios: React.FC<{
  catchIndex: number;
  currentCatchCertificateType: string;
  catchCertificateType: string;
  errors: any;
  t: any;
  handleCatchCertificateTypeChange: (value: string) => void;
  submittedCatchCertificateType?: string;
}> = ({
  catchIndex,
  currentCatchCertificateType,
  catchCertificateType,
  errors,
  t,
  handleCatchCertificateTypeChange,
  submittedCatchCertificateType,
}) => {
  const fieldKey = `catches-${catchIndex}-catchCertificateType`;
  const errorMessage = getErrorMessage(errors, fieldKey, t);
  const isHydrated = useIsHydrated();
  // Use submitted value when there are errors (non-JS scenario)
  const defaultCertType =
    !isEmpty(errors) && submittedCatchCertificateType ? submittedCatchCertificateType : catchCertificateType;

  return (
    <div
      id={fieldKey}
      className={classNames("govuk-form-group", {
        "govuk-form-group--error": hasError(errors, fieldKey),
      })}
    >
      <fieldset id={`${fieldKey}-fieldset`} className="govuk-fieldset" aria-describedby={`${fieldKey}-hint`}>
        <legend className="govuk-label govuk-!-font-weight-bold">
          {t("ccIssuedInUK", { ns: "psAddCatchDetails" })}
        </legend>
        <span id={`${fieldKey}-hint`} className="govuk-hint">
          {t("ccIssuedInUKHint", { ns: "psAddCatchDetails" })}
        </span>
        {errorMessage && (
          <span id={`${fieldKey}-error`} className="govuk-error-message">
            <span className="govuk-visually-hidden">{t("commonErrorText", { ns: "errorsText" })}</span>
            {errorMessage}
          </span>
        )}
        <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="catchCertificateType-uk"
              name="catchCertificateType"
              type="radio"
              value="uk"
              checked={isHydrated ? currentCatchCertificateType === "uk" : undefined}
              onChange={(e) => {
                if (e.target.checked) {
                  handleCatchCertificateTypeChange("uk");
                }
              }}
              defaultChecked={defaultCertType === "uk"}
            />
            <label className="govuk-label govuk-radios__label" htmlFor="catchCertificateType-uk">
              {t("commonYesLabel", { ns: "common" })}
            </label>
          </div>
          <div className="govuk-radios__item">
            <input
              className="govuk-radios__input"
              id="catchCertificateType-non_uk"
              name="catchCertificateType"
              type="radio"
              value="non_uk"
              checked={isHydrated ? currentCatchCertificateType === "non_uk" : undefined}
              onChange={(e) => {
                if (e.target.checked) {
                  handleCatchCertificateTypeChange("non_uk");
                }
              }}
              defaultChecked={defaultCertType === "non_uk"}
            />
            <label className="govuk-label govuk-radios__label" htmlFor="catchCertificateType-non_uk">
              {t("commonNoLabel", { ns: "common" })}
            </label>
          </div>
        </div>
      </fieldset>
    </div>
  );
};

// Helper component for issuing country field
const IssuingCountryField: React.FC<{
  catchIndex: number;
  isReset: boolean;
  selectedIssuingCountry: string;
  isHydrated: boolean;
  countries: ICountry[];
  errors: any;
  t: any;
  setSelectedIssuingCountry: (value: string) => void;
  submittedIssuingCountry?: string;
}> = ({
  catchIndex,
  isReset,
  selectedIssuingCountry,
  isHydrated,
  countries,
  errors,
  t,
  setSelectedIssuingCountry,
  submittedIssuingCountry,
}) => {
  const fieldKey = `catches-${catchIndex}-issuingCountry`;
  // Use submitted value when there are errors (non-JS scenario)
  const defaultValue = isReset ? "" : submittedIssuingCountry ?? selectedIssuingCountry;
  const errorMessage = getErrorMessage(errors, fieldKey, t);
  const countryOptions = isHydrated
    ? countries.map((c: ICountry) => c.officialCountryName)
    : ["", ...countries.map((c: ICountry) => c.officialCountryName)];

  return (
    <AutocompleteFormField
      key={isReset ? `issuing-country-${catchIndex}-reset` : `issuing-country-${catchIndex}`}
      id={fieldKey}
      name="issuingCountry"
      labelText={t("issuingCountry", { ns: "psAddCatchDetails" })}
      labelClassName="govuk-label govuk-!-font-weight-bold"
      hintText={t("issuingCountryHint", { ns: "psAddCatchDetails" })}
      errorMessageText={errorMessage}
      defaultValue={defaultValue}
      options={countryOptions}
      onSelected={(country) => setSelectedIssuingCountry(country)}
      optionsId="issuing-country-option"
      containerClassName={classNames("govuk-form-group", {
        "govuk-form-group--error": hasError(errors, fieldKey),
      })}
      selectProps={{
        selectClassName: classNames("govuk-select govuk-!-width-one-half", {
          "govuk-select--error": hasError(errors, fieldKey),
        }),
      }}
      inputProps={{
        className: classNames("govuk-input govuk-!-width-one-half", {
          "govuk-input--error": hasError(errors, fieldKey),
        }),
        "aria-describedby": `${fieldKey}-hint`,
        "data-testid": `issuing-country-${catchIndex}`,
      }}
    />
  );
};

// Helper component for species autocomplete field
const SpeciesAutocompleteField: React.FC<{
  catchIndex: number;
  selectedSpecies: string;
  species: any;
  isHydrated: boolean;
  errors: any;
  t: any;
  setSelectedSpecies: (species: string) => void;
  setSelectedSpeciesCode: (code: string) => void;
  submittedSpecies?: string;
}> = ({
  catchIndex,
  selectedSpecies,
  species,
  isHydrated,
  errors,
  t,
  setSelectedSpecies,
  setSelectedSpeciesCode,
  submittedSpecies,
}) => {
  const fieldKey = `catches-${catchIndex}-species`;
  const errorMessage = getErrorMessage(errors, fieldKey, t);
  const speciesOptions = isHydrated ? getSpeciesOptions(species) : getNonJsSpeciesOptions(species);
  const hasFieldError = hasError(errors, fieldKey);
  const hasAnyErrors = !isEmpty(errors);
  // Use submitted value when there are errors, otherwise use current state
  const displayValue = hasAnyErrors && submittedSpecies ? submittedSpecies : selectedSpecies;

  // Prepare conditional props for controlled/uncontrolled input
  const speciesInputProps: any = {
    className: classNames("govuk-input govuk-!-width-one-half", {
      "govuk-input--error": hasFieldError,
    }),
    "aria-describedby": `${fieldKey}-hint`,
  };

  // For non-JS scenarios, set defaultValue on the input itself
  if (!isHydrated) {
    speciesInputProps.defaultValue = displayValue;
  }

  return (
    <AutocompleteFormField
      id={fieldKey}
      name="species"
      errorMessageText={errorMessage}
      defaultValue={displayValue}
      options={speciesOptions}
      optionsId="species-option"
      labelClassName="govuk-label govuk-!-font-weight-bold"
      labelText={t("speciesNameText", { ns: "psAddCatchDetails" })}
      hintText={t("speciesNameHintText", { ns: "psAddCatchDetails" })}
      minCharsBeforeSearch={2}
      containerClassName={classNames("govuk-form-group", {
        "govuk-form-group--error": hasError(errors, fieldKey),
      })}
      selectProps={{
        selectClassName: classNames("govuk-select govuk-!-width-one-half", {
          "govuk-select--error": hasError(errors, fieldKey),
        }),
      }}
      inputProps={speciesInputProps}
      searchHandler={querySpecies}
      onSelected={(species) => {
        setSelectedSpecies(species);
        setSelectedSpeciesCode(species?.split(" (")[1]?.replace(")", ""));
      }}
    />
  );
};

const AddCatchDetailsIndex = () => {
  const { t } = useTranslation();
  const {
    documentNumber,
    catchIndex,
    nextUri,
    catches,
    isEditing,
    speciesSelected,
    productId,
    catchId,
    catchCertificateNumber,
    catchCertificateType,
    totalWeightLanded,
    exportWeightBeforeProcessing,
    exportWeightAfterProcessing,
    species,
    speciesCode,
    speciesExemptLink,
    nextLink,
    prevLink,
    isFirstPage,
    isLastPage,
    pageNo,
    totalPages,
    csrf,
    currentProductDescription,
    currentProductCommodityCode,
    speciesCountByCode,
    documentCountByCertificateNumber,
    countries,
    issuingCountry,
  } = useLoaderData<ILoaderData>();

  const actionData = useActionData();
  const { errors = {}, response, ...submittedFormData } = getActionData(actionData) as any;

  // Helper function to get the value to display - prefer submitted form data when there are errors
  const getFormValue = (fieldName: string, defaultValue: any) => {
    if (!isEmpty(errors) && submittedFormData[fieldName] !== undefined) {
      return submittedFormData[fieldName];
    }
    return defaultValue;
  };

  const [currentCatchCertificateType, setCurrentCatchCertificateType] = useState<string>(
    getFormValue("catchCertificateType", getDefaultCatchCertificateType(catchCertificateType))
  );
  const [currentCatchCertificateNumber, setCurrentCatchCertificateNumber] = useState<string>(
    getFormValue("catchCertificateNumber", isEditing ? catchCertificateNumber : "")
  );
  const [currentTotalWeightLanded, setCurrentTotalWeightLanded] = useState<string>(
    getFormValue("totalWeightLanded", "")
  );
  const [currentExportWeightBeforeProcessing, setCurrentExportWeightBeforeProcessing] = useState<string>(
    getFormValue("exportWeightBeforeProcessing", "")
  );
  const [currentExportWeightAfterProcessing, setCurrentExportWeightAfterProcessing] = useState<string>(
    getFormValue("exportWeightAfterProcessing", "")
  );
  const [selectedSpecies, setSelectedSpecies] = useState<string>(getFormValue("species", speciesSelected));
  const [selectedSpeciesCode, setSelectedSpeciesCode] = useState<string>(
    getFormValue("speciesCode", getDefaultSelectedSpeciesCode(speciesCode))
  );
  const [addButtonClicked, setAddButtonClicked] = useState<boolean>(false);
  const [isReset, setIsReset] = useState<boolean>(false);
  const [selectedIssuingCountry, setSelectedIssuingCountry] = useState<string>(
    getFormValue("issuingCountry", getDefaultIssuingCountry(issuingCountry, catches, catchId))
  );

  const actionUrl = getActionUrl(documentNumber, productId);

  useEffect(() => {
    if (isReset) {
      // Use setTimeout to ensure the reset happens after the component has re-mounted
      const timer = setTimeout(() => {
        setIsReset(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isReset]);

  const handleCatchCertificateTypeChange = (value: string) => {
    setCurrentCatchCertificateType(value);
  };

  useEffect(() => {
    // Don't update state if we have errors - keep the submitted values
    if (!isEmpty(errors)) {
      return;
    }

    setCurrentCatchCertificateType(getDefaultCatchCertificateType(catchCertificateType));
    const defaultIssuingCountry = getDefaultIssuingCountry(issuingCountry, catches, catchId);
    if (defaultIssuingCountry) {
      setSelectedIssuingCountry(defaultIssuingCountry);
    }

    setSelectedSpecies(speciesSelected);
    setSelectedSpeciesCode(getDefaultSelectedSpeciesCode(speciesCode));
    setCurrentTotalWeightLanded(totalWeightLanded);
    setCurrentExportWeightBeforeProcessing(exportWeightBeforeProcessing);
    setCurrentExportWeightAfterProcessing(exportWeightAfterProcessing);
  }, [
    catchCertificateType,
    catchId,
    isEditing,
    issuingCountry,
    catches,
    speciesSelected,
    speciesCode,
    totalWeightLanded,
    exportWeightBeforeProcessing,
    exportWeightAfterProcessing,
  ]);

  const isHydrated = useIsHydrated();

  const previousLinkLayout = (
    <a
      className="govuk-link govuk-pagination__link"
      href={getPreviousLinkHref(documentNumber, productId, prevLink)}
      rel="next"
      data-testid="previous-link"
    >
      <svg
        className="govuk-pagination__icon govuk-pagination__icon--prev"
        xmlns="http://www.w3.org/2000/svg"
        height="13"
        width="15"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 15 13"
      >
        <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
      </svg>
      <span className="govuk-pagination__link-title">{t("commonDashboardPrev", { ns: "common" })}</span>
    </a>
  );
  const nextLinkLayout = (
    <a
      className="govuk-link govuk-pagination__link"
      href={getNextLinkHref(documentNumber, productId, nextLink)}
      rel="previous"
      data-testid="next-link"
    >
      <span className="govuk-pagination__link-title ">{t("commonDashboardNext", { ns: "common" })}</span>{" "}
      <svg
        className="govuk-pagination__icon govuk-pagination__icon--next"
        xmlns="http://www.w3.org/2000/svg"
        height="13"
        width="15"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 15 13"
      >
        <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
      </svg>
    </a>
  );
  const populateNavigationLinks = (
    previousLinkLayout: ReactElement<any, string | JSXElementConstructor<any>>,
    nextLinkLayout: ReactElement<any, string | JSXElementConstructor<any>>
  ): pageLinks => ({
    previousLink: () => previousLinkLayout,
    nextLink: () => nextLinkLayout,
  });

  const navigationLinks = populateNavigationLinks(previousLinkLayout, nextLinkLayout);

  useEffect(() => {
    // Don't update if we have errors - preserve submitted values
    if (isEmpty(errors)) {
      setSelectedSpecies(speciesSelected);
    }
  }, [speciesSelected, errors]);

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  useEffect(() => {
    if (response) {
      setCurrentTotalWeightLanded(response.totalWeightLanded);
      setCurrentExportWeightBeforeProcessing(response.exportWeightBeforeProcessing);
      setCurrentExportWeightAfterProcessing(response.exportWeightAfterProcessing);
    }
  }, [response]);

  useEffect(() => {
    if (addButtonClicked) {
      resetFormValues();
      setAddButtonClicked(false);
    }
  }, [catches]);

  const resetFormValues = () => {
    setCurrentTotalWeightLanded("");
    setCurrentExportWeightBeforeProcessing("");
    setCurrentExportWeightAfterProcessing("");
    setCurrentCatchCertificateType(getDefaultCatchCertificateType(catchCertificateType));
    setCurrentCatchCertificateNumber("");
    setSelectedSpecies("");
    setSelectedSpeciesCode("");
    setSelectedIssuingCountry("");
    setIsReset(true);
  };

  const ccNumberKey = `catches-${catchIndex}-catchCertificateNumber`;
  const addProductDetailsConfig = getAddProductDetailsConfig(isEditing);

  const errorKeysInOrder = [
    `catches-${catchIndex}-species`,
    `catches-${catchIndex}-product`,
    `catches-${catchIndex}-catchCertificateType`,
    `catches-${catchIndex}-issuingCountry`,
    `catches-${catchIndex}-catchCertificateNumber`,
    `catches-${catchIndex}-totalWeightLanded`, // For non-UK certificates
    `catches-${catchIndex}-catchCertificateWeight`, // Add this if it exists
    `catches-${catchIndex}-exportWeightBeforeProcessing`,
    `catches-${catchIndex}-exportWeightAfterProcessing`,
  ];

  return (
    <Main backUrl={`/create-processing-statement/${documentNumber}/add-consignment-details/${productId}`}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, errorKeysInOrder)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("psAddCatchDetailsHeading", { ns: "psAddCatchDetails" })} />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" action={actionUrl} csrf={csrf}>
            <div className="form-light-grey-bg govuk-!-padding-5 govuk-!-margin-bottom-5">
              <SpeciesAutocompleteField
                key={isReset ? `species-${catchIndex}-reset` : `species-${catchIndex}`}
                catchIndex={catchIndex}
                selectedSpecies={selectedSpecies}
                species={species}
                isHydrated={isHydrated}
                errors={errors}
                t={t}
                setSelectedSpecies={setSelectedSpecies}
                setSelectedSpeciesCode={setSelectedSpeciesCode}
                submittedSpecies={submittedFormData.species}
              />
              <ProductArrivalSpeciesDetails speciesExemptLink={speciesExemptLink} />
              <CatchCertificateTypeRadios
                catchIndex={catchIndex}
                currentCatchCertificateType={currentCatchCertificateType}
                catchCertificateType={catchCertificateType}
                errors={errors}
                t={t}
                handleCatchCertificateTypeChange={handleCatchCertificateTypeChange}
                submittedCatchCertificateType={submittedFormData.catchCertificateType}
              />
              {shouldShowIssuingCountry(isHydrated, currentCatchCertificateType) && (
                <IssuingCountryField
                  catchIndex={catchIndex}
                  isReset={isReset}
                  selectedIssuingCountry={selectedIssuingCountry}
                  isHydrated={isHydrated}
                  countries={countries}
                  errors={errors}
                  t={t}
                  setSelectedIssuingCountry={setSelectedIssuingCountry}
                  submittedIssuingCountry={submittedFormData.issuingCountry}
                />
              )}
              <FormInput
                containerClassName="govuk-form-group"
                label={t("psCatchCertificate", { ns: "psAddCatchDetails" })}
                name="catchCertificateNumber"
                type="text"
                value={
                  isHydrated
                    ? currentCatchCertificateNumber
                    : getFormValue("catchCertificateNumber", catchCertificateNumber)
                }
                onChange={(e) => isHydrated && setCurrentCatchCertificateNumber(e.currentTarget.value)}
                hint={{
                  id: `hint-catches-${catchIndex}-catchCertificateNumber`,
                  position: "above",
                  text: `${t("psCatchCertificateHint", { ns: "psAddCatchDetails" })}`,
                  className: "govuk-hint govuk-!-margin-bottom-2",
                }}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                inputClassName={classNames("govuk-input govuk-!-width-one-half", {
                  "govuk-input--error": errors?.[ccNumberKey]?.message,
                })}
                inputProps={{
                  id: `catches-${catchIndex}-catchCertificateNumber`,
                  "aria-describedby": `hint-catches-${catchIndex}-catchCertificateNumber`,
                }}
                labelProps={{ htmlFor: `catches-${catchIndex}-catchCertificateNumber` }}
                errorProps={{
                  className: isEmpty(errors?.[ccNumberKey]) ? "" : "govuk-error-message",
                }}
                staticErrorMessage={
                  isEmpty(errors?.[ccNumberKey]) ? "" : t(errors[ccNumberKey]?.message, { ns: "errorsText" })
                }
                errorPosition={ErrorPosition.AFTER_LABEL}
                containerClassNameError={isEmpty(errors?.[ccNumberKey]) ? "" : "govuk-form-group--error"}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
              <CatchCertificateDetails />
              <WeightInput
                id="weight"
                totalWeight={() => {}}
                label={t("psAddCatchCertificateWeight", { ns: "psAddCatchDetails" })}
                hint={t("psAddCatchCertificateWeightHint", { ns: "psAddCatchDetails" })}
                key={isReset ? `total-weight-landed-${catchIndex}-reset` : `total-weight-landed-${catchIndex}`}
                weightKey={`totalWeightLanded`}
                errorID={`catches-${catchIndex}-totalWeightLanded`}
                inputWidth={5}
                unit="kg"
                errors={errors ?? {}}
                formValue={isReset ? "" : getWeightValue(isHydrated, currentTotalWeightLanded, totalWeightLanded)}
                speciesId={`total-weight-landed-${catchIndex}`}
                index={catchIndex}
                exportWeight={isReset ? "" : totalWeightLanded}
                readOnly={false}
                inputType="text"
                inputName="totalWeightLanded"
                onChange={(e) => setCurrentTotalWeightLanded(e.currentTarget.value)}
              />
              <WeightInput
                id="weight"
                totalWeight={() => {}}
                label={t("psAddCatchWeightsExportWeightBeforeProcessingLabel", { ns: "psAddCatchDetails" })}
                hint={t("psAddCatchWeightsExportWeightBeforeProcessingHint", { ns: "psAddCatchDetails" })}
                key={
                  isReset
                    ? `export-weight-before-processing-${catchIndex}-reset`
                    : `export-weight-before-processing-${catchIndex}`
                }
                weightKey={`exportWeightBeforeProcessing`}
                errorID={`catches-${catchIndex}-exportWeightBeforeProcessing`}
                inputWidth={5}
                unit="kg"
                errors={errors ?? {}}
                formValue={
                  isReset
                    ? ""
                    : getWeightValue(isHydrated, currentExportWeightBeforeProcessing, exportWeightBeforeProcessing)
                }
                speciesId={`export-weight-before-processing-${catchIndex}`}
                index={catchIndex}
                exportWeight={isReset ? "" : exportWeightBeforeProcessing?.toString()}
                readOnly={false}
                inputType="text"
                inputName="exportWeightBeforeProcessing"
                onChange={(e) => setCurrentExportWeightBeforeProcessing(e.currentTarget.value)}
              />
              <WeightInput
                id="weight"
                totalWeight={() => {}}
                label={t("psAddCatchWeightsExportWeightAfterProcessingLabel", { ns: "psAddCatchDetails" })}
                hint={t("psAddCatchWeightsExportWeightAfterProcessingHint", { ns: "psAddCatchDetails" })}
                key={
                  isReset
                    ? `export-weight-after-processing-${catchIndex}-reset`
                    : `export-weight-after-processing-${catchIndex}`
                }
                weightKey={`exportWeightAfterProcessing`}
                errorID={`catches-${catchIndex}-exportWeightAfterProcessing`}
                inputWidth={5}
                unit="kg"
                errors={errors ?? {}}
                formValue={
                  isReset
                    ? ""
                    : getWeightValue(isHydrated, currentExportWeightAfterProcessing, exportWeightAfterProcessing)
                }
                speciesId={`export-weight-after-processing-${catchIndex}`}
                index={catchIndex}
                exportWeight={isReset ? "" : exportWeightAfterProcessing?.toString()}
                readOnly={false}
                inputType="text"
                inputName="exportWeightAfterProcessing"
                onChange={(e) => setCurrentExportWeightAfterProcessing(e.currentTarget.value)}
              />
              <div className="govuk-button-group">
                <button
                  id="cancel"
                  type={BUTTON_TYPE.SUBMIT}
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                  name="_action"
                  value="cancelCatch"
                  data-testid="cancel-button"
                  onClick={resetFormValues}
                >
                  {t("commonCancelButtonCancelButtonText", { ns: "common" })}
                </button>
                <Button
                  id="addProductDetails"
                  label={t(addProductDetailsConfig.label, { ns: "psAddCatchDetails" })}
                  className="govuk-button"
                  type={BUTTON_TYPE.SUBMIT}
                  data-module="govuk-button"
                  name="_action"
                  value={getAddProductDetailsValue(isEditing)}
                  // @ts-ignore
                  data-testid="add-product-details"
                  onClick={() => setAddButtonClicked(true)}
                />
              </div>
              <div className="govuk-!-width-full-width">
                <CatchDetailsTable
                  productId={productId}
                  catches={catches}
                  documentNumber={documentNumber}
                  productDescription={currentProductDescription}
                  onClickHandler={() => scrollToId("catchDetails")}
                  navigationLinks={navigationLinks}
                  totalPages={totalPages}
                  isFirstPage={isFirstPage}
                  isLastPage={isLastPage}
                  pageNo={pageNo}
                  speciesCountByCode={speciesCountByCode}
                  documentCountByCertificateNumber={documentCountByCertificateNumber}
                />
              </div>
              <ButtonGroup />
              <input type="hidden" name="nextUri" value={nextUri ?? ""} />
              <input type="hidden" name="catchId" value={catchId} />
              <input type="hidden" name="pageNo" value={pageNo} />
              <input type="hidden" name="speciesCode" value={selectedSpeciesCode} />
              <input type="hidden" name="productDescription" value={currentProductDescription} />
              <input type="hidden" name="productCommodityCode" value={currentProductCommodityCode} />
            </div>
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-processing-statement/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default AddCatchDetailsIndex;
