type foaAreaSelectorProps = {
  legendTitle: string;
  defaultValue: string;
  faoAreas: string[];
};

export const FaoAreaSelector = ({ legendTitle, defaultValue, faoAreas }: foaAreaSelectorProps) => (
  <>
    <label className="govuk-label govuk-fieldset__heading" htmlFor="select-faoArea">
      <b>{legendTitle}</b>
    </label>
    <div className="govuk-form-group">
      <select
        className="govuk-select govuk-!-width-one-third"
        id="select-faoArea"
        name="faoArea"
        defaultValue={defaultValue}
        style={{ backgroundColor: "white" }}
      >
        {faoAreas.map((area) => (
          <option key={`fao-${area}`} id={"faoArea_" + area} value={area}>
            {area}
          </option>
        ))}
      </select>
    </div>
  </>
);
