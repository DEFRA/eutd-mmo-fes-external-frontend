import { type LoaderFunction } from "@remix-run/node";
import { getCommodityCodes } from "~/.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const fao = url.searchParams.get("fao") ?? "";
  const stateCode = url.searchParams.get("stateCode") ?? "";
  const presentationCode = url.searchParams.get("presentationCode") ?? "";
  const commodityCodes = await getCommodityCodes(fao, stateCode, presentationCode);
  return new Response(JSON.stringify({ commodityCodes }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
