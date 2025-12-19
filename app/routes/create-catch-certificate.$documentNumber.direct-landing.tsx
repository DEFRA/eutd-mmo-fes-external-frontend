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
  ImportantNotice,
  AddLandingsVesselHelpContent,
} from "~/components";
import { route } from "routes-gen";
import { useEffect, useState } from "react";
import { useHydrated } from "remix-utils/use-hydrated";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { Details } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import {
  WeightInput,
  DateFieldWithPicker,
  ButtonGroup,
  AddExclusiveEconomicZoneComponent,
  LandingHelpDetails,
} from "~/composite-components";

import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import logger from "~/logger";
import { DirectLandingsAction, DirectLandingsLoader } from "~/models";
import { faoAreas, scrollToId, isValidDate, confirmHSATypeOptions, displayErrorMessagesInOrder } from "~/helpers";
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
      {!isEmpty(errors) && (
        <ErrorSummary
          errors={displayErrorMessagesInOrder(errors, [
            "startDate",
            "dateLanded",
            "faoArea",
            "highSeasArea",
            "eez.0",
            "eez.1",
            "eez.2",
            "eez.3",
            "eez.4",
            "vessel.vesselName",
            "gearCategory",
            "gearType",
            "weight",
          ])}
        />
      )}

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
          <ImportantNotice messageKey="commonAddTripDetailsWarningContent" />
          <SecureForm method="post" noValidate csrf={csrf}>
            <div className="form-light-grey-bg govuk-!-padding-5 govuk-!-margin-bottom-5">
              <DateFieldWithPicker
                id="startDate"
                name="startDate"
                errors={errors?.startDate}
                dateSelected={selectedStartDate}
                getDateSelected={() => {}}
                label={t("ccAddStartDateOfTripLabel")}
                translationNs="directLandings"
                hintText="psAddHealthCertificateDateFieldHint"
              />
              <LandingHelpDetails
                namespace="addLandings"
                headerKey="ccAddLandingStartDateHelpSectionLinkText"
                firstLineKey="ccAddLandingStartDateHelpSectionContent"
                secondLineKey="ccAddLandingStartDateHelpSectionContentHeaderText"
                listItemKeys={[
                  "ccAddLandingStartDateHelpSectionGuidanceListItem1",
                  "ccAddLandingStartDateHelpSectionGuidanceListItem2",
                ]}
              />
              <DateFieldWithPicker
                id="dateLanded"
                name="dateLanded"
                errors={errors?.dateLanded}
                dateSelected={selectedDate}
                getDateSelected={getDateSelected}
                label="ccAddLandingDateLandedLabel"
                translationNs="directLandings"
                hintText="psAddHealthCertificateDateFieldHint"
              />
              <LandingHelpDetails
                namespace="directLandings"
                headerKey="ccAddLandingDateLandedHelpSectionLinkText"
                firstLineKey="ccAddLandingDateLandedHelpSection"
                secondLineKey="ccAddLandingDateLandedHelpSectionHeader1Text"
                listItemKeys={[
                  "ccAddLandingDateLandedHelpSectionGuidanceList1Item1",
                  "ccAddLandingDateLandedHelpSectionGuidanceList1Item2",
                ]}
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
                HSALabel={t("ccAddLandingHSALabel", { ns: "directLandings" })}
                HSAHint={t("ccAddLandingHSAHint", { ns: "directLandings" })}
                confirmHSATypeOptions={confirmHSATypeOptions}
                errors={errors?.highSeasArea}
              />
              <AddExclusiveEconomicZoneComponent
                availableExclusiveEconomicZones={availableExclusiveEconomicZones}
                preloadedZones={exclusiveEconomicZones.length > 0 ? exclusiveEconomicZones : []}
                onExclusiveEconomicZonesChange={handleExclusiveEconomicZonesChange}
                maximumEezPerLanding={maximumEezPerLanding}
                legendTitle={t("ccEEZZoneTitle", { ns: "directLandings" })}
                eezHint={t("eezHintText", { ns: "addLandings" })}
                eezHelpSectionContentThreeLink={t("ccEezHelpSectionContentThreeLink", { ns: "addLandings" })}
                addAnotherButtonText={t("ccAddLandingAddAnotherZoneButtonText", { ns: "addLandings" })}
                removeButtonText={t("ccAddLandingRemoveZoneButtonText", { ns: "addLandings" })}
                eezSelectEmptyHeader={t("ccEezSelectCountryText", { ns: "addLandings" })}
                eezHelpSectionLink={t("ccEezHelpSectionLinkText", { ns: "addLandings" })}
                eezHelpSectionContentOne={t("ccEezHelpSectionContentOne", { ns: "addLandings" })}
                eezHelpSectionContentTwo={t("ccEezHelpSectionContentTwo", { ns: "addLandings" })}
                errors={errors}
              />
              <RfmoSelector
                rfmos={rfmos}
                selectedRfmo={rfmo}
                setRfmo={setRfmo}
                optionalLabel={t("ccRfmoOptionalLabel")}
                rfmoHintText={t("ccRfmoHintText")}
                rfmoNullOption={t("ccRfmoNullOption")}
                rfmoHelpSectionLink={t("ccRfmoHelpSectionLinkText")}
                rfmoHelpSectionContentOne={t("ccRfmoHelpSectionContentOne")}
                rfmoHelpSectionContentTwoLink={t("ccRfmoHelpSectionContentTwoLink")}
              />
              <AutocompleteFormField
                id="vessel.vesselName"
                name="vessel"
                errorMessageText={getVesselErrorText()}
                defaultValue={values?.vessels ?? vesselSelected ?? ""}
                labelText={t("ccAddLandingVesselNameLabel")}
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
              <AddLandingsVesselHelpContent />
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
                legendTitle={t("ccAddLandingGearDetailsLabel")}
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
                  <p>
                    <a
                      href="https://www.gov.uk/government/publications/eu-iuu-regulation-2026-changes-guidance/gear-type"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="govuk-link govuk-link--no-visited-state"
                    >
                      {t("ccAddLandingGearDetailsHelpSectionContentFourLink")}
                    </a>
                  </p>
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
