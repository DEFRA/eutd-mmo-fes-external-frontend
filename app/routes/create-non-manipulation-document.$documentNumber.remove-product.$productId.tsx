import * as React from "react";
import { redirect, useActionData, useLoaderData, type ActionFunction, type LoaderFunction } from "react-router";
import { route } from "routes-gen";
import { RemoveStorageDocumentProduct } from "~/composite-components";
import {
  getStorageDocument,
  getVisibleProducts,
  getBearerTokenForRequest,
  validateResponseData,
  createCSRFToken,
  validateCSRFToken,
  removeStorageDocumentCatch,
} from "~/.server";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import { json } from "~/communication.server";
import type { IErrorsTransformed, IUnauthorised, StorageDocument } from "~/types";
import setApiMock from "tests/msw/helpers/setApiMock";

export const headers = () => ({
  "Cache-Control": "no-store",
});

type LoaderData = {
  csrf: string;
  documentNumber: string;
  productId: string;
  returnUrl: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber, productId } = params;
  const returnUrl = new URL(request.url).searchParams.get("returnUrl") ?? "";
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);

  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);
  validateResponseData(storageDocument);

  const sdData = (storageDocument as StorageDocument) || {};

  // When returning to a page that reflects the live document (e.g. departure-product-summary), check
  //   against every catch; otherwise exclude catches already pending removal in the add-product flow
  const catchesToConfirm = returnUrl
    ? sdData.catches ?? []
    : getVisibleProducts(sdData.catches, session.get("catchesToRemove") ?? "");

  if (!catchesToConfirm.some((item) => item._id === productId)) {
    return redirect("/forbidden");
  }

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  return new Response(
    JSON.stringify({
      csrf,
      documentNumber,
      productId,
      returnUrl,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber, productId } = params;
  const form = await request.formData();

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const session = await getSessionFromRequest(request);
  const removeProductValue = form.get("removeProduct") as string;
  const returnUrl = (form.get("returnUrl") as string) || "";

  if (!removeProductValue) {
    return json(
      {
        errors: {
          removeProduct: { key: "removeProduct", message: "sdRemoveProductErrorNoSelection" },
        },
      },
      session
    );
  }

  if (removeProductValue === "Yes") {
    // returnUrl indicates the caller reflects the live document (e.g. departure-product-summary),
    //   so remove immediately via the API rather than deferring to the add-product session flow
    if (returnUrl) {
      const bearerToken = await getBearerTokenForRequest(request);
      const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);
      validateResponseData(storageDocument);

      const sdData = (storageDocument as StorageDocument) || {};
      const catchIndex = (sdData.catches ?? []).findIndex((item) => item._id === productId);

      if (catchIndex >= 0) {
        const errorResponse = await removeStorageDocumentCatch(
          bearerToken,
          documentNumber,
          returnUrl,
          String(catchIndex),
          true,
          false,
          false
        );

        if (errorResponse) {
          return errorResponse as Response;
        }
      }

      return redirect(returnUrl, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // Only mark the product for removal once the user has explicitly confirmed
    const catchesToRemove = session.get("catchesToRemove") ?? "";
    const catchIdsToRemove: string[] = catchesToRemove ? catchesToRemove.split(",") : [];
    catchIdsToRemove.push(productId as string);
    session.set("catchesToRemove", [...new Set(catchIdsToRemove)].join(","));
  }

  return redirect(
    returnUrl ||
      route("/create-non-manipulation-document/:documentNumber/you-have-added-a-product", {
        documentNumber: documentNumber as string,
      }),
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

const RemoveProductPage = () => {
  const { csrf, documentNumber, productId, returnUrl } = useLoaderData<LoaderData>();
  const { errors } = useActionData<{ errors?: IErrorsTransformed }>() ?? {};

  return (
    <RemoveStorageDocumentProduct
      csrf={csrf}
      productId={productId}
      errors={errors}
      returnUrl={returnUrl}
      backUrl={
        returnUrl ||
        route("/create-non-manipulation-document/:documentNumber/you-have-added-a-product", {
          documentNumber,
        })
      }
    />
  );
};

export default RemoveProductPage;
