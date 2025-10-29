import { getErrorMessage } from "~/helpers";
import { findAddress } from "~/urls.server";
import { getReferenceData } from "~/communication.server";
import type { ILookUpAddress } from "~/types";

export const postCodeLookUp = async (postcode: string | undefined): Promise<ILookUpAddress> => {
  const response: Response = await getReferenceData(findAddress(postcode));
  return onPostCodeResponse(response);
};

const onPostCodeResponse = async (response: Response): Promise<ILookUpAddress> => {
  const data = await response.json();
  switch (response.status) {
    case 200:
      return { data, errors: [] };
    case 400:
      const errorMessage: string = getErrorMessage(data.postcode);
      return {
        data,
        errors: [
          {
            key: "postcode",
            message: errorMessage || "commonLookupAddressPageErrorPostcodeValidation",
          },
        ],
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
