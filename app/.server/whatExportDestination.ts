import setApiMock from "tests/msw/helpers/setApiMock";
import { getBearerTokenForRequest } from "./auth";
import type { Params } from "@remix-run/react";
import { getCountries } from "./countries";
import { getExportLocation, postDraftExportLocation, postExportLocation } from "./exportLocation";
import { redirect } from "@remix-run/node";
import { route } from "routes-gen";
import type { ICountry, IError, Journey } from "~/types";
import { apiCallFailed } from "~/communication.server";
import isEmpty from "lodash/isEmpty";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import { createCSRFToken, validateCSRFToken } from "./csrfToken";

export const WhatExportDestinationLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const countries = await getCountries();
  const exportLocation = await getExportLocation(bearerToken, documentNumber);
  const unauthorised = exportLocation.unauthorised;
  const csrf = await createCSRFToken(request);
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);

  if (unauthorised) {
    return redirect("/forbidden");
  }
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  return new Response(
    JSON.stringify({
      countries,
      documentNumber,
      csrf,
      exportLocation,
      nextUri,
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

export const WhatExportDestinationAction = async (request: Request, params: Params, journey: Journey) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const countries: ICountry[] = (await getCountries()) ?? [];
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const exportedTo = form.get("exportedTo");
  const pointOfDestination = form.get("pointOfDestination") as string;
  const nextUri = form.get("nextUri") as string;
  const country: ICountry | undefined = countries.find((i: ICountry) => i.officialCountryName === exportedTo);
  const requestBody = {
    ...{ exportedTo: country, pointOfDestination },
    exportDestination: exportedTo ?? "",
  };

  const response = await postExportLocation(bearerToken, documentNumber, requestBody);
  const errors: IError[] = response.errors ?? [];
  const unauthorised = response.unauthorised;

  if (unauthorised) {
    return redirect("/forbidden");
  }

  if (form.get("_action") === "saveAsDraft") {
    // if there are validation errors, redirect to dashboard without saving or showing errors
    if (errors.length > 0) {
      return redirect(
        route(
          journey === "processingStatement"
            ? "/create-processing-statement/processing-statements"
            : "/create-storage-document/storage-documents"
        )
      );
    }
    // if data is valid, save as draft and redirect to dashboard
    await postDraftExportLocation(bearerToken, documentNumber, requestBody);
    return redirect(
      route(
        journey === "processingStatement"
          ? "/create-processing-statement/processing-statements"
          : "/create-storage-document/storage-documents"
      )
    );
  }

  // for "saveAndContinue" action, show validation errors if any
  if (errors.length > 0) {
    const values = Object.fromEntries(form);
    return apiCallFailed(errors, values);
  }

  return redirect(
    isEmpty(nextUri)
      ? route(
          journey === "processingStatement"
            ? "/create-processing-statement/:documentNumber/progress"
            : "/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk",
          {
            documentNumber: documentNumber,
          }
        )
      : nextUri
  );
};
