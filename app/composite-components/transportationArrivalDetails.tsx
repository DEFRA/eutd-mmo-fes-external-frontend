import moment from "moment";
import { ErrorPosition, FormInput } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";
import type { ICountry, IErrorsTransformed, ITransport } from "~/types";
import { DateFieldWithPicker } from "./dateFieldWithPicker";
import { AutocompleteFormField, Title } from "~/components";
import { getContainerErrorClassName, getErrorMessageClassName } from "~/helpers";
import { ContainerIdentificationNumber } from "./containerIdentificationNumber";

export const ArrivalTransportationModeDetails = ({
  legendTitle,
  vehicle,
  railwayBillNumber,
  vesselName,
  flagState,
  airwayBillNumber,
  flightNumber,
  containerNumbers,
  nationalityOfVehicle,
  registrationNumber,
  errors,
  displayOptionalSuffix,
  countries,
}: ITransport & {
  legendTitle?: string;
  errors: IErrorsTransformed;
  displayOptionalSuffix: boolean;
  countries: ICountry[];
}) => {
  const { t } = useTranslation("transportation");

  return (
    <>
      {legendTitle && (
        <legend>
          <Title title={legendTitle} />
        </legend>
      )}
      {vehicle === "train" && (
        <FormInput
          containerClassName="govuk-form-group govuk-!-width-one-half"
          label={t(
            displayOptionalSuffix
              ? "addTransportationArrivalDetailsRailwayBillNumberOptional"
              : "addTransportationArrivalDetailsRailwayBillNumber"
          )}
          name="railwayBillNumber"
          type="text"
          labelClassName="govuk-!-font-weight-bold"
          inputClassName={classNames("govuk-input", {
            "govuk-input--error": errors?.railwayBillNumber,
          })}
          inputProps={{
            defaultValue: railwayBillNumber,
            id: "railwayBillNumber",
          }}
          hint={{
            id: "hint-railwayBillNumber",
            position: "above",
            text: t("addTransportationArrivalDetailsRailwayBillNumberHint"),
            className: "govuk-hint govuk-!-margin-bottom-0",
          }}
          errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.railwayBillNumber)) }}
          staticErrorMessage={t(errors?.railwayBillNumber?.message, { ns: "errorsText" })}
          errorPosition={ErrorPosition.AFTER_LABEL}
          containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.railwayBillNumber))}
          hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
          hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        />
      )}
      {vehicle === "containerVessel" && (
        <>
          <FormInput
            containerClassName="govuk-form-group govuk-!-width-one-half"
            label={t("addTransportationArrivalDetailsVesselNameOptional")}
            name="vesselName"
            type="text"
            labelClassName="govuk-!-font-weight-bold"
            inputClassName={classNames("govuk-input", {
              "govuk-input--error": errors?.vesselName,
            })}
            inputProps={{
              defaultValue: vesselName,
              id: "vesselName",
              "aria-describedby": "hint-vesselName",
            }}
            hint={{
              id: "hint-vesselName",
              position: "above",
              text: t("addTransportationArrivalDetailsVesselNameHint"),
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
            errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.vesselName)) }}
            staticErrorMessage={t(errors?.vesselName?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.vesselName))}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
          <FormInput
            containerClassName="govuk-form-group govuk-!-width-one-half"
            label={t("addTransportationArrivalDetailsFlagStateOptional")}
            name="flagState"
            type="text"
            labelClassName="govuk-!-font-weight-bold"
            inputClassName={classNames("govuk-input", {
              "govuk-input--error": errors?.flagState,
            })}
            inputProps={{
              defaultValue: flagState,
              id: "flagState",
              "aria-describedby": "hint-flagState",
            }}
            hint={{
              id: "hint-flagState",
              position: "above",
              text: t("addTransportationArrivalDetailsFlagStateHint"),
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
            errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.flagState)) }}
            staticErrorMessage={t(errors?.flagState?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.flagState))}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </>
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
            labelText={t(
              displayOptionalSuffix
                ? "addTransportationArrivalDetailsTruckNationalityOptional"
                : "addTransportationArrivalDetailsTruckNationality"
            )}
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
            containerClassName="govuk-form-group govuk-!-width-one-half"
            label={t(
              displayOptionalSuffix
                ? "addTransportationArrivalDetailsRegistrationNumberOptional"
                : "addTransportationArrivalDetailsRegistrationNumber"
            )}
            name="registrationNumber"
            type="text"
            labelClassName="govuk-!-font-weight-bold"
            inputClassName={classNames("govuk-input", {
              "govuk-input--error": errors?.registrationNumber,
            })}
            inputProps={{
              defaultValue: registrationNumber,
              id: "registrationNumber",
            }}
            hint={{
              id: "hint-registrationNumber",
              position: "above",
              text: t("addTransportationArrivalDetailsRegistrationNumberHint"),
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
            errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.registrationNumber)) }}
            staticErrorMessage={t(errors?.registrationNumber?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.registrationNumber))}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </>
      )}
      {vehicle === "plane" && (
        <>
          <FormInput
            containerClassName="govuk-form-group govuk-!-width-one-half"
            label={t(
              displayOptionalSuffix
                ? "addTransportationArrivalDetailsAirwayBillNumberOptional"
                : "addTransportationArrivalDetailsAirwayBillNumber"
            )}
            name="airwayBillNumber"
            type="text"
            labelClassName="govuk-label govuk-!-font-weight-bold"
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
              text: t("addTransportationArrivalDetailsAirwayBillNumberHint"),
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
            errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.airwayBillNumber)) }}
            staticErrorMessage={t(errors?.airwayBillNumber?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.airwayBillNumber))}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
          <FormInput
            containerClassName="govuk-form-group govuk-!-width-one-half"
            label={t(
              displayOptionalSuffix
                ? "addTransportationArrivalDetailsFlightNumberOptional"
                : "addTransportationArrivalDetailsFlightNumber"
            )}
            name="flightNumber"
            type="text"
            labelClassName="govuk-!-font-weight-bold"
            inputClassName={classNames("govuk-input", {
              "govuk-input--error": errors?.flightNumber,
            })}
            inputProps={{
              defaultValue: flightNumber,
              id: "flightNumber",
            }}
            hint={{
              id: "hint-flightNumber",
              position: "above",
              text: t("addTransportationArrivalDetailsFlightNumberHint"),
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
            errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.flightNumber)) }}
            staticErrorMessage={t(errors?.flightNumber?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.flightNumber))}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
        </>
      )}
      {(vehicle === "plane" || vehicle === "containerVessel") && (
        <ContainerIdentificationNumber
          containers={containerNumbers}
          maximumContainers={5}
          errors={errors}
          displayOptionalSuffix={displayOptionalSuffix}
        />
      )}
    </>
  );
};

