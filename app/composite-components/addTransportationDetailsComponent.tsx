import { Main, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "@remix-run/react";
import { ButtonGroup } from "./buttonGroup";
import { TransportationDetails } from "./transportationDetails";
import type { ITransport, IErrorsTransformed, Vehicle, ICountry } from "~/types";
import { route } from "routes-gen";
import isEmpty from "lodash/isEmpty";
import {
  displayErrorMessagesInOrder,
  getAirwayBillNumber,
  getContainerNumber,
  getContainerNumbers,
  getDeparturePlace,
  getExportDate,
  getExportDateFromAction,
  getFlagState,
  getFlightNumber,
  getNationalityOfVehicle,
  getRailwayBillNumber,
  getRegistrationNumber,
  getVesselName,
  TransportType,
} from "~/helpers";

type AddTransporrtationDetailsProps = {
  countries: ICountry[];
  actionData: any;
  vehicleType: Vehicle;
  displayOptionalSuffix?: boolean;
};

export const AddTransportationDetailsComponent = ({
  countries,
  vehicleType,
  actionData,
  displayOptionalSuffix,
}: AddTransporrtationDetailsProps) => {
  const { t } = useTranslation(["common", "transportation"]);
  const { errors = {}, day, month, year, ...formData } = actionData;
  const exportDateFromAction = getExportDateFromAction(day, month, year);
  const {
    documentNumber,
    vehicle,
    vesselName,
    flagState,
    containerNumber,
    flightNumber,
    containerNumbers,
    railwayBillNumber,
    airwayBillNumber,
    exportedTo,
    freightBillNumber,
    nationalityOfVehicle,
    registrationNumber,
    departurePlace,
    exportDate,
    nextUri,
    csrf,
  } = useLoaderData<ITransport & { documentNumber: string; nextUri: string; csrf: string }>();

  let componentAttributes: ITransport & {
    legendTitle?: string;
    errors: IErrorsTransformed;
    countries: ICountry[];
    formData: any;
    displayOptionalSuffix?: boolean;
  } = {
    vehicle: vehicleType,
    exportedTo,
    containerNumber: getContainerNumber(errors, actionData, containerNumber),
    departurePlace: getDeparturePlace(errors, actionData, departurePlace),
    errors: errors,
    exportDate: getExportDate(exportDateFromAction, exportDate),
    freightBillNumber,
    countries,
    formData,
    displayOptionalSuffix,
  };
  let backUrl: any = route("/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk", {
    documentNumber,
  });

  switch (vehicleType) {
    case TransportType.CONTAINER_VESSEL:
      componentAttributes = {
        ...componentAttributes,
        containerNumbers: getContainerNumbers(errors, actionData, containerNumbers),
        vesselName: getVesselName(errors, actionData, vesselName),
        flagState: getFlagState(errors, actionData, flagState),
        legendTitle: t("addContainerVesselTransportationDetailsTransportDetailsTitle", { ns: "transportation" }),
      };
      break;
    case TransportType.PLANE:
      componentAttributes = {
        ...componentAttributes,
        containerNumbers: getContainerNumbers(errors, actionData, containerNumbers),
        flightNumber: getFlightNumber(errors, actionData, flightNumber),
        airwayBillNumber: getAirwayBillNumber(errors, actionData, airwayBillNumber),
        legendTitle: t("addPlaneTransportationDetailsTransportDetailsTitle", { ns: "transportation" }),
      };
      break;
    case TransportType.TRAIN:
      componentAttributes = {
        ...componentAttributes,
        displayOptionalSuffix,
        railwayBillNumber: getRailwayBillNumber(errors, actionData, railwayBillNumber),
        legendTitle: t("addTrainTransportationDetailsTransportDetailsTitle", { ns: "transportation" }),
      };
      break;
    case TransportType.TRUCK:
      componentAttributes = {
        ...componentAttributes,
        nationalityOfVehicle: getNationalityOfVehicle(errors, actionData, nationalityOfVehicle),
        registrationNumber: getRegistrationNumber(errors, actionData, registrationNumber),
        legendTitle: t("addTruckTransportationDetailsTransportDetailsTitle", { ns: "transportation" }),
      };
      backUrl = route("/create-storage-document/:documentNumber/do-you-have-a-road-transport-document", {
        documentNumber,
      });
      break;
    default:
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
  ];
  const errorMessagesForDisplay = displayErrorMessagesInOrder(errors, errorKeysInOrder);
  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={errorMessagesForDisplay} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <TransportationDetails {...componentAttributes} />
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
