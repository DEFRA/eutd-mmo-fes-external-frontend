import { getReferenceData } from "~/communication.server";
import serverLogger from "~/logger.server";
import type { Establishment } from "~/types";
import { PROCESSING_PLANTS_URL } from "~/urls.server";

const onGetProcessingPlantsResponse = async (response: Response): Promise<Establishment[]> => {
  switch (response.status) {
    case 200:
      return await response.json();
    case 204:
    case 400:
    case 500:
      return [];
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const getProcessingPlants = async (): Promise<Establishment[]> => {
  try {
    const response: Response = await getReferenceData(PROCESSING_PLANTS_URL);
    return onGetProcessingPlantsResponse(response);
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[GET-PROCESSING-PLANTS][FAIL][ERROR][${e.stack ?? e}]`);
    }

    return [];
  }
};

const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

export const matchEstablishment = (
  establishments: Establishment[],
  plantName?: string,
  plantApprovalNumber?: string
): Establishment | undefined => {
  const normalizedApprovalNumber = normalize(plantApprovalNumber);
  const normalizedPlantName = normalize(plantName);

  const approvalNumberMatch = establishments.find(
    (establishment) => normalize(establishment.approvalNumber?.content) === normalizedApprovalNumber
  );
  if (approvalNumberMatch) {
    return approvalNumberMatch;
  }

  return establishments.find((establishment) => normalize(establishment.tradingName) === normalizedPlantName);
};

export const mapEstablishmentToPlantAddress = (
  establishment: Establishment
): {
  plantAddressOne?: string;
  plantTownCity?: string;
  plantPostcode?: string;
  plantCountry?: string;
} => {
  const address = establishment.address;
  const plantTownCity = address?.cityName;
  const plantPostcode = address?.postCode?.code;
  return {
    plantAddressOne: [address?.line1, address?.line2, address?.line3, address?.line4].filter(Boolean).join(", "),
    plantCountry: address?.country?.countryName ?? "United Kingdom",
    ...(typeof plantTownCity === "string" ? { plantTownCity } : {}),
    ...(typeof plantPostcode === "string" ? { plantPostcode } : {}),
  };
};
