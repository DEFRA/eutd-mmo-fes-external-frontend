import { Button, BUTTON_TYPE, ErrorPosition, FormInput } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";
import type { ICountry, IErrorsTransformed, ILookUpAddressDetails, Journey } from "~/types";
import { AutocompleteFormField, SecureForm } from "~/components";
import classNames from "classnames/bind";
import {
  getBuildingName,
  getBuildingNumber,
  getCity,
  getCounty,
  getPostcode,
  getPostcodeAddress,
  getStreetName,
  getSubBuildingName,
} from "~/helpers";

type AddAddressFormProps = {
  postcodeaddress?: ILookUpAddressDetails;
  errors: IErrorsTransformed;
  countries: ICountry[];
  journey?: Journey;
  actionUri?: string;
  csrf: string;
};

export const AddAddressForm = ({
  postcodeaddress,
  errors,
  countries,
  journey,
  actionUri,
  csrf,
}: AddAddressFormProps) => {
  const { t } = useTranslation("common");
  const selectedCountry = getPostcodeAddress(postcodeaddress);
  return (
    <SecureForm method="post" action={actionUri} csrf={csrf}>
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          <FormInput
            inputProps={{
              defaultValue: getBuildingNumber(postcodeaddress),
              id: "buildingNumber",
            }}
            label={t("commonWhatExportersAddressBuildingNumber")}
            labelClassName="govuk-label govuk-!-font-weight-bold"
            containerClassName="govuk-form-group"
            inputClassName={classNames("govuk-input govuk-input--width-10", {
              "govuk-input--error": errors?.buildingNumber,
            })}
            type="text"
            name="buildingNumber"
            errorProps={{ className: !isEmpty(errors?.buildingNumber) ? "govuk-error-message" : "" }}
            staticErrorMessage={t(errors?.buildingNumber?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={!isEmpty(errors?.buildingNumber) ? "govuk-form-group--error" : ""}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          <FormInput
            label={t("commonWhatExportersAddressBuildingName")}
            labelClassName="govuk-label govuk-!-font-weight-bold"
            containerClassName="govuk-form-group"
            inputClassName={classNames("govuk-input govuk-input--width-20", {
              "govuk-input--error": errors?.buildingName,
            })}
            type="text"
            name="buildingName"
            inputProps={{
              defaultValue: getBuildingName(postcodeaddress),
              id: "buildingName",
            }}
            errorProps={{ className: !isEmpty(errors?.buildingName) ? "govuk-error-message" : "" }}
            staticErrorMessage={t(errors?.buildingName?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={!isEmpty(errors?.buildingName) ? "govuk-form-group--error" : ""}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          <FormInput
            data-cy="subBuildingName"
            label={t("commonWhatExportersAddressSubBuildingName")}
            labelClassName="govuk-!-font-weight-bold"
            containerClassName="govuk-form-group"
            inputClassName={classNames("govuk-input govuk-input--width-20", {
              "govuk-input--error": errors?.subBuildingName,
            })}
            type="text"
            name="subBuildingName"
            inputProps={{
              defaultValue: getSubBuildingName(postcodeaddress),
              id: "subBuildingName",
              "aria-describedby": "hint-subBuildingName",
            }}
            hint={{
              id: "hint-subBuildingName",
              position: "above",
              text: `${t("commonWhatExportersAddressSubBuildingNameHint")}`,
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
            errorProps={{ className: !isEmpty(errors?.subBuildingName) ? "govuk-error-message" : "" }}
            staticErrorMessage={t(errors?.subBuildingName?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={!isEmpty(errors?.subBuildingName) ? "govuk-form-group--error" : ""}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          <FormInput
            label={t("commonWhatExportersAddressStreetName")}
            labelClassName="govuk-label govuk-!-font-weight-bold"
            containerClassName="govuk-form-group"
            inputClassName={classNames("govuk-input govuk-input--width-20", {
              "govuk-input--error": errors?.streetName,
            })}
            type="text"
            name="streetName"
            inputProps={{
              defaultValue: getStreetName(postcodeaddress),
              id: "streetName",
            }}
            errorProps={{ className: !isEmpty(errors?.streetName) ? "govuk-error-message" : "" }}
            staticErrorMessage={t(errors?.streetName?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={!isEmpty(errors?.streetName) ? "govuk-form-group--error" : ""}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          <FormInput
            label={t("commonWhatExportersAddressTownOrCity")}
            labelClassName="govuk-label govuk-!-font-weight-bold"
            containerClassName="govuk-form-group"
            inputClassName={classNames("govuk-input govuk-input--width-20", {
              "govuk-input--error": errors?.townCity,
            })}
            type="text"
            name="townCity"
            inputProps={{
              defaultValue: getCity(postcodeaddress),
              id: "townCity",
            }}
            errorProps={{ className: !isEmpty(errors?.townCity) ? "govuk-error-message" : "" }}
            staticErrorMessage={t(errors?.townCity?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={!isEmpty(errors?.townCity) ? "govuk-form-group--error" : ""}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          <FormInput
            label={t("commonWhatExportersAddressCountyStateProvince")}
            labelClassName="govuk-label govuk-!-font-weight-bold"
            containerClassName="govuk-form-group"
            inputClassName={classNames("govuk-input govuk-input--width-20", {
              "govuk-input--error": errors?.county,
            })}
            type="text"
            name="county"
            inputProps={{
              defaultValue: getCounty(postcodeaddress),
              id: "county",
            }}
            errorProps={{ className: !isEmpty(errors?.county) ? "govuk-error-message" : "" }}
            staticErrorMessage={t(errors?.county?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={!isEmpty(errors?.county) ? "govuk-form-group--error" : ""}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          <FormInput
            label={t("commonWhatExportersAddressPostcode")}
            labelClassName="govuk-label govuk-!-font-weight-bold"
            containerClassName="govuk-form-group"
            inputClassName={classNames("govuk-input govuk-input--width-10", {
              "govuk-input--error": errors?.postcode,
            })}
            type="text"
            name="postcode"
            inputProps={{
              defaultValue: getPostcode(postcodeaddress),
              id: "postcode",
            }}
            errorProps={{ className: !isEmpty(errors?.postcode) ? "govuk-error-message" : "" }}
            staticErrorMessage={t(errors?.postcode?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={!isEmpty(errors?.postcode) ? "govuk-form-group--error" : ""}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          <AutocompleteFormField
            containerClassName={classNames("govuk-form-group govuk-input--width-20", {
              "govuk-form-group--error": errors?.country,
            })}
            options={[selectedCountry, ...countries.map((c) => c.officialCountryName)]}
            errorMessageText={t(errors?.country?.message, { ns: "errorsText" })}
            id="country"
            name="country"
            optionsId="country-option"
            defaultValue={selectedCountry}
            labelClassName="govuk-!-font-weight-bold"
            labelText={t("commonWhatExportersAddressCountry")}
            selectProps={{
              id: "country",
              selectClassName: classNames("govuk-select", {
                "govuk-select--error": errors?.country,
              }),
            }}
            inputProps={{
              id: "country",
              className: classNames("govuk-input", {
                "govuk-input--error": errors?.country,
              }),
            }}
          />
        </div>
      </div>
      <div className="govuk-button-group">
        <Button
          id="cancel"
          type={BUTTON_TYPE.SUBMIT}
          name="_action"
          label={t("commonSecondaryCancelButton")}
          //@ts-ignore
          value="cancelManualAddress"
          className="govuk-button govuk-button--secondary"
          data-testid="cancel"
        />
        <Button
          id="continue"
          type={BUTTON_TYPE.SUBMIT}
          name="_action"
          label={t("commonContinueButtonContinueButtonText")}
          //@ts-ignore
          value="continueManualAddress"
          className="govuk-button"
          data-testid="continue"
        />
      </div>
      <input type="hidden" name="journey" value={journey} />
    </SecureForm>
  );
};
