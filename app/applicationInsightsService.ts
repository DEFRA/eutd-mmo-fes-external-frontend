import { ApplicationInsights, type ITelemetryItem } from "@microsoft/applicationinsights-web";
import { SeverityLevel, type ITraceTelemetry } from "@microsoft/applicationinsights-common";
import { isProdEnv } from "./helpers";

let appInsights: ApplicationInsights;

const createApplicationInsightService = () => {
  const initialize = (instrumentationKey?: string, cloudRoleName?: string) => {
    if (!isProdEnv() || !instrumentationKey || !cloudRoleName) {
      return;
    }

    appInsights = new ApplicationInsights({
      config: {
        instrumentationKey,
      },
    });
    appInsights.loadAppInsights();
    appInsights.trackPageView();
    appInsights.addTelemetryInitializer((env: ITelemetryItem) => {
      env.tags = env.tags ?? [];
      env.tags["ai.cloud.role"] = cloudRoleName;
    });

    const message = `Application insights enabled with key: ${instrumentationKey} and cloud role name ${cloudRoleName}`;
    const trace: ITraceTelemetry = {
      message: message,
      severityLevel: SeverityLevel.Information,
    };

    appInsights.trackTrace(trace);
  };

  return { appInsights, initialize };
};

export const applicationinsights = createApplicationInsightService();
export const getApplicationInsights = () => appInsights;
