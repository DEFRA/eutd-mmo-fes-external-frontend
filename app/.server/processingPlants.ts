import serverLogger from "~/logger.server";
import type { Establishment } from "~/types";
import { searchEstablishments } from "~/.server";

// MDM's own establishment id is the authoritative unique identifier; it's the only reliable
// way to tell two distinct records apart when they'd otherwise render the same option label.
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

export const searchProcessingPlants = async (term: string): Promise<Establishment[]> => {
  try {
    const establishments = await searchEstablishments("processing", term);
    return dedupeEstablishmentsById(establishments);
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[SEARCH-PROCESSING-PLANTS][FAIL][ERROR][${e.stack ?? e}]`);
    }

    return [];
  }
};

export const formatEstablishmentLabel = (establishment: Establishment): string => {
  const postcode = establishment.address?.postCode?.code?.trim();
  const addressSuffix = postcode ? ` - ${postcode}` : "";

  return `${establishment.tradingName} (${establishment.approvalNumber?.content})${addressSuffix}`;
};
