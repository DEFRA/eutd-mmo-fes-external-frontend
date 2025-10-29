import { type ActionFunction } from "@remix-run/node";
import { onLoginAdminReturnHandler } from "~/.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import logger from "~/logger.server";

export const action: ActionFunction = async ({ request }) => {
  setApiMock(request.url);

  logger.info(`[ADMIN-LOGIN][POST][Request: ${request.url}]`);

  return await onLoginAdminReturnHandler(request);
};
