import * as React from "react";
import { useEffect } from "react";
import { useActionData, useLoaderData, type LoaderFunction, type ActionFunction } from "react-router";

import type { ITransport, ErrorResponse, ICountry } from "~/types";
import {
  TransportationDetailsLoaderFunction,
  commonSaveTransportDetails,
  calculateExportDate,
  handleFormEmptyStringValue,
  initializeStorageNotesTransportAction,
} from "~/.server";
import { scrollToId, TransportType } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { AddTransportationDetailsComponent } from "~/composite-components";
import moment from "moment";

export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(request, params, TransportType.TRUCK, "storageNotes");

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const initData = await initializeStorageNotesTransportAction(request, params);
  if (initData instanceof Response) return initData;

  const {
    bearerToken,
    documentNumber,
    transport,
    storageDocument,
    form,
    pointOfDestination,
    countries,
    exportedTo,
    containerNumbers,
  } = initData;

  const nationalityOfVehicle = form.get("nationalityOfVehicle") as string;
  const registrationNumber = form.get("registrationNumber") as string;
  const departurePlace = form.get("departurePlace") as string;
  const freightBillNumber = handleFormEmptyStringValue(form, "freightBillNumber", false);
  const nextUri = form.get("nextUri") as string;

  const payload: ITransport = {
    vehicle: transport.vehicle,
    cmr: transport.cmr,
    exportedTo,
    pointOfDestination,
    nationalityOfVehicle: countries.find((c: ICountry) => c.officialCountryName === nationalityOfVehicle)
      ?.officialCountryName,
    registrationNumber: registrationNumber,
    departurePlace: departurePlace,
    freightBillNumber: freightBillNumber,
    containerNumbers,
    currentUri: "/create-non-manipulation-document/:documentNumber/add-transportation-details-truck",
    user_id: transport.user_id,
    journey: transport.journey,
    nextUri: "/create-non-manipulation-document/:documentNumber/check-your-information",
    exportDate: calculateExportDate(form),
    exportDateTo: moment().startOf("day").add(1, "day").toISOString(),
    facilityArrivalDate: "facilityArrivalDate" in storageDocument ? storageDocument.facilityArrivalDate : undefined,
  };

  return commonSaveTransportDetails(bearerToken, documentNumber, payload, nextUri, form);
};

const TruckTransportDetailsPage = () => {
  const { countries, displayOptionalSuffix } = useLoaderData<{
    countries: ICountry[];
    displayOptionalSuffix?: boolean;
  }>();
  const actionData = useActionData<{ errors: any }>() ?? {};
  const { errors = {} } = actionData;

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <AddTransportationDetailsComponent
      countries={countries}
      vehicleType={TransportType.TRUCK}
      actionData={actionData}
      displayOptionalSuffix={displayOptionalSuffix}
    />
  );
};

export default TruckTransportDetailsPage;
