import * as React from "react";
import { useActionData, useLoaderData, type LoaderFunction, type ActionFunction } from "react-router";
import { useEffect } from "react";
import { route } from "routes-gen";
import type { ICountry, ITransport } from "~/types";
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

const isDepartureTransportation = false;
export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(
    request,
    params,
    TransportType.PLANE,
    "storageNotes",
    isDepartureTransportation
  );

export const action: ActionFunction = async ({ request, params }) => {
  const initData = await initializeStorageNotesTransportAction(request, params, isDepartureTransportation);
  if (initData instanceof Response) return initData;

  const {
    bearerToken,
    documentNumber,
    transport,
    storageDocument,
    form,
    pointOfDestination,
    exportedTo,
    containerNumbers,
  } = initData;

  const saveAsDraft = form.get("_action") === "saveAsDraft";
  const nextUri = form.get("nextUri") as string;
  const currentUri = route("/create-non-manipulation-document/:documentNumber/add-transportation-details-plane", {
    documentNumber,
  });

  const payload: ITransport = {
    exportedTo,
    pointOfDestination,
    departurePlace: form.get("departurePlace") as string,
    flightNumber: form.get("flightNumber") as string,
    airwayBillNumber: handleFormEmptyStringValue(form, "airwayBillNumber", saveAsDraft),
    freightBillNumber: handleFormEmptyStringValue(form, "freightBillNumber", saveAsDraft),
    containerNumbers,
    exportDate: calculateExportDate(form),
    exportDateTo: moment().startOf("day").add(1, "day").toISOString(),
    user_id: transport.user_id,
    journey: transport.journey,
    vehicle: transport.vehicle,
    currentUri,
    nextUri: route("/create-non-manipulation-document/:documentNumber/check-your-information", { documentNumber }),
    facilityArrivalDate: "facilityArrivalDate" in storageDocument ? storageDocument.facilityArrivalDate : undefined,
    arrival: isDepartureTransportation,
  };

  return commonSaveTransportDetails(bearerToken, documentNumber, payload, nextUri, form);
};

const AddTransportationDetailsPlane = () => {
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
      vehicleType={TransportType.PLANE}
      actionData={actionData}
      displayOptionalSuffix={displayOptionalSuffix}
    />
  );
};
export default AddTransportationDetailsPlane;
