import type { ILookUpAddressDetails } from "~/types";

export const getPostcodeAddress = (postcodeaddress?: ILookUpAddressDetails) => postcodeaddress?.country ?? "";
export const getSubBuildingName = (postcodeaddress?: ILookUpAddressDetails) => postcodeaddress?.sub_building_name ?? "";
export const getBuildingNumber = (postcodeaddress?: ILookUpAddressDetails) => postcodeaddress?.building_number ?? "";
export const getBuildingName = (postcodeaddress?: ILookUpAddressDetails) => postcodeaddress?.building_name ?? "";
export const getStreetName = (postcodeaddress?: ILookUpAddressDetails) => postcodeaddress?.street_name ?? "";
export const getCity = (postcodeaddress?: ILookUpAddressDetails) => postcodeaddress?.city ?? "";
export const getCounty = (postcodeaddress?: ILookUpAddressDetails) => postcodeaddress?.county ?? "";
export const getPostcode = (postcodeaddress?: ILookUpAddressDetails) => postcodeaddress?.postCode ?? "";
