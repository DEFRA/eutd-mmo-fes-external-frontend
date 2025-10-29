import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import type { Params } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { get, post } from "~/communication.server";
import { GET_STORAGE_DOCUMENT, getAddStorageDocumentUrl } from "~/urls.server";
import { displayErrorTransformedMessages } from "~/helpers";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { getBearerTokenForRequest } from "./auth";
import type {
  ErrorResponse,
  IUnauthorised,
  StorageDocument,
  StorageDocumentCatch,
  CatchIndex,
  StorageFacility,
} from "~/types";
import { validateResponseData } from "./common";
import { onGetResponse } from "~/helpers/http-utils";
import { validateCSRFToken } from "./csrfToken";

export const getVisibleProducts = (
  catches: StorageDocumentCatch[] = [],
  catchIdsToRemove: string
): (StorageDocumentCatch & CatchIndex)[] =>
  catches.reduce(
    (acc, catchDetails, index) => {
      if (!catchIdsToRemove.includes(catchDetails._id ?? "")) {
        acc.push({ ...catchDetails, catchIndex: index });
      }

      return acc;
    },
    [] as (StorageDocumentCatch & CatchIndex)[]
  );

export const getStorageDocument = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<StorageDocument | IUnauthorised> => {
  if (!documentNumber) {
    throw new Error("storage document number is required");
  }

  try {
    const response: Response = await get(bearerToken, GET_STORAGE_DOCUMENT, {
      documentNumber,
    });

    return onGetResponse(response);
  } catch (error) {
    throw new Error(`Unexpected error: ${error}`);
  }
};

export const addStorageDocument = async (
  bearerToken: string,
  documentNumber: string | undefined,
  storageDocument: StorageDocument,
  currentUrl: string,
  saveToRedisIfErrors: boolean
): Promise<StorageDocument | IUnauthorised> => {
  if (!documentNumber) {
    throw new Error("storage document document number is required");
  }

  const response: Response = await post(
    bearerToken,
    getAddStorageDocumentUrl(currentUrl, saveToRedisIfErrors),
    {
      documentNumber,
    },
    {
      ...storageDocument,
    }
  );

  return onAddStorageDocument(response);
};

