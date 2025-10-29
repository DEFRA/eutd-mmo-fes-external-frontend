import type { IError, IErrorsTransformed } from "./errors";
import type { LandingEntryType, ProductsLanded, ITransport, IExportLocation, IExporter } from ".";

export interface IBase {
  errors?: IError[] | IErrorsTransformed;
  unauthorised?: boolean;
  supportId?: string;
}

export interface ILandingsEntryOptionPost extends IBase {
  landingsEntryOption?: LandingEntryType;
}

export interface ILandingsEntryOptionGet extends ILandingsEntryOptionPost {
  generatedByContent: boolean;
}

export interface ILandingsEntryChange extends ILandingsEntryOptionPost {
  landingsEntryConfirmation?: string;
}

export interface IAddTransportationCheck extends IBase {
  addTransportation?: string;
}

export interface UserReference extends IBase {
  userReference?: string;
}
export interface ConfirmDocumentDelete extends IBase {
  documentDelete?: string;
  journey?: string;
  nextUri?: string;
}

export interface conservationProps {
  [key: string]: string;
}
export interface IConservation extends IBase {
  conservation?: conservationProps;
}

export interface ICatchCertificateSummary {
  documentNumber?: string;
  status?: string;
  startedAt?: string;
  exporter?: IExporter;
  exportPayload?: ProductsLanded;
  conservation?: IConservation;
  transport?: ITransport;
  transportations?: ITransport[];
  exportLocation?: IExportLocation;
  landingsEntryOption?: LandingEntryType;
  validationErrors?: (ValidationFailure | SystemFailure)[];
}

export interface SystemFailure {
  error: string;
  documentNumber?: string;
}

export interface ValidationFailure {
  state: string;
  species: string;
  presentation: string;
  date: Date;
  vessel: string;
  rules: string[];
}

export type LandingsEntryOptionType = {
  label: string;
  value: LandingEntryType;
  name: string;
  id: string;
  hint: string;
};

export type ConfirmLandingsEntryOptionType = {
  label: string;
  value: string;
  name: string;
  id: string;
};

export interface ICatchCertificateSubmitResponse {
  offlineValidation?: boolean;
  documentNumber?: string;
  status?: string;
  uri?: string;
  errors?: SystemFailure | IError[];
  unauthorised?: boolean;
}

export type HSAOptionType = {
  label: string;
  value: string;
  id: string;
};
