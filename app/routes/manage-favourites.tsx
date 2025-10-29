import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { route } from "routes-gen";
import type { ErrorResponse } from "~/types";
import { manageFavouritesLoader, manageFavouritesAction } from "~/.server";
import { ManageFavouritesHomeComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) => await manageFavouritesLoader(request, params);

export const action: ActionFunction = async ({ request }): Promise<Response | ErrorResponse> => {
  const pageUrl = route("/manage-favourites");
  return await manageFavouritesAction(request, pageUrl);
};

const ManageFavourites = () => (
  <ManageFavouritesHomeComponent backUrl={route("/create-catch-certificate/catch-certificates")} />
);

export default ManageFavourites;
