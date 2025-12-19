import { type TransportType } from "~/helpers";
import { type IBase } from "./catchCertificate";
import { type ICountry } from "./common";
import { type Journey } from "./main";

export type Vehicle = "truck" | "plane" | "train" | "containerVessel" | "directLanding" | "undefined";
export type Cmr = "true" | "false";
export type addTransportation = "yes" | "no";

export interface ITransport extends IBase {
  id?: string;
  vehicle: Vehicle;
  cmr?: Cmr;
  nationalityOfVehicle?: string;
  registrationNumber?: string;
  departurePlace?: string | null;
  freightBillNumber?: string | null;
  containerIdentificationNumber?: string | null;
  flightNumber?: string;
  containerNumber?: string;
  containerNumbers?: string[];
  railwayBillNumber?: string;
  airwayBillNumber?: string;
  vesselName?: string;
  flagState?: string;
  user_id?: string;
  journey?: Journey;
  currentUri?: string;
  nextUri?: string;
  departureCountry?: string | null;
  departurePort?: string | null;
  departureDate?: string | null;
  exportDate?: string | null;
  exportDateTo?: string;
  exportedTo?: ICountry | null;
  placeOfUnloading?: string | null;
  pointOfDestination?: string | null;
  documents?: AdditionalDocumentsData[];
  arrival?: boolean;
  facilityArrivalDate?: string | null;
}

export type TransportOptionType = {
  label: string;
  value: string;
  id: string;
};

export type ConfirmCmrOptionsType = {
  label: string;
  value: string;
  id: string;
};

export type AdditionalTransportType = {
  addTransportation: string;
};

export interface AdditionalDocumentForm extends IBase {
  vehicle?: string;
  index: number;
  documents?: AdditionalDocumentsData[];
  transportType?: TransportType;
  documentId?: string;
  documentName?: string;
  documentReference?: string;
}

export type AdditionalDocumentsData = {
  id?: string;
  name: string;
  reference: string;
};
