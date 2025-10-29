import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { WhatExportDestinationComponent } from "~/composite-components";
import { WhatExportDestinationAction, WhatExportDestinationLoader } from "~/.server";
import type { ErrorResponse } from "~/types";

export const loader: LoaderFunction = async ({ request, params }) => await WhatExportDestinationLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  await WhatExportDestinationAction(request, params, "processingStatement");

const WhatExportDestinationProcessingStatement = () => <WhatExportDestinationComponent journey="processingStatement" />;

export default WhatExportDestinationProcessingStatement;
