import * as React from "react";
import { useActionData, useLoaderData, type LoaderFunction, type ActionFunction } from "react-router";
import { route } from "routes-gen";
import { useEffect } from "react";
import type { ITransport, ErrorResponse, ICountry } from "~/types";
import { scrollToId, TransportType } from "~/helpers";
import {
  TransportationDetailsLoaderFunction,
  commonSaveTransportDetails,
  calculateExportDate,
  handleFormEmptyStringValue,
  initializeStorageNotesTransportAction,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { AddTransportationDetailsComponent } from "~/composite-components";
import moment from "moment";

const isDepartureTransportation = false;
export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(
    request,
    params,
    TransportType.TRAIN,
    "storageNotes",
    isDepartureTransportation
  );

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
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
  const railwayBillNumber = form.get("railwayBillNumber") as string;
  const departurePlace = form.get("departurePlace") as string;
  const freightBillNumber = handleFormEmptyStringValue(form, "freightBillNumber", saveAsDraft);

  const nextUri = form.get("nextUri") as string;

  const payload: ITransport = {
    currentUri: route("/create-non-manipulation-document/:documentNumber/add-transportation-details-train", {
      documentNumber,
    }),
    departurePlace: departurePlace,
    journey: transport.journey,
    exportedTo: exportedTo,
    pointOfDestination,
    nextUri: route("/create-non-manipulation-document/:documentNumber/check-your-information", { documentNumber }),
    railwayBillNumber: railwayBillNumber,
    freightBillNumber: freightBillNumber,
    user_id: transport.user_id,
    vehicle: transport.vehicle,
    exportDate: calculateExportDate(form),
    exportDateTo: moment().startOf("day").add(1, "day").toISOString(),
    containerNumbers,
    facilityArrivalDate: "facilityArrivalDate" in storageDocument ? storageDocument.facilityArrivalDate : null,
    arrival: isDepartureTransportation,
  };
  return commonSaveTransportDetails(bearerToken, documentNumber, payload, nextUri, form);
};

const TrainTransportDetailsPage = () => {
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
      vehicleType={TransportType.TRAIN}
      actionData={actionData}
      displayOptionalSuffix={displayOptionalSuffix}
    />
  );
};
export default TrainTransportDetailsPage;
