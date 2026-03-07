import * as React from "react";
import { useActionData, redirect, type LoaderFunction, type ActionFunction } from "react-router";

import { route } from "routes-gen";
import { useEffect } from "react";
import type { ITransport, ErrorResponse, ICountry } from "~/types";
import { scrollToId, TransportType } from "~/helpers";
import {
  getBearerTokenForRequest,
  getCountries,
  getTransportDetails,
  TransportationDetailsLoaderFunction,
  commonSaveTransportDetails,
  validateCSRFToken,
  calculateDepartureDate,
  extractContainerNumbers,
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
    TransportType.CONTAINER_VESSEL,
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
  const saveAsDraft = form.get("_action") === "saveAsDraft";
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const countries: ICountry[] = await getCountries();
  const vesselName = handleFormEmptyStringValue(form, "vesselName", saveAsDraft);
  const flagState = handleFormEmptyStringValue(form, "flagState", saveAsDraft);
  const freightBillNumber = handleFormEmptyStringValue(form, "freightBillNumber", saveAsDraft);
  const departureCountryForm = handleFormEmptyStringValue(form, "departureCountry", saveAsDraft);
  const departureCountry = countries.find(
    (c: ICountry) => c.officialCountryName === departureCountryForm
  )?.officialCountryName;
  const departurePort = handleFormEmptyStringValue(form, "departurePort", saveAsDraft);
  const placeOfUnloading = handleFormEmptyStringValue(form, "placeOfUnloading", saveAsDraft);

  const nextUri = form.get("nextUri") as string;
  const values = Object.fromEntries(form);
  const containerNumbers = extractContainerNumbers(values);

  const payload: ITransport = {
    currentUri: route(
      "/create-non-manipulation-document/:documentNumber/add-arrival-transportation-details-container-vessel",
      {
        documentNumber,
      }
    ),
    nextUri: route("/create-non-manipulation-document/:documentNumber/add-storage-facility-details", {
      documentNumber,
    }),
    journey: "storageNotes",
    vesselName,
    flagState,
    containerNumbers,
    freightBillNumber,
    departureCountry,
    departurePort,
    departureDate: calculateDepartureDate(form),
    placeOfUnloading,
    vehicle: transport.vehicle,
    user_id: transport.user_id,
    arrival: true,
  };

  return commonSaveTransportDetails(bearerToken, documentNumber, payload, nextUri, form);
};

const ContainerVesselTransportArrivalDetailsPage = () => {
  const actionData = useActionData<{ errors: any }>() ?? {};
  const { errors = {} } = actionData;

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <AddTransportationArrivalDetailsComponent vehicleType={TransportType.CONTAINER_VESSEL} actionData={actionData} />
  );
};

export default ContainerVesselTransportArrivalDetailsPage;
