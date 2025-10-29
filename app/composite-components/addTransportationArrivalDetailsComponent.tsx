import { Main, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "@remix-run/react";
import { ButtonGroup } from "./buttonGroup";
import type { ITransport, IErrorsTransformed, Vehicle, ICountry } from "~/types";
import { route } from "routes-gen";
import isEmpty from "lodash/isEmpty";
import {
  displayErrorMessagesInOrder,
  getContainerNumber,
  getContainerNumbers,
  getExportDateFromAction as getDepartureDateFromAction,
  TransportType,
  getDepartureDate,
  getDepartureCountry,
  getVesselName,
  getFlagState,
  getRailwayBillNumber,
  getFreightBillNumber,
  getDeparturePort,
  getNationalityOfVehicle,
  getRegistrationNumber,
  getAirwayBillNumber,
  getFlightNumber,
} from "~/helpers";
import { TransportationArrivalDetails } from "./transportationArrivalDetails";

type AddArrivalTransporrtationDetailsProps = {
  actionData: any;
  vehicleType: Vehicle;
};

export const AddTransportationArrivalDetailsComponent = ({
  vehicleType,
  actionData,
}: AddArrivalTransporrtationDetailsProps) => {
  const { t } = useTranslation("transportation");
  const { errors = {}, day, month, year } = actionData;
  const departureDateFromAction = getDepartureDateFromAction(day, month, year);
  const {
    documentNumber,
    vehicle,
    containerNumber,
    vesselName,
    flagState,
    railwayBillNumber,
    freightBillNumber,
    nationalityOfVehicle,
    registrationNumber,
    airwayBillNumber,
    flightNumber,
    containerNumbers,
    departureCountry,
    departureDate,
    departurePort,
    countries,
    nextUri,
    csrf,
    displayOptionalSuffix,
  } = useLoaderData<
    ITransport & {
      documentNumber: string;
      countries: ICountry[];
      nextUri: string;
      csrf: string;
      displayOptionalSuffix: boolean;
    }
  >();

  let componentAttributes: ITransport & {
    legendTitle?: string;
    countries: ICountry[];
    errors: IErrorsTransformed;
    displayOptionalSuffix: boolean;
  } = {
    vehicle: vehicleType,
    containerNumber: getContainerNumber(errors, actionData, containerNumber),
    vesselName: getVesselName(errors, actionData, vesselName),
    flagState: getFlagState(errors, actionData, flagState),
    freightBillNumber: getFreightBillNumber(errors, actionData, freightBillNumber?.toString()),
    departureCountry: getDepartureCountry(errors, actionData, departureCountry),
    departurePort: getDeparturePort(errors, actionData, departurePort ?? undefined),
    departureDate: getDepartureDate(departureDateFromAction, departureDate),
    containerNumbers: getContainerNumbers(errors, actionData, containerNumbers),
    countries: countries,
    errors: errors,
    displayOptionalSuffix,
  };
  const backUrl: string = route("/create-storage-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk", {
    documentNumber,
  });

  switch (vehicleType) {
    case TransportType.TRAIN:
      componentAttributes = {
        ...componentAttributes,
        railwayBillNumber: getRailwayBillNumber(errors, actionData, railwayBillNumber),
        legendTitle: t("addArrivalTransportationDetailsTrainTitle"),
      };
      break;
    case TransportType.TRUCK:
      componentAttributes = {
        ...componentAttributes,
        nationalityOfVehicle: getNationalityOfVehicle(errors, actionData, nationalityOfVehicle),
        registrationNumber: getRegistrationNumber(errors, actionData, registrationNumber),
        legendTitle: t("addArrivalTransportationDetailsTruckTitle"),
      };
      break;
    case TransportType.CONTAINER_VESSEL:
      componentAttributes = {
        ...componentAttributes,
        vesselName: getVesselName(errors, actionData, vesselName),
        flagState: getFlagState(errors, actionData, flagState),
        legendTitle: t("addArrivalTransportationDetailsContainerVesselTitle"),
      };
      break;
    case TransportType.PLANE:
      componentAttributes = {
        ...componentAttributes,
        airwayBillNumber: getAirwayBillNumber(errors, actionData, airwayBillNumber),
        flightNumber: getFlightNumber(errors, actionData, flightNumber),
        containerNumbers: getContainerNumbers(errors, actionData, containerNumbers),
        legendTitle: t("addArrivalTransportationDetailsPlaneTitle"),
      };
      break;
  }

  const errorKeysInOrder = [
    "exportedTo",
    "departurePlace",
    "exportDate",
    "airwayBillNumber",
    "vesselName",
    "flagState",
    "flightNumber",
    "containerNumbers.0",
    "containerNumbers.1",
    "containerNumbers.2",
    "containerNumbers.3",
    "containerNumbers.4",
    "nationalityOfVehicle",
    "registrationNumber",
    "railwayBillNumber",
    "freightBillNumber",
    "departureCountry",
    "departurePort",
    "departureDate",
  ];

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, errorKeysInOrder)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <TransportationArrivalDetails {...componentAttributes} />
            <ButtonGroup />
            <input type="hidden" name="vehicle" value={vehicle} />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-storage-document/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};
