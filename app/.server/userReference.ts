import type { UserReference } from "~/types";
import { getErrorMessage } from "~/helpers";
import { ADD_YOUR_REFERENCE_URL } from "~/urls.server";
import { post, get } from "~/communication.server";

export const getUserReference = async (bearerToken: string, documentNumber?: string): Promise<UserReference> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await get(bearerToken, ADD_YOUR_REFERENCE_URL, {
    documentNumber,
  });

  return onGetUserReferenceResponse(response);
};

export const addUserReference = async (
  bearerToken: string,
  documentNumber: string | undefined,
  userReference: FormDataEntryValue = ""
): Promise<UserReference> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    ADD_YOUR_REFERENCE_URL,
    {
      documentNumber,
    },
    { userReference }
  );

  return onAddUserReferenceResponse(response, userReference);
};

const onAddUserReferenceResponse = async (
  response: Response,
  userReference?: FormDataEntryValue
): Promise<UserReference> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        userReference: userReference as string,
        errors: [],
      };
    case 400:
      const data = await response.json();
      return {
        userReference: userReference as string,
        errors: [
          {
            key: "userReference",
            message: getErrorMessage(data.userReference),
          },
        ],
      };
    case 403:
      return {
        unauthorised: true,
        errors: [],
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

const onGetUserReferenceResponse = async (response: Response): Promise<UserReference> => {
  switch (response.status) {
    case 200:
    case 204:
      const userReference: string = await response.text();
      return { userReference };
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
