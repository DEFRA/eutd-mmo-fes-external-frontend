import * as React from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { Main, ErrorSummary } from "~/components";
import { type ActionFunction, type LoaderFunction, redirect, type TypedResponse } from "@remix-run/node";
import { displayErrorMessages } from "~/helpers";
import {
  getBearerTokenForRequest,
  createCSRFToken,
  validateCSRFToken,
  getProcessingStatement,
  getProductDescription,
  removeProcessingStatementProduct,
  validateResponseData,
} from "~/.server";
import type { ErrorResponse, ProcessingStatement, IUnauthorised } from "~/types";
import isEmpty from "lodash/isEmpty";
import { RemoveProduct } from "~/composite-components";
import { useScrollOnPageLoad } from "~/hooks";
import { getSessionFromRequest } from "~/sessions.server";
import { json } from "~/communication.server";
import setApiMock from "tests/msw/helpers/setApiMock";

type LoaderData = {
  csrf: string;
  documentNumber: string;
  productId: string;
  productDescription: string;
};

export const loader: LoaderFunction = async ({ request, params }): Promise<TypedResponse<LoaderData>> => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber, productId } = params;

  const bearerToken = await getBearerTokenForRequest(request);

  // Fetch Processing Statement data
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  validateResponseData(processingStatement);

  const psData = processingStatement as ProcessingStatement;

  // Get product description for the specific product
  const { currentProductDescription } = getProductDescription(psData.products, productId);

  // Create CSRF token
  const csrf = await createCSRFToken(request);
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);

  return json(
    {
      csrf,
      documentNumber,
      productId,
      productDescription: currentProductDescription?.description ?? "",
    },
    session
  );
};

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<Response | TypedResponse<never> | ErrorResponse> => {
  const { documentNumber, productId } = params;

  const formData = await request.formData();
  const bearerToken = await getBearerTokenForRequest(request);

  // Validate CSRF token
  const isValid = await validateCSRFToken(request, formData);
  if (!isValid) return redirect("/forbidden");

  // Get form values
  const removeProductValue = formData.get("removeProduct") as string;
  const actionType = formData.get("_action") as string;

  // Validate radio selection
  if (!removeProductValue) {
    const session = await getSessionFromRequest(request);
    return json(
      {
        errors: {
          removeProduct: {
            message: "removeProductErrorNoSelection",
          },
        },
      },
      session
    );
  }

  // Handle "Save as draft" - always go to progress
  if (actionType === "saveAsDraft") {
    return redirect(route("/create-processing-statement/:documentNumber/progress", { documentNumber }));
  }

  // Handle "Save and continue" with "No" - go back to catch-added
  if (removeProductValue === "No") {
    return redirect(route("/create-processing-statement/:documentNumber/catch-added", { documentNumber }));
  }

  // Handle "Save and continue" with "Yes" - delete product
  if (removeProductValue === "Yes") {
    // Call API to remove product and associated catches
    const result = await removeProcessingStatementProduct(
      bearerToken,
      documentNumber,
      productId,
      "",
      false, // saveToRedisIfErrors
      false // returnDataOnly
    );

    // Handle error response
    if (result.errorResponse) {
      return result.errorResponse;
    }

    // Cast to ProcessingStatement - we know it's valid at this point
    const updatedData = result.data as ProcessingStatement;

    // Check remaining products
    const hasRemainingProducts = updatedData?.products && updatedData.products.length > 0;

    if (hasRemainingProducts) {
      // Scenario 2: Navigate back to catch-added
      return redirect(route("/create-processing-statement/:documentNumber/catch-added", { documentNumber }));
    }
  }
  // Scenario 3: Navigate to add-consignment-details, mark section incomplete
  return redirect(`/create-processing-statement/${documentNumber}/add-consignment-details`);
};

const RemoveProductPage = () => {
  const { csrf, productDescription, documentNumber, productId } = useLoaderData<LoaderData>();
  const { errors = {} } = useActionData<{ errors: any }>() ?? {};

  useScrollOnPageLoad();

  return (
    <Main
      backUrl={route("/create-processing-statement/:documentNumber/add-consignment-details/:productId", {
        documentNumber,
        productId,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <RemoveProduct
            errors={errors}
            csrf={csrf}
            productDescription={productDescription}
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default RemoveProductPage;
