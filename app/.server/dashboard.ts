import type { ErrorResponse, IExporter, IGetAllDocumentsData, INotification, Journey, UserAttribute } from "~/types";
import { getAllDocumentsUrl, NOTIFICATION_URL, createDocumentUrl } from "~/urls.server";
import { get, post } from "~/communication.server";
import { getPrivacyNoticeJourney } from "~/helpers";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getBearerTokenForRequest, isAdminUser } from "./auth";
import { getEnv } from "~/env.server";
import { getAllUserAttributes, isAcceptedCookiesAvailable, isPrivacyAccepted } from "./userAttributes";
import { getAccounts, getUserDetails } from "./exporterDetails";
import { redirect } from "@remix-run/node";
import { route } from "routes-gen";
import isEmpty from "lodash/isEmpty";
import { createCSRFToken } from ".";
import { clearSession, commitSession, getSessionFromRequest } from "~/sessions.server";
import i18next from "~/i18next.server";

type CreateDocumentType = {
  documentNumber?: string;
};

export const getDashboardLoader = async (request: Request, journey: Journey, title: string) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const bearerToken = await getBearerTokenForRequest(request);
  const ENV = getEnv();
  const maximumConcurrentDrafts: number = parseInt(ENV.MAXIMUM_CONCURRENT_DRAFTS);
  const url = new URL(request.url);
  const month = url.searchParams.get("month") ? Number(url.searchParams.get("month")) : new Date().getMonth() + 1;
  const year = url.searchParams.get("year") ? Number(url.searchParams.get("year")) : new Date().getFullYear();
  const userAttributes: UserAttribute[] = await getAllUserAttributes(bearerToken);

  if (!isAcceptedCookiesAvailable(userAttributes)) {
    return redirect(route("/cookies"));
  }

  if (!isPrivacyAccepted(userAttributes)) {
    return redirect(route("/:journey/privacy-notice", { journey: getPrivacyNoticeJourney(journey) }));
  }

  const documents = await getAllDocuments(bearerToken, journey, year, month);
  const isAdminSupport: boolean = isAdminUser(bearerToken);
  const emptyExporterFromIdm: IExporter = { error: "", errors: [] };
  const userDetails: IExporter = !isAdminSupport ? await getUserDetails(bearerToken) : emptyExporterFromIdm;
  const accountDetails: IExporter = !isAdminSupport ? getAccounts(bearerToken) : emptyExporterFromIdm;

  let name: string = "";
  if (accountDetails.model?.exporterCompanyName) {
    name = accountDetails.model?.exporterCompanyName;
  } else if (userDetails.model?.exporterFullName) {
    name = userDetails.model?.exporterFullName;
  }

  const t = await i18next.getFixedT(request, ["title"]);
  const session = await getSessionFromRequest(request);
  const csrf = createCSRFToken();
  session.set("csrf", csrf);
  if (journey === "catchCertificate") {
    clearSession(session);
  }
  return new Response(
    JSON.stringify({
      journey,
      documents: documents,
      notification: await getNotification(bearerToken),
      hasDrafts: documents["inProgress"].length > 0,
      showStartButton: documents["inProgress"].length < maximumConcurrentDrafts,
      maximumDrafts: maximumConcurrentDrafts,
      heading: name,
      pageTitle: isEmpty(name) ? t(title, { ns: "title" }) : `${name}: ${t(title, { ns: "title" })}`,
      dashboardFeedbackURL: getEnv().DASHBOARD_FEEDBACK_URL,
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

export const getAllDocuments = async (
  bearerToken: string,
  type: Journey,
  month: number,
  year: number
): Promise<IGetAllDocumentsData> => {
  const response = await get(bearerToken, getAllDocumentsUrl(type, month, year));
  return await response.json();
};

export const getNotification = async (bearerToken: string): Promise<INotification | null> => {
  const response = await get(bearerToken, NOTIFICATION_URL);
  return onNotificationResponse(response);
};

const onNotificationResponse = async (response: Response): Promise<INotification | null> => {
  switch (response.status) {
    case 200:
      return await response.json();
    case 204:
      return null;
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const createDocument = async (bearerToken: string, documentType: Journey): Promise<CreateDocumentType> => {
  const response: Response = await post(bearerToken, createDocumentUrl(documentType), undefined, {
    mmov2: true,
  });

  return onCreateDocumentResponse(response);
};

export const dashboardAction = async (request: Request, journey: Journey): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);

  const { documentNumber }: { documentNumber?: string } = await createDocument(bearerToken, journey);

  if (documentNumber === undefined) {
    return redirect("/forbidden");
  }

  if (journey === "processingStatement") {
    return redirect(route("/create-processing-statement/:documentNumber/progress", { documentNumber }));
  }
  return redirect(route("/create-storage-document/:documentNumber/progress", { documentNumber }));
};

const onCreateDocumentResponse = async (response: Response): Promise<CreateDocumentType> => {
  switch (response.status) {
    case 200:
      return {
        documentNumber: await response.text(),
      };
    case 403:
      return {
        documentNumber: undefined,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
