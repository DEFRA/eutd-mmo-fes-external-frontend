import type { Establishment } from "~/types";
import serverLogger from "~/logger.server";
import { searchApprovedFoodEstablishments, type EstablishmentType } from "./approvedFoodEstablishmentsClient";

// MDM's establishment id is authoritative; older records fall back to approval number or trading name.
const getEstablishmentId = (establishment: Establishment): string =>
  (establishment.id ?? establishment.approvalNumber?.content ?? establishment.tradingName ?? "").trim().toLowerCase();

const dedupeEstablishmentsById = (establishments: Establishment[]): Establishment[] => {
  const seen = new Set<string>();

  return establishments.filter((establishment) => {
    const id = getEstablishmentId(establishment);
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
};

export const searchEstablishments = async (type: EstablishmentType, term: string): Promise<Establishment[]> => {
  try {
    const establishments = await searchApprovedFoodEstablishments(type, term);
    return dedupeEstablishmentsById(establishments);
  } catch (error) {
    if (error instanceof Error) {
      serverLogger.error(`[SEARCH-ESTABLISHMENT][${type.toUpperCase()}][FAIL][ERROR][${error.stack ?? error}]`);
    }

    return [];
  }
};

export const formatEstablishmentLabel = (establishment: Establishment): string => {
  const postcode = establishment.address?.postCode?.code?.trim();
  const addressSuffix = postcode ? ` - ${postcode}` : "";

  return `${establishment.tradingName} (${establishment.approvalNumber?.content})${addressSuffix}`;
};
