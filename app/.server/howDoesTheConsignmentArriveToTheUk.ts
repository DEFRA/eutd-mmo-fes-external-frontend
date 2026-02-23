import type { ErrorResponse, IBase, IError, IErrorsTransformed, ITransport, Journey, Vehicle } from "~/types";
import { getTransportDetails, saveTransport } from "./transport";
import { redirect } from "react-router";
import type { reduxRequestParams } from "~/types/reduxRequestParam";
import { getBearerTokenForRequest } from "./auth";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { createCSRFToken, validateCSRFToken } from "./csrfToken";
import { apiCallFailed } from "~/communication.server";

export const HowDoesTheConsignmentArriveToTheUkLoader = async ({
  bearerToken,
  journey,
  documentNumber,
  request,
}: {
  bearerToken: string;
  journey: Journey;
  documentNumber: string | undefined;
  request: Request;
}) => {
  const isArrivalTransportation = true;
  const { vehicle } = await getTransportDetails(bearerToken, journey, documentNumber, isArrivalTransportation);
  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";

  return new Response(JSON.stringify({ documentNumber, vehicle, journey, nextUri, csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const HowDoesTheConsignmentArriveToTheUkAction = async ({
  request,
  form,
  documentNumber,
  vehicle,
  currentUri,
  saveAsDraftUrl,
  completedUrl,
}: Omit<reduxRequestParams, "params"> & {
  form: FormData;
  documentNumber: string | undefined;
  vehicle: Vehicle;
  currentUri: string;
  saveAsDraftUrl: string;
  completedUrl: string;
}): Promise<Response | ErrorResponse> => {
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const bearerToken = await getBearerTokenForRequest(request);
  const buttonClicked = form.get("_action") as string;
  const journey = form.get("journey") as Journey;
  const nextUri = (form.get("nextUri") as string) ?? "";
  const isArrivalTransportation = true;

  const transportDetails = await getTransportDetails(bearerToken, journey, documentNumber, isArrivalTransportation);
  const vehicleChanged = transportDetails.vehicle && vehicle !== transportDetails.vehicle;
  const isSavedAsDraft: boolean = buttonClicked === "saveAsDraft";

  // If vehicle hasn't changed AND transport data exists, skip saving to avoid overwriting existing data
  // Just redirect to the appropriate page
  if (!vehicleChanged && transportDetails.vehicle && transportDetails.vehicle !== "undefined") {
    if (nextUri) {
      return redirect(nextUri);
    }
    // Same vehicle - redirect directly to transport details form or save as draft page
    return isSavedAsDraft ? redirect(saveAsDraftUrl) : redirect(completedUrl);
  }

  // Vehicle has changed or no transport data exists yet - save/reset transport data
  const transport: ITransport = vehicleChanged
    ? {
        vehicle: vehicle,
        departurePlace: isArrivalTransportation ? undefined : null,
        exportDate: isArrivalTransportation ? undefined : null,
        freightBillNumber: isArrivalTransportation ? null : undefined,
        departureCountry: isArrivalTransportation ? null : undefined,
        departurePort: isArrivalTransportation ? null : undefined,
        departureDate: isArrivalTransportation ? null : undefined,
        placeOfUnloading: isArrivalTransportation ? null : undefined,
        arrival: isArrivalTransportation,
        containerNumbers: [],
      }
    : { vehicle: vehicle, arrival: isArrivalTransportation };

  const transportDetailsResponse: IBase = await saveTransport(
    bearerToken,
    documentNumber,
    transport,
    currentUri,
    journey,
    isSavedAsDraft
  );

  if (buttonClicked === "saveAndContinue" || isSavedAsDraft) {
    const errors: IError[] | IErrorsTransformed = (transportDetailsResponse.errors as IError[]) || [];
    const isUnauthorised = transportDetailsResponse.unauthorised as boolean;
    if (isUnauthorised) return redirect("/forbidden");

    if (buttonClicked === "saveAndContinue" && errors.length > 0) {
      const values = Object.fromEntries(form);
      return apiCallFailed(errors, values);
    }
  }

  return isSavedAsDraft ? redirect(saveAsDraftUrl) : redirect(completedUrl);
};
