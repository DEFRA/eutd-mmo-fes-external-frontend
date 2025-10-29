import { type LoaderFunction } from "@remix-run/node";
import { searchStateLookup } from "~/.server";
import type { SearchState } from "~/types";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const fao = url.searchParams.get("fao");
  const stateLookUp: SearchState[] = await searchStateLookup(fao);

  return new Response(JSON.stringify(stateLookUp), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
