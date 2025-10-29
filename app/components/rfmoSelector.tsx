import { Details } from "@capgeminiuk/dcx-react-library";
import type { Dispatch, SetStateAction } from "react";

type rfmoSelectorProps = {
  rfmos: string[];
  selectedRfmo: string;
  setRfmo: Dispatch<SetStateAction<string>>;
  optionalLabel: string;
  rfmoHintText: string;
  rfmoNullOption: string;
  rfmoHelpSectionLink: string;
  rfmoHelpSectionContentOne: string;
  rfmoHelpSectionContentTwo: string;
  rfmoHelpSectionContentThree: string;
  rfmoHelpSectionContentFour: string;
  rfmoHelpSectionContentFive: string;
  ccRfmoHelpSectionBulletOne: string;
  ccRfmoHelpSectionBulletTwo: string;
  ccRfmoHelpSectionBulletThree: string;
  ccRfmoHelpSectionBulletFour: string;
};

export const RfmoSelector = ({
  rfmos,
  selectedRfmo,
  setRfmo,
  optionalLabel,
  rfmoHintText,
  rfmoNullOption,
  rfmoHelpSectionLink,
  rfmoHelpSectionContentOne,
  rfmoHelpSectionContentTwo,
  rfmoHelpSectionContentThree,
  rfmoHelpSectionContentFour,
  rfmoHelpSectionContentFive,
  ccRfmoHelpSectionBulletOne,
  ccRfmoHelpSectionBulletTwo,
  ccRfmoHelpSectionBulletThree,
  ccRfmoHelpSectionBulletFour,
}: rfmoSelectorProps) => (
  <>
    <label htmlFor="rfmo" className="govuk-label govuk-!-font-weight-bold">
      {optionalLabel}
    </label>
    <div className="govuk-hint">{rfmoHintText}</div>
    <div className="govuk-form-group">
      <div className="govuk-button-group">
        <select
          name="rfmo"
          id="rfmo"
          className="govuk-select govuk-!-width-one-half"
          defaultValue={selectedRfmo}
          onChange={(e) => setRfmo(e.target.value)}
        >
          <option value="" selected aria-label={rfmoNullOption}>
            {rfmoNullOption}
          </option>
          {rfmos.map((rfmo) => (
            <option key={rfmo} value={rfmo} selected={rfmo === selectedRfmo}>
              {rfmo}
            </option>
          ))}
        </select>
      </div>
      <Details
        summary={rfmoHelpSectionLink}
        detailsClassName="govuk-details"
        summaryClassName="govuk-details__summary"
        detailsTextClassName="govuk-details__text"
      >
        <>
          <p>{rfmoHelpSectionContentOne}</p>
          <p>{rfmoHelpSectionContentTwo}</p>
          <ul className="govuk-list govuk-list--bullet">
            <li key={ccRfmoHelpSectionBulletOne}>{ccRfmoHelpSectionBulletOne}</li>
            <li key={ccRfmoHelpSectionBulletTwo}>{ccRfmoHelpSectionBulletTwo}</li>
            <li key={ccRfmoHelpSectionBulletThree}>{ccRfmoHelpSectionBulletThree}</li>
            <li key={ccRfmoHelpSectionBulletFour}>{ccRfmoHelpSectionBulletFour}</li>
          </ul>
          <p>{rfmoHelpSectionContentThree}</p>
          <p>{rfmoHelpSectionContentFour}</p>
          <p>
            <a
              href="https://www.fao.org/in-action/vulnerable-marine-ecosystems/background/regional-fishery-bodies/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link"
            >
              {rfmoHelpSectionContentFive}
            </a>
          </p>
        </>
      </Details>
    </div>
  </>
);
