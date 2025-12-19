import type { ErrorResponse, IBase, IError, IErrorsTransformed, ITransport, Journey, Vehicle } from "~/types";
import { getTransportDetails, saveTransport } from "./transport";
import { redirect } from "@remix-run/node";
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

  return new Response(JSON.stringify({ documentNumber, vehicle, journey, csrf }), {
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

  const transportDetails = await getTransportDetails(bearerToken, journey, documentNumber);
  const transport: ITransport =
    transportDetails.vehicle && transportDetails.vehicle !== vehicle
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

  return buttonClicked === "saveAsDraft" ? redirect(saveAsDraftUrl) : redirect(completedUrl);
};
