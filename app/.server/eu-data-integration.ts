import { redirect, type Params } from "react-router";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getBearerTokenForRequest } from "./auth";
import { getEUIntegrationStatusUrl } from "~/urls.server";
import { get } from "~/communication.server";
import logger from "~/logger";
import type { ICatchStatus, EuStatus } from "~/types";
import i18next from "~/i18next.server";
import { validateResponseData } from "./common";

const getServiceNameFromDocumentNumber = (documentNumber: string) => {
  if (documentNumber && documentNumber.length > 11) {
    return documentNumber.substring(9, 11);
  }

  return null;
};

export const getEuDataIntegration = async (
  bearerToken: string,
  documentNumber: string,
  euStatus: string
): Promise<any> => {
  // Validate documentNumber exists before proceeding
  if (!documentNumber || documentNumber.trim() === "") {
    logger.error(new Error("Missing or invalid documentNumber in EU data integration"));
    return redirect("/forbidden");
  }

  const response: Response = await get(bearerToken, getEUIntegrationStatusUrl(euStatus), {
    documentnumber: documentNumber,
  });

  return onGetEuDataIntegrationResponse(response);
};

const onGetEuDataIntegrationResponse = async (response: Response): Promise<any> => {
  switch (response.status) {
    case 200:
    case 204: {
      const data: ICatchStatus = await response.json();
      return {
        ...data,
        catchReferenceNumber: data.reference ?? "",
      };
    }
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const EuDataIntegrationLoader = async (request: Request, params: Params, euStatus: EuStatus) => {
  setApiMock(request.url);

  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber = "" } = params;

  const euIntegrationResponse = await getEuDataIntegration(bearerToken, documentNumber, euStatus);
  validateResponseData(euIntegrationResponse);

  const t = await i18next.getFixedT(request, ["common", "title"]);

  // Get page title based on status
  const pageTitleMap: Record<EuStatus, string> = {
    SUCCESS: t("euIntegrationSuccessfulTitle"),
    IN_PROGRESS: t("euIntegrationPendingTitle"),
    FAILURE: t("euIntegrationFailedTitle"),
  };

  return new Response(
    JSON.stringify({
      ...euIntegrationResponse,
      pageTitle: pageTitleMap[euStatus],
      commonTitle: t(`${getServiceNameFromDocumentNumber(documentNumber)?.toLowerCase()}CommonTitle`),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
