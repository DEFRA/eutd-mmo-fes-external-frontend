import type { ErrorResponse, IBase, IError, IErrorsTransformed, ITransport, Journey, Vehicle } from "~/types";
import { getTransportDetails, saveTransport } from "./transport";
import { redirect } from "react-router";
import type { reduxRequestParams } from "~/types/reduxRequestParam";
import { getBearerTokenForRequest } from "./auth";
import { apiCallFailed } from "~/communication.server";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { createCSRFToken, validateCSRFToken } from "./csrfToken";

export const howDoesTheExportLeaveTheUkLoader = async ({
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
  const { vehicle } = await getTransportDetails(bearerToken, journey, documentNumber);
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

export const howDoesTheExportLeaveTheUkAction = async ({
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

  const transportDetails = await getTransportDetails(bearerToken, journey, documentNumber);
  const vehicleChanged = transportDetails.vehicle && transportDetails.vehicle !== vehicle;
  const transport: ITransport = vehicleChanged
    ? {
        vehicle: vehicle,
        departurePlace: transportDetails.departurePlace ? null : undefined,
        exportDate: transportDetails.exportDate ? null : undefined,
        exportedTo: transportDetails.exportedTo ? null : undefined,
        freightBillNumber: transportDetails.freightBillNumber ? null : undefined,
        pointOfDestination: transportDetails.pointOfDestination ? null : undefined,
        containerNumbers: transportDetails.containerNumbers ? [] : undefined,
      }
    : { vehicle: vehicle };

  const isSavedAsDraft: boolean = buttonClicked === "saveAsDraft";
  const transportDetailsResponse: IBase = await saveTransport(
    bearerToken,
    documentNumber,
    transport,
    currentUri,
    journey,
    isSavedAsDraft
  );

  if (buttonClicked === "saveAndContinue" || buttonClicked === "saveAsDraft") {
    const errors: IError[] | IErrorsTransformed = (transportDetailsResponse.errors as IError[]) || [];
    const isUnauthorised = transportDetailsResponse.unauthorised as boolean;

    if (isUnauthorised) {
      return redirect("/forbidden");
    }

    if (buttonClicked === "saveAndContinue" && errors.length > 0) {
      const values = Object.fromEntries(form);
      return apiCallFailed(errors, values);
    }
  }

  // If vehicle hasn't changed and nextUri is provided (e.g., from check-your-information change link),
  // redirect back to that page instead of the transport details form
  if (!vehicleChanged && nextUri && transportDetails.vehicle) {
    return redirect(nextUri);
  }

  return buttonClicked === "saveAsDraft" ? redirect(saveAsDraftUrl) : redirect(completedUrl);
};
