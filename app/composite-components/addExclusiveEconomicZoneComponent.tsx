import { useEffect, useState } from "react";
import { Button, BUTTON_TYPE, Details } from "@capgeminiuk/dcx-react-library";
import type { ICountry } from "~/types";
import { AutocompleteFormField } from "~/components";
import classNames from "classnames";

type ExclusiveEconomicZoneProps = {
  legendTitle: string;
  addAnotherButtonText: string;
  eezSelectEmptyHeader: string;
  eezHelpSectionLink: string;
  eezHelpSectionContentOne: string;
  eezHelpSectionContentTwo: string;
  eezHelpSectionContentThree: string;
  eezHelpSectionContentFour: string;
  eezHelpSectionContentFive: string;
  eezHelpSectionBulletOne: string;
  eezHelpSectionBulletTwo: string;
  eezHelpSectionBulletThree: string;
  eezHelpSectionBulletFour: string;
  eezHint: string;
  removeButtonText: string;
  preloadedZones?: string[];
  availableExclusiveEconomicZones: ICountry[];
  onExclusiveEconomicZonesChange: (zones: string[]) => void;
  maximumEezPerLanding: number;
};

export const AddExclusiveEconomicZoneComponent = ({
  legendTitle,
  addAnotherButtonText,
  eezSelectEmptyHeader,
  eezHelpSectionLink,
  eezHelpSectionContentOne,
  eezHelpSectionContentTwo,
  eezHelpSectionContentThree,
  eezHelpSectionContentFour,
  eezHelpSectionContentFive,
  eezHelpSectionBulletOne,
  eezHelpSectionBulletTwo,
  eezHelpSectionBulletThree,
  eezHelpSectionBulletFour,
  eezHint,
  removeButtonText,
  availableExclusiveEconomicZones,
  preloadedZones,
  onExclusiveEconomicZonesChange,
  maximumEezPerLanding,
}: ExclusiveEconomicZoneProps) => {
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
      onClick={() => onClick(index)} // PLEASE REMOVE THIS AS IT WILL NOT WORK IN NO-JS
    />
  );

  const showRemoveZoneButton = (exclusiveZones: string[], index: number) =>
    index === exclusiveZones.length - 1 && exclusiveZones.length > 1
      ? showButton("remove-zone-button", index, handleRemoveLastZone, removeButtonText)
      : null;

  return (
    <div>
      {exclusiveEconomicZones.map((zone: string, index: number) => (
        <>
          <div className="govuk-button-group">
            <AutocompleteFormField
              containerClassName={classNames("govuk-!-width-one-half govuk-!-margin-right-3")}
              options={[...availableExclusiveEconomicZones.map((c: ICountry) => c.officialCountryName)]}
              optionsId="eez-option"
              errorMessageText={""}
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
                selectClassName: classNames("govuk-select"),
              }}
              inputProps={{
                className: classNames("govuk-input"),
                "aria-describedby": "eez-0-hint",
                "aria-label": legendTitle,
                placeholder: eezSelectEmptyHeader,
              }}
            />
            {showRemoveZoneButton(exclusiveEconomicZones, index)}
          </div>
          {showAddZoneButton(exclusiveEconomicZones, index)}
        </>
      ))}
      <Details
        summary={eezHelpSectionLink}
        detailsClassName="govuk-details"
        summaryClassName="govuk-details__summary"
        detailsTextClassName="govuk-details__text"
      >
        <div>
          <p>{eezHelpSectionContentOne}</p>
          <p>{eezHelpSectionContentTwo}</p>
          <p>{eezHelpSectionContentThree}</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>{eezHelpSectionBulletOne}</li>
            <li>{eezHelpSectionBulletTwo}</li>
            <li>{eezHelpSectionBulletThree}</li>
            <li>{eezHelpSectionBulletFour}</li>
          </ul>
          <p>{eezHelpSectionContentFour}</p>
          <p>
            <a
              href="https://www.britannica.com/topic/exclusive-economic-zone"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link"
            >
              {eezHelpSectionContentFive}
            </a>
          </p>
        </div>
      </Details>
    </div>
  );
};
