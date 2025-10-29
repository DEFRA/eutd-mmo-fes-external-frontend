import * as React from "react";
import { useLoaderData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import type { ErrorResponse, ManageFavouritesProps } from "~/types";
import { manageFavouritesLoader, manageFavouritesAction } from "~/.server";
import { ManageFavouritesHomeComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) => await manageFavouritesLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  await manageFavouritesAction(request, `/create-catch-certificate/${params.documentNumber}/upload-favourites`);

const ManageFavourites = () => {
  const { documentNumber } = useLoaderData<ManageFavouritesProps>();
  return <ManageFavouritesHomeComponent backUrl={`/create-catch-certificate/${documentNumber}/upload-guidance`} />;
};

export default ManageFavourites;
