import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { AutocompleteFormField } from "~/components";
import type { ICountry } from "~/types";

type ExportDestinationFieldProps = {
  countries: ICountry[];
  errors?: any;
  formData: any;
  exportLocation?: any;
  labelKey: string;
  hintKey: string;
  namespace?: string;
};

export const ExportDestinationField = ({
  countries,
  errors,
  formData,
  exportLocation,
  labelKey,
  hintKey,
  namespace = "common",
}: ExportDestinationFieldProps) => {
  const { t } = useTranslation(["common", "errorsText", namespace]);

  return (
    <AutocompleteFormField
      containerClassName={classNames("govuk-form-group govuk-!-width-two-thirds ", {
        "govuk-form-group--error": errors?.exportDestination,
      })}
      options={["", ...countries.map((c: ICountry) => c.officialCountryName)]}
      optionsId="country-option"
      errorMessageText={t(errors?.exportDestination?.message, { ns: "errorsText" })}
      id="exportDestination"
      name="exportedTo"
      defaultValue={formData.exportedTo === "" ? "" : exportLocation?.exportedTo?.officialCountryName ?? ""}
      labelText={t(labelKey, namespace === "common" ? {} : { ns: namespace })}
      hintText={t(hintKey, namespace === "common" ? {} : { ns: namespace })}
      selectProps={{
        id: "exportDestination",
        selectClassName: classNames("govuk-select", {
          "govuk-select--error": errors?.exportDestination,
        }),
      }}
      inputProps={{
        className: classNames("govuk-input", {
          "govuk-input--error": errors?.exportDestination,
        }),
        "aria-describedby": "exportDestination-hint",
      }}
    />
  );
};
