import { redirect, type TypedResponse } from "@remix-run/node";
import { apiCallFailed, get, getReferenceData } from "~/communication.server";
import {
  COMMODITY_CODES,
  generatePdf,
  GET_CLIENT_IP_URL,
  GET_GEAR_CATEGORIES_URL,
  getCreatedCertificateUrl,
  getGearTypesByCategoryUrl,
  searchVesselName,
} from "~/urls.server";
import type {
  CodeAndDescription,
  ErrorResponse,
  IBase,
  IError,
  IErrorsTransformed,
  IUnauthorised,
  ProcessingStatement,
  StorageDocument,
  CompletedDocument,
  Journey,
  ISubmitResponse,
  IVessel,
  ILookUpAddress,
  ExporterAddressStep,
  ILookUpAddressDetails,
  IGearType,
} from "~/types";
import serverLogger from "~/logger.server";
import { getGroupedValues, getTransformedError } from "~/helpers";
import { commitSession } from "~/sessions.server";
import isEmpty from "lodash/isEmpty";

export async function handleManualAddressErrors(
  errors: IError[],
  currentStep: ExporterAddressStep,
  lookUpAddress: ILookUpAddressDetails,
  csrf: string,
  session: any
) {
  if (hasManualAddressError(errors)) {
    return new Response(
      JSON.stringify({
        errors: getTransformedError(errors),
        currentStep,
        postcodeaddress: lookUpAddress,
        csrf,
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
  return null;
}

export function hasLookUpAddressError(response: ILookUpAddress) {
  const errors = response.errors || [];
  return hasManualAddressError(errors);
}

export function hasManualAddressError(errors: IError[]) {
  return Array.isArray(errors) && errors.length > 0;
}

export function isGetAddress(action: string, plantAddressOne: string | undefined) {
  return action === "getaddress" && plantAddressOne === "";
}

export function isCancelAddAddress(action: string) {
  return action === "cancel" || action === "cancelManualAddress";
}

export function instanceOfUnauthorised(
  data: ProcessingStatement | StorageDocument | IUnauthorised
): data is IUnauthorised {
  return "unauthorised" in data;
}

export const validateResponseData = (
  responseData: Record<string, any> | IBase,
  formData?: FormData,
  returnDataOnly?: boolean
): TypedResponse<never> | Promise<Response | ErrorResponse> | ErrorResponse | undefined => {
  if (!responseData) {
    return;
  }

  const errors: IError[] | IErrorsTransformed = (responseData.errors as IError[]) || [];
  const unauthorised = responseData.unauthorised as boolean;

  if (unauthorised) {
    throw redirect("/forbidden");
  }

  if (errors.length > 0) {
    const values = formData ? Object.fromEntries(formData) : {};
    return apiCallFailed(errors, values, returnDataOnly);
  }
};

export const getCommodities = async (): Promise<CodeAndDescription[]> => {
  const response: Response = await getReferenceData(COMMODITY_CODES);
  return await response.json();
};

export const getCompletedDocument = async (
  bearerToken: string,
  documentNumber?: string
): Promise<CompletedDocument | null> => {
  if (!documentNumber) {
    throw new Error("document number is required");
  }

  const response: Response = await get(bearerToken, getCreatedCertificateUrl(documentNumber), {
    documentNumber,
  });
  return onGetCreatedCertificate(response);
};

const onGetCreatedCertificate = async (response: Response): Promise<CompletedDocument | null> => {
  switch (response.status) {
    case 200:
    case 204:
      const completedDocument: CompletedDocument = await response.json();
      return { ...completedDocument };
    case 403:
      return null;
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const submitDocument = async (
  bearerToken: string,
  documentNumber: string | undefined,
  journey: Journey
): Promise<ISubmitResponse> => {
  if (!documentNumber) {
    throw new Error("document number is required");
  }

  const res: Response = await get(bearerToken, GET_CLIENT_IP_URL);
  const ipAddress: string = await res.text();

  const response: Response = await fetch(generatePdf(journey), {
    method: "POST",
    headers: {
      documentNumber: documentNumber,
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({ journey, data: ipAddress }),
  });

  return onSubmitExportCertificateResponse(response);
};

const onSubmitExportCertificateResponse = async (response: Response): Promise<ISubmitResponse> => {
  switch (response.status) {
    case 200:
      const res = await response.json();
      return res;
    case 400:
      let errorResponse = await response.json();
      return {
        errors: errorResponse.validationErrors,
      };
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const getVessels = async (searchTerm: string, date: string): Promise<IVessel[]> => {
  try {
    const response: Response = await getReferenceData(searchVesselName(searchTerm, date));
    return onGetVesselsResponse(response);
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[GET-VESSELS][FAIL][ERROR][${e.stack ?? e}]`);
    }
    throw e;
  }
};

export const getVesselsNoJs: (addedDate: string) => Promise<string[]> = async (addedDate: string) => {
  try {
    const vessels: IVessel[] = await getVessels("", addedDate);
    return Array.isArray(vessels)
      ? vessels.reduce((acc: string[], cur: IVessel) => [...acc, `${cur.vesselName} (${cur.pln})`], [""])
      : [];
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[GET-VESSEL-NON-JS][LOADER][ERROR][${e.stack ?? e}]`);
    }

    return [];
  }
};

const onGetVesselsResponse = async (response: Response): Promise<IVessel[]> => {
  switch (response.status) {
    case 200:
      return await response.json();
    case 204:
      return [];
    case 400:
      return [];
    case 500:
      throw new Error(`Internal server error: ${response.status}`);
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const getGroupedAddLandingErrorFieldIds = (errors: IErrorsTransformed) =>
  getGroupedValues(
    errors,
    {
      product: "product",
      startDate: "startDate",
      dateLanded: "dateLanded",
      catchArea: "faoArea",
      exportWeight: "exportWeight",
      vessel: "vessel",
      gearDetails: "gear",
    },
    (_: string, v: IError) => v.fieldId
  );

export const getAllGearCategories = async (): Promise<string[]> => {
  const response: Response = await getReferenceData(GET_GEAR_CATEGORIES_URL);
  return response.json();
};

const onGetGearTypesResponse = async (response: Response): Promise<IGearType[]> => {
  switch (response.status) {
    case 200:
      return response.json();
    case 204:
    case 400:
    case 500:
      throw new Error(`Internal server error: ${response.status}`);
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const getAllGearTypesByCategory = async (gearCategory: string): Promise<IGearType[]> => {
  if (isEmpty(gearCategory)) return [];

  try {
    const response: Response = await getReferenceData(getGearTypesByCategoryUrl(gearCategory));
    return onGetGearTypesResponse(response);
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[GET-GEAR-TYPES][FAIL][ERROR][${e.stack ?? e}]`);
    }
    return [];
  }
};
