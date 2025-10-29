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

const onAddManualExporterAddress = async (response: Response, formData: Exporter): Promise<IExporter> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        model: formData,
        error: "",
        errors: {},
      };
    case 400:
      const data = await response.json();
      return {
        model: formData,
        error: "invalid",
        errors: Object.keys(data).map((key: string) => ({
          key: key,
          message: getErrorMessage(data[key]),
        })),
      };
    case 403:
      return {
        ...(await response.json()),
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
