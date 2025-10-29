import type { Product, Vessel, ErrorObject, ICountry } from "~/types";

export interface IUploadedLanding {
  rowNumber: number;
  originalRow: string;
  productId: string;
  product?: Product;
  startDate?: string;
  landingDate: string;
  faoArea: string;
  highSeasArea?: string;
  rfmoCode?: string;
  rfmoName?: string;
  eezCode?: string;
  eezData?: ICountry[];
  vessel: Vessel;
  vesselPln: string;
  exportWeight: string;
  gearCode?: string;
  gearCategory?: string;
  gearType?: string;
  errors: Array<ErrorObject | string>;
}
