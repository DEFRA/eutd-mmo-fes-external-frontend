import * as React from "react";
import {
  Main,
  Title,
  AutocompleteFormField,
  BackToProgressLink,
  ErrorSummary,
  ErrorMessage,
  SecureForm,
  GearDetails,
  HighSeasAreasDetails,
  RfmoSelector,
  FaoAreaSelector,
} from "~/components";
import { route } from "routes-gen";
import { useEffect, useState, useReducer } from "react";
import type { Navigation } from "@remix-run/router";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { Button, BUTTON_TYPE, Details, List, ListItem, TYPE_LIST } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import {
  AddExclusiveEconomicZoneComponent,
  ButtonGroup,
  DateFieldWithPicker,
  LandingProductTable,
  LandingsTable,
} from "~/composite-components";
import { type ManualEntryLandingsData } from "~/.server";
import isEmpty from "lodash/isEmpty";
import { useHydrated } from "remix-utils/use-hydrated";
import logger from "~/logger";
import { AddLandingsAction, AddLandingsLoader } from "~/models";
import type { ErrorResponse, IGearType, HSAOptionType, HighSeasAreaType, ICountry } from "~/types";
import { faoAreas, scrollToId, isValidDate, displayErrorMessagesInOrder, confirmHSATypeOptions } from "~/helpers";

type AddLandingsType = {
  documentNumber: string;
  landingLimitDaysInFuture: string;
  offlineValidationTime: string;
  maxAddLandingsLimit: string;
  maximumEezPerLanding: number;
  landingsData: ManualEntryLandingsData;
  vesselsNoJs: Array<string>;
  selectedStartDate?: string;
  selectedDate: string;
  selectedProduct: string;
  selectedFaoArea: string;
  selectedWeight: string;
  selectedVessel: string;
  gearCategory: string;
  gearType: string;
  rfmos: string[];
  availableExclusiveEconomicZones: ICountry[];
  selectedExclusiveEconomicZones: string[];
  countries: ICountry[];
  landingId: string;
  canAddLanding: boolean;
  editLanding: boolean;
  nextUri: string;
  csrf: string;
  minCharsBeforeSearch: number;
  maxLandingExceeded: boolean;
  displayOptionalSuffix: boolean;
  gearCategories: string[];
  availableGearTypes: IGearType[];
  selectedHighSeasArea?: HighSeasAreaType;
  selectedRfmo: string;
};

type AddLandingsActionDataType = {
  errors?: any;
  groupedErrorIds?: any;
  [key: string]: any;
};

const addLandingActionName = "submit";
const cancelActionName = "cancel";

const clearFormActions = [addLandingActionName, cancelActionName];

export const loader: LoaderFunction = async ({ params, request }) => await AddLandingsLoader(request, params);
export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  await AddLandingsAction(request, params);

const getDateFromAction = (values: any, type: string): string =>
  `${values[type + "Year"] ?? ""}-${values[type + "Month"] ?? ""}-${values[type + "Day"] ?? ""}`;
const isDisabledProductSelection = (isHydrated: boolean, isEditing: boolean) => !isHydrated && isEditing;
const getInitialProductValue = (values: any, selectedProduct: string) => values.product ?? selectedProduct ?? "";
const getIsActionReload = (navigation: Navigation) =>
  navigation.state === "loading" &&
  navigation.formMethod != null &&
  navigation.formMethod != "GET" &&
  navigation.formAction?.startsWith(navigation.location.pathname);

const hasMaxLandingExceeded = (errors: any, maxLandingExceeded: boolean) => {
  if (maxLandingExceeded) {
    errors["yourproducts"] = {
      key: "yourproducts",
      message: "ccAddLandingMaxLandingExceededError",
    };
  }
};
const getVesselClassName = (errors: any) => errors["vessel.vesselName"] ?? "";

const intialProcessedValues = (
  values: Pick<AddLandingsType, "gearCategory" | "availableGearTypes" | "gearType" | "selectedRfmo">
) => ({
  gearCategory: values.gearCategory || "",
  availableGearTypes: values.availableGearTypes || [],
  gearType: values.gearType || "",
  selectedRfmo: values.selectedRfmo ?? "",
});

