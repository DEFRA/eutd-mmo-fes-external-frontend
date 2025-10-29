import type { ICountry } from "./common";
import type { IError, IErrorsTransformed } from "./errors";
import type { ILookUpAddressDetails } from "./lookupAddress";

export interface DynamicUser {
  firstName: string | undefined;
  lastName: string | undefined;
}

export interface DynamicAddress {
  defra_uprn: string | null;
  defra_buildingname: string | null;
  defra_subbuildingname: string | null;
  defra_premises: string;
  defra_street: string;
  defra_locality: string | null;
  defra_dependentlocality: string | null;
  defra_towntext: string;
  defra_county: string;
  defra_postcode: string;
  _defra_country_value: string;
  defra_internationalpostalcode: string | null;
  defra_fromcompanieshouse: boolean | null;
  defra_addressid: string;
  _defra_country_value_OData_Community_Display_V1_FormattedValue: string;
  _defra_country_value_Microsoft_Dynamics_CRM_associatednavigationproperty: string;
  _defra_country_value_Microsoft_Dynamics_CRM_lookuplogicalname: string;
  defra_fromcompanieshouse_OData_Community_Display_V1_FormattedValue: string;
}

export interface Exporter {
  contactId?: string;
  accountId?: string;
  addressOne?: string;
  addressTwo?: string;
  buildingName?: string | null;
  buildingNumber?: string | null;
  country?: string;
  county?: string;
  currentUri?: string;
  exporterCompanyName?: string;
  exporterFullName?: string;
  journey?: string;
  nextUri?: string;
  postcode?: string;
  streetName?: string;
  subBuildingName?: string | null;
  townCity?: string | null;
  user_id?: string;
  _dynamicsUser?: DynamicUser;
  _dynamicsAddress?: DynamicAddress;
  _updated?: boolean;
}

export interface UserDetails {
  sub: string;
  contactId: string;
  firstName: string;
  lastName: string;
  email: string;
  telephoneNumber: string;
  mobileNumber: string;
  buildingname: string | null;
  buildingnumber: string;
  county: string;
  dependentlocality: string | null;
  internationalpostalcode: string | null;
  locality: string | null;
  postcode: string;
  street: string;
  subbuildingname: string | null;
  town: string;
  uprn: string | null;
  termsAcceptedVersion: number;
  termsAcceptedOn: string;
}

export interface AddressDetails {
  uprn: string | null;
  buildingname: string | null;
  subbuildingname: string | null;
  premises: string;
  street: string;
  locality: string | null;
  dependantLocality: string | null;
  towntext: string;
  county: string;
  postcode: string;
  countryId: string;
  country: string;
  internationalpostalcode: string | null;
  fromcompanieshouse: boolean;
  _dynamicsAddress: DynamicAddress;
}

export interface IExporter {
  model?: Exporter;
  error: string;
  errors: IError[] | IErrorsTransformed;
  unauthorised?: boolean;
}

export interface IUserDetails {
  model: UserDetails[];
}

export interface IAddressDetails {
  model: AddressDetails[];
}

export type ExporterAddressStep = "searchPostCode" | "selectedAddress" | "manualAddress";

export type ExporterAddressButtonType =
  | "cancelManualAddress"
  | "continueManualAddress"
  | "navigateToManualAddress"
  | "findaddress"
  | "getaddress"
  | "changelink"
  | "cancel";

export type ExporterAddressProps = {
  documentNumber: string;
  csrf: string;
  currentStep: ExporterAddressStep;
  countries: ICountry[];
  postcode: string;
  postcodeaddresses: ILookUpAddressDetails[];
  actionUri?: string;
};

export type IActionData = {
  currentStep: ExporterAddressStep;
  errors: IErrorsTransformed;
  postcode: string;
  postcodeaddresses: ILookUpAddressDetails[];
  postcodeaddress: ILookUpAddressDetails;
  csrf: string;
};
