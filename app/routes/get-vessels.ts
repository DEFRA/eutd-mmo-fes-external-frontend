import { type LoaderFunction } from "@remix-run/node";
import { getVessels } from "~/.server";
import type { IVessel } from "~/types";
import serverLogger from "~/logger.server";
import setApiMock from "tests/msw/helpers/setApiMock";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    setApiMock(request.url);
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("search") ?? "";
    const dateSelected = url.searchParams.get("date") ?? "";
    const vessels: IVessel[] = await getVessels(searchTerm, dateSelected);
    const getVesselNames = (vessel: IVessel) => `${vessel.vesselName} (${vessel.pln})`;
    return new Response(JSON.stringify(vessels.map(getVesselNames)), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[GET-VESSELS][ERROR][${e.stack ?? e}]`);
    }
    throw e;
  }
};
