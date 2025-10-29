import { get } from "~/communication.server";
import { GET_CERTIFICATE_SUMMARY, GET_CLIENT_IP_URL, CREATE_EXPORT_CERTIFICATE } from "~/urls.server";
import isEmpty from "lodash/isEmpty";
import type {
  ErrorLookup,
  Exporter,
  ICatchCertificateSubmitResponse,
  ICatchCertificateSummary,
  IConservation,
  IError,
  IExportLocation,
  ITransport,
  Journey,
  LandingStatus,
  ProductLanded,
  ProductsLanded,
  ValidationFailure,
} from "~/types";
import moment from "moment";

export const getCatchCertificateSummary = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<ICatchCertificateSummary | undefined> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await get(bearerToken, GET_CERTIFICATE_SUMMARY, {
    documentNumber: documentNumber,
  });

  const res = await response.text();
  return res ? JSON.parse(res) : undefined;
};

const hasExporterDetails = (exporter: Exporter | undefined): boolean =>
  !isEmpty(exporter) &&
  ["exporterFullName", "exporterCompanyName", "addressOne", "postcode"].every(
    (prop: string) => !isEmpty(exporter[prop as keyof Exporter])
  );

const hasTransportDetails = (transport: ITransport): boolean => {
  if (!transport) return false;

  let hasRequiredTransportDetails;

  switch (transport.vehicle) {
    case "truck":
      hasRequiredTransportDetails = ["nationalityOfVehicle", "registrationNumber", "departurePlace"].every(
        (prop) => transport.cmr === "true" || !isEmpty(transport[prop as keyof ITransport])
      );
      break;
    case "plane":
      hasRequiredTransportDetails = ["flightNumber", "containerNumber", "departurePlace"].every(
        (prop) => !isEmpty(transport[prop as keyof ITransport])
      );
      break;
    case "train":
      hasRequiredTransportDetails = ["railwayBillNumber", "departurePlace"].every(
        (prop) => !isEmpty(transport[prop as keyof ITransport])
      );
      break;
    case "containerVessel":
      hasRequiredTransportDetails = ["vesselName", "flagState", "containerNumber", "departurePlace"].every(
        (prop) => !isEmpty(transport[prop as keyof ITransport])
      );
      break;
    case "directLanding":
      hasRequiredTransportDetails = true;
      break;
    default:
      return false;
  }

  return hasRequiredTransportDetails;
};

const hasExportLandings = (exportPayload: ProductsLanded | undefined): boolean => {
  const hasAtLeastOneLanding =
    (!isEmpty(exportPayload?.items) &&
      exportPayload?.items.some((item: ProductLanded) => Array.isArray(item.landings) && item.landings.length > 0)) ??
    false;
  const hasValidExportWeight =
    exportPayload?.items.every((item: ProductLanded) =>
      item.landings?.every(
        (landing: LandingStatus) =>
          landing.model.exportWeight !== undefined && isNaN(landing.model.exportWeight) === false
      )
    ) ?? false;
  return hasAtLeastOneLanding && hasValidExportWeight;
};

const hasFinishedProduct = (exportPayload: ProductsLanded | undefined): boolean =>
  exportPayload?.items.every(
    (item: ProductLanded) =>
      item.product.state && item.product.presentation && item.landings && item.landings.length >= 1
  ) ?? false;

export const hasRequiredDataCatchCertificateSummary = (
  exporter: Exporter | undefined,
  exportPayload: ProductsLanded | undefined,
  conservation: IConservation | undefined,
  transport: ITransport | undefined,
  transportations: ITransport[] | undefined,
  exportLocation: IExportLocation | undefined
): boolean => {
  const hasExporter = hasExporterDetails(exporter);
  const hasExportProduct =
    (Array.isArray(exportPayload?.items) &&
      exportPayload?.items.some((item: ProductLanded) => !isEmpty(item.product))) ??
    false;
  const hasTransport = !isEmpty(transport) && hasTransportDetails(transport);
  const hasTransportations =
    Array.isArray(transportations) &&
    transportations.length > 0 &&
    transportations.every((t: ITransport) => hasTransportDetails(t));
  const hasExportLocation = !isEmpty(exportLocation);
  const hasConservation = !isEmpty(conservation);

  return (
    hasExporter &&
    hasExportProduct &&
    hasExportLandings(exportPayload) &&
    hasFinishedProduct(exportPayload) &&
    (hasTransport || hasTransportations) &&
    hasExportLocation &&
    hasConservation
  );
};

export const submitExportCertificate = async (
  bearerToken: string,
  documentNumber: string | undefined,
  journey: Journey
): Promise<ICatchCertificateSubmitResponse> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const res: Response = await get(bearerToken, GET_CLIENT_IP_URL);
  const ipAddress: string = await res.text();

  const response = await fetch(CREATE_EXPORT_CERTIFICATE, {
    method: "POST",
    headers: {
      documentNumber: documentNumber,
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({ journey, data: ipAddress }),
  });

  return await onSubmitExportCertificateResponse(response);
};

const onSubmitExportCertificateResponse = async (response: Response): Promise<ICatchCertificateSubmitResponse> => {
  switch (response.status) {
    case 200:
      const res = await response.json();
      return res;
    case 400:
      let errorResponse = await response.json();
      return {
        errors: transformError(errorResponse),
      };
    case 403:
      return {
        unauthorised: true,
      };
    case 500:
      let validationErrors = await response.json();
      if (Array.isArray(validationErrors) && validationErrors[0]?.error === "SYSTEM_ERROR") {
        return {
          errors: {
            error: "SYSTEM_ERROR",
          },
        };
      }
      throw new Error("Unexpected 500 error");
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

const getErrorMessage = (key: string) => {
  const messages: ErrorLookup = {
    "3C": "ccSummaryPage3CValidationError",
    "3D": "ccSummaryPage3DValidationError",
    "4A": "ccSummaryPage4AValidationError",
    noDataSubmitted: "ccSummaryPageNoDataSubmittedError",
    vesselNotFound: "ccSummaryPageVesselNotFoundForSpeciesCaughtOnLandingDate",
    invalidLandingDate: "ccSummaryPageInvalidLandingDateError",
    noLicenceHolder: "ccSummaryPageNoLicenceHolderError",
  };
  return messages[key];
};

export const transformError: (errors: ValidationFailure[]) => IError[] = (errors: ValidationFailure[]): IError[] => {
  const error: IError[] = [];
  errors.forEach((vError: ValidationFailure, index: number) => {
    vError.rules.forEach((rule: string) => {
      error.push({
        key: `validationError-${rule}-${index}`,
        message: getErrorMessage(rule),
        value: { species: vError.species, vessel: vError.vessel, dateLanded: moment(vError.date).format("DD/MM/YYYY") },
      });
    });
  });
  return error;
};
