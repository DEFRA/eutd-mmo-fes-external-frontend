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
    const fieldName = parts[1];
    // Map composite addressFirstPart error to buildingNumber (first field in the group)
    if (fieldName === "addressFirstPart") {
      return "buildingNumber";
    }
    return fieldName;
  }
  return errorKey;
};

const onAddManualExporterAddress = async (response: Response, formData: Exporter): Promise<IExporter> => {
  let data;
  try {
    data = await response.json();
  } catch {
    // If JSON parsing fails (e.g., empty response), use empty object
    data = {};
  }

  switch (response.status) {
    case 200:
    case 204:
      if (Array.isArray(data)) {
        // New way: errors as array of strings
        const errors = data.flatMap((errorKey: string) => {
          const fieldName = getFieldFromErrorKey(errorKey);
          const message = getErrorMessage(errorKey);

          // If this is the addressFirstPart error, map it to all four fields
          if (errorKey.includes("addressFirstPart")) {
            return [
              { key: "buildingNumber", message },
              { key: "buildingName", message },
              { key: "subBuildingName", message },
              { key: "streetName", message },
            ];
          }

          return [{ key: fieldName, message }];
        });
        return {
          model: formData,
          error: "invalid",
          errors,
        };
      } else if (data.unauthorised) {
        // Handle unauthorised flag in 200 response
        return {
          model: formData,
          error: "",
          errors: [],
          unauthorised: true,
        };
      } else {
        // Success: object
        return {
          model: data,
          error: "",
          errors: [],
        };
      }
    case 400:
      // Handle both array and object formats
      if (Array.isArray(data)) {
        // New way: errors as array of strings
        const errors = data.flatMap((errorKey: string) => {
          const fieldName = getFieldFromErrorKey(errorKey);
          const message = getErrorMessage(errorKey);

          // If this is the addressFirstPart error, map it to all four fields
          if (errorKey.includes("addressFirstPart")) {
            return [
              { key: "buildingNumber", message },
              { key: "buildingName", message },
              { key: "subBuildingName", message },
              { key: "streetName", message },
            ];
          }

          return [{ key: fieldName, message }];
        });
        return {
          model: formData,
          error: "invalid",
          errors,
        };
      } else {
        // Old way: errors as object with field names as keys
        return {
          model: formData,
          error: "invalid",
          errors: Object.keys(data).map((key: string) => ({
            key: key,
            message: getErrorMessage(data[key]),
          })),
        };
      }
    case 403:
      // Handle 403 Forbidden - return with unauthorised flag
      return {
        model: formData,
        error: "",
        errors: [],
        unauthorised: true,
      };
    default:
      // For other error status codes, throw with status and data
      throw { status: response.status, data };
  }
};
