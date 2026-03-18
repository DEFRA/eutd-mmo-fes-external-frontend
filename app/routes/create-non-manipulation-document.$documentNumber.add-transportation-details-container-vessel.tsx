import * as React from "react";
import isEmpty from "lodash/isEmpty";
import { useActionData, useLoaderData, redirect, type LoaderFunction, type ActionFunction } from "react-router";
import { useEffect } from "react";
import {
  getBearerTokenForRequest,
  getTransportDetails,
  TransportationDetailsLoaderFunction,
  commonSaveTransportDetails,
  calculateExportDate,
  validateCSRFToken,
  extractContainerNumbers,
  getCountries,
  handleFormEmptyStringValue,
  getStorageDocument,
} from "~/.server";
import type { ErrorResponse, ICountry, ITransport, IUnauthorised, Journey, StorageDocument } from "~/types";
import { scrollToId, TransportType } from "~/helpers";
import { useScrollOnPageLoad } from "~/hooks";
import { AddTransportationDetailsComponent } from "~/composite-components";
import moment from "moment";

const isDepartureTransportation = false;
export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(
    request,
    params,
    TransportType.CONTAINER_VESSEL,
    "storageNotes",
    isDepartureTransportation
  );

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const journey: Journey = "storageNotes";
  const transport: ITransport = await getTransportDetails(
    bearerToken,
    journey,
    documentNumber,
    isDepartureTransportation
  );
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  const saveAsDraft = form.get("_action") === "saveAsDraft";
  const vesselName = form.get("vesselName") as string;
  const pointOfDestination = form.get("pointOfDestination") as string;
  const flagState = form.get("flagState") as string;
  const departurePlace = form.get("departurePlace") as string;
  const consignmentDestination = form.get("exportedTo") as string;
  const freightBillNumber = handleFormEmptyStringValue(form, "freightBillNumber", saveAsDraft);
  const nextUri = form.get("nextUri") as string;

  const countries: ICountry[] = await getCountries();
  const exportedTo: ICountry | undefined = countries.find(
    (c: ICountry) => c.officialCountryName === consignmentDestination
  );

  const values = Object.fromEntries(form);
  const containerNumbers = extractContainerNumbers(values, 5);

  const payload: ITransport = {
    vehicle: transport.vehicle,
    vesselName,
    pointOfDestination,
    flagState,
    departurePlace,
    containerNumbers,
    freightBillNumber,
    currentUri: "/create-non-manipulation-document/:documentNumber/add-transportation-details-conatiner-vessel",
    user_id: transport.user_id,
    journey: transport.journey,
    nextUri: "/create-non-manipulation-document/:documentNumber/check-your-information",
    exportDate: calculateExportDate(form),
    exportDateTo: moment().startOf("day").add(1, "day").toISOString(),
    exportedTo,
    facilityArrivalDate: "facilityArrivalDate" in storageDocument ? storageDocument.facilityArrivalDate : undefined,
    arrival: isDepartureTransportation,
  };

  return commonSaveTransportDetails(bearerToken, documentNumber, payload, nextUri, form);
};

const ContainerVesselTransportDetailsPage = () => {
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
      vehicleType={TransportType.CONTAINER_VESSEL}
      actionData={actionData}
      displayOptionalSuffix={displayOptionalSuffix}
    />
  );
};
export default ContainerVesselTransportDetailsPage;
