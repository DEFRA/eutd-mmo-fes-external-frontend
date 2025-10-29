import type { CatchIndex, CertificateType, ICountry, ITransport, IValidationError } from "~/types";

export interface StorageDocumentCatch {
  id: string;
  product: string;
  commodityCode: string;
  productWeight?: string;
  dateOfUnloading: string;
  placeOfUnloading: string;
  transportUnloadedFrom: string;
  certificateNumber: string;
  certificateType?: CertificateType;
  weightOnCC: string;
  scientificName?: string;
  supportingDocuments?: string[];
  productDescription?: string;
  netWeightProductArrival?: string;
  netWeightFisheryProductArrival?: string;
  netWeightProductDeparture?: string;
  netWeightFisheryProductDeparture?: string;
  _id?: string;
}

export interface StorageFacility {
  facilityName: string;
  facilityAddressOne?: string;
  facilityAddressTwo?: string;
  facilityTownCity?: string;
  facilityPostcode?: string;
  facilitySubBuildingName?: string;
  facilityBuildingNumber?: string;
  facilityBuildingName?: string;
  facilityStreetName?: string;
  facilityCounty?: string;
  facilityCountry?: string;
  facilityApprovalNumber?: string;
  facilityStorage?: string;
  facilityArrivalDate?: string;
}

export interface FacilityIndex {
  facilityIndex?: number;
}

export interface StorageDocument {
  catches: StorageDocumentCatch[];
  storageFacilities?: StorageFacility[];
  validationErrors?: IValidationError[];
  addAnotherProduct?: string;
  addAnotherStorageFacility?: string;
  transport?: ITransport;
  arrivalTransport?: ITransport;
  exportedTo?: ICountry;
  errors?: {};
  errorsUrl?: string;
  isNonJs: boolean;
}

export type FacilitiesLoaderData = {
  documentNumber: string;
  facilities: (StorageFacility & FacilityIndex)[];
  isFromStorageFacilityDetails: string;
  csrf: string;
};

export type CatchesLoaderData = {
  documentNumber: string;
  catches: (StorageDocumentCatch & CatchIndex)[];
  csrf: string;
};

export type DocIssuedInUkRadioSelectType = "uk" | "non_uk" | undefined;

export type DocIssuedInUkRadioSelectOptionType = {
  label: string;
  value: DocIssuedInUkRadioSelectType;
  id: string;
};
export interface ContainerInput {
  id: string;
  value: string;
}
