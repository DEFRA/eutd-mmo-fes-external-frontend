import type { ILandingsEntryOptionGet, ILandingsEntryOptionPost, LandingEntryType } from "~/types";
import { getErrorMessage } from "~/helpers";
import { LANDINGS_TYPE_URL } from "~/urls.server";
import { get, post } from "~/communication.server";

export const getLandingsEntryOption = async (
  bearerToken: string,
  documentNumber?: string
): Promise<ILandingsEntryOptionGet> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await get(bearerToken, LANDINGS_TYPE_URL, {
    documentNumber,
  });

  return onGetLandingsEntryOptionResponse(response);
};

export const addLandingsEntryOption = async (
  bearerToken: string,
  documentNumber: string | undefined,
  landingsEntryOption: FormDataEntryValue = ""
): Promise<ILandingsEntryOptionPost> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    `${LANDINGS_TYPE_URL}`,
    {
      documentnumber: documentNumber,
    },
    { landingsEntryOption }
  );

  return onAddLandingsEntryOptionResponse(response, landingsEntryOption);
};

const onAddLandingsEntryOptionResponse = async (
  response: Response,
  landingsEntryOption?: FormDataEntryValue
): Promise<ILandingsEntryOptionPost> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        landingsEntryOption: landingsEntryOption as LandingEntryType,
        errors: [],
      };
    case 400:
      const data = await response.json();
      return {
        landingsEntryOption: landingsEntryOption as LandingEntryType,
        errors: [
          {
            key: "landingsEntryOption",
            message: getErrorMessage(data.landingsEntryOption),
          },
        ],
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

const onGetLandingsEntryOptionResponse = async (response: Response): Promise<ILandingsEntryOptionGet> => {
  switch (response.status) {
    case 200:
    case 204:
      const landingsEntryOption: ILandingsEntryOptionGet = await response.json();
      return landingsEntryOption;
    case 403:
      return {
        unauthorised: true,
        generatedByContent: false,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
