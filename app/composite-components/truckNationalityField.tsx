import { AutoCompleteErrorPosition } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames";
import type { ICountry, IErrorsTransformed } from "~/types";
import { AutocompleteFormField } from "~/components";

interface TruckNationalityFieldProps {
  nationalityOfVehicle?: string | null;
  errors: IErrorsTransformed;
  countries: ICountry[];
  t: (key: string, options?: any) => string;
  optionsId?: string;
  labelKey?: string;
  hintKey?: string;
  minCharsBeforeSearch?: number;
}

export const TruckNationalityField = ({
  nationalityOfVehicle,
  errors,
  countries,
  t,
  optionsId = "truck-nationality-option",
  labelKey = "addTransportationDetailsTruckNationality",
  hintKey = "addTransportationDetailsTruckNationalityHint",
  minCharsBeforeSearch,
}: TruckNationalityFieldProps) => (
  <AutocompleteFormField
    containerClassName={classNames("govuk-form-group govuk-!-width-one-half", {
      "govuk-form-group--error": errors?.nationalityOfVehicle,
    })}
    options={["", ...countries.map((c: ICountry) => c.officialCountryName)]}
    optionsId={optionsId}
    id="nationalityOfVehicle"
    name="nationalityOfVehicle"
    defaultValue={nationalityOfVehicle ?? ""}
    labelText={t(labelKey)}
    errorPosition={AutoCompleteErrorPosition.AFTER_LABEL}
    errorMessageText={t(errors?.nationalityOfVehicle?.message, { ns: "errorsText" })}
    hintText={t(hintKey)}
    minCharsBeforeSearch={minCharsBeforeSearch}
    selectProps={{
      id: "nationalityOfVehicle-select",
      selectClassName: classNames("govuk-select", {
        "govuk-select--error": errors?.nationalityOfVehicle,
      }),
    }}
    inputProps={{
      className: classNames("govuk-input", {
        "govuk-input--error": errors?.nationalityOfVehicle,
      }),
      "aria-describedby": "nationalityOfVehicle-hint",
    }}
  />
);
