import type {
  CheckCopyCertificateDocument,
  CopyCertificateDocument,
  CopyCertificateOption,
  ErrorResponse,
  IError,
  Journey,
} from "~/types";
import {
  copyCertificateOptions,
  getErrorMessage,
  getServiceNameFromDocumentNumber,
  psSdCopyCertificateOptions,
  sdCopyCertificateOptions,
} from "~/helpers";
import { CHECK_COPY_URL, CONFIRM_COPY_URL, GET_CLIENT_IP_URL } from "~/urls.server";
import { get, post, apiCallFailed } from "~/communication.server";
import { route } from "routes-gen";
import type { Params } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import { createCSRFToken, getBearerTokenForRequest, validateCSRFToken } from "~/.server";

export const submitCopyDocument = async (
  bearerToken: string,
  payload: CopyCertificateDocument
): Promise<CopyCertificateDocument> => {
  if (!payload.documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  let ipAddress: undefined | string;

  if (payload.voidOriginal) {
    const response = await get(bearerToken, GET_CLIENT_IP_URL);
    ipAddress = await response.text();
  }

  const response: Response = await post(
    bearerToken,
    CONFIRM_COPY_URL,
    {
      documentnumber: payload.documentNumber,
    },
    {
      copyDocumentAcknowledged: payload.copyDocumentAcknowledged,
      voidOriginal: payload.voidOriginal,
      excludeLandings: payload.excludeLandings,
      journey: payload.journey,
      ipAddress,
    }
  );

  return onSubmitCopyDocument(response, payload);
};

const onSubmitCopyDocument = async (
  response: Response,
  payload: CopyCertificateDocument
): Promise<CopyCertificateDocument> => {
  switch (response.status) {
    case 200:
    case 204: {
      const data = await response.json();
      return {
        ...data,
        errors: [],
      };
    }
    case 400: {
      const data = await response.json();
      return {
        ...payload,
        errors: Object.keys(data).map((key: string) => ({
          key: key,
          message: getErrorMessage(data[key]),
        })),
      };
    }
    case 403: {
      const data = await response.json();
      return {
        ...data,
        errors: [],
        unauthorised: true,
      };
    }
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const checkCopyDocument = async (
  bearerToken: string,
  documentNumber?: string
): Promise<CheckCopyCertificateDocument> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await get(bearerToken, `${CHECK_COPY_URL}`, { documentnumber: documentNumber });

  return onCheckCopyDocument(response);
};

const onCheckCopyDocument = async (response: Response): Promise<CheckCopyCertificateDocument> => {
  const data = await response.text();

  switch (response.status) {
    case 200:
    case 204:
      return {
        canCopy: data ? JSON.parse(data).canCopy : false,
      };
    case 403:
      return {
        canCopy: false,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const copyDocumentLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber = "" } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const { canCopy } = await checkCopyDocument(bearerToken, documentNumber);

  if (!canCopy) {
    return redirect("/forbidden");
  }

  const session = await getSessionFromRequest(request);
  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  let backUrl;
  let copyDocumentLabel;
  let copyOptions: CopyCertificateOption[] = [];

  const journey = getServiceNameFromDocumentNumber(documentNumber);
  switch (journey) {
    case "CC":
      backUrl = route("/create-catch-certificate/catch-certificates");
      copyDocumentLabel = "catchCertificateCopyDocumentAcknowledgedMessage";
      copyOptions = copyCertificateOptions;
      break;
    case "PS":
      backUrl = route("/create-processing-statement/processing-statements");
      copyDocumentLabel = "pssdCopyDocumentAcknowledgedMessage";
      copyOptions = psSdCopyCertificateOptions;
      break;
    case "SD":
      backUrl = route("/create-storage-document/storage-documents");
      copyDocumentLabel = "pssdCopyDocumentAcknowledgedMessage";
      copyOptions = sdCopyCertificateOptions;
      break;
  }

  return new Response(JSON.stringify({ documentNumber, backUrl, copyDocumentLabel, copyOptions, csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const copyDocumentAction = async (request: Request, params: Params): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const journey: Journey = form.get("journey") as Journey;
  const copyDocument: string = form.get("copyDocument") as string;

  let cancelRoute = "";
  let voidRoute = "";

  switch (journey) {
    case "catchCertificate":
      cancelRoute = route("/create-catch-certificate/catch-certificates");
      voidRoute = route("/create-catch-certificate/:documentNumber/copy-void-confirmation", { documentNumber });
      break;
    case "processingStatement":
      cancelRoute = route("/create-processing-statement/processing-statements");
      voidRoute = route("/create-processing-statement/:documentNumber/copy-void-confirmation", { documentNumber });
      break;
    case "storageNotes":
      cancelRoute = route("/create-storage-document/storage-documents");
      voidRoute = route("/create-storage-document/:documentNumber/copy-void-confirmation", { documentNumber });
  }

  if (form.get("_action") === "cancel") {
    session.unset(`copyDocumentAcknowledged-${documentNumber}`);
    session.unset(`copyDocument-${documentNumber}`);
    session.unset(`documentNumber-${documentNumber}`);
    const updatedSession = await commitSession(session);
    return redirect(cancelRoute, {
      headers: { "Set-Cookie": updatedSession },
    });
  }

  const filteredKeys = Object.keys(session.data).filter(
    (key) =>
      key.startsWith("copyDocumentAcknowledged-") ||
      key.startsWith("copyDocument-") ||
      key.startsWith("documentNumber-")
  );

  for (const key of filteredKeys) {
    const keyParts = key.split("-");
    if (keyParts.length > 1 && !keyParts[1].includes(documentNumber)) {
      session.unset(key);
    }
  }

  let payload: CopyCertificateDocument = {
    copyDocumentAcknowledged: form.get("copyDocumentAcknowledged") === "Y",
    documentNumber,
    journey,
  };

  switch (copyDocument) {
    case "copyAllCertificateData":
      payload = {
        ...payload,
        voidOriginal: false,
      };
      break;
    case "copyExcludeLandings":
      payload = {
        ...payload,
        voidOriginal: false,
        excludeLandings: true,
      };
      break;
    case "voidDocumentConfirm":
      payload = {
        ...payload,
        voidOriginal: true,
        voidDocumentConfirm: true,
      };
      break;
    default:
      break;
  }

  if (payload.copyDocumentAcknowledged && copyDocument === "voidDocumentConfirm") {
    session.set(`copyDocumentAcknowledged-${documentNumber}`, form.get("copyDocumentAcknowledged"));
    const updatedSession = await commitSession(session);
    return redirect(voidRoute, {
      headers: { "Set-Cookie": updatedSession },
    });
  } else {
    const { errors, newDocumentNumber, unauthorised } = await submitCopyDocument(bearerToken, payload);

    if (unauthorised) {
      return redirect("/forbidden");
    }

    if ((errors as IError[]).length > 0) {
      const values = Object.fromEntries(form);
      return apiCallFailed(errors as IError[], values);
    }

    session.set(`copyDocumentAcknowledged-${newDocumentNumber}`, form.get("copyDocumentAcknowledged"));
    session.set(`copyDocument-${newDocumentNumber}`, copyDocument);
    session.set(`documentNumber-${newDocumentNumber}`, documentNumber);
    const updatedSession = await commitSession(session);

    let progressRoute = "";

    switch (journey) {
      case "catchCertificate":
        progressRoute = route("/create-catch-certificate/:documentNumber/landings-entry", {
          documentNumber: newDocumentNumber,
        });
        break;
      case "processingStatement":
        progressRoute = route("/create-processing-statement/:documentNumber/progress", {
          documentNumber: newDocumentNumber,
        });
        break;
      case "storageNotes":
        progressRoute = route("/create-storage-document/:documentNumber/progress", {
          documentNumber: newDocumentNumber,
        });
        break;
    }

    return redirect(progressRoute, {
      headers: { "Set-Cookie": updatedSession },
    });
  }
};
