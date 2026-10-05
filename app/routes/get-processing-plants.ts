import { type LoaderFunction } from "react-router";
import { formatEstablishmentLabel, getProcessingPlants } from "~/.server";
import type { Establishment } from "~/types";
import serverLogger from "~/logger.server";
import setApiMock from "tests/msw/helpers/setApiMock";

type ProcessingPlantSearchResult = {
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

    if (searchTerm.length < 2) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const establishments: Establishment[] = await getProcessingPlants();

    const labels: ProcessingPlantSearchResult[] = establishments
      .filter((establishment) => {
        const tradingName = establishment.tradingName?.toLowerCase() ?? "";
        const approvalNumber = establishment.approvalNumber?.content?.toLowerCase() ?? "";

        return tradingName.includes(searchTerm) || approvalNumber.includes(searchTerm);
      })
      .filter((establishment) => establishment.tradingName && establishment.approvalNumber?.content)
      .map((establishment) => ({
        label: formatEstablishmentLabel(establishment),
        tradingName: establishment.tradingName ?? "",
        approvalNumber: establishment.approvalNumber?.content ?? "",
        addressLine: establishment.address?.line1 ?? "",
        cityName: establishment.address?.cityName ?? "",
        postcode: establishment.address?.postCode?.code ?? "",
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
