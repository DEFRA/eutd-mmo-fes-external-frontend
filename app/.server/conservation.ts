import { getErrorMessage } from "~/helpers";
import { get, post } from "~/communication.server";
import { CONSERVATION_URL } from "~/urls.server";
import type { IBase, IConservation } from "~/types";

export const getConservation = async (bearerToken: string, documentNumber?: string): Promise<IConservation> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await get(bearerToken, `${CONSERVATION_URL}`, {
    documentnumber: documentNumber,
  });

  return onGetConservationResponse(response);
};

export const saveConservation = async (
  bearerToken: string,
  documentNumber: string | undefined,
  conservation: any,
  currentUri: string,
  nextUri: string,
  isConservationSavedAsDraft: boolean
): Promise<IBase> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    CONSERVATION_URL,
    {
      documentnumber: documentNumber,
    },
    { ...conservation, currentUri, nextUri, isConservationSavedAsDraft }
  );
  return onSaveConservationResponse(response);
};

const onSaveConservationResponse = async (response: Response): Promise<IBase> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        errors: [],
      };
    case 400:
      const errorsResponse = await response.json();
      return {
        errors: Object.keys(errorsResponse).map((error) => ({
          key: error,
          message: getErrorMessage(errorsResponse[error]),
        })),
      };
    case 403:
      return {
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

const onGetConservationResponse = async (response: Response): Promise<IConservation> => {
  switch (response.status) {
    case 200:
    case 204:
      let conservation: IConservation = {};
      const res = await response.text();
      if (res) {
        conservation = JSON.parse(res);
      }
      return conservation;
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
