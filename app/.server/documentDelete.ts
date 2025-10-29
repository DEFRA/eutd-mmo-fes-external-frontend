import type { ConfirmDocumentDelete, Journey } from "~/types";
import { deleteDraft, validateResponseData } from "~/.server";
import { redirect } from "@remix-run/node";

export const deleteDocument = async (
  journey: Journey,
  bearerToken: string,
  documentNumber: string | undefined,
  data: FormData,
  nextUri: string
) => {
  const confirmDocumentDelete: ConfirmDocumentDelete = await deleteDraft(
    bearerToken,
    documentNumber,
    data.get("documentDelete") as string,
    journey,
    nextUri
  );

  const errorResponse = validateResponseData(confirmDocumentDelete, data);
  if (errorResponse) {
    return errorResponse;
  }

  throw redirect(nextUri);
};
