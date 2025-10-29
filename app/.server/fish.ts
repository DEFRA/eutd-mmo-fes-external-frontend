import { route } from "routes-gen";
import { getErrorMessage } from "~/helpers";
import { post, put } from "~/communication.server";
import { ADD_SPECIES_URL, updateFishUrl } from "~/urls.server";
import type { IError, Product, Fish } from "~/types";

export const deleteFish = async (
  bearerToken: string,
  documentNumber: string | undefined,
  fishId: string
): Promise<{ cancel: string }> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    ADD_SPECIES_URL,
    {
      documentnumber: documentNumber,
    },
    {
      cancel: fishId,
      redirect: route(`/create-catch-certificate/:documentNumber/what-are-you-exporting`, { documentNumber }),
    }
  );

  return onDeleteFishResponse(response);
};

export const addFish = async (
  bearerToken: string,
  documentNumber: string | undefined,
  fishObj: Fish
): Promise<Product> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    ADD_SPECIES_URL,
    {
      documentnumber: documentNumber,
    },
    {
      ...fishObj,
    }
  );

  return onAddFishResponse(response);
};

export const updateFish = async (
  bearerToken: string,
  documentNumber: string | undefined,
  fishObj: Fish
): Promise<Product> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await put(
    bearerToken,
    `${updateFishUrl(fishObj.id as string)}`,
    {
      documentnumber: documentNumber,
    },
    {
      ...fishObj,
    }
  );

  return onAddFishResponse(response);
};

const onAddFishResponse = async (response: Response): Promise<Product> => {
  switch (response.status) {
    case 200:
    case 204:
      const AddFishResponse: any = await response.json();
      return AddFishResponse;
    case 400:
      const data = await response.json();
      const errors: IError[] = Object.keys(data).map((error: string) =>
        error === "error.favourite.max"
          ? {
              key: data[error]["key"],
              message: getErrorMessage(data[error]["key"]),
              value: { dynamicValue: data[error]["params"]["limit"] },
            }
          : {
              key: error,
              message: getErrorMessage(data[error]),
            }
      );
      return {
        id: "",
        errors,
        user_id: "",
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

const onDeleteFishResponse = async (response: Response): Promise<{ cancel: string }> => {
  switch (response.status) {
    case 200:
    case 204:
      const removeFishResponse: any = await response.json();
      return removeFishResponse;
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
