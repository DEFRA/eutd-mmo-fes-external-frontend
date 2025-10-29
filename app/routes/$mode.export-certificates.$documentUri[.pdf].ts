import jwt from "jsonwebtoken";
import { getEnv } from "~/env.server";
import {
  getDocumentInfo,
  validateOwnership,
  retrieveDocFromStorage,
  Unauthorised401HttpResponse,
  OK200HttpResponse,
  getBearerTokenForRequest,
  isAdminUser,
} from "~/.server";
import { type LoaderFunction } from "@remix-run/node";
import setApiMock from "tests/msw/helpers/setApiMock";
import { monitoringController } from "~/controller/monitoring-controller";
import { getServiceNameFromDocumentNumber } from "~/helpers";
import serverLogger from "~/logger.server";

const ENV = getEnv();
const PROTECTIVE_MONITORING_PRIORITY_NORMAL = "0";
const PROTECTIVE_MONITORING_PRIORITY_EXCEPTION = "9";
const PROTECTIVE_MONITORING_QR_VOID = "VOID";
const PROTECTIVE_MONITORING_QR_404 = "404";
const AUTHENTICATION_NOT_REQUIRED = "AUTHENTICATION-NOT-REQUIRED";
const fireProtectiveMonitoringEvent = async (
  productType: "catchCert" | "processingStatement" | "storageDocument" | "journey type is unknown",
  documentNumber: string,
  priority: "0" | "9",
  ip: string,
  sessionId: string | undefined,
  messageType: string
) => {
  serverLogger.info(`[PDF][PROTECTIVE MONITORING][fireProtectiveMonitoringEvent called]`);
  let info, description, transactionMessage;
  switch (messageType) {
    case PROTECTIVE_MONITORING_QR_VOID:
      info = "VOID document QR code scanned";
      description = "User scanned the QR code of a VOID";
      transactionMessage = `QR-VOID-${getServiceNameFromDocumentNumber(documentNumber)}`;
      break;
    case PROTECTIVE_MONITORING_QR_404:
      info = "QR code scanned but document does not exist";
      description = "User scanned the QR code of a non-existent document -";
      transactionMessage = `QR-404-${getServiceNameFromDocumentNumber(documentNumber)}`;
      break;
    default:
      info = "QR code scanned";
      description = "User successfully scanned the QR code of a";
      transactionMessage = `QR-${getServiceNameFromDocumentNumber(documentNumber)}`;
      break;
  }

  await monitoringController(
    productType,
    documentNumber,
    priority,
    ip,
    info,
    description,
    sessionId,
    transactionMessage
  ).catch((err) => serverLogger.error(`Error in submitting Protective Monitoring Event:  ${err}`));
};

const getIPaddress = (req: Request) => {
  const xFF = req.headers.get("x-forwarded-for");
  return xFF ? xFF.split(",")[0] : "";
};

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const validModes = ["pdf", "qr"];
  const mode = params.mode ?? "";
  if (!validModes.includes(mode) || params.documentUri == undefined) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const bearerToken = mode === validModes[0] ? await getBearerTokenForRequest(request) : AUTHENTICATION_NOT_REQUIRED;

  if (!bearerToken) {
    return Unauthorised401HttpResponse();
  }

  const claims: any = mode === validModes[0] ? jwt.decode(bearerToken) : {};
  const requestByAdmin = mode === validModes[0] ? isAdminUser(bearerToken) : null;
  const requestByUser = claims && !requestByAdmin ? claims.sub : null;
  const blobName = `${params.documentUri}.pdf`;
  const { documentType, documentNumber, createdBy, contactId, documentStatus } = await getDocumentInfo(blobName);
  const ipAaddress = getIPaddress(request);
  const sessionId = requestByUser ? `${claims.auth_time}:${claims.contactId}` : undefined;
  const claimsContactId = claims?.contactId;

  if (
    !requestByAdmin &&
    mode === validModes[0] &&
    !ENV.DISABLE_IDM &&
    !validateOwnership(requestByUser, claimsContactId, contactId, createdBy)
  ) {
    return Unauthorised401HttpResponse();
  }

  if (documentStatus === "VOID") {
    if (mode === validModes[1]) {
      serverLogger.info(
        `[PDF][PROTECTIVE MONITORING][VOID][${documentType}, ${documentNumber}, ${PROTECTIVE_MONITORING_PRIORITY_NORMAL}, ${ipAaddress}, ${sessionId}, ${PROTECTIVE_MONITORING_QR_VOID}]`
      );
      await fireProtectiveMonitoringEvent(
        documentType,
        documentNumber,
        PROTECTIVE_MONITORING_PRIORITY_NORMAL,
        ipAaddress,
        sessionId,
        PROTECTIVE_MONITORING_QR_VOID
      );
    }
    return new Response(
      "The certificate number entered is not valid. The certificate number entered refers to a VOID certificate. For further enquiries please contact ukiuuslo@marinemanagement.org.uk",
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  const pdfBlob = await retrieveDocFromStorage(ENV.BLOB_STORAGE_CONNECTION, params.documentUri);
  if (pdfBlob == null) {
    if (mode === validModes[1]) {
      serverLogger.info(
        `[PDF][PROTECTIVE MONITORING][404]["journey type is unknown", ${documentNumber}, ${PROTECTIVE_MONITORING_PRIORITY_NORMAL}, ${ipAaddress}, ${sessionId}, ${PROTECTIVE_MONITORING_QR_404}]`
      );
      await fireProtectiveMonitoringEvent(
        "journey type is unknown",
        `[document uuid:${params.documentUri}]`,
        PROTECTIVE_MONITORING_PRIORITY_EXCEPTION,
        ipAaddress,
        sessionId,
        PROTECTIVE_MONITORING_QR_404
      );
    }
    return new Response(
      "Please use <a href='https://check-fish-exports-certificate.service.gov.uk'>https://check-fish-exports-certificate.service.gov.uk</a> to check the validation status of this document",
      {
        status: 404,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  if (documentStatus === "COMPLETE") {
    if (mode === validModes[1]) {
      serverLogger.info(
        `[PDF][PROTECTIVE MONITORING][COMPLETE][${documentType}, ${documentNumber}, ${PROTECTIVE_MONITORING_PRIORITY_NORMAL}, ${ipAaddress}, ${sessionId}]`
      );
      await fireProtectiveMonitoringEvent(
        documentType,
        documentNumber,
        PROTECTIVE_MONITORING_PRIORITY_NORMAL,
        ipAaddress,
        sessionId,
        ""
      );
    }
  }

  return OK200HttpResponse(pdfBlob);
};
