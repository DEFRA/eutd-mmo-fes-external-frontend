import { getErrorMessage } from "~/helpers";
import { getProgressUrl, checkProgressUrl } from "~/urls.server";
import { get, apiCallFailed } from "~/communication.server";
import type {
  IProgress,
  Journey,
  ITransport,
  ErrorResponse,
  IError,
  IErrorsTransformed,
  ILandingsEntryOptionGet,
  ProcessingStatement,
  IUnauthorised,
} from "~/types";
import serverLogger from "~/logger.server";
import type { Params } from "@remix-run/react";
import { getSessionFromRequest, commitSession, clearSession } from "~/sessions.server";
import { redirect } from "@remix-run/node";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  getBearerTokenForRequest,
  getTransportDetails,
  getLandingsEntryOption,
  getTransportations,
  createCSRFToken,
  validateCSRFToken,
  getProcessingStatement,
} from "~/.server";
import { route } from "routes-gen";
import { getEnv } from "~/env.server";

export const getProgress = async (
  bearerToken: string,
  journey: Journey,
  documentNumber?: string
): Promise<IProgress> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await get(bearerToken, getProgressUrl(journey), { documentnumber: documentNumber });

  return onGetProgressResponse(response);
};

const onGetProgressResponse = async (response: Response): Promise<IProgress> => {
  switch (response.status) {
    case 200:
    case 204:
      try {
        const progress: IProgress = await response.json();
        return progress;
      } catch (e) {
        serverLogger.error(`[PROGRESS][GET-PROGRESS][FAILED][${e}]`);
        return { progress: null };
      }
    case 400:
      const data = await response.json();
      return {
        errors: Object.keys(data).map((key: string) => ({
          key: key,
          message: getErrorMessage(data[key]),
        })),
      };
    case 403:
      return {
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const checkProgress = async (
  bearerToken: string,
  journey: Journey,
  documentNumber?: string
): Promise<IProgress> => {
  if (!documentNumber) {
    throw new Error("Document number is required");
  }

  const response: Response = await get(bearerToken, checkProgressUrl(journey), {
    documentNumber,
  });

  return onCheckProgressResponse(response);
};

const onCheckProgressResponse = async (response: Response): Promise<IProgress> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        errors: [],
      };
    case 400:
      const data = await response.json();
      return {
        errors: Object.keys(data).map((key: string) => ({
          key: key,
          message: getErrorMessage(data[key]),
        })),
      };
    case 403:
      return {
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const progressPageLoader = async (request: Request, params: Params, journey: Journey) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const csrf = createCSRFToken();
  let landingsEntry: ILandingsEntryOptionGet;
  if (journey === "catchCertificate") {
    landingsEntry = await getLandingsEntryOption(bearerToken, documentNumber);
    if (!landingsEntry?.landingsEntryOption) {
      return redirect(route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber }));
    }
  }

  const { progress, completedSections, requiredSections }: IProgress = await getProgress(
    bearerToken,
    journey,
    documentNumber
  );

  let getTransportRes: ITransport | undefined = undefined;
  if (journey === "catchCertificate") {
    const transportations: ITransport[] = await getTransportations(bearerToken, documentNumber);
    const transport: ITransport | undefined = transportations.findLast((transport: ITransport) => transport.id);
    getTransportRes = transport;
    if (progress === null) {
      return redirect(route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber }));
    }
  }

  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  if (journey === "catchCertificate") {
    clearSession(session);
  }

  const copyDocumentAcknowledged = session.get(`copyDocumentAcknowledged-${documentNumber}`) === "Y";
  const copyDocumentNumber = session.get(`documentNumber-${documentNumber}`);
  const voidDocumentConfirm = session.get(`voidOriginal-${documentNumber}`)
    ? session.get(`voidOriginal-${documentNumber}`) == true
    : session.get(`copyVoidDocument-${documentNumber}`) === "voidDocumentConfirm";
  session.unset("exporterCompanyName");
  if (journey === "catchCertificate") {
    session.unset("exporterFullName");
    session.unset("exporterCompanyName");
  }

  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`voidOriginal-${documentNumber}`);
  session.unset(`copyVoidDocument-${documentNumber}`);
  let objectToReturn: any = {
    documentNumber,
    progress,
    completedSections,
    requiredSections,
    copyDocumentAcknowledged,
    voidDocumentConfirm,
    copyDocumentNumber,
  };

  if (journey === "catchCertificate") {
    objectToReturn = {
      ...landingsEntry,
      progress,
      completedSections,
      requiredSections,
      transport: { ...getTransportRes },
      documentNumber,
    };
  } else if (journey === "storageNotes") {
    const transportation: ITransport = await getTransportDetails(bearerToken, "storageNotes", documentNumber);
    objectToReturn = {
      ...objectToReturn,
      transport: transportation,
    };
  } else if (journey === "processingStatement") {
    const processingStatementData: ProcessingStatement | IUnauthorised = await getProcessingStatement(
      bearerToken,
      documentNumber
    );
    const products = (processingStatementData as ProcessingStatement).products ?? [];
    objectToReturn = {
      ...objectToReturn,
      products,
    };
  }

  const displayOptionalSuffix = getEnv().EU_CATCH_FIELDS_OPTIONAL === "true";

  return new Response(JSON.stringify({ ...objectToReturn, csrf, displayOptionalSuffix }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const progressAction = async (
  request: Request,
  params: Params,
  journey: Journey
): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const session = await getSessionFromRequest(request);

  if (journey === "storageNotes" || journey === "processingStatement") {
    session.unset(`documentNumber-${documentNumber}`);
    session.unset(`copyDocumentAcknowledged-${documentNumber}`);
    if (journey === "processingStatement") {
      session.unset(`copyDocument-${documentNumber}`);
    }
  }

  let returnToDashboardRoute = "";
  let checkInfoRoute = "";
  let headers = {};
  switch (journey) {
    case "catchCertificate":
      returnToDashboardRoute = route("/create-catch-certificate/catch-certificates");
      checkInfoRoute = route("/create-catch-certificate/:documentNumber/check-your-information", { documentNumber });
      break;
    case "processingStatement":
      returnToDashboardRoute = route("/create-processing-statement/processing-statements");
      checkInfoRoute = route("/create-processing-statement/:documentNumber/check-your-information", { documentNumber });
      headers = { "Set-Cookie": await commitSession(session) };
      break;
    case "storageNotes":
      returnToDashboardRoute = route("/create-storage-document/storage-documents");
      checkInfoRoute = route("/create-storage-document/:documentNumber/check-your-information", { documentNumber });
      break;
  }

  if (form.get("_action") === "returnToDashboard") return redirect(returnToDashboardRoute, headers);

  const progress: IProgress = await checkProgress(bearerToken, journey, documentNumber);
  const errors: IError[] | IErrorsTransformed = progress.errors as IError[];
  const unauthorised = progress.unauthorised as boolean;

  if (unauthorised) return redirect("/forbidden");
  if (errors.length > 0) {
    const values = Object.fromEntries(form);
    return apiCallFailed(errors, values);
  }

  return redirect(checkInfoRoute, headers);
};
