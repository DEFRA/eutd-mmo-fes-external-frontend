import * as React from "react";
import {
  Main,
  Title,
  AutocompleteFormField,
  BackToProgressLink,
  ErrorSummary,
  SecureForm,
  GearDetails,
  RfmoSelector,
  HighSeasAreasDetails,
  FaoAreaSelector,
} from "~/components";
import { route } from "routes-gen";
import { useEffect, useState } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { Details } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import classNames from "classnames/bind";
import {
  WeightInput,
  DateFieldWithPicker,
  ButtonGroup,
  AddExclusiveEconomicZoneComponent,
} from "~/composite-components";

import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import logger from "~/logger";
import { DirectLandingsAction, DirectLandingsLoader } from "~/models";
import { faoAreas, displayErrorTransformedMessages, scrollToId, isValidDate, confirmHSATypeOptions } from "~/helpers";
import type {
  IDirectLandingsDetails,
  IErrorsTransformed,
  WeightDetails,
  IGearType,
  HSAOptionType,
  HighSeasAreaType,
  ICountry,
} from "~/types";

type LoaderDataProps = {
  documentNumber: string;
  landingLimitDaysInFuture: string;
  selectedStartDate?: string;
  selectedDate: string;
  getAllVesselNames: any;
  directLandings: any;
  vesselSelected: string;
  nextUri: string;
  totalWeight: number;
  minCharsBeforeSearch: number;
  displayOptionalSuffix?: boolean;
  gearCategories: string[];
  selectedGearCategory?: string;
  selectedGearType?: string;
  fallbackGearTypes: IGearType[];
  csrf: string;
  selectedHighSeasArea?: HighSeasAreaType;
  rfmos: string[];
  selectedRfmo?: string;
  availableExclusiveEconomicZones: ICountry[];
  selectedExclusiveEconomicZones: ICountry[];
  maximumEezPerLanding: number;
  isAddAnotherEEZButtonClicked: boolean;
  faoArea: string;
};

export const loader: LoaderFunction = async ({ params, request }) => DirectLandingsLoader(params, request);

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  DirectLandingsAction(params, request);

const getSelectedEEZCountryNames = (selectedExclusiveEconomicZones: ICountry[]) => {
  if (!Array.isArray(selectedExclusiveEconomicZones) || selectedExclusiveEconomicZones.length === 0) {
    return [];
  }

  return selectedExclusiveEconomicZones.map((zone) => zone.officialCountryName);
};