const onAddStorageDocument = async (response: Response): Promise<StorageDocument | IUnauthorised> => {
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
 * Retrieve a catch based on the provided index or return a valid index for adding a new catch
 * @param storageDocument - StorageDocument
 * @param {number} [catchIndex=0] - the index for a catch
 * @returns {Object} - An object containing the catchIndex and catch details of an existing or new catch
 */
export const getStorageDocumentCatchDetails = (
  storageDocument: StorageDocument,
  catchIndex: number = 0
): {
  validCatchIndex: number;
  currentCatchDetails: StorageDocumentCatch | undefined;
} => {
  const storageDocumentCatches: StorageDocumentCatch[] = storageDocument?.catches ?? [];
  const hasCatches = Array.isArray(storageDocumentCatches) && storageDocumentCatches.length > 0;
  const isValidCatchIndex = hasCatches && storageDocumentCatches[catchIndex];
  const validCatchIndex = isValidCatchIndex ? catchIndex : hasCatches ? storageDocumentCatches.length : 0;
  const currentCatchDetails = isValidCatchIndex ? storageDocumentCatches[validCatchIndex] : undefined;

  return { validCatchIndex, currentCatchDetails };
};

/**
 * Helper method to create or update a StorageDocument
 * @param {string} bearerToken
 * @param {string} documentNumber
 * @param {Partial<StorageDocument | StorageDocumentCatch>} data - an object containing valid StorageDocument or StorageDocumentCatch key/value pairs
 * @param {string} currentUrl - URL of the current page to allow the Orchestration service to find the correct validation handler
 * @param {number} [catchIndex=NaN] - if present and not NaN, the data passed in will be used for an existing or new catch inside the catches array
 * @param {boolean} [saveToRedisIfErrors=false] - if true then save details to database even when there is an error
* @param {boolean} returnDataOnly - will return data added to repopulate UI after a failed submittion

*/
export const updateStorageDocumentCatchDetails = async (
  bearerToken: string,
  documentNumber: string | undefined,
  data: Partial<StorageDocument | StorageDocumentCatch> = {},
  currentUrl: string,
  catchIndex: number = NaN,
  saveToRedisIfErrors: boolean = false,
  returnDataOnly?: boolean,
  isNonJs: boolean = false
): Promise<Response | ErrorResponse | undefined> => {
  const sdData: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  let errorResponse = validateResponseData(sdData);

  if (errorResponse) {
    return errorResponse;
  }

  const currentStorageDocument = (sdData as StorageDocument) || {};
  const isUpdatingCatch = catchIndex >= 0;

  // Check if the catches array needs to be updated or initialised
  if (Array.isArray(currentStorageDocument?.catches)) {
    if (isUpdatingCatch) {
      if (currentStorageDocument.catches[catchIndex]) {
        // Update a catch in the existing catches array
        currentStorageDocument.catches[catchIndex] = {
          ...currentStorageDocument.catches[catchIndex],
          ...(data as StorageDocumentCatch),
        };
      } else {
        // Add a new catch to the existing catches array
        currentStorageDocument.catches.push({ ...(data as StorageDocumentCatch) });
      }
    }
  } else {
    // Create a new catches array
    currentStorageDocument.catches = isUpdatingCatch ? [{ ...(data as StorageDocumentCatch) }] : [];
  }

  const updatedStorageDocument: StorageDocument = {
    ...currentStorageDocument,
    isNonJs,
    ...(!isUpdatingCatch && data),
  };

  const updatedCatchDetails: StorageDocument | IUnauthorised = await addStorageDocument(
    bearerToken,
    documentNumber,
    updatedStorageDocument,
    currentUrl,
    saveToRedisIfErrors
  );

  errorResponse = validateResponseData(updatedCatchDetails, undefined, returnDataOnly);

  if (errorResponse) {
    return errorResponse;
  }
};

/**
 * Helper method to remove particular indexed catch from StorageDocument
 * @param {string} bearerToken
 * @param {string} documentNumber
 * @param {string} currentUrl - URL of the current page to allow the Orchestration service to find the correct validation handler
 * @param {string} indexToRemove - the index of the catch to be removed from the catches array
 * @param {boolean} [saveToRedisIfErrors=false] - if true then save details to database even when there is an error
* @param {boolean} returnDataOnly - will return data added to repopulate UI after a failed submittion

*/
export const removeStorageDocumentCatch = async (
  bearerToken: string,
  documentNumber: string | undefined,
  currentUrl: string,
  indexToRemove: string,
  saveToRedisIfErrors: boolean = false,
  returnDataOnly?: boolean,
  isNonJs: boolean = false
): Promise<Response | ErrorResponse | undefined> => {
  const sdData: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  let errorResponse = validateResponseData(sdData);

  if (errorResponse) {
    return errorResponse;
  }

  const currentStorageDocument = (sdData as StorageDocument) || {};
  if (indexToRemove && Number(indexToRemove)) {
    currentStorageDocument.catches.splice(Number(indexToRemove), 1);
  }
  const updatedStorageDocument: StorageDocument = {
    ...currentStorageDocument,
    isNonJs,
  };

  const updatedCatchDetails: StorageDocument | IUnauthorised = await addStorageDocument(
    bearerToken,
    documentNumber,
    updatedStorageDocument,
    currentUrl,
    saveToRedisIfErrors
  );

  errorResponse = validateResponseData(updatedCatchDetails, undefined, returnDataOnly);

  if (errorResponse) {
    return errorResponse;
  }
};

/**
 * Helper method to create or update a StorageDocument
 * @param {string} bearerToken
 * @param {string} documentNumber
 * @param {any} formData - an object containing valid form data key/value pairs
 * @param {string} currentUrl - URL of the current page to allow the Orchestration service to find the correct validation handler
 * @param {boolean} [saveToRedisIfErrors=false] - if true then save details to database even when there is an error
* @param {boolean} returnDataOnly - will return data added to repopulate UI after a failed submittion

*/
export const updateStorageDocumentCatchDepartureWeights = async (
  bearerToken: string,
  documentNumber: string | undefined,
  formData: any,
  currentUrl: string,
  saveToRedisIfErrors: boolean = false,
  returnDataOnly?: boolean,
  isNonJs: boolean = false
): Promise<Response | ErrorResponse | undefined> => {
  const sdData: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  let errorResponse = validateResponseData(sdData);

  if (errorResponse) {
    return errorResponse;
  }

  const currentStorageDocument = (sdData as StorageDocument) || {};
  const catches = currentStorageDocument?.catches ?? [];

  // Check if the catches array needs to be updated or initialised
  if (Array.isArray(currentStorageDocument?.catches)) {
    currentStorageDocument?.catches.forEach((_catchItem, index) => {
      const netWeightProductDeparture = formData[`weight-net-weight-product-departure-${index}`];
      const netWeightFisheryProductDeparture = formData[`weight-net-weight-fishery-product-departure-${index}`];
      if (netWeightProductDeparture !== undefined && netWeightFisheryProductDeparture !== undefined) {
        catches[index]["netWeightProductDeparture"] = !isEmpty(netWeightProductDeparture)
          ? netWeightProductDeparture
          : undefined;
        catches[index]["netWeightFisheryProductDeparture"] = !isEmpty(netWeightFisheryProductDeparture)
          ? netWeightFisheryProductDeparture
          : undefined;
      }
    });
  } else {
    // Create a new catches array
    currentStorageDocument.catches = [];
  }

  const updatedStorageDocument: StorageDocument = {
    ...currentStorageDocument,
    catches,
    isNonJs,
  };

  const updatedCatchDetails: StorageDocument | IUnauthorised = await addStorageDocument(
    bearerToken,
    documentNumber,
    updatedStorageDocument,
    currentUrl,
    saveToRedisIfErrors
  );

  errorResponse = validateResponseData(updatedCatchDetails, undefined, returnDataOnly);

  if (errorResponse) {
    return errorResponse;
  }
};

export const getStorageFacility = (
  storageDocument: StorageDocument,
  facilityIndex: number = 0
): {
  validFacilityIndex: number;
  currentFacility: StorageFacility | undefined;
} => {
  const storageFacilities: StorageFacility[] = storageDocument?.storageFacilities ?? [];
  const hasFacility = Array.isArray(storageFacilities) && storageFacilities.length > 0;
  const isValidFacilityIndex = hasFacility && storageFacilities[facilityIndex];
  const validFacilityIndex = isValidFacilityIndex ? facilityIndex : hasFacility ? storageFacilities.length : 0;
  const currentFacility = isValidFacilityIndex ? storageFacilities[validFacilityIndex] : undefined;

  return { validFacilityIndex, currentFacility };
};

export const updateStorageDocumentFacility = async (
  bearerToken: string,
  documentNumber: string | undefined,
  storageFacility: Partial<StorageFacility | StorageDocument> = {},
  currentUrl: string,
  faciltyIndex: number = NaN,
  saveToRedisIfErrors: boolean = false,
  returnDataOnly?: boolean
): Promise<Response | ErrorResponse | undefined> => {
  const sdData: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  let errorResponse = validateResponseData(sdData);

  if (errorResponse) {
    return errorResponse;
  }

  const currentStorageDocument = (sdData as StorageDocument) || {};
  const isUpdating = faciltyIndex >= 0;

  if (Array.isArray(currentStorageDocument?.storageFacilities)) {
    if (isUpdating) {
      if (currentStorageDocument.storageFacilities[faciltyIndex]) {
        currentStorageDocument.storageFacilities[faciltyIndex] = {
          ...currentStorageDocument.storageFacilities[faciltyIndex],
          ...(storageFacility as StorageFacility),
        };
      } else {
        currentStorageDocument.storageFacilities.push({ ...(storageFacility as StorageFacility) });
      }
    }
  } else {
    currentStorageDocument.storageFacilities = isUpdating ? [{ ...(storageFacility as StorageFacility) }] : [];
  }

  const updatingStorageDocument: StorageDocument = {
    ...currentStorageDocument,
    ...(!isUpdating && storageFacility),
  };
  const updatedStorageDocument: StorageDocument | IUnauthorised = await addStorageDocument(
    bearerToken,
    documentNumber,
    updatingStorageDocument,
    currentUrl,
    saveToRedisIfErrors
  );

  errorResponse = validateResponseData(updatedStorageDocument, undefined, returnDataOnly);

  if (errorResponse) {
    return errorResponse;
  }
};

export const executeAction = async (request: Request, params: Params): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  session.set("actionExecuted", true);
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  validateResponseData(storageDocument);

  const sdData = (storageDocument as StorageDocument) || {};
  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const isDraft = _action === "saveAsDraft";
  const isSaveAndContinue = _action === "saveAndContinue";
  const isRemove = _action === "remove";
  const isEdit = _action === "edit";

  if (isEdit) {
    return redirect(values["url"] as string);
  }

  let errorData;

  // you-have-added-a-storage-facility
  if (request.url.includes("you-have-added-a-storage-facility")) {
    const addAnotherFacility = values.addAnotherFacility === "Yes";

    if (addAnotherFacility) {
      return redirect(
        `/create-storage-document/${documentNumber}/add-storage-facility-details/${
          sdData?.storageFacilities ? sdData?.storageFacilities.length : 0
        }`,
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }

    if (isRemove) {
      const facilityId = parseInt(values.facilityId as string);
      sdData.storageFacilities?.splice(facilityId, 1);
    }

    errorData = await updateStorageDocumentFacility(
      bearerToken,
      documentNumber,
      { storageFacilities: [...(Array.isArray(sdData.storageFacilities) ? sdData.storageFacilities : [])] },
      `/create-storage-document/${documentNumber}/you-have-added-a-storage-facility`,
      undefined,
      isDraft,
      true
    );

    if (isDraft) {
      return redirect(route("/create-storage-document/storage-documents"), {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    if (errorData && Array.isArray(sdData?.storageFacilities)) {
      const { errors, ...payload } = errorData as ErrorResponse;
      const transformedErrors = displayErrorTransformedMessages(!isEmpty(errors) ? errors : {});
      const groupedErrors = [];

      for (let index = 0; index < sdData.storageFacilities.length; index++) {
        groupedErrors.push(transformedErrors.filter(({ key }) => key.includes(`${index}`)));
      }

      return new Response(
        JSON.stringify({
          groupedErrors,
          ...payload,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }

    if (isRemove) {
      return redirect(
        route("/create-storage-document/:documentNumber/you-have-added-a-storage-facility", { documentNumber }),
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }
    return redirect(
      route("/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk", { documentNumber }),
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } else {
    const addAnotherProduct = values.addAnotherProduct === "Yes";
    const catchesToRemove = session.get("catchesToRemove") ?? "";

    if (addAnotherProduct) {
      return redirect(
        `/create-storage-document/${documentNumber}/add-product-to-this-consignment/${sdData.catches.length}`,
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }

    // If isDraft or isSaveAndContinue check if there are catches to be removed
    if (!isRemove && catchesToRemove) {
      sdData.catches = getVisibleProducts(sdData.catches, catchesToRemove);
    }

    // If isRemove, delete the catch from the array but without saving it to the backend
    //   and store catch IDs to be removed in a cookie as a comma-separated list
    if (isRemove) {
      const catchId = values.productId as string;
      const catchIdsToRemove: string[] = catchesToRemove?.split(",") ?? [];

      catchIdsToRemove.push(catchId);
      session.set("catchesToRemove", [...new Set(catchIdsToRemove)].join(","));

      return redirect(route("/create-storage-document/:documentNumber/you-have-added-a-product", { documentNumber }), {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    if (isDraft || isSaveAndContinue) {
      errorData = await updateStorageDocumentCatchDetails(
        bearerToken,
        documentNumber,
        { catches: [...(Array.isArray(sdData.catches) ? sdData.catches : [])] },
        `/create-storage-document/${documentNumber}/you-have-added-a-product`,
        undefined,
        isDraft,
        true
      );
    }

    if (isDraft) {
      return redirect(route("/create-storage-document/storage-documents"), {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // If errors exist, group them by catch index and return
    if (errorData && Array.isArray(sdData?.catches)) {
      const { errors, ...payload } = errorData as ErrorResponse;
      const transformedErrors = displayErrorTransformedMessages(!isEmpty(errors) ? errors : {});
      const groupedErrors = [];

      for (let index = 0; index < sdData.catches.length; index++) {
        groupedErrors.push(transformedErrors.filter(({ key }) => key.includes(`${index}`)));
      }

      return new Response(
        JSON.stringify({
          groupedErrors,
          ...payload,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }

    if (catchesToRemove) {
      session.unset("catchesToRemove");
    }

    return redirect(`/create-storage-document/${documentNumber}/how-does-the-consignment-arrive-to-the-uk`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
};
