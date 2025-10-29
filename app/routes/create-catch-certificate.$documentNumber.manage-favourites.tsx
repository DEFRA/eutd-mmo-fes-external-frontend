import * as React from "react";
import { ManageFavouritesHomeComponent } from "~/composite-components";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { manageFavouritesLoader, manageFavouritesAction } from "~/.server";
import type { ErrorResponse, ManageFavouritesProps } from "~/types";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request, params }) => await manageFavouritesLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  await manageFavouritesAction(request, `/create-catch-certificate/${params.documentNumber}/manage-favourites`);

const ManageFavourites = () => {
  const { documentNumber } = useLoaderData<ManageFavouritesProps>();
  return (
    <ManageFavouritesHomeComponent
      backUrl={`/create-catch-certificate/${documentNumber}/what-are-you-exporting?activeTab=favouritesTab#add-from-favourites`}
    />
  );
};

export default ManageFavourites;
