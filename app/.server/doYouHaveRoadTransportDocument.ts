import { redirect } from "@remix-run/node";
import { route } from "routes-gen";
import type { Cmr, IBase, IError, ITransport, Journey, Vehicle } from "~/types";
import type { reduxRequestParams } from "~/types/reduxRequestParam";
import { createCSRFToken, getBearerTokenForRequest, saveTruckCMR, validateCSRFToken } from "~/.server";
import { apiCallFailed } from "~/communication.server";
import { commitSession, getSessionFromRequest } from "~/sessions.server";

export const doYouHaveRoadTransportDocumentLoader = async ({
  cmr,
  documentNumber,
  vehicle,
  request,
}: {
  cmr: string | undefined;
  documentNumber: string | undefined;
  vehicle: Vehicle;
  request: Request;
}) => {
  if (vehicle !== "truck") {
    return redirect("/forbidden");
  }

  const session = await getSessionFromRequest(request);
  const csrf = createCSRFToken();
  session.set("csrf", csrf);
  return new Response(JSON.stringify({ documentNumber, cmr, vehicle, csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const doYouHaveRoadTransportDocumentAction = async ({
  request,
  params,
  journey,
  saveAsDraftReturnUrl,
}: reduxRequestParams & { journey: Journey; saveAsDraftReturnUrl: string }) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const { _action, ...values } = Object.fromEntries(form);

  const transport: ITransport = {
    vehicle: values["vehicles"] as Vehicle,
    cmr: values["cmr"] as Cmr,
  };

  let currentUri;
  let progressUrl;
  let addTruckDetailsUrl;

  switch (journey) {
    case "storageNotes":
      currentUri = route(`/create-storage-document/:documentNumber/do-you-have-a-road-transport-document`, {
        documentNumber,
      });
      progressUrl = route(`/create-storage-document/:documentNumber/departure-product-summary`, { documentNumber });
      addTruckDetailsUrl = route(`/create-storage-document/:documentNumber/add-transportation-details-truck`, {
        documentNumber,
      });
      break;
    default:
      return;
  }

  const nextUri = transport.cmr === "true" ? progressUrl : addTruckDetailsUrl;

  const isSavedAsDraft: boolean = _action === "saveAsDraft";

  const truckCMRResponse: IBase = await saveTruckCMR(
    bearerToken,
    currentUri,
    journey,
    { ...transport },
    isSavedAsDraft,
    documentNumber
  );

  const errors = truckCMRResponse.errors as IError[];
  const isUnauthorised = truckCMRResponse.unauthorised as boolean;

  if (isUnauthorised) {
    return redirect("/forbidden");
  }

  if (_action === "saveAndContinue" && errors.length > 0) {
    return apiCallFailed(errors, Object.fromEntries(form));
  }

  return _action === "saveAsDraft" ? redirect(saveAsDraftReturnUrl) : redirect(nextUri);
};
