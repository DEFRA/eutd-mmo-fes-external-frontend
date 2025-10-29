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
  handleFormEmptyStringValue,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { AddTransportationArrivalDetailsComponent } from "~/composite-components/addTransportationArrivalDetailsComponent";

const isArrivalTransportation = true;
export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(
    request,
    params,
    TransportType.TRUCK,
    "storageNotes",
    isArrivalTransportation
  );

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const transport: ITransport = await getTransportDetails(
    bearerToken,
    "storageNotes",
    documentNumber,
    isArrivalTransportation
  );
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);

  if (!isValid) return redirect("/forbidden");

  const nationalityOfVehicle = handleFormEmptyStringValue(form, "nationalityOfVehicle");
  const registrationNumber = handleFormEmptyStringValue(form, "registrationNumber");
  const freightBillNumber = handleFormEmptyStringValue(form, "freightBillNumber");
  const departureCountry = handleFormEmptyStringValue(form, "departureCountry");
  const departurePort = handleFormEmptyStringValue(form, "departurePort");
  const nextUri = form.get("nextUri") as string;

  const payload: ITransport = {
    currentUri: route("/create-storage-document/:documentNumber/add-arrival-transportation-details-truck", {
      documentNumber,
    }),
    nextUri: route("/create-storage-document/:documentNumber/you-have-added-a-storage-facility", { documentNumber }),
    journey: transport.journey,
    freightBillNumber,
    nationalityOfVehicle,
    registrationNumber,
    departurePort,
    departureDate: calculateDepartureDate(form),
    departureCountry,
    vehicle: transport.vehicle,
    user_id: transport.user_id,
    arrival: true,
  };

  return commonSaveTransportDetails(bearerToken, documentNumber, payload, nextUri, form);
};

const TruckTransportArrivalDetailsPage = () => {
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  useScrollOnPageLoad();
  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return <AddTransportationArrivalDetailsComponent vehicleType={TransportType.TRUCK} actionData={actionData} />;
};
export default TruckTransportArrivalDetailsPage;