export const TransportationArrivalDetails = ({
  vehicle,
  railwayBillNumber,
  vesselName,
  flagState,
  containerNumber,
  airwayBillNumber,
  flightNumber,
  containerNumbers,
  nationalityOfVehicle,
  registrationNumber,
  departureCountry,
  errors,
  departurePort,
  departureDate,
  legendTitle,
  freightBillNumber,
  countries,
  displayOptionalSuffix,
}: ITransport & {
  legendTitle?: string;
  errors: IErrorsTransformed;
  countries: ICountry[];
  displayOptionalSuffix: boolean;
}) => {
  const { t } = useTranslation("transportation");
  return (
    <fieldset className="govuk-fieldset">
      <ArrivalTransportationModeDetails
        legendTitle={legendTitle}
        vehicle={vehicle}
        railwayBillNumber={railwayBillNumber}
        vesselName={vesselName}
        flagState={flagState}
        airwayBillNumber={airwayBillNumber}
        flightNumber={flightNumber}
        containerNumber={containerNumber}
        containerNumbers={containerNumbers}
        nationalityOfVehicle={nationalityOfVehicle}
        registrationNumber={registrationNumber}
        departurePort={departurePort}
        errors={errors}
        displayOptionalSuffix={displayOptionalSuffix}
        countries={countries}
      />
      <FormInput
        name="freightBillNumber"
        containerClassName="govuk-form-group govuk-!-width-one-half"
        inputClassName={classNames("govuk-input", {
          "govuk-input--error": errors?.freightBillNumber,
        })}
        containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.freightBillNumber))}
        inputProps={{
          defaultValue: freightBillNumber ?? "",
          id: "freightBillNumber",
          "aria-describedby": "hint-freightBillNumber",
        }}
        labelClassName="govuk-!-font-weight-bold"
        label={t(
          displayOptionalSuffix
            ? "addTransportationArrivalDetailsFreightBillNumberOptional"
            : "addTransportationArrivalDetailsFreightBillNumber"
        )}
        staticErrorMessage={t(errors?.freightBillNumber?.message, { ns: "errorsText" })}
        type="text"
        hint={{
          id: "hint-freightBillNumber",
          position: "above",
          text: t(
            vehicle === "plane"
              ? "addTransportationArrivalDetailsFreightBillNumberHintPlane"
              : "addTransportationArrivalDetailsFreightBillNumberHint"
          ),
          className: "govuk-hint govuk-!-margin-bottom-0",
        }}
        errorPosition={ErrorPosition.AFTER_LABEL}
        errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.freightBillNumber)) }}
        hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
        hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
      />
      <AutocompleteFormField
        containerClassName={classNames("govuk-form-group govuk-!-width-one-half", {
          "govuk-form-group--error": errors?.departureCountry,
        })}
        options={["", ...countries.map((c) => c.officialCountryName)]}
        optionsId="country-option"
        errorMessageText={t(errors?.departureCountry?.message, { ns: "errorsText" })}
        id="departureCountry"
        name="departureCountry"
        labelText={t(
          displayOptionalSuffix
            ? "addTransportationArrivalDetailsDepartureCountryOptional"
            : "addTransportationArrivalDetailsDepartureCountry"
        )}
        labelClassName="govuk-label govuk-!-font-weight-bold"
        hintText={t(
          vehicle === "plane"
            ? "addTransportationArrivalDetailsDepartureCountryHintPlane"
            : "addTransportationArrivalDetailsDepartureCountryHint",
          { vehicle: t(vehicle).toLowerCase() }
        )}
        selectProps={{
          selectClassName: classNames("govuk-select", {
            "govuk-select--error": errors?.departureCountry,
          }),
        }}
        inputProps={{
          className: classNames("govuk-input", {
            "govuk-input--error": errors?.departureCountry,
          }),
          "aria-describedby": "departureCountry-hint",
        }}
        defaultValue={departureCountry ?? ""}
      />
      <FormInput
        containerClassName="govuk-form-group govuk-!-width-one-half"
        label={t(
          displayOptionalSuffix
            ? "addTransportationArrivalDetailsConsignmentOriginOptional"
            : "addTransportationArrivalDetailsConsignmentOrigin"
        )}
        name="departurePort"
        labelClassName="govuk-!-font-weight-bold"
        type="text"
        inputClassName={classNames("govuk-input", {
          "govuk-input--error": errors?.departurePort,
        })}
        inputProps={{
          defaultValue: departurePort ?? "",
          id: "departurePort",
          "aria-describedby": "hint-departurePort",
        }}
        hint={{
          id: "hint-departurePort",
          position: "above",
          text: t(
            vehicle === "plane"
              ? "addTransportationArrivalDetailsConsignmentOriginHintPlane"
              : "addTransportationArrivalDetailsConsignmentOriginHint",
            { vehicle: t(vehicle).toLowerCase() }
          ),
          className: "govuk-hint govuk-!-margin-bottom-0",
        }}
        errorProps={{ className: getErrorMessageClassName(!isEmpty(errors?.departurePort)) }}
        staticErrorMessage={t(errors?.departurePort?.message, { ns: "errorsText" })}
        errorPosition={ErrorPosition.AFTER_LABEL}
        containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.departurePort))}
        hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
        hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
      />
      <DateFieldWithPicker
        id="departureDate"
        getDateSelected={() => {}}
        dateSelected={moment(departureDate, ["DD/MM/YYYY", "YYYY-MM-DD", "D/M/YYYY", "YYYY-M-D"]).format("YYYY-MM-DD")}
        errors={errors?.departureDate}
        label={
          displayOptionalSuffix
            ? "addTransportationArrivalDetailsDepartureDateOptional"
            : "addTransportationArrivalDetailsDepartureDate"
        }
        translationNs="transportation"
        hideAddDateButton={true}
        hintText="addTransportationArrivalDetailsDepartureDateHint"
      />
    </fieldset>
  );
};
