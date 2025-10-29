import * as React from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import { useEffect } from "react";
import { route } from "routes-gen";
import type { ICountry, ITransport, Journey } from "~/types";
import {
  getBearerTokenForRequest,
  getTransportDetails,
  TransportationDetailsLoaderFunction,
  commonSaveTransportDetails,
  calculateExportDate,
  validateCSRFToken,
  getCountries,
  extractContainerNumbers,
  handleFormEmptyStringValue,
} from "~/.server";
import { scrollToId, TransportType } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { AddTransportationDetailsComponent } from "~/composite-components";
import moment from "moment";

export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(request, params, TransportType.PLANE, "storageNotes");

export const action: ActionFunction = async ({ request, params }) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const journey: Journey = "storageNotes";
  const transport: ITransport = await getTransportDetails(bearerToken, journey, documentNumber);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const consignmentDestination = form.get("exportedTo") as string;
  const nextUri = form.get("nextUri") as string;
  const currentUri = route("/create-storage-document/:documentNumber/add-transportation-details-plane", {
    documentNumber,
  });

  const countries: ICountry[] = await getCountries();
  const exportedTo: ICountry | undefined = countries.find(
    (c: ICountry) => c.officialCountryName === consignmentDestination
  );

  const values = Object.fromEntries(form);
  const containerNumbers = extractContainerNumbers(values);

  const payload: ITransport = {
    exportedTo,
    departurePlace: form.get("departurePlace") as string,
    flightNumber: form.get("flightNumber") as string,
    airwayBillNumber: handleFormEmptyStringValue(form, "airwayBillNumber"),
    freightBillNumber: handleFormEmptyStringValue(form, "freightBillNumber"),
    containerNumbers,
    exportDate: calculateExportDate(form),
    exportDateTo: moment().startOf("day").add(1, "day").toISOString(),
    user_id: transport.user_id,
    journey: transport.journey,
    vehicle: transport.vehicle,
    currentUri,
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
