import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { redirect } from "react-router";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getCountries,
  getTransportById,
  getTransportDetails,
  saveTransportDetails,
  updateTransportDetails,
  validateCSRFToken,
} from "~/.server";
import type {
  ITransport,
  Journey,
  IBase,
  IError,
  IErrorsTransformed,
  AdditionalDocumentsData,
  ICountry,
} from "~/types";
import { route } from "routes-gen";
import type { Params } from "@remix-run/router";
import isEmpty from "lodash/isEmpty";
import { getErrorMessage, getTransformedError, isValidDate } from "~/helpers";
import { getEnv } from "~/env.server";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import i18next from "~/i18next.server";
import { apiCallFailed } from "~/communication.server";

export enum TransportType {
  CONTAINER_VESSEL = "containerVessel",
  PLANE = "plane",
  TRAIN = "train",
  TRUCK = "truck",
}

const buildTransportPayload = (transportType: TransportType, form: FormData): Partial<ITransport> => {
  const values = Object.fromEntries(form);

  switch (transportType) {
    case TransportType.TRUCK:
      return {
        nationalityOfVehicle: form.get("nationalityOfVehicle") as string,
        registrationNumber: form.get("registrationNumber") as string,
        containerNumber: extractContainerNumbers(values),
      };
    case TransportType.TRAIN:
      return {
        railwayBillNumber: form.get("railwayBillNumber") as string,
        containerNumber: extractContainerNumbers(values),
      };
    case TransportType.PLANE:
      return {
        flightNumber: form.get("flightNumber") as string,
        airwayBillNumber: !isEmpty(form.get("airwayBillNumber")) ? (form.get("airwayBillNumber") as string) : undefined,
        containerNumber: extractContainerNumbers(values),
      };
    case TransportType.CONTAINER_VESSEL:
      return {
        vesselName: form.get("vesselName") as string,
        flagState: form.get("flagState") as string,
        containerNumber: extractContainerNumbers(values),
      };
    default:
      throw new Error("Unknown Transportation Type");
  }
};

const handleTransportResponse = (
  postTransport: ITransport,
  form: FormData,
  saveDraft: boolean,
  documentNumber: string,
  transportType: TransportType,
  nextUri: string
) => {
  const errors: IError[] | IErrorsTransformed = (postTransport.errors as IError[]) || [];
  const isUnauthorised = postTransport.unauthorised as boolean;

  if (isUnauthorised) return redirect("/forbidden");
  if (saveDraft) return redirect(route("/create-catch-certificate/catch-certificates"));
  if (errors.length > 0) {
    // Map backend error messages through getErrorMessage to get proper translation keys
    const mappedErrors = errors.map((error: IError) => ({
      ...error,
      message: getErrorMessage(error.message),
    }));
    const values = Object.fromEntries(form);
    return apiCallFailed(mappedErrors, values);
  }

  // Use the transport ID from the response
  const transportId = postTransport.id;

  const progressUrl = `/create-catch-certificate/${documentNumber}/add-additional-transport-documents-${transportType === TransportType.CONTAINER_VESSEL ? "container-vessel" : transportType}/${transportId ?? "0"}`;
  return redirect(isEmpty(nextUri) ? progressUrl : nextUri);
};

