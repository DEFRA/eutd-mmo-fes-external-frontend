import { redirect, type Params } from "react-router";

import {
  createCSRFToken,
  getBearerTokenForRequest,
  getCatchCertificatePreSubmitBundle,
  getCatchCertificateSummary,
  getLandingsEntryOption,
  getProgress,
  hasRequiredDataCatchCertificateSummary,
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

const clearCopyContext = (session: any, documentNumber: string | undefined) => {
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`voidOriginal-${documentNumber}`);
  session.unset(`copyVoidDocument-${documentNumber}`);
};

export const CheckYourInformationLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const csrf = await createCSRFToken(request);
  const session = await getSessionFromRequest(request);
  const { documentNumber } = params;
  session.set("csrf", csrf);

  const copyDocumentAcknowledged = session.get(`copyDocumentAcknowledged-${documentNumber}`) === "Y";
  const copyDocumentNumber = session.get(`documentNumber-${documentNumber}`);
  const preSubmitBundle = await getCatchCertificatePreSubmitBundle(bearerToken, documentNumber);
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
  }: ICatchCertificateSummary =
    preSubmitBundle?.summary ?? (await getCatchCertificateSummary(bearerToken, documentNumber)) ?? {};
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
    const { requiredSections, completedSections }: IProgress =
      preSubmitBundle?.completeness ?? (await getProgress(bearerToken, "catchCertificate", documentNumber));

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
      copyDocumentAcknowledged,
      copyDocumentNumber,
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
    clearCopyContext(session, documentNumber);
    const successSession = await commitSession(session);
    return redirect(`/create-catch-certificate/${documentNumber}/catch-certificate-pending`, {
      headers: { "Set-Cookie": successSession },
    });
  } else {
    clearCopyContext(session, documentNumber);
    const successSession = await commitSession(session);
    return redirect(`/create-catch-certificate/${documentNumber}/catch-certificate-created`, {
      headers: { "Set-Cookie": successSession },
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
  const session = await getSessionFromRequest(request);

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

  const { errors }: ISubmitResponse = await submitDocument(bearerToken, documentNumber, journey, ipAddress);

  const filterErrors: IError[] | undefined =
    journey === "processingStatement" ? errors?.filter((error: IError) => error.key !== "dateFieldError") : errors;

  const redirectPath =
    journey === "processingStatement"
      ? `/create-processing-statement/${documentNumber}/processing-statement-created`
      : `/create-non-manipulation-document/${documentNumber}/non-manipulation-document-created`;

  if (Array.isArray(filterErrors) && filterErrors.length > 0) {
    return new Response(JSON.stringify(filterErrors), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  clearCopyContext(session, documentNumber);
  return redirect(redirectPath, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
