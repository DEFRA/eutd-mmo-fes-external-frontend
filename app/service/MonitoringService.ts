/**
 * Using https://github.com/Azure/azure-sdk-for-js to provide the mechanism to interact with Azure EventHubs
 * Using @azure/event-hubs library
 */
import * as moment from "moment";
import { getEnv } from "~/env.server";
import serverLogger from "~/logger.server";
import { EventHubProducerClient } from "@azure/event-hubs";

const ENV = getEnv();

export const postEventData = async (
  user: string,
  message: string,
  info: string,
  ipAddress: string,
  priorityCode: string,
  sessionId: string | undefined,
  transactionMessage: string
) => {
  serverLogger.info(`[PDF][PROTECTIVE MONITORING][postEventData called]`);
  serverLogger.info(`ENV.EVENT_HUB_CONNECTION_STRING: ${ENV.EVENT_HUB_CONNECTION_STRING}`);
  serverLogger.info(`ENV.EVENT_HUB_NAMESPACE: ${ENV.EVENT_HUB_NAMESPACE}`);
  try {
    const connectionString = ENV.EVENT_HUB_CONNECTION_STRING;
    const eventHubName = ENV.EVENT_HUB_NAMESPACE;
    const client = new EventHubProducerClient(connectionString, eventHubName);

    const eventData = {
      body: {
        user: `IDM/${user}`,
        datetime: moment.utc().toISOString(),
        sessionid: sessionId,
        application: "FI001",
        component: "external app",
        ip: ipAddress,
        pmccode: "0703",
        priority: priorityCode.toString(),
        details: {
          transactioncode: `0706-${transactionMessage}`,
          message: message,
          additionalinfo: info,
        },
        environment: getEnvironment(ENV.FE_URL),
        version: "1.1",
      },
    };
    const eventDataBatch = await client.createBatch();
    eventDataBatch.tryAdd(eventData);
    await client.sendBatch(eventDataBatch);
    serverLogger.info("[MONITORING-SERVICE][DATA][SENT]");
    await client.close();
  } catch (err) {
    serverLogger.error(`[MONITORING-SERVICE][CREATING-EVENT-HUB-CLIENT][ERROR][${err}]`);
  }
};

export const getEnvironment = (baseUrl: string) => {
  const host = baseUrl.toLocaleLowerCase();

  if (host.includes("localhost") || host.includes("127.0.0.1")) return "localhost";
  else if (host.includes("snd")) return "SND";
  else if (host.includes("tst")) return "TST";
  else if (host.includes("pre")) return "PRE";
  else return "PRD";
};
