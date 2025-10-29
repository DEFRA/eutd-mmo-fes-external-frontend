import classNames from "classnames";
import { AutocompleteFormField, ErrorMessage } from "~/components";
import { SpeciesDetails } from "./speciesDetails";
import { Button, BUTTON_TYPE, Details, FormCheckbox } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import type { LabelAndValue, Species } from "~/types";
import { useTranslation } from "react-i18next";
import { querySpecies } from "~/helpers";

const getSelectOptions = (options: LabelAndValue[]) =>
  Array.isArray(options)
    ? options.map((optionsData: LabelAndValue) => (
        <option key={optionsData?.value} value={optionsData?.value} aria-label={optionsData?.label}>
          {optionsData?.label}
        </option>
      ))
    : [];

export const AddProductsComponent = ({
  primaryButtonLabel,
  speciesExemptLink,
  species,
  states,
  presentations,
  selectedSpecies,
  selectedState,
  selectedPresentation,
  commodityCodes,
  errors,
  stateLabel,
  presentationLabel,
  scientificName,
  speciesCode,
  displayAddProduct,
  isEdit,
  addToFavourites,
  showFavouriteCheckbox,
  isHydrated,
  presentationInputProps,
  stateInputProps,
  commodityCodeInputProps,
  commonSpecies,
  getSelectedState,
  getSelectedStateLabel,
  getSelectedPresentation,
  getSelectedPresentationLabel,
  selectedSpeciesCode,
  speciesScientificName,
  stateHolder,
  presentationHolder,
  commodityCodesHolder,
  handleSpeciesSelection,
  handleStateChange,
  handlePresentationChange,
  handleCommodityCodeChange,
}: any) => {
  const { t } = useTranslation(["whatAreYouExporting", "common", "errorsText"]);

  function getHydratedValue<T>(isHydrated: boolean, fallback: T, hydratedValue: T): T {
    return !isHydrated ? fallback : hydratedValue;
  }
  function getValue<T>(primary: T | null | undefined, fallback: T): T {
    return primary ?? fallback;
  }

  let addProductButtonLabel = t("ccAddSpeciesPageAddButtonText");
  if (isEdit) {
    addProductButtonLabel = t("commonUpdateproduct", { ns: "common" });
  } else if (primaryButtonLabel) {
    addProductButtonLabel = primaryButtonLabel;
  }

  const commonSpeciesNojs = getValue(commonSpecies, selectedSpecies);
  const defaultChecked = getValue(addToFavourites, false);
  const speciesCodeNojs = getValue(selectedSpeciesCode, speciesCode);
  const stateLabelNojs = getHydratedValue(isHydrated, stateLabel, getSelectedStateLabel);
  const presentationLabelNojs = getHydratedValue(isHydrated, presentationLabel, getSelectedPresentationLabel);
  const scientificNameNojs = getValue(speciesScientificName, scientificName);
  const selectedStateNOjs = getValue(getSelectedState, selectedState);
  const selectedPresentationNojs = getValue(getSelectedPresentation, selectedPresentation);

  return (
    <>
      <div id="0">
        <AutocompleteFormField
          id="species"
          name="species"
          errorMessageText={t(errors?.species?.message, { ns: "errorsText" })}
          defaultValue={commonSpeciesNojs}
          options={isHydrated ? species : ["", ...species.map((s: Species) => `${s.faoName} (${s.faoCode})`)]}
          optionsId="species-option"
          labelClassName="govuk-label govuk-!-font-weight-bold"
          labelText={t("ccFavouritesPageFormCommonNameField")}
          hintText={t("ccSpeciesBlockHintText")}
          containerClassName={classNames("govuk-form-group govuk-!-width-one-half", {
            "govuk-form-group--error": errors?.species?.message,
          })}
          selectProps={{
            selectClassName: classNames("govuk-select govuk-!-width-full", {
              "govuk-select--error": errors?.species?.message,
            }),
          }}
          inputProps={{
            className: classNames("govuk-input", {
              "govuk-input--error": errors?.species?.message,
            }),
            "aria-describedby": "species-hint",
          }}
          onSelected={handleSpeciesSelection}
          searchHandler={querySpecies}
        />
        <SpeciesDetails
          speciesExemptLink={speciesExemptLink}
          documentType={t("ccFavouritesDetailsExemptFromCatchCertificate")}
        />
        {!isHydrated && (
          <Button
            label={isEdit ? t("ccUpdateSpeciesButton") : t("ccAddSpeciesButton")}
            type={BUTTON_TYPE.SUBMIT}
            className="govuk-button govuk-button--primary"
            data-module="govuk-button"
            name="_action"
            // @ts-ignore
            value="addSpecies"
            data-testid="add-species"
          />
        )}
        <div className={!isEmpty(errors?.state) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
          {!isEmpty(errors?.state) && (
            <ErrorMessage
              id="state-error-message"
              text={t(errors?.state?.message, { ns: "errorsText" })}
              visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
            />
          )}
          <label className="govuk-label govuk-!-font-weight-bold" htmlFor="state" id="state-label">
            {t("ccFavouritesPageProductTableRowState")}
          </label>
          {!isHydrated && <div className="govuk-hint">{t("ccAddStateHint")}</div>}{" "}
          <select
            name="state"
            id="state"
            className={classNames("govuk-select govuk-!-width-one-half", {
              " govuk-select--error": errors?.state?.message,
            })}
            {...stateInputProps}
            onChange={handleStateChange}
          >
            <option value="" aria-label={t("ccFavouritesPageFormStateFieldPlaceholder")}>
              {t("ccFavouritesPageFormStateFieldPlaceholder")}
            </option>
            {isHydrated ? getSelectOptions(stateHolder) : getSelectOptions(states)}
          </select>
        </div>
        {!isHydrated && (
          <Button
            label={isEdit ? t("ccUpdateStateButton") : t("ccAddStateButton")}
            type={BUTTON_TYPE.SUBMIT}
            className="govuk-button govuk-button--primary"
            data-module="govuk-button"
            name="_action"
            // @ts-ignore
            value="addState"
            data-testid="add-state"
          />
        )}
        <div
          className={!isEmpty(errors?.presentation) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}
        >
          {!isEmpty(errors?.presentation) && (
            <ErrorMessage
              id="presentation-error-message"
              text={t(errors?.presentation?.message, { ns: "errorsText" })}
              visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
            />
          )}
          <label className="govuk-label govuk-!-font-weight-bold" htmlFor="presentation" id="presentation-label">
            {t("ccFavouritesPageProductTableRowPresentation")}
          </label>
          {!isHydrated && <div className="govuk-hint">{t("ccAddPresentationHint")}</div>}
          <select
            name="presentation"
            id="presentation"
            className={classNames("govuk-select govuk-!-width-one-half", {
              " govuk-select--error": errors?.presentation?.message,
            })}
            {...presentationInputProps}
            onChange={handlePresentationChange}
          >
            <option value="" aria-label={t("ccFavouritesPageFormStateFieldPlaceholder")}>
              {t("ccFavouritesPageFormStateFieldPlaceholder")}
            </option>
            {isHydrated ? getSelectOptions(presentationHolder) : getSelectOptions(presentations)}
          </select>
        </div>

        {!isHydrated && (
          <Button
            label={isEdit ? t("ccUpdatePresentationButton") : t("ccAddPresentationButton")}
            type={BUTTON_TYPE.SUBMIT}
            className="govuk-button govuk-button--primary"
            data-module="govuk-button"
            name="_action"
            // @ts-ignore
            value="addPresentation"
            data-testid="add-presentation"
          />
        )}
        <div
          className={!isEmpty(errors?.commodity_code) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}
        >
          {!isEmpty(errors?.commodity_code) && (
            <ErrorMessage
              id="commodity_code-error-message"
              text={t(errors?.commodity_code?.message, { ns: "errorsText" })}
              visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
            />
          )}
          <label className="govuk-label govuk-!-font-weight-bold" htmlFor="commodity_code" id="commoditycode-label">
            {t("ccFavouritesPageFormCommodityCodeField")}
          </label>
          {!isHydrated && <div className="govuk-hint">{t("ccAddCommodityHint")}</div>}
          <select
            name="commodityCode"
            id="commodity_code"
            className={classNames("govuk-select govuk-!-width-one-half", {
              " govuk-select--error": errors?.commodity_code?.message,
            })}
            onChange={handleCommodityCodeChange}
            {...commodityCodeInputProps}
          >
            <option value="" aria-label={t("ccFavouritesPageFormStateFieldPlaceholder")}>
              {t("ccFavouritesPageFormStateFieldPlaceholder")}
            </option>
            {isHydrated ? getSelectOptions(commodityCodesHolder) : getSelectOptions(commodityCodes)}
          </select>
        </div>
        <Details
          summary={t("ccFavouritesPageFormCommodityCodeSummary")}
          detailsClassName="govuk-details"
          summaryClassName="govuk-details__summary"
          detailsTextClassName="govuk-details__text"
          summaryTextProps={{ id: "commodity-code-details" }}
        >
          <p>{t("ccFavouritesPageFormCommodityCodeDetails", { contactInfo: "0330 159 1989" })}</p>
        </Details>
        {displayAddProduct && showFavouriteCheckbox && (
          <div className="govuk-form-group">
            <div className="govuk-checkboxes" data-module="govuk-checkboxes">
              <FormCheckbox
                id="addToFavourites"
                value="Y"
                label={t("ccSpeciesBlockLabelCheckBoxLabelText")}
                labelClassName="govuk-label govuk-checkboxes__label"
                inputClassName="govuk-checkboxes__input"
                itemClassName="govuk-checkboxes__item"
                name="addToFavourites"
                inputProps={{
                  defaultChecked: defaultChecked,
                }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="govuk-button-group">
        <Button
          type={BUTTON_TYPE.SUBMIT}
          name="_action"
          // @ts-ignore
          value="cancel"
          label={t("commonSecondaryCancelButton", { ns: "common" })}
          className="govuk-button govuk-button--secondary"
          data-testid="cancel"
        />
        {displayAddProduct && (
          <Button
            id="add-product"
            type={BUTTON_TYPE.SUBMIT}
            name="_action"
            // @ts-ignore
            value={isEdit ? "editProduct" : "addProduct"}
            label={addProductButtonLabel}
            className="govuk-button"
            data-testid="add-product"
          />
        )}
      </div>
      <input type="hidden" readOnly name="speciesCode" value={speciesCodeNojs} />
      <input type="hidden" readOnly name="stateLabel" value={stateLabelNojs} />
      <input type="hidden" readOnly name="presentationLabel" value={presentationLabelNojs} />
      <input type="hidden" readOnly name="scientificName" value={scientificNameNojs} />
      <input type="hidden" readOnly name="stateCode" value={selectedStateNOjs} />
      <input type="hidden" readOnly name="presentationCode" value={selectedPresentationNojs} />
      <input type="hidden" readOnly name="jsFlag" checked={isHydrated} />
    </>
  );
};
