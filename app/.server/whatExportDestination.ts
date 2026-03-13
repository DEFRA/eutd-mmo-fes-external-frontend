import setApiMock from "tests/msw/helpers/setApiMock";
import { getBearerTokenForRequest } from "./auth";
import { redirect, type Params } from "react-router";
import { getCountries } from "./countries";
import { getExportLocation, postDraftExportLocation, postExportLocation } from "./exportLocation";

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
    // Save valid fields as draft even when validation errors exist
    if (errors.length > 0) {
      const errorKeys = errors.map((e) => e.key);
      const filteredRequestBody: any = {
        exportedTo: requestBody.exportedTo,
        exportDestination: requestBody.exportDestination,
        pointOfDestination: requestBody.pointOfDestination,
      };

      // Explicitly null out invalid fields so the backend clears them
      if (errorKeys.includes("exportedTo") || errorKeys.includes("exportDestination")) {
        filteredRequestBody.exportedTo = null;
        filteredRequestBody.exportDestination = null;
      }

      if (errorKeys.includes("pointOfDestination")) {
        filteredRequestBody.pointOfDestination = null;
      }

      await postDraftExportLocation(bearerToken, documentNumber, filteredRequestBody);

      return redirect(
        route(
          journey === "processingStatement"
            ? "/create-processing-statement/processing-statements"
            : "/create-non-manipulation-document/non-manipulation-documents"
        )
      );
    }

    // No validation errors - save all data as draft
    await postDraftExportLocation(bearerToken, documentNumber, requestBody);
    return redirect(
      route(
        journey === "processingStatement"
          ? "/create-processing-statement/processing-statements"
          : "/create-non-manipulation-document/non-manipulation-documents"
      )
    );
  }

  // for "saveAndContinue" action, show validation errors if any
  if (errors.length > 0) {
    const values = Object.fromEntries(form) as Record<string, FormDataEntryValue | undefined>;
    const errorKeys = new Set(errors.map((e) => e.key));
    // Set invalid fields to empty string so the component renders an empty field
    // (deleting would fall back to the last saved value from the loader)
    if (errorKeys.has("pointOfDestination")) {
      values.pointOfDestination = "";
    }
    if (errorKeys.has("exportDestination")) {
      values.exportedTo = "";
    }
    return apiCallFailed(errors, values);
  }

  return redirect(
    isEmpty(nextUri)
      ? route(
          journey === "processingStatement"
            ? "/create-processing-statement/:documentNumber/progress"
            : "/create-non-manipulation-document/:documentNumber/how-does-the-consignment-leave-the-uk",
          {
            documentNumber: documentNumber,
          }
        )
      : nextUri
  );
};
