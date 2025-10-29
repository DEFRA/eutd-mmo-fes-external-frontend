import * as React from "react";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { Main } from "~/components";
import { onLoginReturnHandler } from "~/.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import logger from "~/logger.server";

export const loader: LoaderFunction = async ({ request }) => {
  setApiMock(request.url);

  logger.info(`[IDM-V2][GET /login/return][Request: ${request.url}]`);

  throw new Error("no access");
};

export const action: ActionFunction = async ({ request }) => {
  setApiMock(request.url);

  logger.info(`[IDM-V2][POST /login/return][Request: ${request.url}]`);

  return await onLoginReturnHandler(request);
};

export default () => <Main showHelpLink={false} />;
