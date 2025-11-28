import type { Params } from "@remix-run/react";
import setApiMock from "tests/msw/helpers/setApiMock";
import type { IUnauthorised, StorageDocument, StorageDocumentCatch } from "~/types";
import { redirect } from "@remix-run/node";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getStorageDocument,
  getStorageDocumentCatchDetails,
  instanceOfUnauthorised,
  validateResponseData,
} from "~/.server";

export const addDocumentDetailsLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  const { documentNumber } = params;
  const catchIndex = parseInt(params["*"] ?? "") || 0;

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  if (instanceOfUnauthorised(storageDocument)) {
    return redirect("/forbidden");
  }

  if (!Array.isArray(storageDocument?.catches)) {
    return redirect(`/create-storage-document/${documentNumber}/add-product-to-this-consignment`);
  }

  validateResponseData(storageDocument);

  const {
    validCatchIndex,
    currentCatchDetails,
  }: {
    validCatchIndex: number;
    currentCatchDetails: StorageDocumentCatch | undefined;
  } = getStorageDocumentCatchDetails(storageDocument, catchIndex);

  if (storageDocument.catches && catchIndex > storageDocument.catches.length) {
    return redirect(`/create-storage-document/${documentNumber}/you-have-added-a-product`);
  }
  return new Response(
    JSON.stringify({ documentNumber, catchDetails: currentCatchDetails, catchIndex: validCatchIndex, nextUri, csrf }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};
