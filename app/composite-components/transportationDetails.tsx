import moment from "moment";
import { ErrorPosition, FormInput } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames/bind";
import isEmpty from "lodash/isEmpty";
import capitalize from "lodash/capitalize";
import { useTranslation } from "react-i18next";
import type { ICountry, IErrorsTransformed, ITransport } from "~/types";
import { DateFieldWithPicker } from "./dateFieldWithPicker";
import { ContainerIdentificationNumber } from "~/composite-components";
import { AutocompleteFormField, Title } from "~/components";
import {
  getContainerErrorClassName,
  getErrorMessageClassName,
  getFlagStateClassName,
  getFlagStateContainerClassName,
  getVesselNameClassName,
  getVesselNameContainerClassName,
} from "~/helpers";

export const TransportationModeDetails = ({
  legendTitle,
  vehicle,
  vesselName,
  flagState,
  flightNumber,
  containerNumber,
  nationalityOfVehicle,
  registrationNumber,
  railwayBillNumber,
  departurePlace,
  freightBillNumber,
  displayOptionalSuffix,
  errors,
}: ITransport & { legendTitle?: string; errors: IErrorsTransformed; displayOptionalSuffix?: boolean }) => {
  const { t } = useTranslation("transportation");

  return (
    <>
      {legendTitle && (
        <legend>
          <Title title={legendTitle} />
        </legend>
      )}
      {vehicle === "containerVessel" && (
        <FormInput
          containerClassName="govuk-form-group govuk-!-width-one-half"
          label={t("addTransportationDetailsVesselNameText")}
          name="vesselName"
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.vesselName,
          })}
          inputProps={{
            defaultValue: vesselName,
            id: "vesselName",
          }}
          errorProps={{ className: getVesselNameClassName(errors) }}
          staticErrorMessage={t(errors?.vesselName?.message, { ns: "errorsText" })}
          errorPosition={ErrorPosition.AFTER_LABEL}
          containerClassNameError={getVesselNameContainerClassName(errors)}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        />
      )}
      {vehicle === "containerVessel" && (
        <FormInput
          containerClassName="govuk-form-group govuk-!-width-one-half"
          label={t("addTransportationDetailsFlagStateText")}
          name="flagState"
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.flagState,
          })}
          inputProps={{
            defaultValue: flagState,
            id: "flagState",
          }}
          errorProps={{ className: getFlagStateClassName(errors) }}
          staticErrorMessage={t(errors?.flagState?.message, { ns: "errorsText" })}
          errorPosition={ErrorPosition.AFTER_LABEL}
          containerClassNameError={getFlagStateContainerClassName(errors)}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        />
      )}
      {vehicle === "plane" && (
        <FormInput
          containerClassName="govuk-form-group govuk-!-width-one-half"
          label={t("addTransportationDetailsFlightnumber")}
          name="flightNumber"
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.flightNumber,
          })}
          inputProps={{
            defaultValue: flightNumber,
            id: "flightNumber",
          }}
          errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.flightNumber)) }}
          staticErrorMessage={t(errors?.flightNumber?.message, { ns: "errorsText" })}
          errorPosition={ErrorPosition.AFTER_LABEL}
          containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.flightNumber))}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        />
      )}
      {(vehicle === "containerVessel" || vehicle === "plane") && (
        <FormInput
          containerClassName="govuk-form-group"
          label={t("addTransportationDetailsContainerIdentificationText")}
          name="containerNumber"
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.containerNumber,
          })}
          inputProps={{
            defaultValue: containerNumber,
            id: "containerNumber",
          }}
          errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.containerNumber)) }}
          staticErrorMessage={t(errors?.containerNumber?.message, { ns: "errorsText" })}
          errorPosition={ErrorPosition.AFTER_LABEL}
          containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.containerNumber))}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        />
      )}
      {vehicle === "truck" && (
        <FormInput
          containerClassName="govuk-form-group  govuk-!-width-one-half"
          label={t("addTransportationDetailsTruckNationality")}
          name="nationalityOfVehicle"
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.nationalityOfVehicle,
          })}
          inputProps={{
            defaultValue: nationalityOfVehicle,
            id: "nationalityOfVehicle",
          }}
          errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.nationalityOfVehicle)) }}
          staticErrorMessage={t(errors?.nationalityOfVehicle?.message, { ns: "errorsText" })}
          errorPosition={ErrorPosition.AFTER_LABEL}
          containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.nationalityOfVehicle))}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        />
      )}
      {vehicle === "truck" && (
        <FormInput
          containerClassName="govuk-form-group  govuk-!-width-one-half"
          label={t("addTransportationDetailsRegistrationNumber")}
          name="registrationNumber"
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.registrationNumber,
          })}
          inputProps={{
            defaultValue: registrationNumber,
            id: "registrationNumber",
          }}
          errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.registrationNumber)) }}
          staticErrorMessage={t(errors?.registrationNumber?.message, { ns: "errorsText" })}
          errorPosition={ErrorPosition.AFTER_LABEL}
          containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.registrationNumber))}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        />
      )}
      {vehicle === "train" && (
        <FormInput
          containerClassName="govuk-form-group govuk-!-width-one-half"
          label={t("addTransportationDetailsRailwayBillNumber")}
          name="railwayBillNumber"
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.railwayBillNumber,
          })}
          inputProps={{
            defaultValue: railwayBillNumber,
            id: "railwayBillNumber",
          }}
          errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.railwayBillNumber)) }}
          staticErrorMessage={t(errors?.railwayBillNumber?.message, { ns: "errorsText" })}
          errorPosition={ErrorPosition.AFTER_LABEL}
          containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.railwayBillNumber))}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        />
      )}
      <FormInput
        containerClassName="govuk-form-group govuk-!-width-one-half"
        label={t("addTransportationDetailsPlaceExportLeavesUK")}
        name="departurePlace"
        type="text"
        inputClassName={classNames("govuk-input", {
          "govuk-input--error": errors?.departurePlace,
        })}
        inputProps={{
          defaultValue: departurePlace ?? "",
          id: "departurePlace",
          "aria-describedby": "hint-departurePlace",
        }}
        hint={{
          id: "hint-departurePlace",
          position: "above",
          text: t("addTransportationDetailsForExampleHint"),
          className: "govuk-hint govuk-!-margin-bottom-0",
        }}
        errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.departurePlace)) }}
        staticErrorMessage={t(errors?.departurePlace?.message, { ns: "errorsText" })}
        errorPosition={ErrorPosition.AFTER_LABEL}
        containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.departurePlace))}
        hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
        hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
      />
      <FormInput
        name="freightBillNumber"
        type="text"
        inputClassName={classNames("govuk-input", {
          "govuk-input--error": errors?.freightBillNumber,
        })}
        inputProps={{
          defaultValue: freightBillNumber ?? "",
          id: "freightBillNumber",
          "aria-describedby": "hint-freightBillNumber",
        }}
        errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.freightBillNumber)) }}
        staticErrorMessage={t(errors?.freightBillNumber?.message, { ns: "errorsText" })}
        errorPosition={ErrorPosition.AFTER_LABEL}
        containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.freightBillNumber))}
        hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
        hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        containerClassName="govuk-form-group govuk-!-width-one-half"
        label={
          displayOptionalSuffix
            ? t("addTransportationDetailsFreightBillNumberOptional")
            : t("addTransportationDetailsFreightBillNumber")
        }
        hint={{
          id: "hint-freightBillNumber",
          position: "above",
          text: t("addTransportationDetailsFreightBillNumberHint"),
          className: "govuk-hint govuk-!-margin-bottom-0",
        }}
      />
    </>
  );
};

