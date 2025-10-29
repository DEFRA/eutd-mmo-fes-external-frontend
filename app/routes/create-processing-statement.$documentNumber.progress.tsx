import * as React from "react";
import { progressPageLoader, progressAction } from "~/.server";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import type { ErrorResponse } from "~/types";
import { ProgressPageComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) =>
  progressPageLoader(request, params, "processingStatement");

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  progressAction(request, params, "processingStatement");

const Progress = () => <ProgressPageComponent journey="processingStatement" />;

export default Progress;
