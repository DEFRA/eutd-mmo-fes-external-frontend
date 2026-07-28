import { redirect } from "react-router";
import setApiMock from "tests/msw/helpers/setApiMock";
import type { Journey } from "~/types";
import type { reduxRequestParams } from "~/types/reduxRequestParam";
import { getBearerTokenForRequest } from "./auth";
import { deleteDocument } from "./documentDelete";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { createCSRFToken, validateCSRFToken } from "./csrfToken";
import { getProgress } from "./progress";
import { getProcessingStatement } from "./processingStatement";
import { getStorageDocument } from "./storageDocument";

const getDeleteDraftJourney = (request: Request): Journey => {
  const pathname = new URL(request.url).pathname;

  if (pathname.includes("/create-catch-certificate/")) return "catchCertificate";
  if (pathname.includes("/create-processing-statement/")) return "processingStatement";
  if (pathname.includes("/create-non-manipulation-document/")) return "storageNotes";

  throw new Error(`Unsupported delete draft route: ${pathname}`);
};

const isNotFoundError = (error: unknown) => error instanceof Error && /\b404\b/.test(error.message);

const ensureDraftStillExists = async (request: Request, bearerToken: string, documentNumber: string | undefined) => {
  const journey = getDeleteDraftJourney(request);

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

export const deleteDraftFormLoader = async ({ request, params }: reduxRequestParams) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);

  const existenceCheck = await ensureDraftStillExists(request, bearerToken, documentNumber);
  if (existenceCheck) return existenceCheck;

  const session = await getSessionFromRequest(request);
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

export const deleteDraftFormAction = async ({
  journey,
  request,
  params,
  nextUri,
}: reduxRequestParams & { journey: Journey; nextUri: string }) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  return deleteDocument(journey, bearerToken, documentNumber as string, form, nextUri);
};
