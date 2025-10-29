import type { IError } from "./errors";

export interface ILookUpAddressDetails {
  address_line?: string;
  building_number?: string;
  sub_building_name?: string;
  building_name?: string;
  street_name?: string;
  county?: string;
  country?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postCode?: string;
}

export interface ILookUpAddress {
  data: ILookUpAddressDetails[];
  errors: IError[];
}

export interface ISelectAddressProps {
  postcode: string;
  postcodeaddress: ILookUpAddressDetails[];
  errors: IError[];
}
