import { Main, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { ButtonGroup } from "./buttonGroup";
import { TransportationDetails } from "./transportationDetails";
import type { ITransport, IErrorsTransformed, Vehicle, ICountry } from "~/types";
import { route } from "routes-gen";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad, useErrorsOverride } from "~/hooks";
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
  getFreightBillNumber,
  getNationalityOfVehicle,
  getPointOfDestination,
  getRailwayBillNumber,
  getRegistrationNumber,
  getVesselName,
  scrollToId,
  TransportType,
  getErrorKeysInOrderForTransport,
} from "~/helpers";

type AddTransporrtationDetailsProps = {
  countries: ICountry[];
  actionData: any;
  vehicleType: Vehicle;
  displayOptionalSuffix?: boolean;
  errors?: IErrorsTransformed;
  onErrorsChange?: (updatedErrors: IErrorsTransformed) => void;
};

export const AddTransportationDetailsComponent = ({
  countries,
  vehicleType,
  actionData,
  displayOptionalSuffix,
  errors: propsErrors,
  onErrorsChange,
}: AddTransporrtationDetailsProps) => {
  const { t } = useTranslation(["common", "transportation"]);
  const { errors: actionErrors = {}, exportDateDay, exportDateMonth, exportDateYear, ...formData } = actionData;
  const { errors, setErrorsOverride } = useErrorsOverride(propsErrors ?? actionErrors);

  const exportDateFromAction = getExportDateFromAction(exportDateDay, exportDateMonth, exportDateYear);

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
    pointOfDestination,
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
    pointOfDestination: getPointOfDestination(errors, actionData, pointOfDestination),
    containerNumber: getContainerNumber(errors, actionData, containerNumber),
    departurePlace: getDeparturePlace(errors, actionData, departurePlace),
    errors: errors,
    exportDate: getExportDate(exportDateFromAction, exportDate),
    freightBillNumber: getFreightBillNumber(errors, actionData, freightBillNumber),
    countries,
    formData,
    displayOptionalSuffix,
  };
  let backUrl: any = route("/create-non-manipulation-document/:documentNumber/how-does-the-consignment-leave-the-uk", {
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
        containerNumbers: getContainerNumbers(errors, actionData, containerNumbers),
        displayOptionalSuffix,
        railwayBillNumber: getRailwayBillNumber(errors, actionData, railwayBillNumber),
        legendTitle: t("addTrainTransportationDetailsTransportDetailsTitle", { ns: "transportation" }),
      };
      break;
    case TransportType.TRUCK:
      componentAttributes = {
        ...componentAttributes,
        containerNumbers: getContainerNumbers(errors, actionData, containerNumbers),
        nationalityOfVehicle: getNationalityOfVehicle(errors, actionData, nationalityOfVehicle),
        registrationNumber: getRegistrationNumber(errors, actionData, registrationNumber),
        legendTitle: t("addTruckTransportationDetailsTransportDetailsTitle", { ns: "transportation" }),
      };
      backUrl = route("/create-non-manipulation-document/:documentNumber/how-does-the-consignment-leave-the-uk", {
        documentNumber,
      });
      break;
    default:
      break;
  }

  const transportOrder = getErrorKeysInOrderForTransport(vehicleType, false);
  const commonOrder = ["exportedTo", "pointOfDestination", "departurePlace", "exportDate", "airwayBillNumber"];

  const errorKeysInOrder = [
    ...commonOrder.filter((k) => !transportOrder.includes(k)),
    ...transportOrder,
    "nationalityOfVehicle",
    "registrationNumber",
    "railwayBillNumber",
    "freightBillNumber",
  ];

  const errorMessagesForDisplay = displayErrorMessagesInOrder(errors, errorKeysInOrder);

  useScrollOnPageLoad();
  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={errorMessagesForDisplay} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <TransportationDetails
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
