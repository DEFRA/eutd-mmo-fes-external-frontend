import * as React from "react";
import { useActionData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import { route } from "routes-gen";
import { useEffect } from "react";
import type { ITransport, ErrorResponse } from "~/types";
import { scrollToId, TransportType } from "~/helpers";
import {
  getBearerTokenForRequest,
  getTransportDetails,
  TransportationDetailsLoaderFunction,
  commonSaveTransportDetails,
  validateCSRFToken,
  calculateDepartureDate,
  extractContainerNumbers,
  handleContainerActions,
  handleFormEmptyStringValue,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { AddTransportationArrivalDetailsComponent } from "~/composite-components/addTransportationArrivalDetailsComponent";

const isArrivalTransportation = true;
export const loader: LoaderFunction = async ({ request, params }) =>
  TransportationDetailsLoaderFunction(request, params, TransportType.PLANE, "storageNotes", isArrivalTransportation);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;

  if (!documentNumber) {
    return redirect("/forbidden");
  }

  const transport: ITransport = await getTransportDetails(
    bearerToken,
    "storageNotes",
    documentNumber,
    isArrivalTransportation
  );
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const saveAsDraft = form.get("_action") === "saveAsDraft";
  const airwayBillNumber = handleFormEmptyStringValue(form, "airwayBillNumber", saveAsDraft);
  const flightNumber = handleFormEmptyStringValue(form, "flightNumber", saveAsDraft);
  const departureCountry = handleFormEmptyStringValue(form, "departureCountry", saveAsDraft);
  const departureDate = calculateDepartureDate(form);
  const departurePort = handleFormEmptyStringValue(form, "departurePort", saveAsDraft);
  const freightBillNumber = handleFormEmptyStringValue(form, "freightBillNumber", saveAsDraft);
  const placeOfUnloading = handleFormEmptyStringValue(form, "placeOfUnloading", saveAsDraft);

  const nextUri = form.get("nextUri") as string;

  const { _action, ...values } = Object.fromEntries(form);

  // Handle container button actions when JS is disabled
  const containerActionResponse = await handleContainerActions(request, _action as string, values);
  if (containerActionResponse) return containerActionResponse;

  const containerNumbers = extractContainerNumbers(values);

  const payload: ITransport = {
    currentUri: route("/create-storage-document/:documentNumber/add-arrival-transportation-details-plane", {
      documentNumber,
    }),
    nextUri: route("/create-storage-document/:documentNumber/add-storage-facility-details", { documentNumber }),
    journey: transport.journey,
    freightBillNumber,
    airwayBillNumber,
    flightNumber,
    containerNumbers,
    departurePort,
    departureDate,
    departureCountry,
    placeOfUnloading,
    vehicle: transport.vehicle,
    user_id: transport.user_id,
    arrival: true,
  };

  return commonSaveTransportDetails(bearerToken, documentNumber, payload, nextUri, form);
};

const PlaneTransportArrivalDetailsPage = () => {
  const actionData = useActionData() ?? {};
  const errors = (actionData as any)?.errors ?? {};
  useScrollOnPageLoad();
  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return <AddTransportationArrivalDetailsComponent vehicleType={TransportType.PLANE} actionData={actionData} />;
};
export default PlaneTransportArrivalDetailsPage;
