import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getTransportations,
  getAdditionalTransportTypes,
  addAdditionalTransportTypes,
  deleteTransport,
  validateCSRFToken,
} from "~/.server";
import { apiCallFailed } from "~/communication.server";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import type {
  ITransport,
  IAddTransportationCheck,
  AdditionalTransportType,
  addTransportation,
  ErrorResponse,
} from "~/types";

export const DoYouHaveAddtionalTransportTypesLoader = async (params: Params, request: Request) => {
  setApiMock(request.url);

  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  const { documentNumber } = params;

  const bearerToken = await getBearerTokenForRequest(request);
  const transportations: ITransport[] = await getTransportations(bearerToken, documentNumber);

  if (Array.isArray(transportations) && transportations.length > 0) {
    const lastUpdatedTransportId = session.get("lastUpdatedTransportId");
    if (lastUpdatedTransportId) {
      session.unset("lastUpdatedTransportId");
    }
    const transport: ITransport | undefined = lastUpdatedTransportId
      ? transportations.find((transport: ITransport) => lastUpdatedTransportId === transport.id)
      : transportations.findLast((transport: ITransport) => transport.id);

    const transportOptionType: IAddTransportationCheck = await getAdditionalTransportTypes(bearerToken, documentNumber);

    return new Response(
      JSON.stringify({
        documentNumber,
        transport,
        defaultTransportOptionType: transportOptionType.addTransportation,
        transportations,
        csrf,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  return redirect(`/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk`);
};

export const DoYouHaveAddtionalTransportTypesAction = async (
  params: Params,
  request: Request
): Promise<Response | ErrorResponse | undefined> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const transport: AdditionalTransportType = {
    addTransportation: values["addTransportation"] as addTransportation,
  };

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const { errors, unauthorised, addTransportation }: IAddTransportationCheck = await addAdditionalTransportTypes(
    bearerToken,
    transport,
    documentNumber
  );

  if (unauthorised) {
    return redirect("/forbidden");
  }

  if (_action === "saveAsDraft") {
    return redirect("/create-catch-certificate/catch-certificates");
  }

  const transportId = form.get("transportId") as string;

  if (_action === "edit") {
    return redirect(`/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${transportId}`);
  }

  if (_action === "remove") {
    await deleteTransport(bearerToken, documentNumber, transportId);
    return redirect(`/create-catch-certificate/${documentNumber}/do-you-have-additional-transport-types`);
  }

  if (Array.isArray(errors) && errors.length > 0) {
    return apiCallFailed(errors, Object.fromEntries(form));
  }

  const progressUrl = route("/create-catch-certificate/:documentNumber/progress", { documentNumber });
  const whatExportJourneyUrl = `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk`;

  return redirect(addTransportation === "yes" ? whatExportJourneyUrl : progressUrl);
};
