import type { IBase, IError, IErrorsTransformed, Journey } from "./";

export interface IUnauthorised {
  unauthorised: boolean;
  supportId?: string;
}

export interface IResponseBase {
  errors?: IError[];
  unauthorised?: boolean;
}

export interface IValidationError {
  message: string;
  key: string;
  certificateNumber?: string;
  product?: string;
}

export interface ISubmitResponse extends IResponseBase {
  documentNumber?: string;
  uri?: string;
  validationErrors?: IValidationError[];
}

export interface ICountry {
  officialCountryName: string;
  isoCodeAlpha2?: string;
  isoCodeAlpha3?: string;
  isoNumericCode?: string;
}

export interface IVoidCertificateConfirmation extends IBase {
  documentVoid?: string;
  journey?: string;
  nextUri?: string;
}

export type CertificateType = "uk" | "non_uk";

export type CheckCopyCertificateDocument = {
  canCopy: boolean;
};

export type CopyCertificateDocument = {
  copyDocumentAcknowledged: boolean;
  documentNumber?: string;
  journey: Journey;
  newDocumentNumber?: string;
  voidOriginal?: boolean;
  excludeLandings?: boolean;
  voidDocumentConfirm?: boolean;
  errors?: IError[] | IErrorsTransformed;
  unauthorised?: boolean;
  copyDocument?: string;
  ipaddress?: string;
};

export type CopyCertificateOption = {
  label: string;
  value: string;
  name: string;
  id: string;
  hint: string;
};

export type VoidCertificateOption = {
  label: string;
  value: string;
  name: string;
  id: string;
};

export type CompletedDocument = {
  createdAt: string;
  documentNumber: string;
  documentStatus: string;
  documentUri: string;
  userReference: string;
};

export interface CatchIndex {
  catchIndex?: number;
}

export type ActionDataWithErrors = {
  groupedErrors: IError[][];
};
