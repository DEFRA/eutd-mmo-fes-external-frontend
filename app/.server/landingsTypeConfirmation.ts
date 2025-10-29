import type { ILandingsEntryChange, LandingEntryType } from "~/types";
import { getErrorMessage } from "~/helpers";
import { CONFIRM_CHANGE_LANDINGS_TYPE_URL } from "~/urls.server";
import { post } from "~/communication.server";

export const confirmChangeLandingsType = async (
  bearerToken: string,
  documentNumber: string | undefined,
  currentUri: string,
  journey: string,
  landingsEntryConfirmation: string,
  landingsEntryOption: LandingEntryType
): Promise<ILandingsEntryChange> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  } else if (!journey) {
    throw new Error("Journey is required");
  }

  const requestBody = { currentUri, journey, landingsEntryConfirmation, landingsEntryOption };
  const response: Response = await post(
    bearerToken,
    `${CONFIRM_CHANGE_LANDINGS_TYPE_URL}`,
    { documentnumber: documentNumber },
    { ...requestBody }
  );

  return onConfirmChangeLandingsType(response);
};

const onConfirmChangeLandingsType = async (response: Response): Promise<ILandingsEntryChange> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        errors: [],
      };
    case 400:
      const { landingsEntryConfirmation } = await response.json();
      return {
        errors: [
          {
            key: "confirmLandingsTypes",
            message: getErrorMessage(landingsEntryConfirmation),
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
