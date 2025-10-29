import { deleteRequest, get, post, put } from "~/communication.server";
import {
  getTransportDetailsUrl,
  getTransportByIdUrl,
  ADD_TRANSPORT_DETAILS_URL,
  addTransportationDetailsUrl,
  updateTransportDetailsByIdUrl,
  SAVE_TRUCK_CMR_URL,
  CHECK_ADDITIONAL_TYPES_URL,
  SAVE_TRANSPORT_DETAILS_URL,
  GET_TRANSPORTATIONS_URL,
  updateTransportDocumentsByIdUrl,
  deleteTransportByIdUrl,
} from "~/urls.server";
import { getErrorMessage } from "~/helpers";
import type { AdditionalTransportType, IAddTransportationCheck, IBase, ITransport, Journey } from "~/types";

export const getTransportations = async (bearerToken: string, documentNumber?: string): Promise<ITransport[]> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await get(bearerToken, GET_TRANSPORTATIONS_URL, {
    documentNumber: documentNumber,
  });

  return onGetTransportations(response);
};

const onGetTransportations = async (response: Response): Promise<ITransport[]> => {
  switch (response.status) {
    case 200:
      const transportations: ITransport[] = await response.json();
      return transportations;
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const getTransportDetails = async (
  bearerToken: string,
  journey: Journey,
  documentNumber?: string,
  arrival?: boolean
): Promise<ITransport> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await get(bearerToken, getTransportDetailsUrl(journey, arrival), {
    documentNumber: documentNumber,
  });

  return onGetTransport(response);
};

export const getTransportById = async (
  bearerToken: string,
  documentNumber?: string,
  transportId?: string
): Promise<ITransport> => {
  if (!documentNumber || !transportId) throw new Error("Document number or transport id is required");

  const response: Response = await get(bearerToken, getTransportByIdUrl(transportId), {
    documentNumber: documentNumber,
  });

  return onGetTransport(response);
};

const onGetTransport = async (response: Response): Promise<ITransport> => {
  switch (response.status) {
    case 200: {
      const transport: ITransport = await response.json();
      return {
        ...transport,
      };
    }
    case 403:
      return {
        vehicle: "undefined",
        unauthorised: true,
      };
    case 404:
      return {
        vehicle: "undefined",
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const addTransport = async (
  bearerToken: string,
  documentNumber: string | undefined,
  transport: ITransport
): Promise<ITransport> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await post(
    bearerToken,
    ADD_TRANSPORT_DETAILS_URL,
    { documentNumber: documentNumber },
    { ...transport }
  );

  return onAddTransportDetails(response);
};

const onAddTransportDetails = async (response: Response): Promise<ITransport> => {
  switch (response.status) {
    case 200:
      const data = await response.json();
      return {
        id: data.id,
        vehicle: data.vehicle,
        errors: [],
      };

    case 400:
      const errorsResponse = await response.json();
      return {
        vehicle: "undefined",
        errors: Object.keys(errorsResponse).map((error) => ({
          key: error,
          message: getErrorMessage(errorsResponse[error]),
        })),
      };
    case 403:
      return {
        vehicle: "undefined",
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const updateTransport = async (
  bearerToken: string,
  documentNumber: string | undefined,
  transportId: string | undefined,
  payload: ITransport,
  subResource?: string
): Promise<ITransport> => {
  if (!documentNumber || !transportId) throw new Error("Document number or transport id is required");

  const response: Response = await put(
    bearerToken,
    getTransportByIdUrl(transportId, subResource),
    {
      documentnumber: documentNumber,
    },
    {
      ...payload,
      id: transportId,
    }
  );

  return onUpdateTransport(response);
};

export const updateTransportDetails = async (
  bearerToken: string,
  documentNumber: string | undefined,
  transportId: string | undefined,
  payload: ITransport,
  isDraft: boolean
): Promise<ITransport> => {
  if (!documentNumber || !transportId) throw new Error("Document number or transport id is required");

  const response: Response = await put(
    bearerToken,
    updateTransportDetailsByIdUrl(transportId, isDraft),
    {
      documentnumber: documentNumber,
    },
    {
      ...payload,
      id: transportId,
    }
  );

  return onUpdateTransport(response);
};

const onUpdateTransport = async (response: Response): Promise<ITransport> => {
  switch (response.status) {
    case 200:
      const data = await response.json();
      return {
        id: data.id,
        vehicle: data.vehicle,
        errors: [],
      };

    case 400:
      const errorsResponse = await response.json();
      return {
        vehicle: "undefined",
        errors: Object.keys(errorsResponse).map((error) => ({
          key: error,
          message: getErrorMessage(errorsResponse[error]),
        })),
      };
    case 403:
      return {
        vehicle: "undefined",
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const deleteTransport = async (
  bearerToken: string,
  documentNumber: string,
  transportId: string
): Promise<{ success: boolean } | ITransport> => {
  if (!documentNumber || !transportId) {
    throw new Error("Document number or transport ID is required");
  }

  const response: Response = await deleteRequest(bearerToken, deleteTransportByIdUrl(transportId), {
    documentnumber: documentNumber,
  });

  return onDeleteTransport(response);
};

const onDeleteTransport = async (response: Response): Promise<{ success: boolean } | ITransport> => {
  switch (response.status) {
    case 200:
    case 204:
      return { success: true };

    case 400: {
      const errorsResponse = await response.json();
      return {
        vehicle: "undefined",
        errors: Object.keys(errorsResponse).map((error) => ({
          key: error,
          message: getErrorMessage(errorsResponse[error]),
        })),
      };
    }

    case 403:
      return {
        vehicle: "undefined",
        errors: [],
        unauthorised: true,
      };

    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const updateTransportDocuments = async (
  bearerToken: string,
  documentNumber: string | undefined,
  transportId: string | undefined,
  payload: ITransport,
  shouldSaveAndContinue: boolean,
  shouldSaveDraft: boolean
): Promise<ITransport> => {
  if (!documentNumber || !transportId) throw new Error("Document number or transport id is required");

  const requestHeaders = {
    documentnumber: documentNumber,
  };
  const requestBody = {
    ...payload,
    id: transportId,
  };

  const response: Response = shouldSaveAndContinue
    ? await post(bearerToken, updateTransportDocumentsByIdUrl(transportId), requestHeaders, requestBody)
    : await put(
        bearerToken,
        updateTransportDocumentsByIdUrl(transportId, shouldSaveDraft),
        requestHeaders,
        requestBody
      );

  return onUpdateTransportDocuments(response);
};

const onUpdateTransportDocuments = async (response: Response): Promise<ITransport> => {
  switch (response.status) {
    case 200: {
      const data = await response.json();
      return {
        id: data.id,
        vehicle: data.vehicle,
        errors: [],
      };
    }
    case 400: {
      const errorsResponse = await response.json();
      return {
        vehicle: "undefined",
        errors: Object.keys(errorsResponse).map((error) => ({
          key: error,
          message: error.includes("documents.")
            ? modifyErrorMessageForDocument(error, errorsResponse[error])
            : getErrorMessage(errorsResponse[error]),
        })),
      };
    }
    case 403:
      return {
        vehicle: "undefined",
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

const modifyErrorMessageForDocument = (error?: string, message?: string) => {
  const documentIndex = error?.split(".")?.[1];
  const newMessage = message?.replace(`.${documentIndex}`, "")?.toString() ?? "";
  return getErrorMessage(newMessage);
};

export const saveTransportDetails = async (
  bearerToken: string,
  documentNumber: string | undefined,
  payload: ITransport,
  isSaveAsDraft: boolean = false
): Promise<IBase> => {
  if (!documentNumber) throw new Error("Document number is required");
  const response: Response = await post(
    bearerToken,
    addTransportationDetailsUrl(payload.vehicle, isSaveAsDraft),
    {
      documentnumber: documentNumber,
    },
    { ...payload }
  );
  return onSaveTransportDetails(response);
};

export const saveTransport = async (
  bearerToken: string,
  documentNumber: string | undefined,
  transport: ITransport,
  currentUri: string,
  journey: Journey,
  isTransportSavedAsDraft: boolean
): Promise<IBase> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await post(
    bearerToken,
    SAVE_TRANSPORT_DETAILS_URL,
    { documentNumber: documentNumber },
    { ...transport, currentUri, journey, isTransportSavedAsDraft }
  );

  return onSaveTransportDetails(response);
};

const onSaveTransportDetails = async (response: Response): Promise<IBase> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        errors: [],
      };
    case 400:
      const errorsResponse = await response.json();
      return {
        errors: Object.keys(errorsResponse).map((error) => {
          if (errorsResponse[error] === "error.nationalityOfVehicle.any.required") {
            errorsResponse[error] = "error.nationalityOfVehicle.any.invalid";
          }

          return {
            key: error,
            message: getErrorMessage(errorsResponse[error]),
          };
        }),
      };
    case 403:
      return {
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const saveTruckCMR = async (
  bearerToken: string,
  currentUri: string,
  journey: Journey,
  transport: any,
  isTruckCMRSavedAsDraft: boolean,
  documentNumber: string | undefined
): Promise<IBase> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await post(
    bearerToken,
    SAVE_TRUCK_CMR_URL,
    { documentNumber: documentNumber },
    { ...transport, currentUri, journey, isTruckCMRSavedAsDraft }
  );

  return onSaveTruckCMR(response);
};

const onSaveTruckCMR = async (response: Response): Promise<IBase> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        errors: [],
      };
    case 400:
      const errorsResponse = await response.json();
      return {
        errors: Object.keys(errorsResponse).map((error) => ({
          key: error,
          message: getErrorMessage(errorsResponse[error]),
        })),
      };
    case 403:
      return {
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const getAdditionalTransportTypes = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<IAddTransportationCheck> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await get(bearerToken, CHECK_ADDITIONAL_TYPES_URL, { documentNumber: documentNumber });

  return onAddAdditionalTransportTypes(response);
};

export const addAdditionalTransportTypes = async (
  bearerToken: string,
  transport: AdditionalTransportType,
  documentNumber: string | undefined
): Promise<IAddTransportationCheck> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await post(
    bearerToken,
    CHECK_ADDITIONAL_TYPES_URL,
    { documentNumber: documentNumber },
    { ...transport }
  );

  return onAddAdditionalTransportTypes(response);
};

const onAddAdditionalTransportTypes = async (response: Response): Promise<IAddTransportationCheck> => {
  switch (response.status) {
    case 204:
      return {
        addTransportation: undefined,
        errors: [],
      };
    case 200:
      const data = await response.json();
      return {
        addTransportation: data.addTransportation,
        errors: [],
      };
    case 400:
      const errorsResponse = await response.json();
      return {
        errors: Object.keys(errorsResponse).map((error) => ({
          key: error,
          message: getErrorMessage(errorsResponse[error]),
        })),
      };
    case 403:
      return {
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
