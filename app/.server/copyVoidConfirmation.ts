import type { Params } from "@remix-run/react";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  checkCopyDocument,
  createCSRFToken,
  getBearerTokenForRequest,
  submitCopyDocument,
  validateCSRFToken,
} from "~/.server";
import { redirect } from "@remix-run/node";
import { apiCallFailed } from "~/communication.server";
import type { CopyCertificateDocument, ErrorResponse, IError, Journey } from "~/types";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import logger from "~/logger";

export const copyVoidConfirmationLoader = async (request: Request, params: Params, journey: string) => {
  /* istanbul ignore next */
  try {
    setApiMock(request.url);

    const { documentNumber } = params;
    const bearerToken = await getBearerTokenForRequest(request);
    const { canCopy } = await checkCopyDocument(bearerToken, documentNumber);
    const session = await getSessionFromRequest(request);
    const csrf = createCSRFToken();
    session.set("csrf", csrf);

    if (!canCopy || !session.has(`copyDocumentAcknowledged-${documentNumber}`)) {
      return redirect("/forbidden");
    }
    return new Response(JSON.stringify({ documentNumber, csrf }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    logger.error(new Error(`Error in copy-void-confirmation for ${journey} ${error}`));
  }
};

export const copyVoidConfirmationAction = async (
  request: Request,
  params: Params
): Promise<Response | ErrorResponse> => {
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const buttonClicked = form.get("_action");
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const journey: Journey = form.get("journey") as Journey;
  const session = await getSessionFromRequest(request);
  let copyVoidDocument: boolean | null | string | undefined = form.get("voidOriginal") as
    | boolean
    | null
    | string
    | undefined;

  copyVoidDocument = copyVoidDocument !== null ? copyVoidDocument === "Yes" : undefined;
  const copyDocumentAcknowledged: boolean = session.get(`copyDocumentAcknowledged-${documentNumber}`) === "Y";

  let payload: CopyCertificateDocument = {
    copyDocumentAcknowledged: copyDocumentAcknowledged,
    voidOriginal: copyVoidDocument,
    excludeLandings: false,
    journey,
    documentNumber,
  };

  let cancelButtonUrl = "";
  let completeUrl = "";
  switch (journey) {
    case "catchCertificate":
      cancelButtonUrl = "/create-catch-certificate/catch-certificates";
      completeUrl = "/create-catch-certificate/:documentNumber/landings-entry";
      break;
    case "processingStatement":
      cancelButtonUrl = "/create-processing-statement/processing-statements";
      completeUrl = "/create-processing-statement/:documentNumber/progress";
      break;
    case "storageNotes":
      cancelButtonUrl = "/create-storage-document/storage-documents";
      completeUrl = "/create-storage-document/:documentNumber/progress";
      break;
  }

  if (buttonClicked === "cancel") {
    return redirect(route(cancelButtonUrl as any));
  }

  const { errors, newDocumentNumber } = await submitCopyDocument(bearerToken, payload);
  if ((errors as IError[]).length > 0) {
    const values = Object.fromEntries(form);
    return apiCallFailed(errors as IError[], values);
  }

  session.set(
    `copyDocumentAcknowledged-${newDocumentNumber}`,
    session.get(`copyDocumentAcknowledged-${documentNumber}`)
  );
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.set(`voidOriginal-${newDocumentNumber}`, copyVoidDocument);
  session.set(`documentNumber-${newDocumentNumber}`, documentNumber);

  const updatedSession = await commitSession(session);
  return redirect(route(completeUrl as any, { documentNumber: newDocumentNumber }), {
    headers: { "Set-Cookie": updatedSession },
  });
};
