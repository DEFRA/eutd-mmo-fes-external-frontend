import { useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { scrollToId, TransportType } from "~/helpers";
import { useScrollOnPageLoad } from "./useScrollOnPageLoad";

export const getTransportErrorKeys = (transportType: TransportType): string[] => {
  const containerNumberKeys = [
    "containerNumber.0",
    "containerNumber.1",
    "containerNumber.2",
    "containerNumber.3",
    "containerNumber.4",
    "containerNumber.5",
    "containerNumber.6",
    "containerNumber.7",
    "containerNumber.8",
    "containerNumber.9",
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
