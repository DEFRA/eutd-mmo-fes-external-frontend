import { type LoaderFunction } from "@remix-run/node";
import { getAllGearTypesByCategory } from "~/.server";
import type { IGearType } from "~/types";
import serverLogger from "~/logger.server";
import setApiMock from "tests/msw/helpers/setApiMock";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    setApiMock(request.url);
    const url = new URL(request.url);
    const gearCategory = url.searchParams.get("gearCategory");
    const gearTypes: IGearType[] = await getAllGearTypesByCategory(gearCategory as string);
    return new Response(JSON.stringify(gearTypes), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[GET-GEAR-TYPES][ERROR][${e.stack ?? e}]`);
    }
    throw e;
  }
};
