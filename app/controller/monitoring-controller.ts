import { postEventData } from "../service/MonitoringService";
import serverLogger from "~/logger.server";

const CATCH_CERTIFICATE_KEY = "catchCert";
const PROCESSING_STATEMENT_KEY = "processingStatement";
const STORAGE_DOCUMENT_KEY = "storageDocument";

const MESSAGE_CATCH_CERTIFICATE = "catch certificate";
const MESSAGE_PROCESSING_STATEMENT = "processing statement";
const MESSAGE_STORAGE_DOCUMENT = "storage document";

export const monitoringController = async (
  journey:
    | typeof CATCH_CERTIFICATE_KEY
    | typeof PROCESSING_STATEMENT_KEY
    | typeof STORAGE_DOCUMENT_KEY
    | "journey type is unknown",
  documentNumber: string,
  priorityCode: "0" | "9",
  clientip: string,
  info: string,
  description: string,
  sessionId: string | undefined,
  transactionMessage: string
) => {
  serverLogger.info(`[PDF][PROTECTIVE MONITORING][monitoringController called]`);
  let monitoringInfo, message;
  const userPrincipal = "USER UNIDENTIFIED";

  if (journey === CATCH_CERTIFICATE_KEY) {
    monitoringInfo = `${info}/${MESSAGE_CATCH_CERTIFICATE}/dn:${documentNumber}`;
    message = `${description} ${MESSAGE_CATCH_CERTIFICATE}`;
  } else if (journey === PROCESSING_STATEMENT_KEY) {
    monitoringInfo = `${info}/${MESSAGE_PROCESSING_STATEMENT}/dn:${documentNumber}`;
    message = `${description} ${MESSAGE_PROCESSING_STATEMENT}`;
  } else if (journey === STORAGE_DOCUMENT_KEY) {
    monitoringInfo = `${info}/${MESSAGE_STORAGE_DOCUMENT}/dn:${documentNumber}`;
    message = `${description} ${MESSAGE_STORAGE_DOCUMENT}`;
  } else {
    monitoringInfo = `${info}/${journey}/dn:${documentNumber}`;
    message = `${description} ${journey}`;
  }

  await postEventData(
    userPrincipal,
    message,
    monitoringInfo,
    clientip,
    priorityCode,
    sessionId,
    transactionMessage
  ).catch((err) => serverLogger.error(`Protective Monitoring data has not been sent: ${err}`));
};
