export interface IError {
  key: string;
  message: string;
  value?: { [key: string]: number | string };
  fieldId?: string;
}

export interface IErrorsTransformed {
  [key: string]: IError;
}

export interface ErrorLookup {
  [key: string]: string;
}

export interface ErrorObject {
  key: string;
  params: number[];
}

export interface ErrorResponse {
  errors: IErrorsTransformed;
}

export interface LinkData {
  href: string;
}
