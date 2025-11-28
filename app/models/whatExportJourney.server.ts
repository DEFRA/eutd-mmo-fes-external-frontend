import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  getBearerTokenForRequest,
  getLandingsEntryOption,
  getExportLocation,
  getCountries,
  createCSRFToken,
  getTransportations,
  postDraftExportLocation,
  postExportLocation,
  validateCSRFToken,
} from "~/.server";
import { apiCallFailed } from "~/communication.server";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import type { IError, ITransport } from "~/types";

export const WhatExportJourneyLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);

  const { documentNumber } = params;
  const { landingsEntryOption } = await getLandingsEntryOption(bearerToken, documentNumber);
  if (landingsEntryOption === null) {
    return redirect(route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber }));
  }

  const exportLocation = await getExportLocation(bearerToken, documentNumber);
  const unauthorised = exportLocation.unauthorised;

  if (unauthorised) {
    return redirect("/forbidden");
  }

  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const countries = await getCountries();

  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  return new Response(
    JSON.stringify({
      landingsEntryOption,
      countries,
      exportLocation,
      documentNumber,
      nextUri,
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
};

export const WhatExportJourneyAction = async (request: Request, params: Params): Promise<Response> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const countries = await getCountries();
  const body = await request.formData();
  const exportedFrom = (body.get("exportedFrom") as string) ?? "United Kingdom";
  const exportedTo = body.get("exportedTo");
  const landingsEntryOption = body.get("landingsEntryOption");
  const action = body.get("_action");
  const country = countries.filter((i) => i.officialCountryName === exportedTo)[0];
  const requestBody = {
    exportedFrom,
    // loaded: true, // TO DO: need to find out what this property does, when it should be true/false, and whether we actually need it.
    ...(country && { exportedTo: country }),
  };

  const isValid = await validateCSRFToken(request, body);
  if (!isValid) return redirect("/forbidden");

  if (action === "saveAsDraft") {
    await postDraftExportLocation(bearerToken, documentNumber, requestBody);
    return redirect(route("/create-catch-certificate/catch-certificates"));
  }

  const response = await postExportLocation(bearerToken, documentNumber, requestBody);
  const errors: IError[] = response.errors ?? [];

  const unauthorised = response.unauthorised;
  if (unauthorised) {
    return redirect("/forbidden");
  }

  if (errors.length > 0) {
    const values = Object.fromEntries(body);
    return apiCallFailed(errors, values);
  }

  if (landingsEntryOption === "directLanding" || !isEmpty(body.get("nextUri"))) {
    return redirect(
      route("/create-catch-certificate/:documentNumber/check-your-information", { documentNumber: documentNumber })
    );
  }

  const transportations: ITransport[] = await getTransportations(bearerToken, documentNumber);
  if (Array.isArray(transportations) && transportations.length > 0) {
    const transport: ITransport | undefined = transportations.findLast((transport: ITransport) => transport.id);
    return redirect(`/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${transport?.id}`);
  }

  return redirect(
    route("/create-catch-certificate/:documentNumber/how-does-the-export-leave-the-uk", {
      documentNumber: documentNumber,
    })
  );
};
