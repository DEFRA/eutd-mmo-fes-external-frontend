import type { Params } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getCatchCertificateSummary,
  getLandingsEntryOption,
  getProgress,
  hasRequiredDataCatchCertificateSummary,
  submitDocument,
  submitExportCertificate,
  transformError,
  validateCSRFToken,
} from "~/.server";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import type {
  ICatchCertificateSubmitResponse,
  ICatchCertificateSummary,
  IError,
  IProgress,
  ISubmitResponse,
  Journey,
  SystemFailure,
  ValidationFailure,
} from "~/types";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";

function instanceOfSystemFailure(
  data: (SystemFailure | IError[]) | (ValidationFailure | SystemFailure)
): data is SystemFailure {
  return "error" in data;
}

export const CheckYourInformationLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const csrf = createCSRFToken();
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);

  const { documentNumber } = params;
  const {
    status,
    transport,
    transportations,
    exporter,
    exportPayload,
    exportLocation,
    conservation,
    validationErrors,
    landingsEntryOption,
  }: ICatchCertificateSummary = (await getCatchCertificateSummary(bearerToken, documentNumber)) ?? {};

  if (
    !hasRequiredDataCatchCertificateSummary(
      exporter?.model,
      exportPayload,
      conservation,
      transport,
      transportations,
      exportLocation
    )
  ) {
    return redirect(`/create-catch-certificate/${documentNumber}/progress`);
  }

  const hasSystemFailure: boolean =
    Array.isArray(validationErrors) &&
    validationErrors.some((validationError: ValidationFailure | SystemFailure) =>
      instanceOfSystemFailure(validationError)
    );

  if (status !== "LOCKED") {
    const { requiredSections, completedSections }: IProgress = await getProgress(
      bearerToken,
      "catchCertificate",
      documentNumber
    );

    if (landingsEntryOption === null) {
      return redirect(`/create-catch-certificate/${documentNumber}/landings-entry`);
    } else if (completedSections !== requiredSections) {
      return redirect(`/create-catch-certificate/${documentNumber}/progress`);
    }
  }

  const filterValidationErrors: ValidationFailure[] = [];
  if (Array.isArray(validationErrors)) {
    for (const error of validationErrors) {
      if (!instanceOfSystemFailure(error)) {
        filterValidationErrors.push(error);
      }
    }
  }

  return new Response(
    JSON.stringify({
      documentNumber,
      landingsEntryOption,
      status,
      transport,
      transportations,
      exporter,
      exportPayload,
      exportLocation,
      conservation,
      hasSystemFailure,
      validationErrors: filterValidationErrors.length > 0 ? transformError(filterValidationErrors) : undefined,
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

export const CheckYourInformationAction = async (request: Request, params: Params): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const values = Object.fromEntries(form);
  const journey = form.get("journey") as Journey;
  const session = await getSessionFromRequest(request);
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const submitCertificate: ICatchCertificateSubmitResponse = await submitExportCertificate(
    bearerToken,
    documentNumber,
    journey
  );

  session.set(`noOfVessels`, values["noOfVessels"]);
  const updatedSession = await commitSession(session);

  if (submitCertificate?.errors !== undefined) {
    return new Response(JSON.stringify({ submitCertificate, hasSystemFailure: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    });
  } else if (submitCertificate?.status && submitCertificate?.status === "invalid catch certificate") {
    const { landingsEntryOption } = await getLandingsEntryOption(bearerToken, documentNumber);
    return landingsEntryOption === "directLanding"
      ? redirect(`/create-catch-certificate/${documentNumber}/direct-landing`)
      : redirect(`/create-catch-certificate/${documentNumber}/add-landings`);
  } else if (submitCertificate?.status && submitCertificate?.status === "catch certificate is LOCKED") {
    return redirect(route("/create-catch-certificate/catch-certificates"));
  } else if (submitCertificate?.offlineValidation) {
    return redirect(`/create-catch-certificate/${documentNumber}/catch-certificate-pending`, {
      headers: { "Set-Cookie": updatedSession },
    });
  } else {
    return redirect(`/create-catch-certificate/${documentNumber}/catch-certificate-created`, {
      headers: { "Set-Cookie": updatedSession },
    });
  }
};

export const CheckYourInformationPSSDAction = async (
  request: Request,
  params: Params,
  journey: Journey
): Promise<Response> => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const { errors }: ISubmitResponse = await submitDocument(bearerToken, documentNumber, journey);

  const filterErrors: IError[] | undefined =
    journey === "processingStatement" ? errors?.filter((error: IError) => error.key !== "dateFieldError") : errors;

  return Array.isArray(filterErrors) && filterErrors.length > 0
    ? new Response(JSON.stringify(filterErrors), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    : redirect(
        journey === "processingStatement"
          ? `/create-processing-statement/${documentNumber}/processing-statement-created`
          : `/create-storage-document/${documentNumber}/storage-document-created`
      );
};
