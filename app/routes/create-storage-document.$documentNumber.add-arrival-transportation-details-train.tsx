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
  commonSaveTransportDetails,
  validateCSRFToken,
  TransportationDetailsLoaderFunction,
  calculateDepartureDate,
  handleFormEmptyStringValue,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { AddTransportationArrivalDetailsComponent } from "~/composite-components/addTransportationArrivalDetailsComponent";

export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(request, params, TransportType.TRAIN, "storageNotes", true);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const transport: ITransport = await getTransportDetails(bearerToken, "storageNotes", documentNumber, true);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);

  if (!isValid) return redirect("/forbidden");

  const saveAsDraft = form.get("_action") === "saveAsDraft";
  const railwayBillNumber = handleFormEmptyStringValue(form, "railwayBillNumber", saveAsDraft);
  const freightBillNumber = handleFormEmptyStringValue(form, "freightBillNumber", saveAsDraft);
  const departureCountry = handleFormEmptyStringValue(form, "departureCountry", saveAsDraft);
  const departurePort = handleFormEmptyStringValue(form, "departurePort", saveAsDraft);
  const placeOfUnloading = handleFormEmptyStringValue(form, "placeOfUnloading", saveAsDraft);

  const nextUri = form.get("nextUri") as string;

  const payload: ITransport = {
    currentUri: route("/create-storage-document/:documentNumber/add-arrival-transportation-details-train", {
      documentNumber,
    }),
    journey: transport.journey,
    nextUri: route("/create-storage-document/:documentNumber/add-storage-facility-details", { documentNumber }),
    railwayBillNumber,
    freightBillNumber,
    departureCountry,
    departurePort,
    departureDate: calculateDepartureDate(form),
    placeOfUnloading,
    user_id: transport.user_id,
    vehicle: transport.vehicle,
    arrival: true,
  };

  return commonSaveTransportDetails(bearerToken, documentNumber, payload, nextUri, form);
};

const TrainTransportArrivalDetailsPage = () => {
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return <AddTransportationArrivalDetailsComponent vehicleType={TransportType.TRAIN} actionData={actionData} />;
};
export default TrainTransportArrivalDetailsPage;
