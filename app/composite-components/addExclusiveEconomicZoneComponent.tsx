import { Button, BUTTON_TYPE, Details } from "@capgeminiuk/dcx-react-library";
import type { ICountry, IError, IErrorsTransformed } from "~/types";
import { useEffect, useState } from "react";
import { AutocompleteFormField } from "~/components";
import classNames from "classnames";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";

type ExclusiveEconomicZoneProps = {
  legendTitle: string;
  addAnotherButtonText: string;
  eezSelectEmptyHeader: string;
  eezHelpSectionLink: string;
  eezHelpSectionContentOne: string;
  eezHelpSectionContentTwo: string;
  eezHelpSectionContentThreeLink: string;
  eezHint: string;
  removeButtonText: string;
  preloadedZones?: string[];
  availableExclusiveEconomicZones: ICountry[];
  onExclusiveEconomicZonesChange: (zones: string[]) => void;
  maximumEezPerLanding: number;
  errors?: IErrorsTransformed;
};

export const AddExclusiveEconomicZoneComponent = ({
  legendTitle,
  addAnotherButtonText,
  eezSelectEmptyHeader,
  eezHelpSectionLink,
  eezHelpSectionContentOne,
  eezHelpSectionContentTwo,
  eezHelpSectionContentThreeLink,
  eezHint,
  removeButtonText,
  availableExclusiveEconomicZones,
  preloadedZones,
  onExclusiveEconomicZonesChange,
  maximumEezPerLanding,
  errors,
}: ExclusiveEconomicZoneProps) => {
  const { t } = useTranslation("errorsText");
  const mapPreloadedExclusiveEconomicZones = (zones?: string[]) => {
    if (!zones || zones.length === 0) return ["zone-1"];
    return zones.map((_, index) => `zone-${index + 1}`);
  };
  const handlePreloadedZones = (zones: string[] | undefined) => {
    if (!zones || zones.length === 0) return {};
    return zones.reduce(
      (acc: Record<string, string>, zone: string, index: number) => {
        acc[`zone-${index + 1}`] = zone;
        return acc;
      },
      {} as { [key: string]: string }
    );
  };
  const [exclusiveEconomicZones, setExclusiveEconomicZones] = useState<Array<string>>(
    mapPreloadedExclusiveEconomicZones(preloadedZones)
  );
  const [selectedExclusiveEconomicZones, setSelectedExclusiveEconomicZones] = useState<{ [key: string]: string }>(
    handlePreloadedZones(preloadedZones)
  );

  useEffect(() => {
    const selectedZoneValues = exclusiveEconomicZones.map((zone: string) => selectedExclusiveEconomicZones[zone] || "");
    onExclusiveEconomicZonesChange(selectedZoneValues);
  }, [exclusiveEconomicZones, selectedExclusiveEconomicZones]);

  const handleAddZone = () => {
    setExclusiveEconomicZones((prev) => [...prev, `zone-${exclusiveEconomicZones.length + 1}`]);
  };

  const handleRemoveLastZone = (index: number) => {
    setExclusiveEconomicZones((prev) => [...prev.slice(0, -1)]);
    const updatedSelectedZones = { ...selectedExclusiveEconomicZones };
    delete updatedSelectedZones[`zone-${index + 1}`];
    setSelectedExclusiveEconomicZones(updatedSelectedZones);
  };

  const showAddZoneButton = (exclusiveZones: string[], index: number) =>
    index === exclusiveZones.length - 1 && exclusiveZones.length < maximumEezPerLanding
      ? showButton("add-zone-button", index, handleAddZone, addAnotherButtonText)
      : null;

  const showButton = (id: string, index: number, onClick: Function, buttonText: string, buttonValue?: string) => (
    <Button
      key={`showButton-${id}-${index}`}
      id={id}
      label={buttonText}
      className="govuk-button govuk-button--secondary"
      type={BUTTON_TYPE.SUBMIT}
      data-module="govuk-button"
      name="_action"
      //@ts-ignore
      value={id}
      data-testid={`${buttonValue}-${id}`}
      {...(id === "remove-zone-button" && { style: { top: "15px" } })}
      onClick={() => onClick(index)} // PLEASE REMOVE THIS AS IT WILL NOT WORK IN NO-JS
    />
  );

  const showRemoveZoneButton = (exclusiveZones: string[], index: number) =>
    index === exclusiveZones.length - 1 && exclusiveZones.length > 1
      ? showButton("remove-zone-button", index, handleRemoveLastZone, removeButtonText)
      : null;

  // Get error for a specific index
  const getErrorForIndex = (index: number): IError | undefined => {
    if (!errors) return undefined;

    const eezErrorKey = `eez.${index}`;
    if (errors[eezErrorKey]) {
      return errors[eezErrorKey];
    }

    return undefined;
  };

  return (
    <div>
      {exclusiveEconomicZones.map((zone: string, index: number) => {
        const errorForIndex = getErrorForIndex(index);
        return (
          <>
            <div
              className={`${isEmpty(errorForIndex) ? "govuk-button-group" : "govuk-button-group govuk-form-group--error"}`}
              style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}
            >
              <AutocompleteFormField
                containerClassName={classNames("govuk-!-width-one-half govuk-!-margin-right-3")}
                options={[...availableExclusiveEconomicZones.map((c: ICountry) => c.officialCountryName)]}
                optionsId="eez-option"
                errorMessageText={
                  errorForIndex ? t(errorForIndex.message, { ns: "errorsText", ...(errorForIndex.value ?? {}) }) : ""
                }
                id={`eez-${index}`}
                name={`eez-${index}`}
                onSelected={(value) => {
                  setSelectedExclusiveEconomicZones({ ...selectedExclusiveEconomicZones, [zone]: value });
                }}
                defaultValue={selectedExclusiveEconomicZones[zone] ?? ""}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                labelText={index === 0 ? legendTitle : undefined}
                hintText={index === 0 ? eezHint : undefined}
                selectProps={{
                  id: `eez-${index}`,
                  selectClassName: classNames("govuk-select", {
                    "govuk-select--error": !isEmpty(errorForIndex),
                  }),
                }}
                inputProps={{
                  className: classNames("govuk-input", {
                    "govuk-input--error": !isEmpty(errorForIndex),
                  }),
                  "aria-describedby": "eez-0-hint",
                  "aria-label": legendTitle,
                  placeholder: eezSelectEmptyHeader,
                }}
              />
              {showRemoveZoneButton(exclusiveEconomicZones, index)}
            </div>
            {showAddZoneButton(exclusiveEconomicZones, index)}
          </>
        );
      })}
      <Details
        summary={eezHelpSectionLink}
        detailsClassName="govuk-details"
        summaryClassName="govuk-details__summary"
        detailsTextClassName="govuk-details__text"
      >
        <div>
          <p>{eezHelpSectionContentOne}</p>
          <p>{eezHelpSectionContentTwo}</p>
          <p>
            <a
              href="https://www.gov.uk/government/publications/eu-iuu-regulation-2026-changes-guidance/fishing-area#exclusive-economic-zone-eez"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link govuk-link--no-visited-state"
            >
              {eezHelpSectionContentThreeLink}
            </a>
          </p>
        </div>
      </Details>
    </div>
  );
};
