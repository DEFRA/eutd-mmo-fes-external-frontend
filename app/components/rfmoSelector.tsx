import { Details } from "@capgeminiuk/dcx-react-library";
import type { Dispatch, SetStateAction } from "react";

// Safe HTML tag stripper with input validation
const stripHtmlTags = (input: string): string => {
  if (!input || typeof input !== "string") return "";
  // Limit input length to prevent potential DoS
  const maxLength = 10000;
  const safeInput = input.length > maxLength ? input.substring(0, maxLength) : input;

  // Use a character-by-character approach to avoid regex backtracking
  let result = "";
  let inTag = false;

  for (const char of safeInput) {
    if (char === "<") {
      inTag = true;
    } else if (char === ">") {
      inTag = false;
    } else if (!inTag) {
      result += char;
    }
  }

  return result;
};

type rfmoSelectorProps = {
  rfmos: string[];
  selectedRfmo: string;
  setRfmo: Dispatch<SetStateAction<string>>;
  optionalLabel: string;
  rfmoHintText: string;
  rfmoNullOption: string;
  ccRfmoNullOptionAriaLabel: string;
  rfmoHelpSectionLink: string;
  rfmoHelpSectionContentOne: string;
  rfmoHelpSectionContentTwoLink: string;
};

export const RfmoSelector = ({
  rfmos,
  selectedRfmo,
  setRfmo,
  optionalLabel,
  rfmoHintText,
  rfmoNullOption,
  ccRfmoNullOptionAriaLabel,
  rfmoHelpSectionLink,
  rfmoHelpSectionContentOne,
  rfmoHelpSectionContentTwoLink,
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
          <option value="" selected aria-label={ccRfmoNullOptionAriaLabel}>
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
        summary={stripHtmlTags(rfmoHelpSectionLink)}
        detailsClassName="govuk-details"
        summaryClassName="govuk-details__summary"
        detailsTextClassName="govuk-details__text"
      >
        <>
          <p dangerouslySetInnerHTML={{ __html: rfmoHelpSectionContentOne }} />
          <p>
            <a
              href="https://www.gov.uk/government/publications/eu-iuu-regulation-2026-changes-guidance/fishing-area#rfmo"
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-link govuk-link--no-visited-state"
              dangerouslySetInnerHTML={{ __html: rfmoHelpSectionContentTwoLink }}
            />
          </p>
        </>
      </Details>
    </div>
  </>
);
