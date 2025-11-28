import type { ErrorResponse, IBase, IError, IErrorsTransformed, ITransport, Journey, Vehicle } from "~/types";
import { getTransportDetails, saveTransport } from "./transport";
import { redirect } from "@remix-run/node";
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

  return new Response(JSON.stringify({ documentNumber, vehicle, journey, csrf }), {
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
  const isArrivalTransportation = true;

  const transportDetails = await getTransportDetails(bearerToken, journey, documentNumber, isArrivalTransportation);
  const transport: ITransport =
    transportDetails.vehicle && vehicle !== transportDetails.vehicle
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

  const isSavedAsDraft: boolean = buttonClicked === "saveAsDraft";
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