export const TransportationDetails = ({
  vehicle,
  vesselName,
  flagState,
  flightNumber,
  containerNumbers,
  nationalityOfVehicle,
  registrationNumber,
  airwayBillNumber,
  railwayBillNumber,
  departurePlace,
  exportedTo,
  freightBillNumber,
  errors,
  exportDate,
  legendTitle,
  countries,
  formData,
  displayOptionalSuffix,
}: ITransport & {
  legendTitle?: string;
  errors: IErrorsTransformed;
  countries: ICountry[];
  formData: any;
  displayOptionalSuffix?: boolean;
}) => {
  const { t } = useTranslation("transportation");

  return (
    <fieldset className="govuk-fieldset">
      {legendTitle && (
        <legend>
          <Title title={legendTitle} />
        </legend>
      )}
      <AutocompleteFormField
        containerClassName={classNames("govuk-form-group govuk-!-width-one-half", {
          "govuk-form-group--error": errors?.exportedTo,
        })}
        options={["", ...countries.map((c: ICountry) => c.officialCountryName)]}
        optionsId="country-option"
        errorMessageText={t(errors?.exportedTo?.message, { ns: "errorsText" })}
        id="exportedTo"
        name="exportedTo"
        defaultValue={formData.exportedTo === "" ? "" : exportedTo?.officialCountryName ?? ""}
        labelText={t("addConsignmentDestination")}
        hintText={t("addConsignmentDestinationHint")}
        selectProps={{
          id: "consignmentDestination",
          selectClassName: classNames("govuk-select", {
            "govuk-select--error": errors?.exportedTo,
          }),
        }}
        inputProps={{
          className: classNames("govuk-input", {
            "govuk-input--error": errors?.exportedTo,
          }),
          "aria-describedby": "exportedTo-hint",
        }}
        labelClassName="govuk-!-font-weight-bold"
      />
      <FormInput
        containerClassName="govuk-form-group govuk-!-width-one-half"
        label={t(`addTransportationDetailsPlaceExportLeavesUK${capitalize(vehicle)}`)}
        name="departurePlace"
        type="text"
        inputClassName={classNames("govuk-input", {
          "govuk-input--error": errors?.departurePlace,
        })}
        inputProps={{
          defaultValue: departurePlace ?? "",
          id: "departurePlace",
          "aria-describedby": "hint-departurePlace",
        }}
        hint={{
          id: "hint-departurePlace",
          position: "above",
          text: t(`addTransportationDetailsPlaceExportLeavesUK${capitalize(vehicle)}Hint`),
          className: "govuk-hint govuk-!-margin-bottom-0",
        }}
        errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.departurePlace)) }}
        staticErrorMessage={t(errors?.departurePlace?.message, { ns: "errorsText" })}
        errorPosition={ErrorPosition.AFTER_LABEL}
        containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.departurePlace))}
        hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
        hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        labelClassName="govuk-!-font-weight-bold"
      />
      <DateFieldWithPicker
        id="exportDate"
        getDateSelected={() => {}}
        dateSelected={moment(exportDate, ["DD/MM/YYYY", "YYYY-MM-DD", "D/M/YYYY", "YYYY-M-D"]).format("YYYY-MM-DD")}
        errors={errors?.exportDate}
        label={`addTransportationDetailsExportDate${capitalize(vehicle)}`}
        hintText="addTransportationArrivalDetailsDepartureDateHint"
        translationNs="transportation"
        labelStyle="bold"
        hideAddDateButton={true}
      />
      {vehicle === "plane" && (
        <FormInput
          containerClassName="govuk-form-group  govuk-!-width-one-half"
          label={
            displayOptionalSuffix
              ? t("addTransportationDetailsAirwayBillNumberOptional")
              : t("addTransportationDetailsAirwayBillNumber")
          }
          name="airwayBillNumber"
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.airwayBillNumber,
          })}
          inputProps={{
            defaultValue: airwayBillNumber,
            id: "airwayBillNumber",
          }}
          hint={{
            id: "hint-airwayBillNumber",
            position: "above",
            text: t("addTransportationDetailsAirwayBillNumberHint"),
            className: "govuk-hint govuk-!-margin-bottom-0",
          }}
          labelClassName="govuk-!-font-weight-bold"
          staticErrorMessage={t(errors?.airwayBillNumber?.message, { ns: "errorsText" })}
          errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.airwayBillNumber)) }}
          containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.airwayBillNumber))}
          errorPosition={ErrorPosition.AFTER_LABEL}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
        />
      )}
      {vehicle === "containerVessel" && (
        <>
          <FormInput
            label={t("addTransportationDetailsVesselNameText")}
            labelClassName="govuk-!-font-weight-bold"
            containerClassName="govuk-form-group govuk-!-width-one-half"
            type="text"
            hint={{
              id: "hint-vesselName",
              position: "above",
              text: t("addTransportationDetailsVesselNameNumberHint"),
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
            name="vesselName"
            inputClassName={classNames("govuk-input", {
              "govuk-input--error": errors?.vesselName,
            })}
            inputProps={{
              defaultValue: vesselName,
              id: "vesselName",
            }}
            errorProps={{ className: getVesselNameClassName(errors) }}
            errorPosition={ErrorPosition.AFTER_LABEL}
            staticErrorMessage={t(errors?.vesselName?.message, { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
            containerClassNameError={getVesselNameContainerClassName(errors)}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          />
          <FormInput
            label={t("addTransportationDetailsFlagStateText")}
            containerClassName="govuk-form-group govuk-!-width-one-half"
            name="flagState"
            type="text"
            inputProps={{
              id: "flagState",
              defaultValue: flagState,
            }}
            inputClassName={classNames("govuk-input", {
              "govuk-input--error": errors?.flagState,
            })}
            errorProps={{ className: getFlagStateClassName(errors) }}
            hint={{
              id: "hint-flagState",
              position: "above",
              text: t("addTransportationDetailsFlagStateNumberHint"),
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
            labelClassName="govuk-!-font-weight-bold"
            errorPosition={ErrorPosition.AFTER_LABEL}
            staticErrorMessage={t(errors?.flagState?.message, { ns: "errorsText" })}
            containerClassNameError={getFlagStateContainerClassName(errors)}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          />
        </>
      )}
      {vehicle === "plane" && (
        <FormInput
          label={t("addTransportationDetailsFlightnumber")}
          containerClassName="govuk-form-group govuk-!-width-one-half"
          name="flightNumber"
          labelClassName="govuk-!-font-weight-bold"
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.flightNumber,
          })}
          inputProps={{
            id: "flightNumber",
            defaultValue: flightNumber,
          }}
          staticErrorMessage={t(errors?.flightNumber?.message, { ns: "errorsText" })}
          errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.flightNumber)) }}
          containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.flightNumber))}
          errorPosition={ErrorPosition.AFTER_LABEL}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hint={{
            id: "hint-flightNumber",
            position: "above",
            text: t("addTransportationDetailsFlightNumberHint"),
            className: "govuk-hint govuk-!-margin-bottom-0",
          }}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        />
      )}
      {(vehicle === "containerVessel" || vehicle === "plane") && (
        <ContainerIdentificationNumber containers={containerNumbers} maximumContainers={5} errors={errors} />
      )}
      {vehicle === "truck" && (
        <>
          <AutocompleteFormField
            containerClassName={classNames("govuk-form-group govuk-!-width-one-half", {
              "govuk-form-group--error": errors?.nationalityOfVehicle,
            })}
            options={["", ...countries.map((c) => c.officialCountryName)]}
            optionsId="country-option"
            errorMessageText={t(errors?.nationalityOfVehicle?.message, { ns: "errorsText" })}
            id="nationalityOfVehicle"
            name="nationalityOfVehicle"
            labelText={t("addTransportationDetailsTruckNationality")}
            labelClassName="govuk-label govuk-!-font-weight-bold"
            hintText={t("addTransportationArrivalDetailsTruckNationalityHint")}
            defaultValue={nationalityOfVehicle ?? ""}
            selectProps={{
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
          <FormInput
            type="text"
            label={t("addTransportationDetailsRegistrationNumber")}
            name="registrationNumber"
            inputProps={{
              defaultValue: registrationNumber,
              id: "registrationNumber",
            }}
            errorPosition={ErrorPosition.AFTER_LABEL}
            inputClassName={classNames("govuk-input", {
              "govuk-input--error": errors?.registrationNumber,
            })}
            errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.registrationNumber)) }}
            staticErrorMessage={t(errors?.registrationNumber?.message, { ns: "errorsText" })}
            containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.registrationNumber))}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
            containerClassName="govuk-form-group  govuk-!-width-one-half"
            labelClassName="govuk-!-font-weight-bold"
            hint={{
              id: "hint-registrationNumber",
              position: "above",
              text: t("addTransportationArrivalDetailsRegistrationNumberHint"),
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
          />
        </>
      )}
      {vehicle === "train" && (
        <FormInput
          name="railwayBillNumber"
          label={t("addTransportationDetailsRailwayBillNumber")}
          type="text"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.railwayBillNumber,
          })}
          inputProps={{
            defaultValue: railwayBillNumber,
            id: "railwayBillNumber",
          }}
          staticErrorMessage={t(errors?.railwayBillNumber?.message, { ns: "errorsText" })}
          errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.railwayBillNumber)) }}
          containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.railwayBillNumber))}
          errorPosition={ErrorPosition.AFTER_LABEL}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          containerClassName="govuk-form-group govuk-!-width-one-half"
          labelClassName="govuk-!-font-weight-bold"
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hint={{
            id: "hint-railBillNumber",
            position: "above",
            text: t("addTransportationArrivalDetailsRailwayBillNumberHint"),
            className: "govuk-hint govuk-!-margin-bottom-0",
          }}
        />
      )}
      <FormInput
        containerClassName="govuk-form-group govuk-!-width-one-half"
        name="freightBillNumber"
        type="text"
        inputClassName={classNames("govuk-input", {
          "govuk-input--error": errors?.freightBillNumber,
        })}
        inputProps={{
          defaultValue: freightBillNumber ?? "",
          id: "freightBillNumber",
          "aria-describedby": "hint-freightBillNumber",
        }}
        hint={{
          id: "hint-freightBillNumber",
          position: "above",
          text: t("addTransportationDetailsFreightBillNumberHint"),
          className: "govuk-hint govuk-!-margin-bottom-0",
        }}
        label={
          displayOptionalSuffix
            ? t("addTransportationDetailsFreightBillNumberOptional")
            : t("addTransportationDetailsFreightBillNumber")
        }
        errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.freightBillNumber)) }}
        staticErrorMessage={t(errors?.freightBillNumber?.message, { ns: "errorsText" })}
        errorPosition={ErrorPosition.AFTER_LABEL}
        containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.freightBillNumber))}
        hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
        hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        labelClassName="govuk-!-font-weight-bold"
      />
    </fieldset>
  );
};
