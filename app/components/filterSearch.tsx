import React, { useRef } from "react";

type FilterSearchProps = {
  label: string;
  hint?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  searchButtonLabel?: string;
  resetButtonLabel?: string;
};

export const FilterSearch = ({
  label,
  hint,
  name = "q",
  id,
  placeholder = "",
  defaultValue = "",
  searchButtonLabel,
  resetButtonLabel,
}: FilterSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id ?? `${name}-filter`;
  const hintId = `${inputId}-hint`;

  const handleReset = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="govuk-form-group">
      <label className="govuk-label govuk-!-font-weight-bold" htmlFor={inputId}>
        {label}
      </label>

      {hint ? (
        <div id={hintId} className="govuk-hint">
          {hint}
        </div>
      ) : null}

      <div className="govuk-grid-row" style={{ alignItems: "end" }}>
        <div className="govuk-grid-column-one-half">
          <input
            ref={inputRef}
            className="govuk-input"
            id={inputId}
            name={name}
            defaultValue={defaultValue}
            placeholder={placeholder}
            aria-describedby={hint ? hintId : undefined}
            type="search"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="submit"
              name="actionType"
              value="search"
              className="govuk-button"
              data-testid="filter-search-submit"
            >
              {searchButtonLabel}
            </button>
            <button
              type="submit"
              name="actionType"
              value="reset"
              className="govuk-button govuk-button--secondary"
              data-testid="filter-search-reset"
              onClick={handleReset}
            >
              {resetButtonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSearch;
