import { HighSeasAreasGuidance } from "~/composite-components/highSeasAreasGuidance";
import type { HighSeasAreaType, HSAOptionType } from "~/types";

type HighSeasAreaDetailsProps = {
  HSALabel: string;
  HSAHint: string;
  confirmHSATypeOptions: HSAOptionType[];
  highSeasArea: HighSeasAreaType;
  setHighSeasArea: (value: React.SetStateAction<HighSeasAreaType>) => void;
  getHSAOptionLabel: (option: HSAOptionType) => string;
};

export const HighSeasAreasDetails = ({
  HSALabel,
  HSAHint,
  confirmHSATypeOptions,
  highSeasArea,
  setHighSeasArea,
  getHSAOptionLabel,
}: HighSeasAreaDetailsProps) => (
  <>
    <div className="govuk-form-group">
      <fieldset className="govuk-fieldset">
        <legend className="govuk-fieldset__heading">
          <b>{HSALabel}</b>
        </legend>
        <div id="highSeasArea-hint" className="govuk-hint">
          {HSAHint}
        </div>
        <div className="govuk-radios govuk-radios--inline">
          {confirmHSATypeOptions.map((option: HSAOptionType) => (
            <div key={option.id} className="govuk-radios__item">
              <input
                id={option.id}
                type="radio"
                name="highSeasArea"
                className="govuk-radios__input"
                value={option.value}
                defaultChecked={option.value === highSeasArea}
                onChange={(e) => setHighSeasArea(e.target.value as HighSeasAreaType)}
                aria-describedby="highSeasArea-hint"
              />
              <label htmlFor={option.id} className="govuk-label govuk-radios__label">
                {getHSAOptionLabel(option)}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
    <HighSeasAreasGuidance />
  </>
);
