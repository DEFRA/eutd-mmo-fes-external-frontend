import { route } from "routes-gen";
import { type ActionFunction, type LoaderFunction } from "react-router";
import { manageFavouritesLoader, manageFavouritesAction } from "~/.server";
import type { ErrorResponse } from "~/types";
import * as React from "react";
import { ManageFavouritesHomeComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) => await manageFavouritesLoader(request, params);

/* istanbul ignore next */
export const action: ActionFunction = async ({ request }): Promise<Response | ErrorResponse> => {
  const pageUrl = route("/manage-favourites");
  return await manageFavouritesAction(request, pageUrl);
};

const ManageFavourites = () => (
  <ManageFavouritesHomeComponent backUrl={route("/create-catch-certificate/catch-certificates")} />
);

export default ManageFavourites;