const DirectLanding = () => {
  const {
    documentNumber,
    landingLimitDaysInFuture,
    selectedStartDate,
    selectedDate,
    selectedGearCategory,
    selectedGearType,
    getAllVesselNames,
    directLandings,
    vesselSelected,
    nextUri,
    totalWeight,
    minCharsBeforeSearch,
    displayOptionalSuffix,
    gearCategories,
    fallbackGearTypes,
    csrf,
    selectedHighSeasArea,
    rfmos,
    selectedRfmo,
    availableExclusiveEconomicZones,
    selectedExclusiveEconomicZones,
    maximumEezPerLanding,
    isAddAnotherEEZButtonClicked,
    faoArea,
  } = useLoaderData<LoaderDataProps>();
  const {
    values,
    errors = {},
    groupedErrorIds = {},
  } = useActionData<{ values: any; errors: IErrorsTransformed; groupedErrorIds: Record<string, string[]> }>() ?? {};

  const [vessels, setVessels] = useState<string[]>([]);
  const [exportWeights, setExportWeights] = useState<{ exportWeight: number }[]>(
    Array.isArray(directLandings?.weights)
      ? directLandings?.weights.map((weight: IDirectLandingsDetails) => ({
          exportWeight:
            weight.exportWeight !== undefined && weight.exportWeight !== null && !isNaN(parseFloat(weight.exportWeight))
              ? weight.exportWeight
              : 0,
        }))
      : []
  );

  const { t } = useTranslation("directLandings");
  const isHydrated = useHydrated();
  const [promptText, setPromptText] = useState<string | undefined>(t("ccAddVesselFormVesselDateQueryPrompt"));
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [calculatedWeight, setCalculatedWeight] = useState(totalWeight);
  const [landedDate, setLandedDate] = useState<string>(selectedDate);
  const [searchTerm, setSearchTerm] = useState<string>(vesselSelected);
  const [enableChange, setEnableChange] = useState<boolean>(vesselSelected === undefined);
  const [gearCategory, setGearCategory] = useState<string>(selectedGearCategory ?? "");
  const [gearType, setGearType] = useState<string>(selectedGearType ?? "");
  const [gearTypes, setGearTypes] = useState<IGearType[]>(fallbackGearTypes ?? []);
  const [highSeasArea, setHighSeasArea] = useState<HighSeasAreaType>(selectedHighSeasArea);
  const [rfmo, setRfmo] = useState<string>(selectedRfmo ?? "");

  let selctedEEZCountries: string[] = [];

  selctedEEZCountries = getSelectedEEZCountryNames(selectedExclusiveEconomicZones);

  if (!isHydrated && isAddAnotherEEZButtonClicked && selctedEEZCountries.length !== maximumEezPerLanding) {
    selctedEEZCountries.push(" ");
  }

  const [exclusiveEconomicZones, setExclusiveEconomicZones] = useState<string[]>(selctedEEZCountries ?? []);

  const handleExclusiveEconomicZonesChange = (updatedExclusiveEconomicZones: string[]) => {
    setExclusiveEconomicZones(updatedExclusiveEconomicZones);
  };

  // vessel input
  const getVesselErrorText = () => {
    const error = errors?.["vessel.vesselName"]?.message ?? "";
    return isEmpty(error) ? "" : t(error, { ns: "errorsText" });
  };

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  useEffect(() => {
    const getVessels = async (): Promise<void> => {
      if (searchTerm.length < minCharsBeforeSearch) {
        return;
      }

      try {
        const response = await fetch(`/get-vessels?search=${searchTerm}&date=${landedDate}`);
        const vessels: string[] = await response.json();
        setVessels(vessels ?? []);
      } catch (e) {
        logger.info(`[DIRECT-LANDING][GET-VESSEL-JS][LOADER][ERROR]`);
        if (e instanceof Error) {
          logger.error(e);
        }

        setVessels([]);
      }
    };

    getVessels();
  }, [searchTerm]);

  useScrollOnPageLoad();

  const getDateSelected = (date: string) => {
    setLandedDate(date);
    setPromptText(
      isValidDate(date, ["YYYY-M-D", "YYYY-MM-DD"])
        ? t("ccAddVesselFormVesselQueryPrompt")
        : t("ccAddVesselFormVesselDateQueryPrompt")
    );
    setShowPrompt(!isValidDate(date, ["YYYY-M-D", "YYYY-MM-DD"]));
    setVessels([]);
  };

  const getTotalWeight = (weightDetail: WeightDetails) => {
    const weightDetailIndex = parseInt(weightDetail?.id.split(".")[1]);

    if (!isNaN(weightDetailIndex)) {
      const totalWeights: { exportWeight: number }[] = Array.isArray(exportWeights)
        ? exportWeights.map((weight: { exportWeight: number }, index: number) => {
            if (index === weightDetailIndex) {
              return {
                exportWeight: weightDetail.value,
              };
            }

            return {
              exportWeight: weight.exportWeight,
            };
          })
        : [];

      setCalculatedWeight(
        totalWeights.reduce(
          (curr: number, acc: { exportWeight: number }) => (isNaN(acc.exportWeight) ? curr : curr + acc.exportWeight),
          0
        )
      );
      setExportWeights(totalWeights);
    }
  };

  const handleVesselChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleVesselSelected = () => {
    setEnableChange(false);
  };

  const handleGearCategoryChange = async (gearCategory: string) => {
    try {
      const response: Response = await fetch(`/get-gear-types?gearCategory=${gearCategory}`);
      const data: IGearType[] = await response.json();

      setGearTypes(data);
    } catch (e) {
      logger.info(`[DIRECT-LANDING][GET-GEAR-TYPES-JS][LOADER][ERROR]`);
      if (e instanceof Error) {
        logger.error(e);
      }
      setGearTypes([]);
    }
  };

  useEffect(() => {
    const searchTerm = gearCategory ?? values?.gearCategory;
    if (searchTerm) {
      handleGearCategoryChange(searchTerm);
    } else {
      setGearType("");
      setGearTypes([]);
    }
  }, [gearCategory]);

  const getOptions = () => {
    if (isHydrated) {
      return vessels;
    } else if (!isEmpty(getAllVesselNames) && getAllVesselNames?.length > 0) {
      return ["", ...getAllVesselNames];
    } else {
      return [""];
    }
  };

  const normalize = (s?: string | null) => (s?.trim() === "" ? undefined : s);

  const faoValue = normalize(faoArea) ?? normalize(directLandings?.faoArea) ?? "FAO27";

  return (
    <Main
      backUrl={route("/create-catch-certificate/:documentNumber/what-are-you-exporting", {
        documentNumber,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div className="govuk-inset-text" id="directLandingsGuidanceMessage">
            <p>{t("ccAddSpeciesPageGuidanceMessageHeaderText", { ns: "whatAreYouExporting" })}</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>{t("ccSpeciesAndLandingsGuidanceListItem1")}</li>
              <li>
                {t("ccSpeciesAndLandingsGuidanceListItem2", { landingLimitDaysInTheFuture: landingLimitDaysInFuture })}
              </li>
              <li>{t("ccSpeciesAndLandingsGuidanceListItem3")}</li>
            </ul>
          </div>
          <Title title={t("ccDirectLandingAddYourLandingTitle")} />
          <SecureForm method="post" noValidate csrf={csrf}>
            <div className="add-landings-form">
              <DateFieldWithPicker
                id="startDate"
                errors={errors?.startDate}
                dateSelected={selectedStartDate}
                getDateSelected={() => {}}
                label={displayOptionalSuffix ? "ccAddStartDateOfTripOptionalLabel" : "ccAddStartDateOfTripLabel"}
                translationNs="directLandings"
                hintText="psAddHealthCertificateDateFieldHint"
                hideAddDateButton={true}
              />
              <Details
                summary={t("ccAddLandingStartDateHelpSectionLinkText", { ns: "addLandings" })}
                detailsClassName="govuk-details"
                summaryClassName="govuk-details__summary"
                detailsTextClassName="govuk-details__text"
              >
                <p>{t("ccAddLandingStartDateHelpSectionContent", { ns: "addLandings" })}</p>
              </Details>
              <DateFieldWithPicker
                id="dateLanded"
                errors={errors?.dateLanded}
                dateSelected={selectedDate}
                getDateSelected={getDateSelected}
                label="ccAddLandingDateLandedLabel"
                translationNs="directLandings"
                hintText="psAddHealthCertificateDateFieldHint"
              />
              <FaoAreaSelector
                legendTitle={t("ccAddLandingCatchAreaLabel")}
                defaultValue={faoValue}
                faoAreas={faoAreas}
              />
              <HighSeasAreasDetails
                highSeasArea={highSeasArea}
                setHighSeasArea={setHighSeasArea}
                getHSAOptionLabel={(option: HSAOptionType) => t(option.label, { ns: "common" })}
                HSALabel={t(displayOptionalSuffix ? "ccAddLandingHSAOptionalLabel" : "ccAddLandingHSALabel", {
                  ns: "directLandings",
                })}
                HSAHint={t("ccAddLandingHSAHint", { ns: "directLandings" })}
                confirmHSATypeOptions={confirmHSATypeOptions}
              />
              <AddExclusiveEconomicZoneComponent
                availableExclusiveEconomicZones={availableExclusiveEconomicZones}
                preloadedZones={exclusiveEconomicZones.length > 0 ? exclusiveEconomicZones : []}
                onExclusiveEconomicZonesChange={handleExclusiveEconomicZonesChange}
                maximumEezPerLanding={maximumEezPerLanding}
                legendTitle={t("exclusiveZoneTitle", { ns: "addLandings" })}
                eezHint={t("eezHintText", { ns: "addLandings" })}
                eezHelpSectionBulletOne={t("ccEezHelpSectionBulletOne", { ns: "addLandings" })}
                eezHelpSectionBulletTwo={t("ccEezHelpSectionBulletTwo", { ns: "addLandings" })}
                eezHelpSectionBulletThree={t("ccEezHelpSectionBulletThree", { ns: "addLandings" })}
                eezHelpSectionBulletFour={t("ccEezHelpSectionBulletFour", { ns: "addLandings" })}
                eezHelpSectionContentFour={t("ccEezHelpSectionContentFour", { ns: "addLandings" })}
                eezHelpSectionContentFive={t("ccEezHelpSectionContentSix", { ns: "addLandings" })}
                addAnotherButtonText={t("ccAddLandingAddAnotherZoneButtonText", { ns: "addLandings" })}
                removeButtonText={t("ccAddLandingRemoveZoneButtonText", { ns: "addLandings" })}
                eezSelectEmptyHeader={t("ccEezSelectCountryText", { ns: "addLandings" })}
                eezHelpSectionLink={t("ccEezHelpSectionLinkText", { ns: "addLandings" })}
                eezHelpSectionContentOne={t("ccEezHelpSectionContentOne", { ns: "addLandings" })}
                eezHelpSectionContentTwo={t("ccEezHelpSectionContentTwo", { ns: "addLandings" })}
                eezHelpSectionContentThree={t("ccEezHelpSectionContentThree", { ns: "addLandings" })}
              />
              <RfmoSelector
                rfmos={rfmos}
                selectedRfmo={rfmo}
                setRfmo={setRfmo}
                optionalLabel={t("ccRfmoOptionalLabel")}
                rfmoHintText={t("ccRfmoHintText")}
                rfmoNullOption={t("ccRfmoNullOption")}
                rfmoHelpSectionLink={t("ccRfmoHelpSectionLinkText")}
                ccRfmoHelpSectionBulletFour={t("ccRfmoHelpSectionBulletFour")}
                ccRfmoHelpSectionBulletThree={t("ccRfmoHelpSectionBulletThree")}
                ccRfmoHelpSectionBulletTwo={t("ccRfmoHelpSectionBulletTwo")}
                ccRfmoHelpSectionBulletOne={t("ccRfmoHelpSectionBulletOne")}
                rfmoHelpSectionContentOne={t("ccRfmoHelpSectionContentOne")}
                rfmoHelpSectionContentTwo={t("ccRfmoHelpSectionContentTwo")}
                rfmoHelpSectionContentThree={t("ccRfmoHelpSectionContentThree")}
                rfmoHelpSectionContentFour={t("ccRfmoHelpSectionContentFour")}
                rfmoHelpSectionContentFive={t("ccRfmoHelpSectionContentFive")}
              />
              <AutocompleteFormField
                id="vessel.vesselName"
                name="vessel"
                errorMessageText={getVesselErrorText()}
                defaultValue={values?.vessels ?? vesselSelected ?? ""}
                labelText={t("ccAddLandingVesselNameLabel")}
                labelClassName="govuk-!-font-weight-bold"
                hintText={t("ccAddLandingVesselNameHint", { ns: "directLandings" })}
                options={getOptions()}
                optionsId="vessel-name-option"
                promptMessage={promptText}
                minCharsMessage={t("ccAddVesselFormVesselQueryPrompt")}
                minCharsBeforeSearch={minCharsBeforeSearch}
                promptCondition={() => {
                  if (!enableChange) {
                    setEnableChange(true);
                  }
                  return showPrompt;
                }}
                containerClassName={classNames("govuk-form-group", "govuk-!-width-one-half", {
                  "govuk-form-group--error": !isEmpty(errors["vessel.vesselName"]),
                })}
                selectProps={{
                  selectClassName: classNames("govuk-select", {
                    "govuk-select--error": !isEmpty(errors["vessel.vesselName"]),
                  }),
                }}
                inputProps={{
                  className: classNames("govuk-input", {
                    "govuk-input--error": !isEmpty(errors["vessel.vesselName"]),
                  }),
                }}
                onChange={enableChange ? handleVesselChange : undefined}
                onSelected={handleVesselSelected}
              />
              <Details
                summary={t("ccAddLandingHelpSectionLinkText")}
                detailsClassName="govuk-details"
                summaryClassName="govuk-details__summary"
                detailsTextClassName="govuk-details__text"
              >
                <p>{t("ccAddLandingHelpSectionContent")}</p>
              </Details>
              <GearDetails
                isHydrated={isHydrated}
                selectedGearCategory={gearCategory}
                selectedGearType={gearType}
                setSelectedGearCategory={setGearCategory}
                setSelectedGearType={setGearType}
                gearCategories={gearCategories}
                gearTypes={fallbackGearTypes ?? gearTypes}
                gearType={selectedGearType ?? ""}
                addLandingGearCategoryNullOption={t("ccAddLandingGearCategoryNullOption")}
                addLandingGearTypeNullOption={t("ccAddLandingGearTypeNullOption")}
                groupedErrorIds={groupedErrorIds}
                legendTitle={t(
                  displayOptionalSuffix ? "ccAddLandingGearDetailsOptionalLabel" : "ccAddLandingGearDetailsLabel"
                )}
                landingGearCategoryLabel={t("ccAddLandingGearCategoryLabel")}
                visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                gearDetailsHint={t("ccAddLandingGearDetailsHint")}
                addLandingGearCategoryButton={t("ccDirectLandingGearCategoryButton")}
                addLandingGearTypeLabel={t("ccAddLandingGearTypeLabel")}
                errors={errors}
                gearCategoryMessage={errors.gearCategory && t(errors.gearCategory.message, { ns: "errorsText" })}
                gearTypeMessage={errors.gearType && t(errors.gearType.message, { ns: "errorsText" })}
                values={values}
              />
              <Details
                summary={t("ccAddLandingGearDetailsHelpSectionLinkText")}
                detailsClassName="govuk-details"
                summaryClassName="govuk-details__summary"
                detailsTextClassName="govuk-details__text"
              >
                <>
                  <p>{t("ccAddLandingGearDetailsHelpSectionContentOne")}</p>
                  <p>{t("ccAddLandingGearDetailsHelpSectionContentTwo")}</p>
                  <p>{t("ccAddLandingGearDetailsHelpSectionContentThree")}</p>
                </>
              </Details>
            </div>
            <h2>{t("ccAddLandingProductWeightHeader")}</h2>
            <table className="govuk-table" id="yourproducts">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header table-adjust-font">
                    {t("ccAddLandingProductLabel")}
                  </th>
                  <th scope="col" className="govuk-table__header table-adjust-font">
                    {t("ccAddLandingExportWeightFieldLabel")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {directLandings?.weights.map((landings: IDirectLandingsDetails, index: number) => (
                  <tr className="govuk-table__row" key={`directlanding-${landings.speciesId}`}>
                    <td className="govuk-table__cell tablerowuserref table-adjust-font">{landings.speciesLabel}</td>
                    <td className="govuk-table__cell">
                      <WeightInput
                        id="weight"
                        unit="kg"
                        errors={errors}
                        formValue={values?.[`weight-${landings?.speciesId}`]}
                        speciesId={landings?.speciesId}
                        index={index}
                        exportWeight={isEmpty(values) ? landings?.exportWeight?.toString() : ""}
                        totalWeight={getTotalWeight}
                      />
                    </td>
                  </tr>
                ))}
                <tr className="govuk-table__row">
                  <td className="govuk-table__cell">
                    <strong>{t("ccAddLandingTotalExportWeight")}</strong>
                  </td>
                  <td className="govuk-table__cell">
                    <strong>{calculatedWeight?.toFixed(2)}kg</strong>
                  </td>
                </tr>
              </tbody>
            </table>
            <ButtonGroup />
            <BackToProgressLink
              progressUri="/create-catch-certificate/:documentNumber/progress"
              documentNumber={documentNumber}
            />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
        </div>
      </div>
    </Main>
  );
};

export default DirectLanding;
