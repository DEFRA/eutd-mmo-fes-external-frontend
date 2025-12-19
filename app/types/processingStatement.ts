import type { CertificateType, ErrorLookup, ICountry, IError } from "~/types";

export interface Catch {
  id?: string;
  species?: string;
  speciesCode?: string;
  catchCertificateNumber?: string;
  catchCertificateType?: CertificateType;
  totalWeightLanded?: string;
  catchCertificateWeight?: string;
  exportWeightBeforeProcessing?: string;
  exportWeightAfterProcessing?: string;
  issuingCountry?: ICountry;
  scientificName?: string;
  _id?: string;
  subIndex?: number;
  productId?: string;
  productDescription?: string;
  productCommodityCode?: string;
}

export interface ProcessingStatementProduct {
  id?: string;
  commodityCode: string;
  description: string;
}

export interface ProcessingStatement {
  catches?: Catch[];
  validationErrors?: {}[];
  consignmentDescription?: string;
  products?: ProcessingStatementProduct[];
  error: string;
  addAnotherCatch?: string;
  personResponsibleForConsignment?: string;
  plantApprovalNumber?: string;
  plantAddressOne?: string;
  plantBuildingNumber?: string;
  plantSubBuildingName?: string;
  plantBuildingName?: string;
  plantStreetName?: string;
  plantCounty?: string;
  plantCountry?: string;
  plantTownCity?: string;
  plantPostcode: string;
  dateOfAcceptance?: string;
  plantName?: string;
  healthCertificateNumber?: string;
  healthCertificateDate?: string;
  errors?: ErrorLookup | IError[];
  errorsUrl?: string;
  exportedTo: ICountry;
  pointOfDestination?: string;
  _plantDetailsUpdated?: boolean;
  isNonJs: boolean;
}
