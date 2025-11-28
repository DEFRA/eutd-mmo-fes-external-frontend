import isEmpty from "lodash/isEmpty";
import moment from "moment";
import { getAddProcessingStatementUrl, GET_PROCESSING_STATEMENT } from "~/urls.server";
import { get, post } from "~/communication.server";
import type {
  Catch,
  CatchIndex,
  ErrorResponse,
  Exporter,
  IUnauthorised,
  ProcessingStatement,
  ProcessingStatementProduct,
} from "~/types";
import { instanceOfUnauthorised, validateResponseData } from "./common";
import type { Params } from "@remix-run/router/dist/utils";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getBearerTokenForRequest } from "./auth";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { redirect } from "@remix-run/node";

export const getProcessingStatement = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<ProcessingStatement | IUnauthorised> => {
  if (!documentNumber) {
    throw new Error("processing statement document number is required");
  }

  const response: Response = await get(bearerToken, GET_PROCESSING_STATEMENT, {
    documentNumber,
  });

  return onGetProcessingStatement(response);
};

const onGetProcessingStatement = async (response: Response): Promise<ProcessingStatement | IUnauthorised> => {
  switch (response.status) {
    case 200:
      const processingStatement: ProcessingStatement = await response.json();
      return {
        ...processingStatement,
      };
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error ${response.status}`);
  }
};

export const addProcessingDetails = async (
  bearerToken: string,
  documentNumber: string | undefined,
  processingStatement: ProcessingStatement,
  currentUrl: string,
  saveToRedisIfErrors: boolean
): Promise<ProcessingStatement | IUnauthorised> => {
  if (!documentNumber) {
    throw new Error("processing statement document number is required");
  }

  const response: Response = await post(
    bearerToken,
    getAddProcessingStatementUrl(currentUrl, saveToRedisIfErrors),
    {
      documentNumber,
    },
    {
      ...processingStatement,
    }
  );

  return onAddProcessingDetails(response);
};

const onAddProcessingDetails = async (response: Response): Promise<ProcessingStatement | IUnauthorised> => {
  switch (response.status) {
    case 200:
    case 400:
      const data = (await response.json()) ?? {};
      return {
        ...data,
        errors: !isEmpty(data.errors)
          ? Object.keys(data.errors).map((key: string) => ({
              key,
              message: data.errors[key],
            }))
          : {},
      };
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

/**
 * Saves the original catchIndex to allow Edit functionality for the correct catch entry even when one or more catches
 *   have been marked for removal as the UI index of visible entries will then be different from their original index
 * @param {Array<Catch>} catches - The original catches array from the ProcessingStatement
 * @param {string} catchIdsToRemove - A comma-separated list of catch IDs marked for removal
 * @returns
 */
export const getVisibleCatches = (catches: Catch[] = [], catchIdsToRemove: string): (Catch & CatchIndex)[] =>
  catches.reduce(
    (acc, catchDetails, index) => {
      if (!catchIdsToRemove.includes(catchDetails._id ?? "")) {
        acc.push({ ...catchDetails, catchIndex: index });
      }

      return acc;
    },
    [] as (Catch & CatchIndex)[]
  );

/**
 * Retrieve a catch based on the provided index or return a valid index for adding a new catch
 * @param processingStatement - ProcessingStatement
 * @param {number} [catchIndex=0] - the index for a catch
 * @returns {Object} - An object containing the catchIndex and catch details of an existing or new catch
 */
export const getCatchDetails = (processingStatement: ProcessingStatement, catchIndex: number): Catch => {
  const catches = Array.isArray(processingStatement.catches) ? processingStatement.catches : [];
  return catches[catchIndex];
};

export const getProductDescription = (
  products: ProcessingStatementProduct[] | undefined,
  id?: string
): {
  currentProductDescription: ProcessingStatementProduct | undefined;
} => {
  const hasProducts = Array.isArray(products) && products.length > 0;

  if (!hasProducts || id === undefined) {
    return { currentProductDescription: undefined };
  }

  const productDescription: ProcessingStatementProduct | undefined = products.find(
    (product: ProcessingStatementProduct) => product.id && product.id === id
  );
  return { currentProductDescription: productDescription };
};

export const removeProductDescription = async (
  bearerToken: string,
  documentNumber: string | undefined,
  productIndex: number = NaN,
  currentUrl: string,
  saveToRedisIfErrors: boolean
): Promise<ProcessingStatement | IUnauthorised> => {
  const data: ProcessingStatement | IUnauthorised = await getProcessingStatement(bearerToken, documentNumber);

  if (isNaN(productIndex) || instanceOfUnauthorised(data)) {
    return data;
  }

  if (data.products?.[productIndex]) {
    data.products.splice(productIndex, 1);
    const updated: ProcessingStatement | IUnauthorised = await addProcessingDetails(
      bearerToken,
      documentNumber,
      data,
      currentUrl,
      saveToRedisIfErrors
    );

    return updated;
  }

  return data;
};

export const removeCatchDescription = async (
  bearerToken: string,
  documentNumber: string | undefined,
  catchIndex: number = NaN,
  currentUrl: string,
  saveToRedisIfErrors: boolean
): Promise<ProcessingStatement | IUnauthorised> => {
  const data: ProcessingStatement | IUnauthorised = await getProcessingStatement(bearerToken, documentNumber);

  if (isNaN(catchIndex) || instanceOfUnauthorised(data)) {
    return data;
  }

  if (data.catches?.[catchIndex]) {
    data.catches.splice(catchIndex, 1);
    const updated: ProcessingStatement | IUnauthorised = await addProcessingDetails(
      bearerToken,
      documentNumber,
      data,
      currentUrl,
      saveToRedisIfErrors
    );

    return updated;
  }

  return data;
};

/**
 * Helper method to create or update a ProcessingStatement
 * @param {string} bearerToken
 * @param {string} documentNumber
 * @param {Partial<ProcessingStatement | Catch>} data - an object containing valid ProcessingStatement or Catch key/value pairs
 * @param {string} currentUrl - URL of the current page to allow the Orchestration service to find the correct validation handler
 * @param {number} [catchIndex=NaN] - if present and not NaN, the data passed in will be used for an existing or new catch inside the catches array
 * @param {boolean} [saveToRedisIfErrors=false] - if true then save details to database even when there is an error
 * @param {boolean} returnDataOnly - will return data added to repopulate UI after a failed submittion
 */
export const updateProcessingStatement = async (
  bearerToken: string,
  documentNumber: string | undefined,
  data: Partial<ProcessingStatement | Catch> = {},
  currentUrl: string,
  catchIndex: number = NaN,
  saveToRedisIfErrors: boolean = false,
  returnDataOnly?: boolean,
  isNewCatch?: boolean,
  isNonJs: boolean = false
): Promise<Response | ErrorResponse | undefined> => {
  const psData: ProcessingStatement | IUnauthorised = await getProcessingStatement(bearerToken, documentNumber);

  let errorResponse = validateResponseData(psData);

  if (errorResponse) {
    return errorResponse;
  }

  const currentProcessingStatement = (psData as ProcessingStatement) || {};
  const isUpdatingCatch = catchIndex >= 0;

  // Check if the catches array needs to updated or initialised
  if (Array.isArray(currentProcessingStatement?.catches)) {
    if (isUpdatingCatch) {
      if (currentProcessingStatement.catches[catchIndex] && !isNewCatch) {
        // Update a catch in the existing catches array
        currentProcessingStatement.catches[catchIndex] = {
          ...currentProcessingStatement.catches[catchIndex],
          ...(data as Catch),
        };
      } else {
        // Add a new catch to the existing catches array
        currentProcessingStatement.catches.unshift({ ...(data as Catch) });
      }
    }
  } else {
    // Create a new catches array
    currentProcessingStatement.catches = isUpdatingCatch ? [{ ...(data as Catch) }] : [];
  }

  const updatedProcessingStatement: ProcessingStatement = {
    ...currentProcessingStatement,
    isNonJs: isNonJs,
    ...(!isUpdatingCatch && data),
  };

  const updatedCatchDetails: ProcessingStatement | IUnauthorised = await addProcessingDetails(
    bearerToken,
    documentNumber,
    updatedProcessingStatement,
    currentUrl,
    saveToRedisIfErrors
  );

  errorResponse = validateResponseData(updatedCatchDetails, undefined, returnDataOnly);

  if (errorResponse) {
    return errorResponse;
  }
};

export const updateProcessingStatementProducts = async (
  bearerToken: string,
  documentNumber: string | undefined,
  data: Partial<ProcessingStatementProduct> = {},
  productId: string | undefined,
  saveToRedisIfErrors: boolean = false,
  returnDataOnly?: boolean
): Promise<Response | ErrorResponse | undefined> => {
  const psData: ProcessingStatement | IUnauthorised = await getProcessingStatement(bearerToken, documentNumber);

  let errorResponse = validateResponseData(psData);

  if (errorResponse) {
    return errorResponse;
  }

  const currentProcessingStatement = (psData as ProcessingStatement) || {};
  const productIndex = currentProcessingStatement.products?.findIndex(
    (p: ProcessingStatementProduct) => p.id === productId
  );
  const isUpdatingProduct = productIndex !== undefined && productIndex >= 0;

  // Check if the products array needs to updated or initialised
  if (Array.isArray(currentProcessingStatement?.products)) {
    if (isUpdatingProduct) {
      if (currentProcessingStatement.products[productIndex]) {
        // Update a product in the existing products array
        currentProcessingStatement.products[productIndex] = {
          ...currentProcessingStatement.products[productIndex],
          ...(data as ProcessingStatementProduct),
        };
      }
    } else {
      // Add a new product to the existing products array
      currentProcessingStatement.products.push({ ...(data as ProcessingStatementProduct) });
    }
  } else {
    // Create a new products array
    currentProcessingStatement.products = [{ ...(data as ProcessingStatementProduct) }];
  }

  // Update catches that have the same productId with the new product description and commodity code
  if (isUpdatingProduct && Array.isArray(currentProcessingStatement?.catches)) {
    currentProcessingStatement.catches = currentProcessingStatement.catches.map((catchItem: Catch) => {
      if (catchItem.productId === productId) {
        return {
          ...catchItem,
          productDescription: data.description,
          productCommodityCode: data.commodityCode,
        };
      }
      return catchItem;
    });
  }

  const updatedProcessingStatement: ProcessingStatement = {
    ...currentProcessingStatement,
    ...(!isUpdatingProduct && data),
  };

  const updatedCatchDetails: ProcessingStatement | IUnauthorised = await addProcessingDetails(
    bearerToken,
    documentNumber,
    updatedProcessingStatement,
    `/create-processing-statement/${documentNumber}/add-consignment-details/${
      isUpdatingProduct ? productIndex : currentProcessingStatement.products.length - 1
    }`,
    saveToRedisIfErrors
  );

  errorResponse = validateResponseData(updatedCatchDetails, undefined, returnDataOnly);

  if (errorResponse) {
    return errorResponse;
  }
};

export const removeProcessingStatementProduct = async (
  bearerToken: string,
  documentNumber: string | undefined,
  productId: string | undefined,
  currentUrl: string,
  saveToRedisIfErrors: boolean = false,
  returnDataOnly?: boolean
) => {
  const psData: ProcessingStatement | IUnauthorised = await getProcessingStatement(bearerToken, documentNumber);

  const errorResponse = validateResponseData(psData);
  if (errorResponse) {
    return { errorResponse, data: psData };
  }

  // Filter products and catches to exclude the provided productId
  const currentProcessingStatement = psData as ProcessingStatement;
  const updatedProcessingStatement: ProcessingStatement = {
    ...currentProcessingStatement,
    products: currentProcessingStatement.products?.filter(
      (product: ProcessingStatementProduct) => product.id !== productId
    ),
    catches: currentProcessingStatement.catches?.filter((catchItem: Catch) => catchItem.productId !== productId),
  };

  const updatedData: ProcessingStatement | IUnauthorised = await addProcessingDetails(
    bearerToken,
    documentNumber,
    updatedProcessingStatement,
    currentUrl,
    saveToRedisIfErrors
  );

  const finalErrorResponse = validateResponseData(updatedData, undefined, returnDataOnly);
  return {
    errorResponse: finalErrorResponse,
    data: updatedData,
  };
};

const hasExporterDetails = (exporter: Exporter | undefined): boolean =>
  !isEmpty(exporter) &&
  ["exporterCompanyName", "addressOne", "postcode"].every((prop: string) => !isEmpty(exporter[prop as keyof Exporter]));

const validateExportHealthCertificateFormat = (str: string): boolean => {
  const regex = /^\d{2}\/\d\/\d{6}$/;
  return regex.test(str);
};

const validateDate = (date: string): boolean => {
  const formattedDate = moment(date, ["DD/MM/YYYY", "DD/M/YYYY", "D/MM/YYYY", "D/M/YYYY"], true);

  return formattedDate.isValid() && formattedDate.isBefore(moment(new Date()).add(8, "days"));
};

const validateWeight = (weight: string): boolean => {
  const numericWeight = parseFloat(weight);
  const regex = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
  return !isNaN(numericWeight) && numericWeight > 0 && regex.test(weight);
};

const hasValidProductDescriptions = (products: ProcessingStatementProduct[] | undefined): boolean => {
  if (!Array.isArray(products) || products.length <= 0) {
    return false;
  }

  return !products.some(
    (product: ProcessingStatementProduct) =>
      isEmpty(product.commodityCode.trim()) || isEmpty(product.description.trim())
  );
};

export const hasRequiredDataProcessingStatementSummary = (
  exporter: Exporter | undefined,
  processingStatement: ProcessingStatement
): boolean => {
  const hasExporter = hasExporterDetails(exporter);
  const hasHealthCertificateNumber =
    processingStatement.healthCertificateNumber !== undefined &&
    validateExportHealthCertificateFormat(processingStatement.healthCertificateNumber);
  const hasHealthCeritificateDate =
    processingStatement.healthCertificateDate !== undefined && validateDate(processingStatement.healthCertificateDate);
  const hasConsignmentDescription =
    !isEmpty(processingStatement.consignmentDescription) || hasValidProductDescriptions(processingStatement.products);
  const hasPersonResponsible = !isEmpty(processingStatement.personResponsibleForConsignment);
  const hasPlantApprovalNumber = !isEmpty(processingStatement.plantApprovalNumber);
  const hasPlantName = !isEmpty(processingStatement.plantName);

  const hasPlantAddressOne = !isEmpty(processingStatement.plantAddressOne);
  const hasPlantTownCity = !isEmpty(processingStatement.plantTownCity);
  const hasPlantPostcode = !isEmpty(processingStatement.plantPostcode);
  const hasPlantAddress =
    !!processingStatement._plantDetailsUpdated || (hasPlantAddressOne && hasPlantTownCity && hasPlantPostcode);

  const hasExportedTo = !isEmpty(processingStatement.exportedTo);
  const hasCatches =
    !isEmpty(processingStatement.catches) &&
    Array.isArray(processingStatement.catches) &&
    processingStatement.catches.every(
      (item: Catch) =>
        !isEmpty(item.species) &&
        !isEmpty(item.catchCertificateNumber) &&
        item.totalWeightLanded !== undefined &&
        item.exportWeightBeforeProcessing !== undefined &&
        item.exportWeightAfterProcessing !== undefined &&
        validateWeight(item.totalWeightLanded) &&
        validateWeight(item.exportWeightBeforeProcessing) &&
        validateWeight(item.exportWeightAfterProcessing) &&
        parseFloat(item.exportWeightBeforeProcessing) <= parseFloat(item.totalWeightLanded)
    );

  return (
    hasHealthCertificateNumber &&
    hasHealthCeritificateDate &&
    hasExporter &&
    hasConsignmentDescription &&
    hasPersonResponsible &&
    hasPlantApprovalNumber &&
    hasPlantName &&
    hasPlantAddress &&
    hasCatches &&
    hasExportedTo
  );
};

export const processingStatementLoader = async (
  request: Request,
  params: Params
): Promise<Response | ErrorResponse> => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  const session = await getSessionFromRequest(request);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);

  if (instanceOfUnauthorised(processingStatement)) {
    return redirect("/forbidden");
  }

  validateResponseData(processingStatement);

  return new Response(
    JSON.stringify({
      documentNumber,
      personResponsibleForConsignment: processingStatement.personResponsibleForConsignment,
      plantApprovalNumber: processingStatement.plantApprovalNumber,
      plantAddressOne: processingStatement.plantAddressOne,
      plantTownCity: processingStatement.plantTownCity,
      plantPostcode: processingStatement.plantPostcode,
      plantName: processingStatement.plantName,
      nextUri,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};
