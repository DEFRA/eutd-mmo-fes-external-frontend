import * as React from "react";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { ProgressPageComponent } from "~/composite-components";
import { progressPageLoader, progressAction } from "~/.server";
import type { ErrorResponse } from "~/types";

export const loader: LoaderFunction = async ({ request, params }) =>
  progressPageLoader(request, params, "storageNotes");

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  progressAction(request, params, "storageNotes");

const Progress = () => <ProgressPageComponent journey="storageNotes" />;

export default Progress;
