import type { ConfirmCmrOptionsType, IError, IErrorsTransformed, TransportOptionType } from "~/types";
import { isValidDate } from "./utilities";
import isEmpty from "lodash/isEmpty";
export const getExportDate = (exportDateFromAction?: string, exportDate?: string | null) =>
  exportDateFromAction ?? exportDate;
export const getExportDateFromAction = (day: string, month: string, year: string) =>
  isValidDate(`${year}-${month}-${day}`) ? `${year}-${month}-${day}` : undefined;
export const getContainerNumber = (errors: any, actionData: any, containerNumber?: string) =>
  !isEmpty(errors) || actionData?.containerNumber ? actionData?.containerNumber : containerNumber;
export const getDeparturePlace = (errors: any, actionData: any, departurePlace?: string | null) =>
  !isEmpty(errors) || actionData?.departurePlace ? actionData?.departurePlace : departurePlace;
export const getVesselName = (errors: any, actionData: any, vesselName?: string) =>
  !isEmpty(errors) || actionData?.vesselName ? actionData?.vesselName : vesselName;
export const getFlagState = (errors: any, actionData: any, flagState?: string) =>
  !isEmpty(errors) || actionData?.flagState ? actionData?.flagState : flagState;
export const getFlightNumber = (errors: any, actionData: any, flightNumber?: string) =>
  !isEmpty(errors) || actionData?.flightNumber ? actionData?.flightNumber : flightNumber;
export const getAirwayBillNumber = (errors: any, actionData: any, airwayBillNumber?: string) =>
  !isEmpty(errors) || actionData?.airwayBillNumber ? actionData?.airwayBillNumber : airwayBillNumber;
export const getContainerNumbers = (errors: any, actionData: any, containerNumbers?: string[]) =>
  !isEmpty(errors) || actionData?.containerNumbers ? actionData?.containerNumbers : containerNumbers;
export const getRailwayBillNumber = (errors: any, actionData: any, railwayBillNumber?: string) =>
  !isEmpty(errors) || actionData?.railwayBillNumber ? actionData?.railwayBillNumber : railwayBillNumber;
export const getNationalityOfVehicle = (errors: any, actionData: any, nationalityOfVehicle?: string) =>
  !isEmpty(errors) || actionData?.nationalityOfVehicle ? actionData?.nationalityOfVehicle : nationalityOfVehicle;
export const getRegistrationNumber = (errors: any, actionData: any, registrationNumber?: string) =>
  !isEmpty(errors) || actionData?.registrationNumber ? actionData?.registrationNumber : registrationNumber;
export const getVesselNameClassName = (errors: IErrorsTransformed | (IError[] & IErrorsTransformed)) =>
  !isEmpty(errors?.vesselName) ? "govuk-error-message" : "";
export const getVesselNameContainerClassName = (errors: IErrorsTransformed | (IError[] & IErrorsTransformed)) =>
  !isEmpty(errors?.vesselName) ? "govuk-form-group--error" : "";
export const getFlagStateClassName = (errors: IErrorsTransformed | (IError[] & IErrorsTransformed)) =>
  !isEmpty(errors?.flagState) ? "govuk-error-message" : "";
export const getFlagStateContainerClassName = (errors: IErrorsTransformed | (IError[] & IErrorsTransformed)) =>
  !isEmpty(errors?.flagState) ? "govuk-form-group--error" : "";
export const getErrorMessageClassName: (hasError: boolean) => string = (hasError: boolean) =>
  hasError ? "govuk-error-message" : "";
export const getContainerErrorClassName: (hasError: boolean) => string = (hasError: boolean) =>
  hasError ? "govuk-form-group--error" : "";
export const getDepartureDate = (departureDateFromAction?: string, departureDate?: string | null | undefined) =>
  departureDateFromAction ?? departureDate;
export const getDepartureCountry = (errors: any, actionData: any, departureCountry?: string | null | undefined) =>
  !isEmpty(errors) || actionData?.departureCountry ? actionData?.departureCountry : departureCountry;
export const getFreightBillNumber = (errors: any, actionData: any, freightBillNumber?: string | null | undefined) =>
  !isEmpty(errors) || actionData?.freightBillNumber ? actionData?.freightBillNumber : freightBillNumber;
export const getDeparturePort = (errors: any, actionData: any, departurePort?: string) =>
  !isEmpty(errors) || actionData?.departurePort ? actionData?.departurePort : departurePort;

export enum TransportType {
  CONTAINER_VESSEL = "containerVessel",
  PLANE = "plane",
  TRAIN = "train",
  TRUCK = "truck",
}

export const transportOptions: TransportOptionType[] = [
  {
    label: "truck",
    value: "truck",
    id: "truck",
  },
  {
    label: "plane",
    value: "plane",
    id: "plane",
  },
  {
    label: "train",
    value: "train",
    id: "train",
  },
  {
    label: "containerVessel",
    value: "containerVessel",
    id: "containerVessel",
  },
];

export const confirmCmrOptions: ConfirmCmrOptionsType[] = [
  {
    label: "commonThereIs",
    value: "true",
    id: "cmr",
  },
  {
    label: "commonThereIsNot",
    value: "false",
    id: "separateCmrFalse",
  },
];

export const confirmTransportTypeOptions: TransportOptionType[] = [
  {
    label: "doYouHaveaAdditionalTransportTypesSelectYes",
    value: "yes",
    id: "addTransportation",
  },
  {
    label: "doYouHaveaAdditionalTransportTypesSelectNo",
    value: "no",
    id: "separateAddTransportationFalse",
  },
];
