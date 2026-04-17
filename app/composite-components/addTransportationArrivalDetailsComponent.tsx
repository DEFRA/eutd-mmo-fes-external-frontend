import { Main, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { ButtonGroup } from "./buttonGroup";
import type { ITransport, IErrorsTransformed, Vehicle, ICountry } from "~/types";
import { route } from "routes-gen";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad, useErrorsOverride } from "~/hooks";
import {
  displayErrorMessagesInOrder,
  getContainerNumber,
  getContainerNumbers,
  getExportDateFromAction as getDepartureDateFromAction,
  TransportType,
  getDepartureDate,
  getDepartureCountry,
  scrollToId,
  getVesselName,
  getFlagState,
  getRailwayBillNumber,
  getFreightBillNumber,
  getDeparturePort,
  getNationalityOfVehicle,
  getRegistrationNumber,
  getAirwayBillNumber,
  getFlightNumber,
  getPlaceOfUnloading,
  getErrorKeysInOrderForTransport,
} from "~/helpers";
import { TransportationArrivalDetails } from "./transportationArrivalDetails";

type AddArrivalTransporrtationDetailsProps = {
  actionData: any;
  vehicleType: Vehicle;
  errors?: IErrorsTransformed;
  onErrorsChange?: (updatedErrors: IErrorsTransformed) => void;
};

export const AddTransportationArrivalDetailsComponent = ({
  vehicleType,
  actionData,
  errors: propsErrors,
  onErrorsChange,
}: AddArrivalTransporrtationDetailsProps) => {
  const { t } = useTranslation("transportation");
  const { errors: actionErrors = {}, departureDateDay, departureDateMonth, departureDateYear } = actionData;
  const { errors, setErrorsOverride } = useErrorsOverride(propsErrors ?? actionErrors);
  const departureDateFromAction = getDepartureDateFromAction(departureDateDay, departureDateMonth, departureDateYear);

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
    placeOfUnloading,
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
    infoText?: string;
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
    placeOfUnloading: getPlaceOfUnloading(errors, actionData, placeOfUnloading ?? undefined),
    countries: countries,
    errors: errors,
    displayOptionalSuffix,
  };
  const backUrl: string = route(
    "/create-non-manipulation-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk",
    {
      documentNumber,
    }
  );

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

  const transportOrder = getErrorKeysInOrderForTransport(vehicleType, true);
  const commonOrder = [
    "exportedTo",
    "departurePlace",
    "exportDate",
    "airwayBillNumber",
    "vesselName",
    "flagState",
    "flightNumber",
  ];

  const errorKeysInOrder = [
    // common keys first (if not already in transport order)
    ...commonOrder.filter((k) => !transportOrder.includes(k)),
    // transport-specific ordered keys
    ...transportOrder,
    // ensure these appear after transport-specific ordering if still unmatched
    "nationalityOfVehicle",
    "registrationNumber",
    "freightBillNumber",
    "placeOfUnloading",
  ];

  useScrollOnPageLoad();
  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, errorKeysInOrder)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <TransportationArrivalDetails
              {...componentAttributes}
              useBoldLabels={true}
              onErrorsChange={onErrorsChange ?? setErrorsOverride}
            />
            <ButtonGroup />
            <input type="hidden" name="vehicle" value={vehicle} />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-non-manipulation-document/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};
