/* eslint-disable no-console */
import { getApplicationInsights } from "~/applicationInsightsService";
import type { IApplicationInsights } from "@microsoft/applicationinsights-web";
import {
  SeverityLevel,
  type ITraceTelemetry,
  type IEventTelemetry,
  type IExceptionTelemetry,
} from "@microsoft/applicationinsights-common";
import { isProdEnv } from "./helpers";

const info = (message: string) => {
  const trace: ITraceTelemetry = {
    message: message,
    severityLevel: SeverityLevel.Information,
  };

  if (!isProdEnv()) {
    console.info(`%c${message}`, "color: #bada55");
    return;
  }

  const appInsights: IApplicationInsights = getApplicationInsights();

  if (appInsights) {
    appInsights.trackTrace(trace);
  }
};

const warning = (message: string) => {
  const trace: ITraceTelemetry = {
    message: message,
    severityLevel: SeverityLevel.Warning,
  };

  if (!isProdEnv()) {
    console.warn(`%c${message}`, "color: #FFBF00");
    return;
  }

  const appInsights: IApplicationInsights = getApplicationInsights();

  if (appInsights) {
    appInsights.trackTrace(trace);
  }
};

const error = (e: Error) => {
  const exceptionTelemetry: IExceptionTelemetry = {
    severityLevel: SeverityLevel.Error,
    exception: e,
  };

  if (!isProdEnv()) {
    console.error(`%c${e.stack ?? e}`, "color: #FF0000");
    return;
  }

  const appInsights: IApplicationInsights = getApplicationInsights();

  if (appInsights) {
    appInsights.trackException(exceptionTelemetry);
  }
};

const event = (name: string, properties: any) => {
  const obj: IEventTelemetry = {
    name,
    properties,
  };

  if (!isProdEnv()) {
    console.log(`%c${obj.name}`);
    return;
  }

  const appInsights: IApplicationInsights = getApplicationInsights();

  if (appInsights) {
    appInsights.trackEvent(obj);
  }
};

export default {
  info,
  warning,
  error,
  event,
};
