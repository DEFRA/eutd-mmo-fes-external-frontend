import setApiMock from "tests/msw/helpers/setApiMock";
import { redirect, type Params } from "react-router";
import { route } from "routes-gen";
import type { ErrorResponse, Journey } from "~/types";
import { apiCallFailed } from "~/communication.server";
import {
  getProgress,
  getProcessingStatement,
  getStorageDocument,
  getBearerTokenForRequest,
  addVoidCertificateConfirmation,
  createCSRFToken,
  validateCSRFToken,
} from "~/.server";

import { commitSession, getSessionFromRequest } from "~/sessions.server";

const getVoidedSessionKey = (documentNumber: string | undefined) => `voided-${documentNumber ?? "unknown"}`;

const getVoidJourney = (request: Request): Journey => {
  const pathname = new URL(request.url).pathname;

  if (pathname.includes("/create-catch-certificate/")) return "catchCertificate";
  if (pathname.includes("/create-processing-statement/")) return "processingStatement";
  if (pathname.includes("/create-non-manipulation-document/")) return "storageNotes";

  throw new Error(`Unsupported void draft route: ${pathname}`);
};

const isNotFoundError = (error: unknown) => error instanceof Error && /\b404\b/.test(error.message);

const ensureDraftStillExists = async (request: Request, bearerToken: string, documentNumber: string | undefined) => {
  const journey = getVoidJourney(request);

  try {
    switch (journey) {
      case "catchCertificate": {
        const progress = await getProgress(bearerToken, journey, documentNumber);
        if (progress.unauthorised) return redirect("/forbidden");
        break;
      }
      case "processingStatement": {
        const processingStatement = await getProcessingStatement(bearerToken, documentNumber);
        if ("unauthorised" in processingStatement && processingStatement.unauthorised) return redirect("/forbidden");
        break;
      }
      case "storageNotes": {
        const storageDocument = await getStorageDocument(bearerToken, documentNumber);
        if ("unauthorised" in storageDocument && storageDocument.unauthorised) return redirect("/forbidden");
        break;
      }
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      return redirect("/forbidden");
    }

    throw error;
  }
};

export const voidThisDocumentLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);
  const { documentNumber } = params;
  const session = await getSessionFromRequest(request);
  const wasVoidedInSession = session.get(getVoidedSessionKey(documentNumber)) === "Y";

  if (wasVoidedInSession) {
    const bearerToken = await getBearerTokenForRequest(request);
    const existenceCheck = await ensureDraftStillExists(request, bearerToken, documentNumber);
    if (existenceCheck) return existenceCheck;
  }

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);
  return new Response(JSON.stringify({ documentNumber, csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const voidThisDocumentAction = async (
  request: Request,
  params: Params,
  nextUri: any
): Promise<Response | ErrorResponse> => {
  const session = await getSessionFromRequest(request);
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const { documentNumber } = params;
  const journey = form.get("journey") as Journey;
  const response = await addVoidCertificateConfirmation(
    bearerToken,
    documentNumber,
    journey,
    nextUri,
    form.get("documentVoid") as string
  );
  const errors = response.errors ?? [];
  const unauthorised = response.unauthorised as boolean;

  if (unauthorised) {
    return redirect("/forbidden");
  }

  if (Array.isArray(errors) && errors.length > 0) {
    return apiCallFailed(errors);
  }

  if (response.documentVoid === "Yes") {
    session.set(getVoidedSessionKey(documentNumber), "Y");
  }

  return redirect(route(nextUri), {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
