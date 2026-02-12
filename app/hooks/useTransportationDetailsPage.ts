import { useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { scrollToId, TransportType } from "~/helpers";
import { useScrollOnPageLoad } from "./useScrollOnPageLoad";

export const getTransportErrorKeys = (transportType: TransportType): string[] => {
  const containerNumberKeys = [
    "containerNumbers.0",
    "containerNumbers.1",
    "containerNumbers.2",
    "containerNumbers.3",
    "containerNumbers.4",
    "containerNumbers.5",
    "containerNumbers.6",
    "containerNumbers.7",
    "containerNumbers.8",
    "containerNumbers.9",
  ];

  switch (transportType) {
    case TransportType.TRUCK:
      return [
        "nationalityOfVehicle",
        "registrationNumber",
        "departurePlace",
        ...containerNumberKeys,
        "freightBillNumber",
      ];
    case TransportType.PLANE:
      return ["flightNumber", "departurePlace", ...containerNumberKeys, "airwayBillNumber", "freightBillNumber"];
    case TransportType.TRAIN:
      return ["railwayBillNumber", "departurePlace", ...containerNumberKeys, "freightBillNumber"];
    case TransportType.CONTAINER_VESSEL:
      return ["vesselName", "flagState", "departurePlace", ...containerNumberKeys, "freightBillNumber"];
    default:
      return [];
  }
};

export const useTransportationDetailsPage = (errors: Record<string, any>) => {
  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);
};
