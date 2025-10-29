import type { ConfirmDocumentDelete } from "~/types";
import { getErrorMessage } from "~/helpers";
import { CONFIRM_DOCUMENT_DELETE_URL } from "~/urls.server";
import { post } from "~/communication.server";

export const deleteDraft = async (
  bearerToken: string,
  documentNumber: string | undefined,
  documentDelete: string,
  journey: string,
  nextUri: string
): Promise<ConfirmDocumentDelete> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    CONFIRM_DOCUMENT_DELETE_URL,
    {
      documentnumber: documentNumber,
    },
    { journey, nextUri, documentDelete }
  );

  return onConfirmDocumentDelete(response, documentDelete);
};

const onConfirmDocumentDelete = async (response: Response, documentDelete: string): Promise<ConfirmDocumentDelete> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        documentDelete,
        errors: [],
      };
    case 400:
      const data = await response.json();

      return {
        documentDelete: documentDelete,
        errors: Object.keys(data).map((key: string) => ({
          key,
          message: getErrorMessage(data[key]),
        })),
      };
    case 403:
      return {
        errors: [],
        unauthorised: true,
      };
    case 404:
      return {
        errors: [],
        unauthorised: false,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
