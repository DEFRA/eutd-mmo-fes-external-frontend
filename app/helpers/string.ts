import isEmpty from "lodash/isEmpty";
import type { ILookUpAddressDetails } from "~/types";

export const camelCaseToSpacedUpperCase = (word: string) =>
  camelCaseToSpaced(word)
    .toLowerCase()
    .replace(/^./, (str) => str.toUpperCase());

export const camelCaseToSpacedLowerCase = (word: string) => camelCaseToSpaced(word).toLowerCase();

const camelCaseToSpaced = (word: string) => {
  if (word) {
    return (
      word
        // insert a space between lower & upper
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        // space before last upper in a sequence followed by lower
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, "$1 $2$3")
    );
  } else {
    return "";
  }
};

export const getAddressOne = (lookUpAddress: ILookUpAddressDetails | undefined): string | undefined => {
  const addressLineOne: string[] = [];

  if (lookUpAddress?.building_number) {
    addressLineOne.push(lookUpAddress.building_number);
  }

  if (lookUpAddress?.building_name) {
    addressLineOne.push(lookUpAddress.building_name);
  }

  if (lookUpAddress?.sub_building_name) {
    addressLineOne.push(lookUpAddress.sub_building_name);
  }

  if (lookUpAddress?.street_name) {
    addressLineOne.push(lookUpAddress.street_name);
  }

  return addressLineOne.length > 0 ? addressLineOne.filter((_: string) => _ !== "null").join(", ") : undefined;
};

export const getStorageFacilityAddressOne = (lookUpAddress: ILookUpAddressDetails | undefined): string => {
  const addressLineOne: string[] = [];

  if (lookUpAddress?.building_number) {
    addressLineOne.push(lookUpAddress.building_number);
  }

  if (lookUpAddress?.sub_building_name) {
    addressLineOne.push(lookUpAddress.sub_building_name);
  }

  if (lookUpAddress?.building_name) {
    addressLineOne.push(lookUpAddress.building_name);
  }

  if (lookUpAddress?.street_name) {
    addressLineOne.push(lookUpAddress.street_name);
  }

  return addressLineOne.length > 0 ? addressLineOne.filter((_: string) => _ !== "null").join(", ") : "";
};

export const isMissing: (value: string | undefined) => boolean = (value: string | undefined) => {
  if (value === undefined) {
    return true;
  }

  if (value === null) {
    return true;
  }

  return isEmpty(value.trim());
};

export const getStartDate: (values: any) => string | undefined = (values) => {
  if (!values) {
    return;
  }

  const startDateYear = values["startDateYear"];
  const startDateMonth = values["startDateMonth"];
  const startDateDay = values["startDateDay"];

  const formattedDate = toISODateFormat(startDateDay, startDateMonth, startDateYear);

  return startDateYear || startDateMonth || startDateDay ? formattedDate : undefined;
};

export const toISODateFormat = (day: string, month: string, year: string): string => `${year}-${month}-${day}`;

export const getStrOrDefault = (value: string, defaultValue: string = "") => value ?? defaultValue;

export const toDelimitedStr = (items: string[], delimiter: string = ', ') => items?.join(delimiter);
