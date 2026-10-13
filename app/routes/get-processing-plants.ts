import { type LoaderFunction } from "react-router";
import { formatEstablishmentLabel, searchEstablishments } from "~/.server";
import type { Establishment } from "~/types";
import serverLogger from "~/logger.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getEnv } from "~/env.server";

type ProcessingPlantSearchResult = {
  label: string;
  tradingName: string;
  approvalNumber: string;
  addressLine: string;
  cityName: string;
  postcode: string;
  country: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    setApiMock(request.url);

    const url = new URL(request.url);
    const searchTerm = (url.searchParams.get("search") ?? "").trim();
    const minSearchLength = Number.parseInt(getEnv().APPROVED_ESTABLISHMENT_SEARCH_MIN_LENGTH, 10);

    if (searchTerm.length < minSearchLength) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const establishments: Establishment[] = await searchEstablishments("processing", searchTerm);

    const labels: ProcessingPlantSearchResult[] = establishments.map((establishment) => ({
      label: formatEstablishmentLabel(establishment),
      tradingName: establishment.tradingName ?? "",
      approvalNumber: establishment.approvalNumber?.content ?? "",
      addressLine: [
        establishment.address?.line1,
        establishment.address?.line2,
        establishment.address?.line3,
        establishment.address?.line4,
      ]
        .filter(Boolean)
        .join(", "),
      cityName: establishment.address?.cityName ?? "",
      postcode: establishment.address?.postCode?.code ?? "",
      country: establishment.address?.country?.countryName ?? "",
    }));

    return new Response(JSON.stringify(labels), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[GET-PROCESSING-PLANTS-SEARCH][ERROR][${e.stack ?? e}]`);
    }

    throw e;
  }
};
