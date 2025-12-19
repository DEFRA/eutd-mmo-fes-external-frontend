import * as React from "react";
import { useEffect } from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import type { ITransport, Journey, ErrorResponse, ICountry, IUnauthorised, StorageDocument } from "~/types";
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
import { scrollToId, TransportType } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { AddTransportationDetailsComponent } from "~/composite-components";
import moment from "moment";

export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(request, params, TransportType.TRUCK, "storageNotes");

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const journey: Journey = "storageNotes";
  const transport: ITransport = await getTransportDetails(bearerToken, journey, documentNumber);
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const consignmentDestination = form.get("exportedTo") as string;
  const pointOfDestination = form.get("pointOfDestination") as string;
  const nationalityOfVehicle = form.get("nationalityOfVehicle") as string;
  const registrationNumber = form.get("registrationNumber") as string;
  const departurePlace = form.get("departurePlace") as string;
  const freightBillNumber = handleFormEmptyStringValue(form, "freightBillNumber", false);

  const nextUri = form.get("nextUri") as string;

  const countries: ICountry[] = await getCountries();
  const exportedTo: ICountry | undefined = countries.find(
    (c: ICountry) => c.officialCountryName === consignmentDestination
  );

  const values = Object.fromEntries(form);
  const containerNumbers = extractContainerNumbers(values);

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
    currentUri: "/create-storage-document/:documentNumber/add-transportation-details-truck",
    user_id: transport.user_id,
    journey: transport.journey,
    nextUri: "/create-storage-document/:documentNumber/check-your-information",
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
