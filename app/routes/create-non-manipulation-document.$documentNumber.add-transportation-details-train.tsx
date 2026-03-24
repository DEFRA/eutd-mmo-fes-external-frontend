import * as React from "react";
import { useActionData, useLoaderData, redirect, type LoaderFunction, type ActionFunction } from "react-router";
import { route } from "routes-gen";
import type { ITransport, Journey, ErrorResponse, ICountry, IUnauthorised, StorageDocument } from "~/types";
import { TransportType } from "~/helpers";
import {
  getBearerTokenForRequest,
  getTransportDetails,
  TransportationDetailsLoaderFunction,
  commonSaveTransportDetails,
  calculateExportDate,
  validateCSRFToken,
  getCountries,
  handleFormEmptyStringValue,
  extractContainerNumbers,
  getStorageDocument,
} from "~/.server";
import { AddTransportationDetailsComponent } from "~/composite-components";
import moment from "moment";

const journey: Journey = "storageNotes";
const isDepartureTransportation = false;

export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(request, params, TransportType.TRAIN, journey, isDepartureTransportation);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const transport: ITransport = await getTransportDetails(
    bearerToken,
    journey,
    documentNumber,
    isDepartureTransportation
  );
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const saveAsDraft = form.get("_action") === "saveAsDraft";
  const pointOfDestination = form.get("pointOfDestination") as string;
  const nextUri = form.get("nextUri") as string;

  const countries: ICountry[] = await getCountries();
  const exportedTo: ICountry | undefined = countries.find(
    (c: ICountry) => c.officialCountryName === (form.get("exportedTo") as string)
  );

  const values = Object.fromEntries(form);
  const containerNumbers = extractContainerNumbers(values);

  const payload: ITransport = {
    currentUri: route("/create-non-manipulation-document/:documentNumber/add-transportation-details-train", {
      documentNumber,
    }),
    departurePlace: form.get("departurePlace") as string,
    journey: transport.journey,
    exportedTo,
    pointOfDestination,
    nextUri: route("/create-non-manipulation-document/:documentNumber/progress", { documentNumber }),
    railwayBillNumber: form.get("railwayBillNumber") as string,
    freightBillNumber: handleFormEmptyStringValue(form, "freightBillNumber", saveAsDraft),
    user_id: transport.user_id,
    vehicle: transport.vehicle,
    exportDate: calculateExportDate(form),
    exportDateTo: moment().startOf("day").add(1, "day").toISOString(),
    containerNumbers,
    facilityArrivalDate: "facilityArrivalDate" in storageDocument ? storageDocument.facilityArrivalDate : undefined,
    arrival: isDepartureTransportation,
  };
  return commonSaveTransportDetails(bearerToken, documentNumber, payload, nextUri, form);
};

const TrainTransportDetailsPage = () => {
  const { countries, displayOptionalSuffix } = useLoaderData<{
    countries: ICountry[];
    displayOptionalSuffix?: boolean;
  }>();
  const actionData = useActionData<any>() ?? {};

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
