import type { Params } from "@remix-run/react";
import { getEnv } from "~/env.server";

export const CatchCertificatePendingLoader = async (params: Params): Promise<Response> => {
  const { documentNumber } = params;
  const offlineValidationTime = getEnv().OFFLINE_PROCESSING_TIME_IN_MINUTES;
  return new Response(JSON.stringify({ documentNumber, offlineValidationTime }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
