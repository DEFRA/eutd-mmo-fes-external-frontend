import { type ICountry, type IResponseBase } from "./";

export interface IExportLocation {
  exportedFrom?: string;
  exportedTo?: ICountry;
  pointOfDestination?: string;
}
export interface IExportLocationResponse extends IResponseBase {
  exportedFrom?: string;
  exportedTo?: ICountry;
  pointOfDestination?: string;
}
