import { getErrorMessage } from "~/helpers";
import { post } from "~/communication.server";
import { MANUAL_EXPORTER_ADDRESS_URL } from "~/urls.server";
import type { IExporter, Exporter, ICountry, Journey } from "~/types";

export const addManualExporterAddress = async (
  bearerToken: string,
  documentNumber: string | undefined,
  exporter: Exporter,
  country: ICountry,
  journey?: Journey
): Promise<IExporter> => {
  if (!documentNumber) {
    throw new Error("document number is required");
  }
  const response: Response = await post(
    bearerToken,
    MANUAL_EXPORTER_ADDRESS_URL,
    {
      documentnumber: documentNumber,
    },
    {
      ...exporter,
      ...country,
      journey,
    }
  );

  return await onAddManualExporterAddress(response, exporter);
};

const getFieldFromErrorKey = (errorKey: string): string => {
  const parts = errorKey.split(".");
  if (parts[0] === "error" && parts.length > 1) {
    return parts[1];
  }
  return errorKey;
};

const onAddManualExporterAddress = async (response: Response, formData: Exporter): Promise<IExporter> => {
  const data = await response.json();
  switch (response.status) {
    case 200:
    case 204:
      if (Array.isArray(data)) {
        // New way: errors as array of strings
        const errors = data.map((errorKey: string) => ({
          key: getFieldFromErrorKey(errorKey),
          message: getErrorMessage(errorKey),
        }));
        return {
          model: formData,
          error: "invalid",
          errors,
        };
      } else {
        // Success: object
        return {
          model: data,
          error: "",
          errors: [],
        };
      }
    default:
      // For 400, 403, etc., throw with status and data
      throw { status: response.status, data };
  }
};