export const CatchCertificateTransportationDetailsLoader = async (
  request: Request,
  params: Params,
  transportType: TransportType
) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const splitParams = params["*"]?.split("/");
  const transportId = splitParams ? splitParams[0] : "";

  const { documentNumber } = params;
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const bearerToken = await getBearerTokenForRequest(request);
  // Get translation function
  const t = await i18next.getFixedT(request, ["title"]);

  const isDocumentPage = url.pathname?.includes("add-additional-transport-documents");
  // Map transportType to translation keys
  const transportTypeTranslationKeys: Record<TransportType, string> = {
    [TransportType.TRUCK]: isDocumentPage ? "addTransportationDocumentsTruck" : "addTransportationDetailsTruck",
    [TransportType.PLANE]: isDocumentPage ? "addTransportationDocumentsPlane" : "addTransportationDetailsPlane",
    [TransportType.TRAIN]: isDocumentPage
      ? "addTransportationDocumentsContainerTrain"
      : "addTransportationDetailsContainerTrain",
    [TransportType.CONTAINER_VESSEL]: isDocumentPage
      ? "addTransportationDocumentsContainerVessel"
      : "addTransportationDetailsContainerVessel",
  };

  const transportTypeKey = transportTypeTranslationKeys[transportType];

  if (transportId) {
    const transport: ITransport = await getTransportById(bearerToken, documentNumber, transportId);

    if (transport.unauthorised || transport.vehicle !== transportType) {
      return redirect("/forbidden");
    }

    const countries: ICountry[] = await getCountries();

    // Dynamically set the page title using translation
    const pageTitle = t(transportTypeKey, { ns: "title" });
    const commonTitle = t("ccCommonTitle", { ns: "title" });

    const documents: AdditionalDocumentsData[] = Array.isArray(transport.documents)
      ? transport.documents.map((document: AdditionalDocumentsData) => ({
          id: document.id ?? uuidv4(),
          name: document.name,
          reference: document.reference,
        }))
      : [];

    const displayOptionalSuffix = getEnv().EU_CATCH_FIELDS_OPTIONAL === "true";

    const session = await getSessionFromRequest(request);
    const csrf = await createCSRFToken(request);
    session.set("csrf", csrf);
    const hasActionExecuted = session.get("addAnotherDocument");

    if (hasActionExecuted) {
      documents.unshift({
        id: hasActionExecuted,
        name: "",
        reference: "",
      });
    }

    const maximumTransportDocumentPerTransport = parseInt(getEnv().EU_CATCH_MAX_TRANSPORT_DOCUMENTS, 10);

    let containerNumber: string[] = transport.containerNumber ?? [];
    // Initialize with empty string for all transport types that support containerNumbers
    if (
      [TransportType.TRUCK, TransportType.TRAIN, TransportType.PLANE, TransportType.CONTAINER_VESSEL].includes(
        transportType
      ) &&
      containerNumber.length === 0
    ) {
      containerNumber = [""];
    }

    return new Response(
      JSON.stringify({
        documentNumber,
        csrf,
        ...transport,
        containerNumber,
        documents,
        nextUri,
        pageTitle,
        commonTitle,
        displayOptionalSuffix,
        maximumTransportDocumentPerTransport,
        countries,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  return redirect(`/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk`);
};

export const CatchCertificateTransportationDetailsAction = async (
  request: Request,
  params: Params,
  transportType: TransportType
) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const splitParams = params["*"]?.split("/");
  const transportId = splitParams?.[0];

  if (!transportId) {
    return redirect(`/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk`);
  }

  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const saveDraft = form.get("_action") === "saveAsDraft";
  const departurePlace = form.get("departurePlace") as string;
  const freightBillNumber = !isEmpty(form.get("freightBillNumber"))
    ? (form.get("freightBillNumber") as string)
    : undefined;
  const nextUri = form.get("nextUri") as string;

  const payload: ITransport = {
    vehicle: transportType,
    departurePlace: departurePlace,
    freightBillNumber: freightBillNumber,
    ...buildTransportPayload(transportType, form),
  };

  const postTransport: ITransport = await updateTransportDetails(
    bearerToken,
    documentNumber,
    transportId,
    payload,
    saveDraft
  );

  return handleTransportResponse(postTransport, form, saveDraft, documentNumber, transportType, nextUri);
};

export const TransportationDetailsLoaderFunction = async (
  request: Request,
  params: Params,
  transportType: string,
  journey: Journey,
  arrival?: boolean
) => {
  setApiMock(request.url);
  const { documentNumber } = params;
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);
  const transport: ITransport = await getTransportDetails(bearerToken, journey, documentNumber, arrival);

  if (transport.unauthorised) {
    return redirect("/forbidden");
  }

  if (transport.vehicle !== transportType) return redirect("/forbidden");

  const countries: ICountry[] = await getCountries();
  const displayOptionalSuffix = getEnv().EU_CATCH_FIELDS_OPTIONAL === "true";

  // Handle containers data when JS is disabled
  const addContainerClicked = session.get("addContainerClicked");
  const removeContainerClicked = session.get("removeContainerClicked");
  const containerCount = session.get("containerCount") ?? 1;
  const sessionContainerValues = session.get("containerValues") ?? [];

  session.unset("addContainerClicked");
  session.unset("removeContainerClicked");

  let containerNumber = transport.containerNumber;
  if (addContainerClicked || removeContainerClicked) {
    containerNumber = Array.from({ length: containerCount }, (_, index) => sessionContainerValues[index] ?? "");
  }

  return new Response(
    JSON.stringify({
      documentNumber,
      ...transport,
      nextUri,
      csrf,
      countries,
      displayOptionalSuffix,
      containerNumber,
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

export const jsDisabledValidation = async (request: Request, values: any) => {
  const selectedDate = `${values["year"]}-${values["month"]}-${values["day"]}`;

  if (isEmpty(values["year"]) || isEmpty(values["month"]) || isEmpty(values["day"])) {
    const t = await i18next.getFixedT(request, ["transportation"]);

    return new Response(
      JSON.stringify({
        ...values,
        errors: getTransformedError([
          {
            key: "exportDate",
            message: t(getErrorMessage("error.exportDate.any.required")),
          },
        ]),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  if (!isValidDate(selectedDate, "YYYY-MM-DD")) {
    const t = await i18next.getFixedT(request, ["transportation"]);

    return new Response(
      JSON.stringify({
        ...values,
        errors: getTransformedError([
          {
            key: "exportDate",
            message: t(getErrorMessage("error.exportDate.date.format")),
          },
        ]),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const enteredDate = moment(selectedDate, "YYYY-M-D").startOf("day");
  const maxDate = moment().add(1, "day").startOf("day");

  // Compare the two dates
  const diffInDays = enteredDate.diff(maxDate, "days");

  if (diffInDays > 0) {
    const t = await i18next.getFixedT(request, ["transportation"]);

    return new Response(
      JSON.stringify({
        ...values,
        errors: getTransformedError([
          {
            key: "exportDate",
            message: t(getErrorMessage("error.exportDate.date.max")),
          },
        ]),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(JSON.stringify({ ...values }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const calculateExportDate = (form: any): string | undefined => {
  const day = form.get("exportDateDay") as string;
  const month = form.get("exportDateMonth") as string;
  const year = form.get("exportDateYear") as string;
  // If all parts are empty, return an explicit empty string so the payload contains a clear marker
  // (JSON.stringify will include the key with an empty string value). This allows the server
  // to distinguish "user cleared this field" from "field not supplied" and overwrite stored values.
  return !day && !month && !year ? "" : `${day}/${month}/${year}`;
};

export const calculateDepartureDate = (form: any): string | undefined => {
  const day = form.get("departureDateDay") as string;
  const month = form.get("departureDateMonth") as string;
  const year = form.get("departureDateYear") as string;
  // If all parts are empty, return an explicit empty string so the payload contains a clear marker
  // (JSON.stringify will include the key with an empty string value). This allows the server
  // to distinguish "user cleared this field" from "field not supplied" and overwrite stored values.
  return !day && !month && !year ? "" : `${day}/${month}/${year}`;
};
const returnValidCountryName = async (countryName: string | undefined | null) => {
  if (countryName === "") return "";
  if (!countryName) return undefined;
  const countries = await getCountries();
  const officialCountryName: string | undefined = countries.find(
    (c: ICountry) =>
      !isEmpty(c.officialCountryName) &&
      !isEmpty(countryName) &&
      c.officialCountryName.toLowerCase() === countryName.toLowerCase()
  )?.officialCountryName;
  return officialCountryName;
};
const checkField = (fieldValue: string | undefined | null, maxAllowedLen: number, regex: RegExp) => {
  if (fieldValue == "") return "";
  if (!fieldValue) return undefined;
  const checkMaxLen = fieldValue.length > maxAllowedLen;
  if (checkMaxLen || !fieldValue.match(regex)) return undefined;
  else return fieldValue;
};
const checkRegistrationNumber = (registrationNumber: string | undefined | null) =>
  checkField(registrationNumber, 50, /^[a-zA-Z0-9\- ]+$/);
const checkFreightBillNumber = (freightBillNumber: string | undefined | null) =>
  checkField(freightBillNumber, 60, /^[a-zA-Z0-9-./]*$/);
const checkDeparturePlace = (departurePlace: string | undefined | null) =>
  checkField(departurePlace, 50, /^[a-zA-Z0-9\-'` ]+$/);
const checkDeparturePort = (departurePort: string | undefined | null) =>
  checkField(departurePort, 50, /^[a-zA-Z0-9\-"' ]+$/);
const checkRailwayBillNumber = (railwayBillNumber: string | undefined | null) =>
  checkField(railwayBillNumber, 15, /^[a-zA-Z0-9]+$/);
const checkAirWayBillNumber = (airwayBillNumber: string | undefined | null) =>
  checkField(airwayBillNumber, 50, /^[a-zA-Z0-9-./]+$/);
const checkFlightNumber = (flightNumber: string | undefined | null) => checkField(flightNumber, 50, /^[a-zA-Z0-9]+$/);
const checkPlaceOfUnloading = (placeOfUnloading: string | undefined | null) =>
  checkField(placeOfUnloading, 50, /^[a-zA-Z0-9]+$/);
const checkPointOfDestination = (pointOfDestination: string | undefined | null) =>
  checkField(pointOfDestination, 100, /^[a-zA-Z0-9\-' /]+$/);
const validatePayload = async (payload: ITransport, saveAsDraft: boolean) => {
  if (saveAsDraft) {
    payload.nationalityOfVehicle = await returnValidCountryName(payload.nationalityOfVehicle);
    payload.railwayBillNumber = checkRailwayBillNumber(payload.railwayBillNumber);
    payload.registrationNumber = checkRegistrationNumber(payload.registrationNumber);
    payload.freightBillNumber = checkFreightBillNumber(payload.freightBillNumber);
    payload.departurePlace = checkDeparturePlace(payload.departurePlace);
    payload.departureCountry = await returnValidCountryName(payload.departureCountry);
    payload.departurePort = checkDeparturePort(payload.departurePort);
    payload.airwayBillNumber = checkAirWayBillNumber(payload.airwayBillNumber);
    payload.flightNumber = checkFlightNumber(payload.flightNumber);
    payload.placeOfUnloading = checkPlaceOfUnloading(payload.placeOfUnloading);
    payload.pointOfDestination = checkPointOfDestination(payload.pointOfDestination);
    // Save-as-draft preserves container numbers as entered (including invalid formats)
    // so users can return and correct them. Only strip undefined/null entries.
    payload.containerNumber = (payload.containerNumber ?? []).filter((cn): cn is string => cn != null);
    return [] as IError[] | IErrorsTransformed;
  } else {
    const errors: IError[] | IErrorsTransformed = [];
    if (payload.nationalityOfVehicle) {
      const countryName = await returnValidCountryName(payload.nationalityOfVehicle);
      payload.nationalityOfVehicle = countryName;
      if (countryName === undefined)
        errors.push({
          key: "nationalityOfVehicle",
          message: "sdTransportTruckNationalityInvalidError",
        });
    }
    if (payload.departureCountry) {
      const countryName = await returnValidCountryName(payload.departureCountry);
      payload.departureCountry = countryName;
      if (countryName === undefined)
        errors.push({
          key: "departureCountry",
          message: "sdTransportDepatureCountryInvalidError",
        });
    }
    return errors;
  }
};

export const handleFormEmptyStringValue = <T = string>(
  form: any,
  valueName: string,
  saveAsDraft: boolean
): T | undefined => {
  if (saveAsDraft) return form.get(valueName) as T;
  return form.get(valueName) === "" ? ("" as T) : (form.get(valueName) as T);
};

const sortErrors = (errors: IError[], payload: ITransport) =>
  errors.sort((a, b) => {
    const indexA = Object.keys(payload).indexOf(a.key);
    const indexB = Object.keys(payload).indexOf(b.key);
    return indexA - indexB;
  });

export const commonSaveTransportDetails = async (
  bearerToken: string,
  documentNumber: string | undefined,
  payload: ITransport,
  nextUri: string,
  form: any
) => {
  const saveAsDraft = form.get("_action") === "saveAsDraft";
  let errors: IError[] | IErrorsTransformed = payload?.arrival ? await validatePayload(payload, saveAsDraft) : [];

  // Reject year 0000 (and any sub-1000 year) for exportDate and departureDate (format dd/mm/yyyy)
  // before hitting the API. moment.js in strict mode accepts year 0000 as valid;
  // isValidDate now rejects it, but we use moment().year() directly here rather than !isValidDate
  // to avoid adding frontend errors for other invalid formats (e.g. month 13) that the API
  // already catches, which would produce duplicate error messages.
  if (!saveAsDraft) {
    if (payload.exportDate) {
      const exportDateParsed = moment(payload.exportDate as string, "DD/MM/YYYY", true);
      if (exportDateParsed.isValid() && exportDateParsed.year() < 1000) {
        (errors as IError[]).push({ key: "exportDate", message: "sdTransportExportDateInvalidError" });
      }
    }
    if (payload.departureDate) {
      const departureDateParsed = moment(payload.departureDate as string, "DD/MM/YYYY", true);
      if (departureDateParsed.isValid() && departureDateParsed.year() < 1000) {
        (errors as IError[]).push({ key: "departureDate", message: "sdTransportDepatureDateInvalidError" });
      }
    }
  }

  let postTransport: IBase;

  // Save valid fields as draft even when validation errors exist
  if (saveAsDraft) {
    // Validate to determine which fields are invalid
    const validationResponse = await saveTransportDetails(bearerToken, documentNumber, payload, false);

    // Combine validation errors from client and backend with defensive checks
    const backendErrors = Array.isArray(validationResponse.errors) ? validationResponse.errors : [];
    const allErrors = [...(Array.isArray(errors) ? errors : []), ...backendErrors];

    if (allErrors.length > 0) {
      // Define system fields that must never be deleted
      const systemFields = ["vehicle", "journey", "user_id", "currentUri", "nextUri", "arrival"];

      // Filter out invalid fields from payload, but preserve system fields
      const errorKeys = allErrors.map((e) => e.key).filter((key) => !systemFields.includes(key));
      const filteredPayload = { ...payload };
      errorKeys.forEach((key) => {
        delete (filteredPayload as any)[key];
      });

      // Save only valid fields as draft
      postTransport = await saveTransportDetails(bearerToken, documentNumber, filteredPayload, true);
    } else {
      // No validation errors - save all data as draft
      postTransport = await saveTransportDetails(bearerToken, documentNumber, payload, true);
    }

    errors = allErrors;
  } else {
    // Normal save and continue - validate and return errors if any
    postTransport = await saveTransportDetails(bearerToken, documentNumber, payload, false);

    const sortedErrors = sortErrors(
      [...(Array.isArray(errors) ? errors : []), ...(postTransport.errors as IError[])],
      payload
    );
    errors = sortedErrors;
  }

  const isUnauthorised = postTransport.unauthorised as boolean;

  if (isUnauthorised) {
    return redirect("/forbidden");
  }

  // Determine the correct save as draft route based on the document type
  let saveAsDraftRoute: string;
  if (documentNumber?.includes("-PS-")) {
    saveAsDraftRoute = route("/create-processing-statement/processing-statements");
  } else if (documentNumber?.includes("-SD-") || documentNumber?.includes("-SM-")) {
    saveAsDraftRoute = route("/create-non-manipulation-document/non-manipulation-documents");
  } else {
    // Default to catch certificate
    saveAsDraftRoute = route("/create-catch-certificate/catch-certificates");
  }
  const progressRoute = payload.arrival
    ? route("/create-non-manipulation-document/:documentNumber/add-storage-facility-details", { documentNumber })
    : route("/create-non-manipulation-document/:documentNumber/departure-product-summary", { documentNumber });

  // Redirect to dashboard after saving valid fields
  if (saveAsDraft) return redirect(saveAsDraftRoute);

  if (errors.length > 0) {
    const values = Object.fromEntries(form);
    return apiCallFailed(errors, values);
  }

  // If this is an arrival transport and we're redirecting to the storage facility page,
  // include the arrival vehicle as a query parameter so the storage facility loader can
  // determine the correct back link immediately after redirect.
  let finalRedirect = isEmpty(nextUri) ? progressRoute : nextUri;

  if (payload.arrival && finalRedirect.includes("add-storage-facility-details")) {
    const vehicleParam = encodeURIComponent(String(payload.vehicle ?? ""));
    if (isEmpty(nextUri)) {
      finalRedirect = `${progressRoute}?arrivalVehicle=${vehicleParam}`;
    } else if (finalRedirect.includes("?")) {
      finalRedirect = `${finalRedirect}&arrivalVehicle=${vehicleParam}`;
    } else {
      finalRedirect = `${finalRedirect}?arrivalVehicle=${vehicleParam}`;
    }
  }

  return redirect(finalRedirect);
};

export const extractContainerNumbers = (values: Record<string, any>, maxCount: number = 10): string[] => {
  const containerNumber: string[] = [];
  for (let i = 0; i < maxCount; i++) {
    const key = `containerNumber.${i}`;
    const value = values[key];
    // Preserve all values including empty strings to maintain index integrity for error mapping
    // (error messages like "containerNumber.2" must map to the correct form field)
    containerNumber.push(value ?? "");
  }
  // Remove trailing empty strings for cleaner payload
  while (containerNumber.length > 0 && containerNumber[containerNumber.length - 1] === "") {
    containerNumber.pop();
  }
  return containerNumber;
};

// Handle container button actions when JS is disabled
export const handleContainerActions = async (request: Request, _action: string, values: Record<string, any>) => {
  const session = await getSessionFromRequest(request);

  switch (_action) {
    case "add-container-button": {
      const currentContainers = Object.keys(values)
        .filter((key) => key.startsWith("containerNumber."))
        .map((key) => values[key] as string);

      session.set("addContainerClicked", true);
      session.set("containerCount", currentContainers.length + 1);
      session.set("containerValues", currentContainers);

      return redirect(request.url, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
    case "remove-container-button": {
      const currentContainers = Object.keys(values)
        .filter((key) => key.startsWith("containerNumber."))
        .map((key) => values[key] as string);

      session.set("removeContainerClicked", true);
      session.set("containerCount", Math.max(1, currentContainers.length - 1));
      session.set("containerValues", currentContainers.slice(0, -1));

      return redirect(request.url, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }

  return null;
};
