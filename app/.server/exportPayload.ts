import type { IError, IUnauthorised, ProductsLanded } from "~/types";
import { getErrorMessage } from "~/helpers";
import { EXPORT_PAYLOAD_URL, SAVE_AND_VALIDATE_EXPORT_URL, landingUrl } from "~/urls.server";
import { get, post, deleteRequest } from "~/communication.server";

export const getExportPayload = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<ProductsLanded | IUnauthorised> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await get(bearerToken, EXPORT_PAYLOAD_URL, {
    documentnumber: documentNumber,
  });

  return onGetExportPayloadResponse(response);
};

const onGetExportPayloadResponse = async (response: Response): Promise<ProductsLanded | IUnauthorised> => {
  switch (response.status) {
    case 200:
    case 204:
      const exportPayload = await response.json();
      return exportPayload;
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const saveAddLandingsDetails = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<ProductsLanded | IUnauthorised> => {
  if (!documentNumber) throw new Error("Document number is required");
  const response: Response = await post(bearerToken, SAVE_AND_VALIDATE_EXPORT_URL, {
    documentNumber: documentNumber,
  });

  return saveAddLandingsDetailsResponse(response);
};

const saveAddLandingsDetailsResponse = async (response: Response): Promise<ProductsLanded | IUnauthorised> => {
  switch (response.status) {
    case 200:
    case 204:
      return await response.json();
    case 400:
      const data = await response.json();
      const errors: IError[] = Object.keys(data.errors).map((key: string) =>
        key === "vessel_license"
          ? {
              key: "vessel_license",
              message: "ccContactSupport",
            }
          : {
              key,
              message: getErrorMessage(data.errors[key].key),
              value: {
                species: data.errors[key].params.species,
                state: data.errors[key].params.state,
                presentation: data.errors[key].params.presentation,
                commodityCode: data.errors[key].params.commodityCode,
              },
            }
      );
      return {
        ...data,
        errors,
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

export const removeProduct = async (
  bearerToken: string,
  productId: string,
  documentNumber?: string
): Promise<{ cancel: string }> => {
  if (!documentNumber) {
    throw new Error("document number is required");
  }

  const response: Response = await deleteRequest(bearerToken, `${EXPORT_PAYLOAD_URL}/product/${productId}`, {
    documentnumber: documentNumber,
  });
  return onDeleteProductLandings(response);
};

export const removeLanding = async (
  bearerToken: string,
  productId: string,
  landingId: string,
  documentNumber?: string
): Promise<{ cancel: string }> => {
  if (!documentNumber) {
    throw new Error("document number is required");
  }

  const response: Response = await deleteRequest(bearerToken, `${landingUrl(productId, landingId)}`, {
    documentnumber: documentNumber,
  });

  return onDeleteProductLandings(response);
};

const onDeleteProductLandings = async (response: Response): Promise<{ cancel: string }> => {
  switch (response.status) {
    case 200:
    case 204:
      const removeFishResponse: any = await response.json();
      return removeFishResponse;
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
