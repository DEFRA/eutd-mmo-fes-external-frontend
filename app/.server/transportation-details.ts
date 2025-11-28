import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { redirect } from "@remix-run/node";
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

    return new Response(
      JSON.stringify({
        documentNumber,
        csrf,
        ...transport,
        documents,
        nextUri,
        pageTitle,
        commonTitle,
        displayOptionalSuffix,
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

  if (transportId) {
    const form = await request.formData();
    const isValid = await validateCSRFToken(request, form);
    if (!isValid) return redirect("/forbidden");
    const saveDraft = form.get("_action") === "saveAsDraft";

    const departurePlace = form.get("departurePlace") as string;
    const freightBillNumber = !isEmpty(form.get("freightBillNumber"))
      ? (form.get("freightBillNumber") as string)
      : undefined;
    const nextUri = form.get("nextUri") as string;

    let payload: ITransport = {
      vehicle: transportType,
      departurePlace: departurePlace,
      freightBillNumber: freightBillNumber,
    };

    switch (payload.vehicle) {
      case TransportType.TRUCK: {
        payload.nationalityOfVehicle = form.get("nationalityOfVehicle") as string;
        payload.registrationNumber = form.get("registrationNumber") as string;
        payload.containerIdentificationNumber = !isEmpty(form.get("containerIdentificationNumber"))
          ? (form.get("containerIdentificationNumber") as string)
          : null;
        break;
      }
      case TransportType.TRAIN: {
        payload.railwayBillNumber = form.get("railwayBillNumber") as string;
        payload.containerIdentificationNumber = !isEmpty(form.get("containerIdentificationNumber"))
          ? (form.get("containerIdentificationNumber") as string)
          : null;
        break;
      }
      case TransportType.PLANE: {
        payload.flightNumber = form.get("flightNumber") as string;
        payload.containerNumber = form.get("containerNumber") as string;
        break;
      }
      case TransportType.CONTAINER_VESSEL: {
        payload.vesselName = form.get("vesselName") as string;
        payload.flagState = form.get("flagState") as string;
        payload.containerNumber = form.get("containerNumber") as string;
        break;
      }
      default: {
        throw new Error("Unknown Transportation Type");
      }
    }

    const postTransport: ITransport = await updateTransportDetails(
      bearerToken,
      documentNumber,
      transportId,
      payload,
      saveDraft
    );

    const errors: IError[] | IErrorsTransformed = (postTransport.errors as IError[]) || [];
    const isUnauthorised = postTransport.unauthorised as boolean;
    if (isUnauthorised) {
      return redirect("/forbidden");
    } else if (saveDraft) {
      return redirect(route("/create-catch-certificate/catch-certificates"));
    } else if (errors.length > 0) {
      const values = Object.fromEntries(form);
      return apiCallFailed(errors, values);
    }

    const progressUrl = `/create-catch-certificate/${documentNumber}/add-additional-transport-documents-${transportType === TransportType.CONTAINER_VESSEL ? "container-vessel" : transportType}/${transportId}`;
    return redirect(isEmpty(nextUri) ? progressUrl : nextUri);
  }

  return redirect(`/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk`);
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

  let containerNumbers = transport.containerNumbers;
  if (addContainerClicked || removeContainerClicked) {
    containerNumbers = Array.from({ length: containerCount }, (_, index) => sessionContainerValues[index] ?? "");
  }

  return new Response(
    JSON.stringify({
      documentNumber,
      ...transport,
      nextUri,
      csrf,
      countries,
      displayOptionalSuffix,
      containerNumbers,
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
    const t = i18next.getFixedT(request, ["transportation"]);

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
    const t = i18next.getFixedT(request, ["transportation"]);

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
  return day && month && year ? `${day}/${month}/${year}` : undefined;
};

export const calculateDepartureDate = (form: any): string | undefined => {
  const day = form.get("departureDateDay") as string;
  const month = form.get("departureDateMonth") as string;
  const year = form.get("departureDateYear") as string;
  return !day && !month && !year ? undefined : `${day}/${month}/${year}`;
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
const checkContainerNumbers = (containerNumbers: string[] | undefined | null) => {
  if (!containerNumbers || containerNumbers.length === 0) return [];
  const validContainers = containerNumbers.map((cn) => {
    const trimmed = cn.trim();
    if (trimmed.length > 50 || !trimmed.match(/^[a-zA-Z0-9]+$/)) return undefined;
    return trimmed;
  });
  return validContainers;
};
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
    payload.containerNumbers = checkContainerNumbers(payload.containerNumbers).filter((cn) => cn !== undefined);
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
  const postTransport: IBase = await saveTransportDetails(bearerToken, documentNumber, payload, saveAsDraft);
  const sortedErrors = sortErrors(
    [...(Array.isArray(errors) ? errors : []), ...(postTransport.errors as IError[])],
    payload
  );

  errors = sortedErrors;
  const isUnauthorised = postTransport.unauthorised as boolean;

  if (isUnauthorised) {
    return redirect("/forbidden");
  }

  const saveAsDraftRoute = route("/create-storage-document/storage-documents");
  const progressRoute = payload.arrival
    ? route("/create-storage-document/:documentNumber/add-storage-facility-details", { documentNumber })
    : route("/create-storage-document/:documentNumber/departure-product-summary", { documentNumber });

  if (saveAsDraft) return redirect(saveAsDraftRoute);

  if (errors.length > 0) {
    const values = Object.fromEntries(form);
    return apiCallFailed(errors, values);
  }

  return redirect(isEmpty(nextUri) ? progressRoute : nextUri);
};

export const extractContainerNumbers = (values: Record<string, any>): string[] =>
  Object.keys(values)
    .filter((key) => key.startsWith("containerNumbers."))
    .map((key) => values[key] as string);

// Handle container button actions when JS is disabled
export const handleContainerActions = async (request: Request, _action: string, values: Record<string, any>) => {
  const session = await getSessionFromRequest(request);

  switch (_action) {
    case "add-container-button": {
      const currentContainers = Object.keys(values)
        .filter((key) => key.startsWith("containerNumbers."))
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
        .filter((key) => key.startsWith("containerNumbers."))
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
