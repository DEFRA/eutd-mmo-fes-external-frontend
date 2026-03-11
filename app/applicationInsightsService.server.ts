import { isProdEnv } from "./helpers";
let appInsights: any;

const createApplicationInsightService = () => {
  const initialize = async (instrumentationKey?: string, cloudRoleName?: string) => {
    if (!isProdEnv() || !instrumentationKey || !cloudRoleName) {
      return;
    }

    let imported = await import("applicationinsights");
    appInsights = imported.default || imported;
    appInsights
      .setup(instrumentationKey)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true);
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] =
      cloudRoleName + "-server";
    appInsights.start();

    return appInsights;
  };

  return { initialize };
};

export const serverApplicationinsights = createApplicationInsightService();
