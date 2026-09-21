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
};

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber, productId } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);

  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);
  validateResponseData(storageDocument);

  const sdData = (storageDocument as StorageDocument) || {};
  const catchesToRemove = session.get("catchesToRemove") ?? "";
  const visibleCatches = getVisibleProducts(sdData.catches, catchesToRemove);

  if (!visibleCatches.some((item) => item._id === productId)) {
    return redirect("/forbidden");
  }

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  return new Response(
    JSON.stringify({
      csrf,
      documentNumber,
      productId,
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

  // Only mark the product for removal once the user has explicitly confirmed
  if (removeProductValue === "Yes") {
    const catchesToRemove = session.get("catchesToRemove") ?? "";
    const catchIdsToRemove: string[] = catchesToRemove ? catchesToRemove.split(",") : [];
    catchIdsToRemove.push(productId as string);
    session.set("catchesToRemove", [...new Set(catchIdsToRemove)].join(","));
  }

  return redirect(
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
  const { csrf, documentNumber, productId } = useLoaderData<LoaderData>();
  const { errors } = useActionData<{ errors?: IErrorsTransformed }>() ?? {};

  return (
    <RemoveStorageDocumentProduct
      csrf={csrf}
      productId={productId}
      errors={errors}
      backUrl={route("/create-non-manipulation-document/:documentNumber/you-have-added-a-product", {
        documentNumber,
      })}
    />
  );
};

export default RemoveProductPage;
