import * as React from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import { route } from "routes-gen";
import { useEffect } from "react";
import type { ITransport, Journey, ErrorResponse, ICountry } from "~/types";
import { scrollToId, TransportType } from "~/helpers";
import {
  getBearerTokenForRequest,
  getTransportDetails,
  TransportationDetailsLoaderFunction,
  commonSaveTransportDetails,
  calculateExportDate,
  validateCSRFToken,
  getCountries,
  handleFormEmptyStringValue,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { AddTransportationDetailsComponent } from "~/composite-components";
import moment from "moment";

export const loader: LoaderFunction = async ({ request, params }) =>
  await TransportationDetailsLoaderFunction(request, params, TransportType.TRAIN, "storageNotes");

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const journey: Journey = "storageNotes";
  const transport: ITransport = await getTransportDetails(bearerToken, journey, documentNumber);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const consignmentDestination = form.get("exportedTo") as string;
  const railwayBillNumber = form.get("railwayBillNumber") as string;
  const departurePlace = form.get("departurePlace") as string;
  const freightBillNumber = handleFormEmptyStringValue(form, "freightBillNumber");

  const nextUri = form.get("nextUri") as string;

  const countries: ICountry[] = await getCountries();
  const exportedTo: ICountry | undefined = countries.find(
    (c: ICountry) => c.officialCountryName === consignmentDestination
  );

  const payload: ITransport = {
    currentUri: route("/create-storage-document/:documentNumber/add-transportation-details-train", { documentNumber }),
    departurePlace: departurePlace,
    journey: transport.journey,
    exportedTo,
    nextUri: route("/create-storage-document/:documentNumber/progress", { documentNumber }),
    railwayBillNumber: railwayBillNumber,
    freightBillNumber: freightBillNumber,
    user_id: transport.user_id,
    vehicle: transport.vehicle,
    exportDate: calculateExportDate(form),
    exportDateTo: moment().startOf("day").add(1, "day").toISOString(),
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