const AddLandings = () => {
  const isHydrated = useHydrated();

  const { t } = useTranslation(["addLandings", "uploadFile", "errorsText"]);
  const addVesselFormVesselDateQueryPrompt: string = t("ccAddVesselFormVesselDateQueryPrompt", {
    ns: "directLandings",
  });

  const {
    documentNumber,
    maxAddLandingsLimit,
    landingLimitDaysInFuture,
    maximumEezPerLanding,
    offlineValidationTime,
    landingsData,
    vesselsNoJs,
    selectedStartDate,
    displayOptionalSuffix,
    selectedDate,
    selectedProduct,
    selectedFaoArea,
    selectedWeight,
    selectedVessel,
    rfmos,
    availableExclusiveEconomicZones,
    selectedExclusiveEconomicZones,
    landingId,
    canAddLanding,
    editLanding,
    nextUri,
    minCharsBeforeSearch,
    maxLandingExceeded,
    csrf,
    gearCategories,
    selectedHighSeasArea,
    ...rest
  } = useLoaderData<AddLandingsType>();

  const { gearCategory, availableGearTypes, gearType, selectedRfmo } = intialProcessedValues(rest);

  const {
    errors = {},
    groupedErrorIds = {},
    actionExecuted,
    ...values
  } = useActionData<AddLandingsActionDataType>() ?? {};
  const startDateFromAction = getDateFromAction(values, "startDate");
  const dateFromAction = getDateFromAction(values, "dateLanded");
  const submit = useSubmit();
  const isEditing = !!landingId;
  const disableProductSelection = isDisabledProductSelection(isHydrated, isEditing);
  const initialProductValue = getInitialProductValue(values, selectedProduct);

  const [startDate, setStartDate] = useState<string | undefined>(selectedStartDate);
  const [landedDate, setLandedDate] = useState<string | undefined>(selectedDate);
  const [vessels, setVessels] = useState<string[]>([]);
  const [promptText, setPromptText] = useState<string>(addVesselFormVesselDateQueryPrompt);
  const [showPrompt, setShowPrompt] = useState<boolean>(vessels.length === 0);
  const [currentProduct, setCurrentProduct] = useState<string>(initialProductValue);
  // disable change detection in autocomplete field during render to prevent
  // premature event triggering (e.g. when the field is pre-populated)
  const [enableChange, setEnableChange] = useState<boolean>(isHydrated);
  const [selectedGearCategory, setSelectedGearCategory] = useState<string>(gearCategory);
  const [gearTypes, setGearTypes] = useState<IGearType[]>(availableGearTypes);
  const [selectedGearType, setSelectedGearType] = useState<string>(gearType);
  const [highSeasArea, setHighSeasArea] = useState<HighSeasAreaType>(selectedHighSeasArea);

  const [exclusiveEconomicZones, setExclusiveEconomicZones] = useState<string[]>(selectedExclusiveEconomicZones ?? []);
  const [rfmo, setRfmo] = useState<string>(selectedRfmo);
  const [renderCounter, forceUpdate] = useReducer((x) => x + 1, 0);
  const navigation = useNavigation();
  const isActionReload = getIsActionReload(navigation);
  hasMaxLandingExceeded(errors, maxLandingExceeded);

  const getStartDate = (date: string) => {
    setStartDate(date);
  };

  const handleExclusiveEconomicZonesChange = (updatedExclusiveEconomicZones: string[]) => {
    setExclusiveEconomicZones(updatedExclusiveEconomicZones);
  };

  const getDateSelected = (date: string) => {
    setLandedDate(date);
    setPromptText(t("ccAddVesselFormVesselDateQueryPrompt", { ns: "directLandings" }));
    setShowPrompt(!isValidDate(date, ["YYYY-M-D", "YYYY-MM-DD"]));
    setVessels([]);
  };

  const handleVesselChange = async (searchTerm: string) => {
    if (searchTerm.length < minCharsBeforeSearch) {
      return;
    }

    try {
      const response: Response = await fetch(`/get-vessels?search=${searchTerm}&date=${landedDate ?? selectedDate}`);
      const data: string[] = await response.json();

      setVessels(data ?? []);
    } catch (e) {
      logger.info(`[ADD-LANDINGS][GET-VESSEL-JS][LOADER][ERROR]`);
      if (e instanceof Error) {
        logger.error(e);
      }

      setVessels([]);
    }
  };

  const handleGearCategoryChange = async (gearCategory: string) => {
    try {
      const response: Response = await fetch(`/get-gear-types?gearCategory=${gearCategory}`);
      const data: IGearType[] = await response.json();

      setGearTypes(data);
    } catch (e) {
      logger.info(`[ADD-LANDINGS][GET-GEAR-TYPES-JS][LOADER][ERROR]`);
      if (e instanceof Error) {
        logger.error(e);
      }
      setGearTypes([]);
    }
  };
  useEffect(() => {
    if (editLanding) {
      setEnableChange(false);
      handleGearCategoryChange(gearCategory);
      setSelectedGearCategory(gearCategory);
      setSelectedGearType(gearType);
      setHighSeasArea(selectedHighSeasArea);
      setExclusiveEconomicZones(selectedExclusiveEconomicZones);
      setRfmo(selectedRfmo);
    }
  }, [editLanding, landingId]);

  useEffect(() => {
    if (!editLanding) {
      setSelectedGearCategory("");
      setSelectedGearType("");
      setHighSeasArea(undefined);
      setExclusiveEconomicZones([]);
      setRfmo("");
    }
  }, [editLanding]);

  useEffect(() => {
    const gearCategory = selectedGearCategory || values.gearCategory;
    if (gearCategory) {
      handleGearCategoryChange(gearCategory);
    } else {
      setSelectedGearType("");
      setGearTypes([]);
    }
  }, [selectedGearCategory]);

  const handleVesselSelected = () => {
    setEnableChange(false);
  };

  useEffect(() => {
    if (isActionReload && clearFormActions.includes(actionExecuted)) {
      forceUpdate();
      setCurrentProduct(values.product ?? "");
      setSelectedGearCategory("");
      setSelectedGearType("");
      setLandedDate(undefined);
      setStartDate(undefined);
      setHighSeasArea(undefined);
      setExclusiveEconomicZones([]);
      setRfmo("");
    }

    // JS only - reload page when we cancel or successfully add a landing after invoking actionData
    const shouldReload = () => !isEmpty(values) && values.reload;

    if (shouldReload()) {
      location.reload();
    }
  }, [isActionReload, actionExecuted]);

  useEffect(() => {
    if (Array.isArray(vessels)) {
      const options = vessels.slice(1);
      setVessels(options);
      setShowPrompt(options.length === 0 && !isEditing);
    }

    setLandedDate(selectedDate);
    setStartDate(selectedStartDate);

    forceUpdate();
    setCurrentProduct(initialProductValue);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [landingId]);

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  useEffect(() => {
    if (!initialProductValue) {
      setCurrentProduct("");
    }
  }, [initialProductValue]);

  useEffect(() => {
    if (isEditing && currentProduct !== initialProductValue) {
      submit({ _action: cancelActionName, productToAdd: currentProduct }, { replace: true, method: "post" });
    }
  }, [currentProduct]);

  const { productOptions, productsTableData, landingsTableData } = landingsData;
  const vesselClassName = classNames("govuk-select govuk-!-width-full", {
    "govuk-select--error": getVesselClassName(errors),
  });

  const errorKeysInOrder = [
    "yourproducts",
    "product",
    "startDate",
    "dateLanded",
    "vessel.vesselName",
    "exportWeight",
    "gearCategory",
    "gearType",
  ];
  const errorMessagesForDisplay = displayErrorMessagesInOrder(errors, errorKeysInOrder);
  const buildSelectedDate = (
    year: string,
    month: string,
    day: string,
    dateFromAction: string,
    date: string | undefined
  ) => ((year || month || day) && dateFromAction) ?? date ?? "";

  return (
    <Main
      backUrl={route("/create-catch-certificate/:documentNumber/what-are-you-exporting", {
        documentNumber,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={errorMessagesForDisplay} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div className="govuk-inset-text" id="speciesAndLandingsGuidanceMessage">
            <p>{t("ccAddSpeciesPageGuidanceMessageHeaderText", { ns: "whatAreYouExporting" })}</p>
            <ul className="govuk-list govuk-list--bullet">
              <li> {t("ccSpeciesAndLandingsGuidanceListItem1", { ns: "directLandings" })}</li>
              <li>
                {t("ccSpeciesAndLandingsGuidanceListItem2", {
                  landingLimitDaysInTheFuture: landingLimitDaysInFuture,
                })}
              </li>
              <li>{t("ccSpeciesAndLandingsGuidanceListItem3", { ns: "directLandings" })}</li>
              <li>{t("ccSpeciesAndLandingsGuidanceListItem4", { offlineValidationTime })}</li>
              <li>{t("ccSpeciesAndLandingsGuidanceListItem5", { maxAddLandingsLimit })}</li>
            </ul>
          </div>
          <Title title={t("ccAddLandingHeader")} />
          <SecureForm method="post" key={renderCounter} csrf={csrf}>
            {isEditing && <input type="hidden" name="landingId" defaultValue={landingId} />}
            {disableProductSelection && <input type="hidden" name="product" defaultValue={initialProductValue} />}
            <div className="add-landings-form">
              <div
                className={classNames("govuk-form-group", {
                  "govuk-form-group--error": errors.product,
                })}
              >
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="product">
                  {t("commonProductText", { ns: "common" })}
                </label>
                {errors.product?.message && (
                  <ErrorMessage
                    text={t(errors.product.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <select
                  className={classNames("govuk-select govuk-!-width-one-half", {
                    "govuk-select--error": errors.product?.message,
                  })}
                  name="product"
                  id="product"
                  {...(isHydrated
                    ? {
                        defaultValue: currentProduct,
                        onChange: ({ currentTarget: { value } }) => setCurrentProduct(value),
                      }
                    : { defaultValue: initialProductValue })}
                  {...(disableProductSelection && { disabled: true })}
                >
                  <option value="" id="select-a-product" aria-label="Select...">
                    {t("ccAddLandingNullOption")}
                  </option>
                  {productOptions.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <DateFieldWithPicker
                id="startDate"
                getDateSelected={getStartDate}
                dateSelected={buildSelectedDate(
                  values["startDateYear"],
                  values["startDateMonth"],
                  values["startDateDay"],
                  startDateFromAction,
                  startDate
                )}
                errors={errors?.startDate}
                label={displayOptionalSuffix ? "ccAddLandingStartDateOptionalLabel" : "ccAddLandingStartDateLabel"}
                translationNs="addLandings"
                hintText="ccAddLandingStartDateFieldHint"
                hideAddDateButton={true}
              />
              <Details
                summary={t("ccAddLandingStartDateHelpSectionLinkText", { ns: "addLandings" })}
                detailsClassName="govuk-details"
                summaryClassName="govuk-details__summary"
                detailsTextClassName="govuk-details__text"
              >
                <div>
                  <p>{t("ccAddLandingStartDateHelpSectionContent", { ns: "addLandings" })}</p>
                  <p>{t("ccAddLandingStartDateHelpSectionContentHeaderText")}</p>
                  <List type={TYPE_LIST.UNORDERED} className="govuk-list govuk-list--bullet">
                    <ListItem>{t("ccAddLandingStartDateHelpSectionGuidanceListItem1")}</ListItem>
                    <ListItem>{t("ccAddLandingStartDateHelpSectionGuidanceListItem2")}</ListItem>
                  </List>
                </div>
              </Details>
              <DateFieldWithPicker
                id="dateLanded"
                getDateSelected={getDateSelected}
                dateSelected={buildSelectedDate(
                  values["dateLandedYear"],
                  values["dateLandedMonth"],
                  values["dateLandedDay"],
                  dateFromAction,
                  landedDate
                )}
                errors={errors?.dateLanded}
                label="ccAddLandingDateLandedLabel"
                translationNs="directLandings"
                hintText="psAddHealthCertificateDateFieldHint"
              />
              <Details
                summary={t("ccAddLandingDateLandedHelpSectionLinkText", { ns: "directLandings" })}
                detailsClassName="govuk-details"
                summaryClassName="govuk-details__summary"
                detailsTextClassName="govuk-details__text"
              >
                <div>
                  <p>{t("ccAddLandingDateLandedHelpSection", { ns: "directLandings" })}</p>
                  <p>{t("ccAddLandingDateLandedHelpSectionHeader1Text", { ns: "directLandings" })}</p>
                  <List type={TYPE_LIST.UNORDERED} className="govuk-list govuk-list--bullet">
                    <ListItem>
                      {t("ccAddLandingDateLandedHelpSectionGuidanceList1Item1", { ns: "directLandings" })}
                    </ListItem>
                    <ListItem>
                      {t("ccAddLandingDateLandedHelpSectionGuidanceList1Item2", { ns: "directLandings" })}
                    </ListItem>
                  </List>
                  <p>{t("ccAddLandingDateLandedHelpSectionHeader2Text", { ns: "directLandings" })}</p>
                  <List type={TYPE_LIST.UNORDERED} className="govuk-list govuk-list--bullet">
                    <ListItem>
                      {t("ccAddLandingDateLandedHelpSectionGuidanceList2Item1", { ns: "directLandings" })}
                    </ListItem>
                    <ListItem>
                      {t("ccAddLandingDateLandedHelpSectionGuidanceList2Item2", { ns: "directLandings" })}
                    </ListItem>
                  </List>
                </div>
              </Details>
              <FaoAreaSelector
                legendTitle={t("ccAddLandingCatchAreaLabel", { ns: "directLandings" })}
                defaultValue={values.faoArea ?? (selectedFaoArea || "FAO27")}
                faoAreas={faoAreas}
              />
              <HighSeasAreasDetails
                HSALabel={t(displayOptionalSuffix ? "ccAddLandingHSAOptionalLabel" : "ccAddLandingHSALabel", {
                  ns: "directLandings",
                })}
                HSAHint={t("ccAddLandingHSAHint", { ns: "directLandings" })}
                confirmHSATypeOptions={confirmHSATypeOptions}
                highSeasArea={highSeasArea}
                setHighSeasArea={setHighSeasArea}
                getHSAOptionLabel={(option: HSAOptionType) => t(option.label, { ns: "common" })}
              />
              <AddExclusiveEconomicZoneComponent
                legendTitle={t("exclusiveZoneTitle", { ns: "addLandings" })}
                eezHint={t("eezHintText", { ns: "addLandings" })}
                addAnotherButtonText={t("ccAddLandingAddAnotherZoneButtonText", { ns: "addLandings" })}
                removeButtonText={t("ccAddLandingRemoveZoneButtonText", { ns: "addLandings" })}
                eezSelectEmptyHeader={t("ccEezSelectCountryText", { ns: "addLandings" })}
                eezHelpSectionLink={t("ccEezHelpSectionLinkText", { ns: "addLandings" })}
                eezHelpSectionContentOne={t("ccEezHelpSectionContentOne", { ns: "addLandings" })}
                eezHelpSectionContentTwo={t("ccEezHelpSectionContentTwo", { ns: "addLandings" })}
                eezHelpSectionContentThree={t("ccEezHelpSectionContentThree", { ns: "addLandings" })}
                eezHelpSectionBulletOne={t("ccEezHelpSectionBulletOne", { ns: "addLandings" })}
                eezHelpSectionBulletTwo={t("ccEezHelpSectionBulletTwo", { ns: "addLandings" })}
                eezHelpSectionBulletThree={t("ccEezHelpSectionBulletThree", { ns: "addLandings" })}
                eezHelpSectionBulletFour={t("ccEezHelpSectionBulletFour", { ns: "addLandings" })}
                eezHelpSectionContentFour={t("ccEezHelpSectionContentFour", { ns: "addLandings" })}
                eezHelpSectionContentFive={t("ccEezHelpSectionContentSix", { ns: "addLandings" })}
                availableExclusiveEconomicZones={availableExclusiveEconomicZones}
                preloadedZones={exclusiveEconomicZones.length > 0 ? exclusiveEconomicZones : []}
                onExclusiveEconomicZonesChange={handleExclusiveEconomicZonesChange}
                maximumEezPerLanding={maximumEezPerLanding}
              />
              <RfmoSelector
                rfmoHelpSectionContentFive={t("ccRfmoHelpSectionContentFive")}
                rfmoHelpSectionContentFour={t("ccRfmoHelpSectionContentFour")}
                rfmoHelpSectionContentThree={t("ccRfmoHelpSectionContentThree")}
                rfmoHelpSectionContentTwo={t("ccRfmoHelpSectionContentTwo")}
                rfmoHelpSectionContentOne={t("ccRfmoHelpSectionContentOne")}
                ccRfmoHelpSectionBulletOne={t("ccRfmoHelpSectionBulletOne")}
                ccRfmoHelpSectionBulletTwo={t("ccRfmoHelpSectionBulletTwo")}
                ccRfmoHelpSectionBulletThree={t("ccRfmoHelpSectionBulletThree")}
                ccRfmoHelpSectionBulletFour={t("ccRfmoHelpSectionBulletFour")}
                rfmoHelpSectionLink={t("ccRfmoHelpSectionLinkText")}
                rfmoNullOption={t("ccRfmoNullOption")}
                rfmoHintText={t("ccRfmoHintText")}
                optionalLabel={t("ccRfmoOptionalLabel")}
                selectedRfmo={rfmo}
                setRfmo={setRfmo}
                rfmos={rfmos}
              />
              <AutocompleteFormField
                id="vessel.vesselName"
                name="vessel"
                errorMessageText={
                  errors["vessel.vesselName"]?.message
                    ? t(errors["vessel.vesselName"].message, { ns: "errorsText" })
                    : ""
                }
                defaultValue={values.vessel ?? selectedVessel ?? ""}
                options={isHydrated ? vessels : vesselsNoJs}
                optionsId="vessel-option"
                minCharsMessage={t("ccAddVesselFormVesselQueryPrompt", { ns: "directLandings" })}
                promptMessage={promptText}
                minCharsBeforeSearch={minCharsBeforeSearch}
                promptCondition={() => {
                  if (!enableChange || isEditing) {
                    setEnableChange(true);
                  }

                  return showPrompt;
                }}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                labelText={t("ccAddLandingVesselNameLabel", { ns: "directLandings" })}
                hintText={t("ccAddLandingVesselNameHint", { ns: "directLandings" })}
                containerClassName={
                  isEmpty(errors["vessel.vesselName"])
                    ? "govuk-form-group govuk-!-width-one-half"
                    : "govuk-form-group govuk-!-width-one-half govuk-form-group--error"
                }
                selectProps={{
                  id: "select-vessel",
                  selectClassName: vesselClassName,
                }}
                inputProps={{
                  id: "vessel.vesselName",
                  className: vesselClassName,
                  "aria-describedby": "vessel.vesselName-hint",
                }}
                onChange={enableChange ? handleVesselChange : undefined}
                onSelected={handleVesselSelected}
                promptId="select-vessel-hint"
              />
              <Details
                summary={t("ccAddLandingHelpSectionLinkText", { ns: "directLandings" })}
                detailsClassName="govuk-details"
                summaryClassName="govuk-details__summary"
                detailsTextClassName="govuk-details__text"
              >
                <>
                  <p>{t("ccAddLandingHelpSectionContent", { ns: "directLandings" })}</p>
                  <p>{t("ccAddLandingHelpSectionContent2", { ns: "directLandings" })}</p>
                </>
              </Details>
              <div
                className={classNames("govuk-form-group", {
                  "govuk-form-group--error": errors.exportWeight?.message,
                })}
                id="exportWeight"
              >
                <label className="govuk-label govuk-!-font-weight-bold" htmlFor="weight">
                  {t("ccAddLandingExportWeightFieldLabel")}
                </label>
                <div className="govuk-hint">{t("ccAddLandingExportWeightFieldHint")}</div>
                {errors.exportWeight?.message && (
                  <ErrorMessage
                    text={t(errors.exportWeight.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <div className="govuk-input__wrapper">
                  <input
                    className={classNames("govuk-input govuk-input--width-10", {
                      "govuk-input--error": errors.exportWeight,
                    })}
                    id="weight"
                    name="weight"
                    type="text"
                    spellCheck="false"
                    defaultValue={values.weight ?? selectedWeight ?? ""}
                    minLength={0}
                    maxLength={16}
                    size={16}
                  />
                  <div className="govuk-input__suffix" aria-hidden="true">
                    kg
                  </div>
                </div>
              </div>
              <GearDetails
                values={values}
                gearTypeMessage={errors.gearType && t(errors.gearType.message, { ns: "errorsText" })}
                gearCategoryMessage={errors.gearCategory && t(errors.gearCategory.message, { ns: "errorsText" })}
                errors={errors}
                addLandingGearTypeLabel={t("ccAddLandingGearTypeLabel")}
                addLandingGearCategoryButton={t("ccAddLandingGearCategoryButton")}
                gearDetailsHint={t("ccAddLandingGearDetailsHint")}
                visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                landingGearCategoryLabel={t("ccAddLandingGearCategoryLabel")}
                legendTitle={t(
                  displayOptionalSuffix ? "ccAddLandingGearDetailsOptionalLabel" : "ccAddLandingGearDetailsLabel"
                )}
                groupedErrorIds={groupedErrorIds}
                addLandingGearTypeNullOption={t("ccAddLandingGearTypeNullOption")}
                addLandingGearCategoryNullOption={t("ccAddLandingGearCategoryNullOption")}
                gearType={gearType}
                gearTypes={gearTypes}
                gearCategories={gearCategories}
                setSelectedGearType={setSelectedGearType}
                setSelectedGearCategory={setSelectedGearCategory}
                selectedGearType={selectedGearType}
                selectedGearCategory={selectedGearCategory}
                isHydrated={isHydrated}
              />
              <Details
                summary={t("ccAddLandingGearDetailsHelpSectionLinkText", { ns: "addLandings" })}
                detailsClassName="govuk-details"
                summaryClassName="govuk-details__summary"
                detailsTextClassName="govuk-details__text"
              >
                <>
                  <p>{t("ccAddLandingGearDetailsHelpSectionContentOne", { ns: "addLandings" })}</p>
                  <p>{t("ccAddLandingGearDetailsHelpSectionContentTwo", { ns: "addLandings" })}</p>
                  <p>{t("ccAddLandingGearDetailsHelpSectionContentThree", { ns: "addLandings" })}</p>
                  <p>
                    <a
                      href="https://www.fao.org/cwp-on-fishery-statistics/handbook/capture-fisheries-statistics/fishing-gear-classification/en/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="govuk-link"
                    >
                      {t("ccAddLandingGearDetailsHelpSectionContentFour", { ns: "addLandings" })}
                    </a>
                  </p>
                </>
              </Details>
              <div className="govuk-button-group ">
                <Button
                  type={BUTTON_TYPE.SUBMIT}
                  name="_action"
                  label={t("commonSecondaryCancelButton", { ns: "common" })}
                  // @ts-ignore
                  value={cancelActionName}
                  className="govuk-button govuk-button--secondary"
                  id={cancelActionName}
                  data-testid={cancelActionName}
                />
                {canAddLanding && (
                  <Button
                    type={BUTTON_TYPE.SUBMIT}
                    name="_action"
                    data-module="govuk-button"
                    className="govuk-button govuk-button-primary"
                    id={addLandingActionName}
                    // @ts-ignore
                    value={addLandingActionName}
                    label={
                      editLanding
                        ? t("ccAddLandingUpdateLandingBtnLabel")
                        : t("commonAddLandingButtonText", { ns: "common" })
                    }
                    data-testid={addLandingActionName}
                  />
                )}
              </div>
            </div>
          </SecureForm>
          {canAddLanding && (
            <SecureForm method="post" csrf={csrf}>
              <div className="govuk-button-group govuk-!-margin-top-4">
                <Button
                  id="upload-product-landing"
                  label={t("ccUploadFilePageTitle", { ns: "uploadFile" })}
                  className="govuk-button"
                  type={BUTTON_TYPE.SUBMIT}
                  data-module="govuk-button"
                  name="_action"
                  //@ts-ignore
                  value="uploadProductAndLanding"
                  data-testid="upload-product-and-landing"
                />
              </div>
              <input type="hidden" name="nextUri" value={nextUri} />
            </SecureForm>
          )}
          <LandingProductTable products={productsTableData} csrf={csrf} />
          <LandingsTable landings={landingsTableData} csrf={csrf} />
          <SecureForm method="post" csrf={csrf}>
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-catch-certificate/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default AddLandings;
