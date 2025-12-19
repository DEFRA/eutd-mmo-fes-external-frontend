import type { ICountry, IExportLocationResponse } from "~/types";
import { getErrorMessage } from "~/helpers";
import { get, post } from "~/communication.server";
import { EXPORT_LOCATION_URL, EXPORT_LOCATION_DRAFT_URL } from "~/urls.server";

type RequestBody = {
  exportedFrom?: string;
  loaded?: boolean;
  exportedTo?: ICountry;
};

export const getExportLocation = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<IExportLocationResponse> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await get(bearerToken, EXPORT_LOCATION_URL, {
    documentnumber: documentNumber,
  });

  return onExportLocationResponse(response);
};

export const postExportLocation = async (
  bearerToken: string,
  documentNumber: string | undefined,
  requestBody: RequestBody
): Promise<IExportLocationResponse> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    EXPORT_LOCATION_URL,
    {
      documentnumber: documentNumber,
    },
    {
      ...requestBody,
    }
  );

  return onExportLocationResponse(response);
};

export const postDraftExportLocation = async (
  bearerToken: string,
  documentNumber: string | undefined,
  requestBody: RequestBody
): Promise<IExportLocationResponse> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    `${EXPORT_LOCATION_DRAFT_URL}`,
    {
      documentnumber: documentNumber,
    },
    {
      ...requestBody,
    }
  );

  return onPostDraftExportLocationResponse(response);
};

const onPostDraftExportLocationResponse = async (response: Response): Promise<IExportLocationResponse> => {
  switch (response.status) {
    case 200:
    case 204: {
      const exportLocation = await response.json();
      return exportLocation;
    }
    case 403:
      return {
        unauthorised: true,
      };
    case 400: {
      const data = await response.json();
      const errors = [];
      if (data.exportDestination) {
        errors.push({
          key: "exportDestination",
          message: getErrorMessage(data.exportDestination),
        });
      }
      if (data.pointOfDestination) {
        errors.push({
          key: "pointOfDestination",
          message: getErrorMessage(data.pointOfDestination),
        });
      }
      return {
        errors,
      };
    }
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

const onExportLocationResponse = async (response: Response): Promise<IExportLocationResponse> => {
  switch (response.status) {
    case 200:
    case 204: {
      let exportLocation: IExportLocationResponse = {};
      const res = await response.text();
      if (res) {
        exportLocation = JSON.parse(res);
      }
      return exportLocation;
    }
    case 400: {
      const data = await response.json();
      const errors = [];
      if (data.exportDestination) {
        errors.push({
          key: "exportDestination",
          message: getErrorMessage(data.exportDestination),
        });
      }
      if (data.pointOfDestination) {
        errors.push({
          key: "pointOfDestination",
          message: getErrorMessage(data.pointOfDestination),
        });
      }
      return {
        errors,
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
