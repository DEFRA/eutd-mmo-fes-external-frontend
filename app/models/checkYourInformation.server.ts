import { redirect, type Params } from "react-router";

import {
  createCSRFToken,
  getBearerTokenForRequest,
  getCatchCertificateSummary,
  getStorageDocument,
  getLandingsEntryOption,
  getProgress,
  hasRequiredDataCatchCertificateSummary,
  instanceOfUnauthorised,
  checkProgress,
  submitDocument,
  submitExportCertificate,
  transformError,
  validateCSRFToken,
} from "~/.server";
import { get } from "~/communication.server";
import { GET_CLIENT_IP_URL } from "~/urls.server";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import type {
  ICatchCertificateSubmitResponse,
  ICatchCertificateSummary,
  IError,
  IProgress,
  ISubmitResponse,
  IUnauthorised,
  IValidationError,
  Journey,
  StorageDocument,
  StorageDocumentCatch,
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

const parseWeight = (value: string | number | null | undefined): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedWeight = Number(value);
  return Number.isFinite(parsedWeight) ? parsedWeight : undefined;
};

const validateStorageDocumentWeightRelationships = (catches: StorageDocumentCatch[] = []): IValidationError[] => {
  const validationErrors: IValidationError[] = [];

  catches.forEach((catchItem: StorageDocumentCatch, index: number) => {
    const arrivalProductWeight = parseWeight(catchItem.netWeightProductArrival);
    const departureProductWeight = parseWeight(catchItem.netWeightProductDeparture);
    const arrivalFisheryWeight = parseWeight(catchItem.netWeightFisheryProductArrival);
    const departureFisheryWeight = parseWeight(catchItem.netWeightFisheryProductDeparture);

    if (
      arrivalProductWeight !== undefined &&
      departureProductWeight !== undefined &&
      departureProductWeight > arrivalProductWeight
    ) {
      validationErrors.push({
        key: `validationError-product-departure-exceeds-arrival-${index}`,
        message: "sdNetWeightProductDepartureExceedsArrival",
        certificateNumber: catchItem.certificateNumber,
        product: catchItem.product,
      });
    }

    if (
      arrivalFisheryWeight !== undefined &&
      departureFisheryWeight !== undefined &&
      departureFisheryWeight > arrivalFisheryWeight
    ) {
      validationErrors.push({
        key: `validationError-fishery-departure-exceeds-arrival-${index}`,
        message: "sdNetWeightProductDepartureExceedsArrival",
        certificateNumber: catchItem.certificateNumber,
        product: catchItem.product,
      });
    }
  });

  return validationErrors;
};

export const CheckYourInformationLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const csrf = await createCSRFToken(request);
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
    userReference,
  }: ICatchCertificateSummary = (await getCatchCertificateSummary(bearerToken, documentNumber)) ?? {};
  if (status === "COMPLETE") {
    return redirect("/create-catch-certificate/catch-certificates");
  }

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
      userReference,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const CheckYourInformationAction = async (request: Request, params: Params): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);

  // Parallelize form data parsing and IP address fetch — both only require the
  // bearer token and are independent of each other.
  const [form, ipAddress] = await Promise.all([
    request.formData(),
    get(bearerToken, GET_CLIENT_IP_URL).then((r) => r.text()),
  ]);

  const values = Object.fromEntries(form);
  const journey = form.get("journey") as Journey;
  const session = await getSessionFromRequest(request);
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const submitCertificate: ICatchCertificateSubmitResponse = await submitExportCertificate(
    bearerToken,
    documentNumber,
    journey,
    ipAddress
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

  // Get bearer token first so it is available for the parallel IP fetch below.
  const bearerToken = await getBearerTokenForRequest(request);

  // Parallelise form data parsing and client IP fetch — both only require the
  // bearer token and are independent of each other.
  const [form, ipAddress] = await Promise.all([
    request.formData(),
    get(bearerToken, GET_CLIENT_IP_URL).then((r) => r.text()),
  ]);

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  // Re-validate document completeness before submitting. Editing arrival weights
  // via the "Change" link on this page clears departure weights server-side; the
  // user can return here directly via the nextUri parameter and would otherwise
  // be able to submit a document with blank departure weights on the generated
  // PDF (DEFECT-592 / FI0-11257). The orchestration /v1/progress/complete/{journey}
  // endpoint returns 400 with per-section errors when any required section is
  // incomplete; in that case bounce the user back to the progress page.
  const completeness: IProgress = await checkProgress(bearerToken, journey, documentNumber);
  if (completeness.unauthorised) return redirect("/forbidden");
  if (Array.isArray(completeness.errors) && completeness.errors.length > 0) {
    const progressPath =
      journey === "processingStatement"
        ? `/create-processing-statement/${documentNumber}/progress`
        : `/create-non-manipulation-document/${documentNumber}/progress`;
    return redirect(progressPath);
  }

  if (journey === "storageNotes") {
    const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);
    if (instanceOfUnauthorised(storageDocument)) {
      return redirect("/forbidden");
    }

    const weightRelationshipValidationErrors = validateStorageDocumentWeightRelationships(
      storageDocument.catches ?? []
    );
    if (weightRelationshipValidationErrors.length > 0) {
      return new Response(JSON.stringify(weightRelationshipValidationErrors), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  const { errors }: ISubmitResponse = await submitDocument(bearerToken, documentNumber, journey, ipAddress);

  const filterErrors: IError[] | undefined =
    journey === "processingStatement" ? errors?.filter((error: IError) => error.key !== "dateFieldError") : errors;

  const redirectPath =
    journey === "processingStatement"
      ? `/create-processing-statement/${documentNumber}/processing-statement-created`
      : `/create-non-manipulation-document/${documentNumber}/non-manipulation-document-created`;

  return Array.isArray(filterErrors) && filterErrors.length > 0
    ? new Response(JSON.stringify(filterErrors), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    : redirect(redirectPath);
};
