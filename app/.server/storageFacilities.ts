import serverLogger from "~/logger.server";
import type { Establishment } from "~/types";
import { formatEstablishmentLabel, searchEstablishments } from "./establishmentSearch";

const normalize = (value?: string): string => value?.trim().toLowerCase() ?? "";

export const matchEstablishment = (
  establishments: Establishment[],
  facilityName?: string,
  facilityApprovalNumber?: string
): Establishment | undefined => {
  const normalizedApprovalNumber = normalize(facilityApprovalNumber);
  if (normalizedApprovalNumber) {
    const approvalNumberMatch = establishments.find(
      (establishment) => normalize(establishment.approvalNumber?.content) === normalizedApprovalNumber
    );
    if (approvalNumberMatch) {
      return approvalNumberMatch;
    }
  }

  const normalizedFacilityName = normalize(facilityName);
  return normalizedFacilityName
    ? establishments.find((establishment) => normalize(establishment.tradingName) === normalizedFacilityName)
    : undefined;
};

export const getStorageFacilities = async (): Promise<string[]> => {
  try {
    const establishments = await searchEstablishments("storage", "");
    return Array.isArray(establishments)
      ? establishments.reduce((acc: string[], cur: Establishment) => [...acc, formatEstablishmentLabel(cur)], [""])
      : [""];
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[GET-STORAGE-FACILITIES-NO-JS][ERROR][${e.stack ?? e}]`);
    }

    return [""];
  }
};

export const mapEstablishmentToFacilityAddress = (
  establishment: Establishment
): {
  facilityAddressOne?: string;
  facilityTownCity?: string;
  facilityPostcode?: string;
  facilityCountry?: string;
} => {
  const address = establishment.address;
  const localityLine = [address?.line4, address?.line3, address?.line2].find((line) => line?.trim());
  const addressParts =
    address?.line1
      ?.split(",")
      .map((part) => part.trim())
      .filter(Boolean) ?? [];
  const facilityTownCity = [
    address?.cityName?.trim(),
    localityLine?.trim(),
    addressParts.length >= 3 ? addressParts.at(-1) : undefined,
  ].find(Boolean);
  const facilityPostcode = address?.postCode?.code;
  const facilityCountry = address?.country?.countryName?.trim();
  return {
    facilityAddressOne: [address?.line1, address?.line2, address?.line3, address?.line4].filter(Boolean).join(", "),
    facilityCountry: facilityCountry ? address?.country?.countryName : "United Kingdom",
    ...(typeof facilityTownCity === "string" ? { facilityTownCity } : {}),
    ...(typeof facilityPostcode === "string" ? { facilityPostcode } : {}),
  };
};
