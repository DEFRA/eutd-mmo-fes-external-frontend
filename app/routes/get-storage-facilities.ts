import { type LoaderFunction } from "react-router";
import { formatEstablishmentLabel, mapEstablishmentToFacilityAddress, searchEstablishments } from "~/.server";
import type { Establishment } from "~/types";
import serverLogger from "~/logger.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getEnv } from "~/env.server";

type StorageFacilitySearchResult = {
  label: string;
  tradingName: string;
  approvalNumber: string;
  addressLine: string;
  cityName: string;
  postcode: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    setApiMock(request.url);

    const url = new URL(request.url);
    const searchTerm = (url.searchParams.get("search") ?? "").trim().toLowerCase();

    const minSearchLength = Number.parseInt(getEnv().APPROVED_ESTABLISHMENT_SEARCH_MIN_LENGTH, 10);

    if (searchTerm.length < minSearchLength) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const establishments: Establishment[] = await searchEstablishments("storage", searchTerm);

    const labels: StorageFacilitySearchResult[] = establishments
      .filter((establishment) => {
        const tradingName = establishment.tradingName?.toLowerCase() ?? "";
        const approvalNumber = establishment.approvalNumber?.content?.toLowerCase() ?? "";

        return tradingName.includes(searchTerm) || approvalNumber.includes(searchTerm);
      })
      .filter((establishment) => establishment.tradingName && establishment.approvalNumber?.content)
      .map((establishment) => {
        const address = mapEstablishmentToFacilityAddress(establishment);
        return {
          label: formatEstablishmentLabel(establishment),
          tradingName: establishment.tradingName ?? "",
          approvalNumber: establishment.approvalNumber?.content ?? "",
          addressLine: address.facilityAddressOne ?? "",
          cityName: address.facilityTownCity ?? "",
          postcode: address.facilityPostcode ?? "",
        };
      });

    return new Response(JSON.stringify(labels), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      serverLogger.error(`[GET-STORAGE-FACILITIES-SEARCH][ERROR][${error.stack ?? error}]`);
    }

    throw error;
  }
};
