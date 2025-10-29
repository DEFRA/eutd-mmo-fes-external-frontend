import * as React from "react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { progressAction, progressPageLoader } from "~/.server";
import type { ErrorResponse } from "~/types";
import { ProgressPageComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) =>
  progressPageLoader(request, params, "catchCertificate");

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  progressAction(request, params, "catchCertificate");

const Progress = () => <ProgressPageComponent journey="catchCertificate" />;

export default Progress;
